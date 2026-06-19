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
import type { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";

const API_KEY_HEADER = "X-Forge-API-Key";
const DEFAULT_PREFIX = "allo";
/** Total per-request timeout, matching the Go and Python SDK siblings (30s). */
const DEFAULT_TIMEOUT_MS = 30_000;

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
  try {
    return JSON.parse(body) as T;
  } catch {
    const preview = body.length > 256 ? `${body.slice(0, 256)}…` : body;
    throw new Error(`Forge ${what} response was not valid JSON: ${preview}`);
  }
}

/**
 * HTTP client for the Forge signing-wallet API.
 *
 * @internal Low-level transport for {@link ForgeRemoteSigner}. Prefer
 * `ForgeRemoteSigner.create()`, which performs the pubkey-derived address
 * cross-check; calling `sign()` on this client directly bypasses that safety net.
 */
export class ForgeSigningWalletClient {
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
    return info;
  }

  /** Sign a payload with the wallet. When prehashed is false the backend SHA-256
   * hashes the payload (Cosmos SignDoc); when true it signs the 32-byte digest.
   * When expectedPubkeyHex is given, the pubkey echoed by the backend is checked
   * against it so a rotated or mis-routed wallet is caught before broadcast. */
  async sign(
    walletId: string,
    payload: Uint8Array,
    prehashed: boolean,
    expectedPubkeyHex?: string,
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
      throw new Error(`Forge sign response for ${walletId} missing 'signature'`);
    }
    if (
      expectedPubkeyHex &&
      data.pubkey &&
      data.pubkey.toLowerCase() !== expectedPubkeyHex.toLowerCase()
    ) {
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
    return sig;
  }

  private async request(
    method: string,
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
  private constructor(
    private readonly client: ForgeSigningWalletClient,
    private readonly walletId: string,
    private readonly accountAddress: string,
    private readonly pubkey: Uint8Array,
  ) {}

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
    const pubkey = fromHex(info.pubkey);
    if (pubkey.length !== 33) {
      throw new Error(
        `expected a 33-byte compressed secp256k1 pubkey from the backend, got ${pubkey.length} bytes`,
      );
    }

    // Derive the address from the pubkey and cross-check against the backend's
    // reported address so a misconfigured wallet fails here, not on broadcast.
    // address is non-optional in the API contract, so a missing/empty value is a
    // backend regression rather than a reason to skip the check.
    const rawAddress = rawSecp256k1PubkeyToRawAddress(pubkey);
    const derived = toBech32(prefix, rawAddress);
    if (!info.address) {
      throw new Error(
        `backend wallet-info response for ${config.walletId} missing 'address'`,
      );
    }
    // Compare the decoded address bytes, not the bech32 strings, so a non-default
    // prefix still validates against the backend's allo1… address (the guard is
    // about key identity, not the rendered prefix). A non-bech32 value also fails.
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
    return new ForgeRemoteSigner(client, config.walletId, derived, pubkey);
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
      toHex(this.pubkey),
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
    return this.client.sign(this.walletId, digest, true, toHex(this.pubkey));
  }
}
