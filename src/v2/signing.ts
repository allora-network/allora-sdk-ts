import {
  makeSignBytes,
  type AccountData,
  type DirectSignResponse,
  type OfflineDirectSigner,
} from "@cosmjs/proto-signing";
import {
  encodeSecp256k1Signature,
  rawSecp256k1PubkeyToRawAddress,
  type Algo,
} from "@cosmjs/amino";
import { fromBech32, fromHex, toBech32, toHex } from "@cosmjs/encoding";
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
import type { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";

const API_KEY_HEADER = "X-Forge-API-Key";
const DEFAULT_PREFIX = "allo";
/** Total per-request timeout, matching the Go and Python SDK siblings (30s). */
const DEFAULT_TIMEOUT_MS = 30_000;
/** Largest delay setTimeout accepts before it overflows its 32-bit signed counter
 * (Node's TIMEOUT_MAX, also the browser limit): a delay above 2^31-1 ms wraps and fires
 * almost immediately (~1ms), so a larger finite timeoutMs would silently become an instant
 * abort instead of a long timeout. Reject it rather than letting it degrade to that. */
const MAX_TIMEOUT_MS = 2_147_483_647;
/** Upper bound on a Forge backend response body (1 MiB), matching allora-sdk-go's
 * io.LimitReader cap (allora-sdk-py uses 64 KiB). Legitimate wallet-info and sign
 * responses are well under 1 KiB; anything larger is a broken/hostile endpoint or a
 * captive-portal page, so reject it instead of buffering it into JSON.parse. */
const MAX_RESPONSE_BYTES = 1 << 20;

/** Minimal structural view of a WHATWG ReadableStream response body — just enough to
 * read it with a hard size cap. Typed structurally (not via the DOM lib) so the SDK
 * stays portable across browser/Node/test runtimes. */
interface ReadableBodyLike {
  getReader(): {
    read(): Promise<{ done: boolean; value?: Uint8Array }>;
    cancel(reason?: unknown): Promise<void>;
  };
}

/** Minimal subset of the Fetch API used by the signing client, so a custom
 * implementation can be injected (e.g. in tests or non-browser runtimes). */
export type FetchLike = (
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
    redirect?: "error" | "follow" | "manual";
  },
) => Promise<{
  ok: boolean;
  status: number;
  text(): Promise<string>;
  /** Streaming body, when the implementation exposes one (the global fetch Response
   * does). When present it is read with a hard byte cap so an oversized body is never
   * buffered whole; when absent the client falls back to text(). */
  body?: ReadableBodyLike | null;
}>;

/** Non-secret view of a Forge signing wallet. */
export interface SigningWalletInfo {
  id: string;
  address: string;
  /** Hex-encoded 33-byte compressed secp256k1 public key. */
  pubkey: string;
  /** Master fee-granter (allo1…) the backend advertises for this wallet, when a master
   * wallet is configured (omitted otherwise). This is the raw snake_case wire field exactly
   * as emitted by forge-v2 (`json:"master_granter,omitempty"`) and allora-sdk-py;
   * `parseForgeJson` does no key transformation, so the property name must match the wire
   * key — a camelCase `masterGranter` would always read back `undefined`. Surfaced
   * ergonomically on the signer as {@link ForgeRemoteSigner.masterGranter} so a worker can
   * discover the granter at runtime instead of configuring it out-of-band, making a
   * master-wallet rotation transparent. */
  master_granter?: string;
}

export interface ForgeRemoteSignerConfig {
  /** Forge API base URL, e.g. "https://forge.allora.network". */
  backendUrl: string;
  /** Forge API key (sent as the X-Forge-API-Key header). */
  apiKey: string;
  /** Signing wallet UUID, as returned by the create endpoint. */
  walletId: string;
  /** Bech32 prefix; defaults to "allo". */
  prefix?: string;
  /** Optional fetch implementation; defaults to the global fetch. */
  fetchFn?: FetchLike;
  /** Allow a non-HTTPS backendUrl (e.g. http:// in tests). Defaults to false. */
  allowInsecureHttp?: boolean;
  /** Per-request timeout in milliseconds; defaults to 30000 (30s). */
  timeoutMs?: number;
}

/** JSON.parse with Forge context, so a non-JSON backend/proxy response (an HTML
 * error page, a plain-text 401) surfaces an actionable error instead of an opaque
 * SyntaxError with no indication it came from the Forge SDK. */
function parseForgeJson<T>(body: string, what: string): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    const preview = body.length > 256 ? `${body.slice(0, 256)}…` : body;
    throw new Error(`Forge ${what} response was not valid JSON: ${preview}`);
  }
  // Reject non-object JSON (arrays, null, numbers, strings) so the actual root
  // cause surfaces here instead of a misleading "missing field" error downstream.
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    const kind = Array.isArray(parsed)
      ? "array"
      : parsed === null
        ? "null"
        : typeof parsed;
    throw new Error(
      `Forge ${what} response was not a JSON object (got ${kind})`,
    );
  }
  return parsed as T;
}

/** Concatenate body chunks into a single Uint8Array of known total length. */
function concatChunks(chunks: Uint8Array[], total: number): Uint8Array {
  if (chunks.length === 1) {
    return chunks[0];
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Read a fetch response body into a string with a hard byte cap, so a hostile or
 * captive-portal backend cannot drive the signer toward OOM by streaming an unbounded
 * body before the size guard runs (parity with allora-sdk-go's io.LimitReader and
 * allora-sdk-py's capped raw.read). When the response exposes a streaming body, read it
 * chunk by chunk and stop — cancelling the stream — as soon as the cap is exceeded, so
 * the oversized body is never buffered whole. When it does not (an injected test stub,
 * or a runtime without a stream body), fall back to text() and re-check after the fact. */
async function readBoundedBody(
  res: { text(): Promise<string>; body?: ReadableBodyLike | null },
  limit: number,
): Promise<string> {
  const stream = res.body;
  if (!stream || typeof stream.getReader !== "function") {
    const text = await res.text();
    // Measure UTF-8 bytes, not String.length (UTF-16 code units): for multi-byte content
    // (CJK, emoji) the byte count can be up to ~3-4x the character count, so a code-unit
    // check would let a hostile body encode several MiB past the cap. The streaming path
    // below already counts bytes — keep the two paths consistent.
    const bytes = new TextEncoder().encode(text);
    if (bytes.length > limit) {
      throw new Error(`Forge backend response exceeded ${limit} bytes`);
    }
    return text;
  }
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (!value) {
      continue;
    }
    total += value.length;
    if (total > limit) {
      // Stop reading and let the underlying connection be reclaimed instead of
      // streaming a hostile oversized body to completion. Swallow a cancel() rejection
      // (some runtimes reject cancel on an already-errored stream) so it cannot mask the
      // size-cap diagnostic, which exists specifically to flag oversized responses.
      await reader.cancel().catch(() => {});
      throw new Error(`Forge backend response exceeded ${limit} bytes`);
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(concatChunks(chunks, total));
}

/** Report whether a URL hostname is a loopback address, so the allowInsecureHttp
 * escape hatch can be bounded to local development: cleartext http:// is tolerated
 * only for these hosts, never for a public endpoint that would leak the
 * X-Forge-API-Key over the wire. Mirrors allora-sdk-go's isLoopbackHost guard. The
 * 127/8 match is a strict dotted-quad so a hostile name like "127.evil.com" is not
 * treated as loopback; new URL() lowercases the hostname, so no case-folding is
 * needed. IPv6 loopback arrives bracketed from URL.hostname ("[::1]"). */
function isLoopbackHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}

/** Canonical 8-4-4-4-12 UUID shape (any version/variant). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Throw unless walletId is a UUID. A truthy-but-bogus misconfiguration ("undefined",
 * "TODO", a stray value that survives encodeURIComponent) would otherwise be interpolated
 * into the request path and surface only as an opaque backend 404; this fails fast at
 * signer construction instead. Parity with allora-sdk-go's uuid.Parse(cfg.WalletID). */
function assertWalletIdUuid(walletId: string): void {
  if (!UUID_RE.test(walletId)) {
    throw new Error(`walletId must be a UUID (got "${walletId}")`);
  }
}

/** secp256k1 half curve-order (n/2), big-endian. An ECDSA signature's s component is in
 * canonical BIP-62 low-S form iff s <= n/2. @cosmjs/crypto's Secp256k1.verifySignature is
 * called with lowS:false, so it accepts a malleated high-S twin; the SDK enforces low-S
 * itself to stay at parity with the Go (cosmos-sdk secp256k1.VerifySignature) and Python
 * (cosmpy) siblings, which reject high-S. */
const SECP256K1_HALF_ORDER = fromHex(
  "7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0",
);

/** Report whether the 32-byte big-endian s value is in low-S (canonical) form. A
 * lexicographic comparison of equal-length big-endian byte strings is an unsigned integer
 * comparison, so this is exactly s <= n/2 (s == n/2 is still canonical). */
function isLowS(s: Uint8Array): boolean {
  for (let i = 0; i < SECP256K1_HALF_ORDER.length; i++) {
    if (s[i] < SECP256K1_HALF_ORDER[i]) {
      return true;
    }
    if (s[i] > SECP256K1_HALF_ORDER[i]) {
      return false;
    }
  }
  return true;
}

/**
 * HTTP client for the Forge signing-wallet API.
 *
 * @internal Low-level transport for {@link ForgeRemoteSigner}. Prefer
 * `ForgeRemoteSigner.create()`, which performs the pubkey-derived address
 * cross-check; calling `sign()` on this client directly bypasses that safety net.
 */
class ForgeSigningWalletClient {
  private readonly baseUrl: string;
  private readonly fetchFn: FetchLike;

  constructor(
    baseUrl: string,
    private readonly apiKey: string,
    fetchFn?: FetchLike,
    allowInsecureHttp = false,
    private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ) {
    // Parse with Forge context: a bare `new URL(baseUrl)` throws a context-free
    // `TypeError: Invalid URL` for a malformed value (e.g. "forge.allora.network" with no
    // scheme, or ""), unlike every other validation below which throws a backendUrl-prefixed
    // message. Wrap it so an operator's stack trace points back at the signing SDK.
    let parsed: URL;
    try {
      parsed = new URL(baseUrl);
    } catch (err) {
      throw new Error(
        `backendUrl is not a valid absolute URL: ${(err as Error).message}`,
      );
    }
    // Reject embedded credentials, query strings, and fragments, and require a hostname.
    // Userinfo (user:pass@host) would be sent as HTTP Basic Auth on every request
    // alongside the X-Forge-API-Key and would leak into fetch error strings/operator
    // logs on any transient failure; a query string or fragment would corrupt every
    // request path. Parity with allora-sdk-go's backendUrl validation.
    if (parsed.username || parsed.password) {
      throw new Error(
        "backendUrl must not contain embedded userinfo (user:pass@); " +
          "it would be sent as Basic Auth on every request",
      );
    }
    if (parsed.search || parsed.hash) {
      throw new Error(
        "backendUrl must not contain a query string or fragment; " +
          "it would corrupt every request path",
      );
    }
    if (!parsed.hostname) {
      throw new Error(
        "backendUrl must be an absolute http(s) URL with a hostname",
      );
    }
    // Reject non-HTTPS backends: the Forge API key authorises on-chain signing, so it
    // must never travel in cleartext. allowInsecureHttp opts out only for loopback
    // hosts (local testing/dev) and only for the http: scheme — it must never downgrade
    // a public endpoint to cleartext or wave through some other scheme, either of which
    // would leak the signing credential. Parity with allora-sdk-go's isLoopbackHost guard.
    if (parsed.protocol !== "https:") {
      const loopbackHttpOk =
        parsed.protocol === "http:" &&
        allowInsecureHttp &&
        isLoopbackHost(parsed.hostname);
      if (!loopbackHttpOk) {
        throw new Error(
          `backendUrl must use https:// (got "${parsed.protocol}//"); ` +
            `cleartext http is only permitted for loopback hosts ` +
            `(localhost, 127.0.0.0/8, ::1) with allowInsecureHttp set`,
        );
      }
    }
    // Reject a non-positive / non-finite timeout: it is forwarded to setTimeout, and 0,
    // a negative value, or NaN all schedule controller.abort() on the next tick, so every
    // request would fail with an opaque "timed out after 0ms" before fetch could complete.
    // The TypeScript parameter default only fills in undefined, not these explicit values.
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0) {
      throw new Error(
        `timeoutMs must be a positive finite number of milliseconds (got ${this.timeoutMs})`,
      );
    }
    // Reject a timeout above setTimeout's 32-bit max delay: a larger value overflows and
    // fires almost immediately, so a caller asking for a long timeout would silently get an
    // instant abort on every request instead.
    if (this.timeoutMs > MAX_TIMEOUT_MS) {
      throw new Error(
        `timeoutMs must not exceed ${MAX_TIMEOUT_MS}ms (setTimeout's max delay); ` +
          `a larger value overflows and aborts almost immediately (got ${this.timeoutMs})`,
      );
    }
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    // Bind the global fetch to its receiver: WHATWG fetch throws "Illegal
    // invocation" in browsers when called as a method on another object.
    const globalFetch = (globalThis as { fetch?: FetchLike }).fetch;
    const resolved =
      fetchFn ??
      (globalFetch ? (globalFetch.bind(globalThis) as FetchLike) : undefined);
    if (!resolved) {
      throw new Error("no fetch implementation available; pass fetchFn");
    }
    this.fetchFn = resolved;
  }

  /** Fetch a signing wallet's public key and address. */
  async getWallet(walletId: string): Promise<SigningWalletInfo> {
    const body = await this.request(
      "GET",
      `/api/v1/signing-wallets/${encodeURIComponent(walletId)}`,
    );
    const info = parseForgeJson<SigningWalletInfo>(
      body,
      `wallet-info (${walletId})`,
    );
    if (!info.pubkey) {
      throw new Error(
        `Forge wallet-info response for ${walletId} missing 'pubkey'`,
      );
    }
    // Bind the returned wallet to the requested id: a caching proxy serving a
    // stale response for a different wallet, or a backend routing bug, would
    // otherwise pair this walletId with the wrong pubkey/address for the
    // signer's lifetime. (The pubkey-derived address cross-check in create()
    // validates pubkey<->address, but not pubkey<->walletId.)
    if (!info.id) {
      throw new Error(
        `Forge wallet-info response for ${walletId} missing 'id'; cannot verify the backend bound the response to the requested wallet`,
      );
    }
    // Compare case-insensitively: UUIDs are case-insensitive (RFC 4122 §3) and the
    // backend re-serializes them in lowercase canonical form, so a caller who configured
    // an uppercase walletId (which assertWalletIdUuid accepts via the /i regex) would
    // otherwise be rejected here against the lowercased echo despite the ids being equal.
    // Parity with the Go and Python siblings, which normalize before comparing.
    if (info.id.toLowerCase() !== walletId.toLowerCase()) {
      throw new Error(
        `Forge wallet-info returned id '${info.id}', expected '${walletId}'; the backend may have mis-routed the wallet`,
      );
    }
    return info;
  }

  /** Sign a payload with the wallet. When prehashed is false the backend SHA-256
   * hashes the payload (Cosmos SignDoc); when true it signs the 32-byte digest.
   * expectedPubkeyHex is required (not optional): the pubkey echoed by the backend is
   * checked against it so a rotated or mis-routed wallet is caught before broadcast, and
   * the returned signature is cryptographically verified against that pubkey so a
   * wrong-key/non-canonical/corrupted signature is rejected client-side. Making it a
   * required parameter means a future caller cannot silently disable verification by
   * forgetting to pass it — the omission is a compile error, not a quiet security hole. */
  async sign(
    walletId: string,
    payload: Uint8Array,
    prehashed: boolean,
    expectedPubkeyHex: string,
    expectedPubkey: Uint8Array,
  ): Promise<Uint8Array> {
    // expectedPubkeyHex is required and non-empty: the pubkey-echo check and the local
    // cryptographic verify below are load-bearing security gates, not optional. An empty
    // string is still typed `string` (no compile error) but is falsy, so a bare
    // `if (expectedPubkeyHex)` guard would silently skip all verification on `""`. Reject
    // it up front, before the network round-trip, so verification can never be bypassed.
    if (!expectedPubkeyHex) {
      throw new Error(
        "expectedPubkeyHex is required and must be a non-empty hex string",
      );
    }
    const body = await this.request(
      "POST",
      `/api/v1/signing-wallets/${encodeURIComponent(walletId)}/sign`,
      JSON.stringify({ payload: toHex(payload), prehashed }),
    );
    const data = parseForgeJson<{ signature?: string; pubkey?: string }>(
      body,
      `sign (${walletId})`,
    );
    if (!data.signature) {
      throw new Error(
        `Forge sign response for ${walletId} missing 'signature'`,
      );
    }
    // Fail closed when the backend omits the pubkey echo: a `data.pubkey &&` truthy
    // guard would let a response that simply drops the field skip the rotation/
    // mis-route check entirely.
    if (!data.pubkey) {
      throw new Error(
        `Forge sign response for ${walletId} missing 'pubkey' echo; cannot verify the backend signed with the expected wallet`,
      );
    }
    if (data.pubkey.toLowerCase() !== expectedPubkeyHex.toLowerCase()) {
      throw new Error(
        `Forge sign response pubkey ${data.pubkey} does not match the wallet pubkey ` +
          `${expectedPubkeyHex}; the backend may have rotated or mis-routed the wallet`,
      );
    }
    const sig = fromHex(data.signature);
    if (sig.length !== 64) {
      throw new Error(
        `Forge sign response for ${walletId} returned a ${sig.length}-byte signature; expected 64 (r||s)`,
      );
    }
    // Treat the backend as untrusted: cryptographically verify the returned
    // signature against the cached wallet pubkey before handing it back, so a
    // wrong-key, MITM, or byte-corruption regression is caught here with an
    // actionable error instead of as an opaque on-chain "signature verification
    // failed" rejection. The pubkey-echo check above is not a substitute: a backend
    // echoing the correct pubkey alongside a bad signature passes it.
    const digest = prehashed ? payload : sha256(payload);
    const parsedSig = new Secp256k1Signature(
      sig.slice(0, 32),
      sig.slice(32, 64),
    );
    // Verify with the signer's cached compressed pubkey bytes directly:
    // Secp256k1.verifySignature (→ @noble secp256k1.verify) accepts a 33-byte compressed key
    // and decompresses it internally, so the previous per-call fromHex(expectedPubkeyHex) +
    // Secp256k1.uncompressPubkey — which also forced a redundant second point lift inside
    // verify — are unnecessary work on a path that runs on every signature.
    // Wrap in Promise.resolve for forward-compatibility: on @cosmjs/crypto >=0.38 (the
    // current peerDependencies floor) verifySignature is synchronous, so this is a no-op
    // today — but guarding against a future async form prevents a bare
    // `if (!verifySignature(...))` from silently testing a truthy Promise (dead verification).
    const valid = await Promise.resolve(
      Secp256k1.verifySignature(parsedSig, digest, expectedPubkey),
    );
    if (!valid) {
      throw new Error(
        `Forge backend signature for ${walletId} failed local verification (wrong key or corrupted signature)`,
      );
    }
    // Enforce BIP-62 low-S explicitly: cosmjs calls secp256k1.verify with lowS:false,
    // so verifySignature above accepts a malleated high-S twin. The Go (cosmos-sdk
    // secp256k1.VerifySignature) and Python (cosmpy) siblings reject high-S and the
    // chain enforces it at broadcast, so reject it here too — this keeps parity and
    // keeps off-chain signDigest signatures non-malleable.
    if (!isLowS(sig.slice(32, 64))) {
      throw new Error(
        `Forge backend signature for ${walletId} is not in canonical low-S form (BIP-62 high-S)`,
      );
    }
    return sig;
  }

  /** Idempotently get-or-create the user's signing wallet bound to topicId (POST
   * /api/v1/signing-wallets with a topic_id; provisioning rides on the create endpoint
   * because a static /provision sub-route collides with /:id in the backend router).
   * Safe to call on every worker start: the backend enforces one wallet per (user, topic). */
  async provision(topicId: number, label?: string): Promise<SigningWalletInfo> {
    const payload = label
      ? { topic_id: topicId, label }
      : { topic_id: topicId };
    const body = await this.request(
      "POST",
      "/api/v1/signing-wallets",
      JSON.stringify(payload),
    );
    const info = parseForgeJson<SigningWalletInfo>(
      body,
      `provision (topic ${topicId})`,
    );
    // Report the missing field by name (matching getWallet's per-field guards) so a caller
    // knows which one the backend omitted, rather than a combined "id/pubkey" message.
    if (!info.pubkey) {
      throw new Error(
        `Forge provision response for topic ${topicId} missing 'pubkey'`,
      );
    }
    if (!info.id) {
      throw new Error(
        `Forge provision response for topic ${topicId} missing 'id'`,
      );
    }
    return info;
  }

  /** Release a managed wallet's topic binding (Forge-side bookkeeping only; does NOT
   * unregister the worker on-chain). Mirrors the sibling SDKs (allora-sdk-py
   * ForgeBackendClient.clear_association, allora-sdk-go RemoteSigner.ClearAssociation):
   * POST /api/v1/signing-wallets/{id}/clear-association with no body. Call it before
   * re-provisioning the wallet against a new topic or before decommission. Throws when the
   * backend returns a non-2xx (e.g. 404 for an unknown / foreign / already-cleared wallet),
   * so the caller decides whether an unbind failure is fatal or best-effort. */
  async clearAssociation(walletId: string): Promise<void> {
    // Fail fast on a non-UUID id before issuing the request, matching revoke() and
    // allora-sdk-go's prepareWalletByIDCall, which guards both operations identically;
    // otherwise a malformed id surfaces only as an opaque backend 404/400.
    assertWalletIdUuid(walletId);
    // clear-association returns 204 No Content; request() returns "" for an ok response
    // with an empty body, so there is nothing to parse.
    await this.request(
      "POST",
      `/api/v1/signing-wallets/${encodeURIComponent(walletId)}/clear-association`,
    );
  }

  /** Permanently revoke (decommission) a managed wallet on the Forge backend (DELETE
   * /api/v1/signing-wallets/{id}). This is the destructive counterpart to clearAssociation:
   * clearing only unbinds the wallet from its topic and is reversible by re-provisioning,
   * whereas revoking tears the wallet down for good. Mirrors the server's RevokeSigningWallet
   * handler and the sibling allora-sdk-go RevokeWallet. Throws when the backend returns a
   * non-2xx (e.g. 404 for an unknown / foreign / already-revoked wallet), so the caller
   * decides whether the failure is fatal or best-effort. */
  async revoke(walletId: string): Promise<void> {
    // Fail fast on a non-UUID id before issuing the request: revoke fires a destructive
    // DELETE, so a malformed value must never be interpolated into the request path (parity
    // with allora-sdk-go RevokeWallet, which uuid.Parse-checks the id first).
    assertWalletIdUuid(walletId);
    // RevokeSigningWallet answers 200 + JSON ({"message":"wallet revoked"}) or an empty 2xx;
    // request() returns the (ignored) body for any ok response, so there is nothing to parse.
    await this.request(
      "DELETE",
      `/api/v1/signing-wallets/${encodeURIComponent(walletId)}`,
    );
  }

  private async request(
    method: "GET" | "POST" | "DELETE",
    path: string,
    body?: string,
  ): Promise<string> {
    const headers: Record<string, string> = {
      [API_KEY_HEADER]: this.apiKey,
      Accept: "application/json",
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetchFn(this.baseUrl + path, {
        method,
        headers,
        body,
        signal: controller.signal,
        // Never follow redirects: a 3xx from the backend would otherwise replay
        // the X-Forge-API-Key header to the (possibly cross-origin) target.
        redirect: "error",
      });
      // Bound the body so a misbehaving/hostile backend cannot drive the signer
      // process toward OOM (this runs inside signAndBroadcast, where a crash also
      // burns the account-sequence reservation). Reading the stream stops before an
      // oversized body is buffered whole; the AbortController timeout does not bound
      // memory on its own.
      let text: string;
      try {
        text = await readBoundedBody(res, MAX_RESPONSE_BYTES);
      } catch (err) {
        // If the response is itself an error (non-2xx) AND oversized, surface the status
        // alongside the size-cap failure: otherwise an operator sees only "response
        // exceeded N bytes" with no hint that the real problem is, e.g., a 502 serving a
        // large captive-portal page rather than a valid reply.
        if (!res.ok) {
          throw new Error(
            `Forge backend returned ${res.status} with an oversized response body: ${(err as Error).message}`,
          );
        }
        throw err;
      }
      if (!res.ok) {
        const preview = text.length > 512 ? `${text.slice(0, 512)}…` : text;
        throw new Error(`Forge backend returned ${res.status}: ${preview}`);
      }
      return text;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(
          `Forge backend request timed out after ${this.timeoutMs}ms`,
        );
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * ForgeRemoteSigner is a cosmjs OfflineDirectSigner that delegates signing to the Forge
 * backend (a Privy-managed server wallet). The private key never leaves the backend.
 *
 * Use it like any other cosmjs signer:
 *
 *   const signer = await ForgeRemoteSigner.create({ backendUrl, apiKey, walletId });
 *   const client = await SigningStargateClient.connectWithSigner(rpcUrl, signer);
 *   await client.signAndBroadcast(signer.address, msgs, { ...fee, granter: masterAddr });
 *
 * Only SIGN_MODE_DIRECT is implemented (no amino / SIGN_MODE_LEGACY_AMINO_JSON),
 * which covers Allora's default signing. A cosmjs client that requires amino sign
 * mode (some IBC fee/relayer or Ledger paths) is not supported by this signer.
 */
export class ForgeRemoteSigner implements OfflineDirectSigner {
  /** Lowercased hex of the (lifetime-invariant) compressed pubkey, cached so it is
   * not recomputed on every signDirect/signDigest call. */
  private readonly pubkeyHex: string;

  private constructor(
    private readonly client: ForgeSigningWalletClient,
    private readonly walletId: string,
    private readonly accountAddress: string,
    private readonly pubkey: Uint8Array,
    private readonly masterGranterAddress?: string,
  ) {
    this.pubkeyHex = toHex(pubkey).toLowerCase();
  }

  /**
   * Create a signer, fetching the wallet's pubkey/address from the backend.
   *
   * @throws {Error} If backendUrl/apiKey/walletId are missing; if walletId is not a UUID;
   * if backendUrl is invalid (non-https without a loopback host + allowInsecureHttp,
   * embedded userinfo, a query string or fragment, or no hostname); if timeoutMs is not a
   * positive finite number; if the backend returns a non-2xx response; or if the wallet's
   * pubkey-derived address does not match the address the backend reports.
   */
  static async create(
    config: ForgeRemoteSignerConfig,
  ): Promise<ForgeRemoteSigner> {
    if (!config.backendUrl || !config.apiKey || !config.walletId) {
      throw new Error("backendUrl, apiKey, and walletId are all required");
    }
    assertWalletIdUuid(config.walletId);
    const prefix = config.prefix ?? DEFAULT_PREFIX;
    const client = new ForgeSigningWalletClient(
      config.backendUrl,
      config.apiKey,
      config.fetchFn,
      config.allowInsecureHttp,
      config.timeoutMs,
    );
    const info = await client.getWallet(config.walletId);
    return ForgeRemoteSigner.fromInfo(client, config.walletId, info, prefix);
  }

  /**
   * Idempotently get-or-create the user's managed wallet bound to topicId (ENGN-8572
   * "one worker = one topic") and build a signer for it. Safe to call on every worker
   * start: the backend enforces one wallet per (user, topic). No walletId is needed.
   *
   * @throws {Error} If backendUrl/apiKey are missing; if backendUrl is invalid; if
   * timeoutMs is not a positive finite number; if topicId is not a positive safe integer
   * (1 ≤ topicId ≤ 2^53-1); if the backend returns a non-2xx response; or if the
   * provisioned wallet's pubkey-derived address does not match the backend's address.
   */
  static async provisionForTopic(
    config: Omit<ForgeRemoteSignerConfig, "walletId">,
    topicId: number,
    label?: string,
  ): Promise<ForgeRemoteSigner> {
    if (!config.backendUrl || !config.apiKey) {
      throw new Error("backendUrl and apiKey are required");
    }
    // Number.isSafeInteger (not isInteger): chain topic IDs are uint64, and a value
    // above 2^53-1 loses precision in JS's double representation before it reaches
    // JSON.stringify, which would silently bind the worker to the wrong topic. It also
    // rejects -0 (Number.isInteger(-0) is true), which `topicId < 1` then double-guards.
    if (!Number.isSafeInteger(topicId) || topicId < 1) {
      throw new Error(
        "topicId must be a positive safe integer (1 ≤ topicId ≤ 2^53-1)",
      );
    }
    const prefix = config.prefix ?? DEFAULT_PREFIX;
    const client = new ForgeSigningWalletClient(
      config.backendUrl,
      config.apiKey,
      config.fetchFn,
      config.allowInsecureHttp,
      config.timeoutMs,
    );
    const info = await client.provision(topicId, label);
    return ForgeRemoteSigner.fromInfo(client, info.id, info, prefix);
  }

  /** Build a signer from wallet info: derive the address from the pubkey and cross-check
   * it against the backend's reported address so a misconfigured wallet fails here, not on
   * broadcast. The byte comparison (not bech32 strings) keeps a non-default prefix valid. */
  private static fromInfo(
    client: ForgeSigningWalletClient,
    walletId: string,
    info: SigningWalletInfo,
    prefix: string,
  ): ForgeRemoteSigner {
    // Parse with Forge context: a malformed pubkey hex (odd length, non-hex chars, a 0x
    // prefix, whitespace) would otherwise leak a bare cosmjs `Error: Invalid hex string`
    // with no breadcrumb to the signing SDK — every other check in fromInfo is prefixed.
    let pubkey: Uint8Array;
    try {
      pubkey = fromHex(info.pubkey);
    } catch (err) {
      throw new Error(
        `Forge wallet response for ${walletId}: pubkey '${info.pubkey}' is not valid hex (${(err as Error).message})`,
      );
    }
    if (pubkey.length !== 33) {
      throw new Error(
        `expected a 33-byte compressed secp256k1 pubkey from the backend, got ${pubkey.length} bytes`,
      );
    }
    const rawAddress = rawSecp256k1PubkeyToRawAddress(pubkey);
    const derived = toBech32(prefix, rawAddress);
    if (!info.address) {
      throw new Error(
        `backend wallet response for ${walletId} missing 'address'`,
      );
    }
    // Distinguish the two failure modes instead of collapsing both into "does not match":
    // a malformed bech32 address (bad checksum, invalid charset, missing separator) is a
    // backend data-quality bug, whereas a well-formed address that decodes to different
    // bytes is a routing/security concern. Same error string for both makes them
    // indistinguishable in operator logs.
    let backendRaw: Uint8Array | undefined;
    let parseErr: string | undefined;
    try {
      backendRaw = fromBech32(info.address).data;
    } catch (err) {
      parseErr = (err as Error).message;
    }
    if (!backendRaw) {
      throw new Error(
        `backend address '${info.address}' is not valid bech32 (${parseErr})`,
      );
    }
    if (toHex(backendRaw) !== toHex(rawAddress)) {
      throw new Error(
        `backend address ${info.address} does not match pubkey-derived address ${derived}`,
      );
    }
    // Capture the optional master fee-granter the backend advertised for this wallet. It
    // arrives under the snake_case wire key `master_granter`; parseForgeJson preserves
    // unknown keys, so it rides along on the parsed payload. The master granter is a
    // discovery hint, not part of the wallet's identity, so a missing/blank/invalid value
    // degrades gracefully to undefined ("no granter") rather than failing construction.
    // Validate it is a canonical bech32 address with this wallet's prefix before surfacing
    // it: a compromised or misconfigured backend could otherwise advertise an attacker-
    // controlled or garbage string that a consumer assigns straight to fee.granter. The
    // round-trip (decode then re-encode and compare) rejects a bad checksum, the wrong
    // prefix, or non-canonical form. Defense-in-depth parity with allora-sdk-go's
    // ResolveFeeGranter, which sdk.AccAddressFromBech32-parses the value (the chain still
    // enforces the actual feegrant at broadcast, so this is not the sole gate).
    const granter: unknown = info.master_granter;
    let masterGranter: string | undefined;
    if (typeof granter === "string" && granter.length > 0) {
      try {
        const decoded = fromBech32(granter);
        if (toBech32(prefix, decoded.data) === granter) {
          masterGranter = granter;
        }
      } catch {
        masterGranter = undefined;
      }
    }
    return new ForgeRemoteSigner(
      client,
      walletId,
      derived,
      pubkey,
      masterGranter,
    );
  }

  /** The signer's bech32 account address (prefix defaults to "allo"). */
  get address(): string {
    return this.accountAddress;
  }

  /**
   * The master fee-granter (allo1…) the Forge backend advertised for this wallet at
   * construction, or undefined when it advertises none. forge-v2 auto-creates a feegrant
   * from this granter to each new signing wallet, so a worker can subsidize its gas without
   * holding any ALLO. It is discovered at runtime from the wallet-info/provision response
   * (the `master_granter` field), so a master-wallet rotation does not force consumers to
   * reconfigure.
   *
   * Precedence — prefer an explicit `FORGE_MASTER_GRANTER_ADDRESS` env override, with this
   * backend-discovered value as the fallback (env-first, matching the Go and Python SDKs):
   *
   *   fee.granter = process.env.FORGE_MASTER_GRANTER_ADDRESS ?? signer.masterGranter;
   *
   * Leave `fee.granter` unset to have the signing wallet pay its own gas.
   */
  get masterGranter(): string | undefined {
    return this.masterGranterAddress;
  }

  async getAccounts(): Promise<readonly AccountData[]> {
    return [
      {
        address: this.accountAddress,
        algo: "secp256k1" as Algo,
        // Clone so a caller mutating accounts[0].pubkey cannot corrupt the
        // signer's internal key.
        pubkey: new Uint8Array(this.pubkey),
      },
    ];
  }

  /**
   * Sign a Cosmos SignDoc by delegating to the backend. Per cosmjs convention the
   * returned `signed` is the same object reference passed in as signDoc; do not
   * mutate it after this resolves, or the returned signature will no longer attest
   * to it (the chain would reject the tx with "signature verification failed").
   *
   * @throws {Error} If signerAddress does not match this signer; if the backend returns a
   * non-2xx response; if the returned pubkey does not match the cached wallet pubkey; if
   * the signature is not 64 bytes; or if local verification fails (wrong key, corrupted,
   * or non-canonical high-S).
   */
  async signDirect(
    signerAddress: string,
    signDoc: SignDoc,
  ): Promise<DirectSignResponse> {
    // Compare case-insensitively: per BIP-173 an all-lowercase and an all-uppercase bech32
    // string encode the same address. cosmjs toBech32 always emits lowercase (so
    // this.accountAddress is lowercase), but a caller may pass a BIP-173 uppercase form from
    // a wallet UI or non-cosmjs library; rejecting it would be wrong. Same root cause as the
    // case-sensitive walletId echo-check.
    if (signerAddress.toLowerCase() !== this.accountAddress) {
      throw new Error(
        `address ${signerAddress} does not match signer address ${this.accountAddress}`,
      );
    }
    const signBytes = makeSignBytes(signDoc);
    const signature = await this.client.sign(
      this.walletId,
      signBytes,
      false,
      this.pubkeyHex,
      this.pubkey,
    );
    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(this.pubkey, signature),
    };
  }

  /**
   * Sign a 32-byte application-level digest directly: the backend signs the digest
   * as-is (no Cosmos SHA-256 step). Use this for bundle/non-tx signatures; Cosmos
   * transactions go through signDirect. Mirrors allora-sdk-py's
   * RemoteSigner.sign_digest. Returns the raw 64-byte (r||s) signature.
   *
   * @throws {Error} If digest is not exactly 32 bytes; if the backend returns a non-2xx
   * response; if the returned pubkey does not match the cached wallet pubkey; if the
   * signature is not 64 bytes; or if local verification fails (wrong key, corrupted, or
   * non-canonical high-S).
   */
  async signDigest(digest: Uint8Array): Promise<Uint8Array> {
    if (digest.length !== 32) {
      throw new Error(`digest must be 32 bytes, got ${digest.length}`);
    }
    return this.client.sign(
      this.walletId,
      digest,
      true,
      this.pubkeyHex,
      this.pubkey,
    );
  }

  /**
   * Release this wallet's topic binding on the Forge backend (Forge-side bookkeeping
   * only; does NOT unregister the worker on-chain). Convenience wrapper over
   * ForgeSigningWalletClient.clearAssociation for this signer's own wallet — call it before
   * re-provisioning against a new topic or before decommission.
   *
   * @throws {Error} If the backend returns a non-2xx response (e.g. 404 for an unknown,
   * foreign, or already-cleared wallet).
   */
  async clearAssociation(): Promise<void> {
    await this.client.clearAssociation(this.walletId);
  }

  /**
   * Permanently revoke (decommission) this signer's wallet on the Forge backend. Convenience
   * wrapper over ForgeSigningWalletClient.revoke for this signer's own wallet. Unlike
   * clearAssociation (which only unbinds the topic and is reversible by re-provisioning), this
   * is destructive and irreversible — it tears the wallet down for good, so the signer must
   * not be used afterwards.
   *
   * @throws {Error} If the backend returns a non-2xx response (e.g. 404 for an unknown,
   * foreign, or already-revoked wallet).
   */
  async revoke(): Promise<void> {
    await this.client.revoke(this.walletId);
  }
}
