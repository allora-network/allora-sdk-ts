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
import { fromHex, toBech32, toHex } from "@cosmjs/encoding";
import type { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";

export type { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";

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

/** HTTP client for the Forge signing-wallet API. */
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
      `/api/v1/signing-wallets/${walletId}`,
    );
    return JSON.parse(body) as SigningWalletInfo;
  }

  /** Sign a payload with the wallet. When prehashed is false the backend SHA-256
   * hashes the payload (Cosmos SignDoc); when true it signs the 32-byte digest. */
  async sign(
    walletId: string,
    payload: Uint8Array,
    prehashed: boolean,
  ): Promise<Uint8Array> {
    const body = await this.request(
      "POST",
      `/api/v1/signing-wallets/${walletId}/sign`,
      JSON.stringify({ payload: toHex(payload), prehashed }),
    );
    const data = JSON.parse(body) as { signature: string; pubkey: string };
    return fromHex(data.signature);
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

    // Derive the address from the pubkey and cross-check against the backend's
    // reported address so a misconfigured wallet fails here, not on broadcast.
    const derived = toBech32(prefix, rawSecp256k1PubkeyToRawAddress(pubkey));
    if (info.address && info.address !== derived) {
      throw new Error(
        `backend address ${info.address} does not match pubkey-derived address ${derived}`,
      );
    }
    return new ForgeRemoteSigner(client, config.walletId, derived, pubkey);
  }

  /** The signer's allo1... account address. */
  get address(): string {
    return this.accountAddress;
  }

  async getAccounts(): Promise<readonly AccountData[]> {
    return [
      {
        address: this.accountAddress,
        algo: "secp256k1" as Algo,
        pubkey: this.pubkey,
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
    const signature = await this.client.sign(this.walletId, signBytes, false);
    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(this.pubkey, signature),
    };
  }
}
