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
/** Upper bound on a Forge backend response body (1 MiB), matching allora-sdk-go's
 * io.LimitReader cap (allora-sdk-py uses 64 KiB). Legitimate wallet-info and sign
 * responses are well under 1 KiB; anything larger is a broken/hostile endpoint or a
 * captive-portal page, so reject it instead of buffering it into JSON.parse. */
const MAX_RESPONSE_BYTES = 1 << 20;

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
) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

/** Non-secret view of a Forge signing wallet. */
export interface SigningWalletInfo {
  id: string;
  address: string;
  /** Hex-encoded 33-byte compressed secp256k1 public key. */
  pubkey: string;
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
    // Reject non-HTTPS backends: the Forge API key authorises on-chain signing,
    // so it must never travel in cleartext. allowInsecureHttp opts out for local
    // testing against http:// backends.
    const parsed = new URL(baseUrl);
    if (parsed.protocol !== "https:" && !allowInsecureHttp) {
      throw new Error(
        `backendUrl must use https:// (got "${parsed.protocol}//"); set allowInsecureHttp to override`,
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
    if (info.id !== walletId) {
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
  ): Promise<Uint8Array> {
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
    if (expectedPubkeyHex) {
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
    }
    const sig = fromHex(data.signature);
    if (sig.length !== 64) {
      throw new Error(
        `Forge sign response for ${walletId} returned a ${sig.length}-byte signature; expected 64 (r||s)`,
      );
    }
    // Treat the backend as untrusted: cryptographically verify the returned
    // signature against the cached wallet pubkey before handing it back, so a
    // wrong-key, non-canonical (high-S), MITM, or byte-corruption regression is
    // caught here with an actionable error instead of as an opaque on-chain
    // "signature verification failed" rejection. The pubkey-echo check above is
    // not a substitute: a backend echoing the correct pubkey alongside a bad
    // signature passes it. Parity with allora-sdk-go (pubKey.VerifySignature)
    // and allora-sdk-py (RemoteSigner._verify).
    if (expectedPubkeyHex) {
      const digest = prehashed ? payload : sha256(payload);
      const parsedSig = new Secp256k1Signature(
        sig.slice(0, 32),
        sig.slice(32, 64),
      );
      const pubkey = Secp256k1.uncompressPubkey(fromHex(expectedPubkeyHex));
      // Wrap in Promise.resolve so this works on both sync (@cosmjs/crypto >=0.38)
      // and async (<=0.37) verifySignature: peerDependencies admits >=0.32, and on
      // 0.32-0.37 verifySignature returns a Promise, so a bare `if (!verifySignature(...))`
      // would test a truthy Promise and silently skip the throw (dead verification).
      const valid = await Promise.resolve(
        Secp256k1.verifySignature(parsedSig, digest, pubkey),
      );
      if (!valid) {
        throw new Error(
          `Forge backend signature for ${walletId} failed local verification (non-canonical/high-S or wrong key)`,
        );
      }
    }
    return sig;
  }

  /** Idempotently get-or-create the user's signing wallet bound to topicId (POST
   * /api/v1/signing-wallets with a topic_id; provisioning rides on the create endpoint
   * because a static /provision sub-route collides with /:id in the backend router).
   * Safe to call on every worker start: the backend enforces one wallet per (user, topic). */
  async provision(
    topicId: number,
    label?: string,
  ): Promise<SigningWalletInfo> {
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
    if (!info.id || !info.pubkey) {
      throw new Error(
        `Forge provision response for topic ${topicId} missing 'id'/'pubkey'`,
      );
    }
    return info;
  }

  private async request(
    method: "GET" | "POST",
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
      const text = await res.text();
      // Bound the body so a misbehaving/hostile backend cannot drive the signer
      // process toward OOM (this runs inside signAndBroadcast, where a crash also
      // burns the account-sequence reservation). The AbortController timeout does
      // not bound memory on its own.
      if (text.length > MAX_RESPONSE_BYTES) {
        throw new Error(
          `Forge backend response exceeded ${MAX_RESPONSE_BYTES} bytes`,
        );
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
  ) {
    this.pubkeyHex = toHex(pubkey).toLowerCase();
  }

  /** Create a signer, fetching the wallet's pubkey/address from the backend. */
  static async create(
    config: ForgeRemoteSignerConfig,
  ): Promise<ForgeRemoteSigner> {
    if (!config.backendUrl || !config.apiKey || !config.walletId) {
      throw new Error("backendUrl, apiKey, and walletId are all required");
    }
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
    const pubkey = fromHex(info.pubkey);
    if (pubkey.length !== 33) {
      throw new Error(
        `expected a 33-byte compressed secp256k1 pubkey from the backend, got ${pubkey.length} bytes`,
      );
    }
    const rawAddress = rawSecp256k1PubkeyToRawAddress(pubkey);
    const derived = toBech32(prefix, rawAddress);
    if (!info.address) {
      throw new Error(
        `backend wallet-info response for ${walletId} missing 'address'`,
      );
    }
    let backendRaw: Uint8Array | undefined;
    try {
      backendRaw = fromBech32(info.address).data;
    } catch {
      backendRaw = undefined;
    }
    if (!backendRaw || toHex(backendRaw) !== toHex(rawAddress)) {
      throw new Error(
        `backend address ${info.address} does not match pubkey-derived address ${derived}`,
      );
    }
    return new ForgeRemoteSigner(client, walletId, derived, pubkey);
  }

  /** The signer's bech32 account address (prefix defaults to "allo"). */
  get address(): string {
    return this.accountAddress;
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
   */
  async signDirect(
    signerAddress: string,
    signDoc: SignDoc,
  ): Promise<DirectSignResponse> {
    if (signerAddress !== this.accountAddress) {
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
   */
  async signDigest(digest: Uint8Array): Promise<Uint8Array> {
    if (digest.length !== 32) {
      throw new Error(`digest must be 32 bytes, got ${digest.length}`);
    }
    return this.client.sign(this.walletId, digest, true, this.pubkeyHex);
  }
}
