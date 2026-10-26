/** Gateway path segment (not a Cosmos chain id). */
export enum ChainSlug {
  TESTNET = "testnet",
  MAINNET = "mainnet",
  OFFCHAIN = "offchain",
}

/**
 * @deprecated Cosmos chain ids used historically by RPC/worker code — not Forge
 * gateway paths. The gateway client uses `ChainSlug`. Kept for back-compat imports.
 */
export enum ChainID {
  TESTNET = "allora-testnet-1",
  MAINNET = "allora-mainnet-1",
}

/** @deprecated No longer used by any method; kept for back-compat imports. */
export enum PriceInferenceToken {
  BTC = "BTC",
  ETH = "ETH",
}

/** @deprecated No longer used by any method; kept for back-compat imports. */
export enum PriceInferenceTimeframe {
  FIVE_MIN = "5m",
  EIGHT_HOURS = "8h",
}

/**
 * Legacy consumer signature format; mapped to `evm_chain_id` query when possible.
 * You may also pass a raw chain id string (e.g. `"3448148188"`) or
 * `"ethereum-<chainId>"` to `getInferenceByTopicID`.
 */
export enum SignatureFormat {
  ETHEREUM_SEPOLIA = "ethereum-11155111",
  /** Allora testnet EVM consumer chain. */
  ETHEREUM_ALLORA_TESTNET = "ethereum-3448148188",
}

export interface AlloraAPIClientConfig {
  /** Required Forge secret key (`forge_sk_…`). */
  apiKey: string;
  /** Gateway network path segment. Defaults to mainnet. */
  chainSlug?: ChainSlug;
  /**
   * Forge API Gateway origin override. Must be `https://` (or `http://`
   * for localhost / 127.0.0.1). When omitted, `ALLORA_API_BASE_URL` is
   * read if present, else the public gateway default.
   */
  baseAPIUrl?: string;
  /**
   * Optional request deadline in milliseconds (client-wide policy).
   * Must be a finite number in `(0, 2^31 - 1]`.
   */
  timeoutMs?: number;
}

/** Per-call options (cancellation is request-scoped, not client-scoped). */
export interface AlloraRequestOptions {
  /** AbortSignal to cancel this request only. */
  signal?: AbortSignal;
}

/** Locked public topic shape — field names must not change. */
export interface AlloraTopic {
  topic_id: number;
  topic_name: string;
  description?: string | null;
  epoch_length: number;
  ground_truth_lag: number;
  loss_method: string;
  worker_submission_window: number;
  worker_count: number;
  reputer_count: number;
  total_staked_allo: number;
  total_emissions_allo: number;
  is_active: boolean | null;
  updated_at: string;
}

/** Locked nested inference payload — field names must not change. */
export interface AlloraInferenceData {
  network_inference: string;
  network_inference_normalized: string;
  confidence_interval_percentiles: string[];
  confidence_interval_percentiles_normalized: string[];
  confidence_interval_values: string[];
  confidence_interval_values_normalized: string[];
  topic_id: string;
  /** Unix seconds (legacy field; derived from gateway `timestamp_ms` or `timestamp`). */
  timestamp: number;
  extra_data: string;
}

/** Locked public inference shape — nested `inference_data` must not change. */
export interface AlloraInference {
  signature: string;
  inference_data: AlloraInferenceData;
}

/** @deprecated Legacy Upshot envelope — preserved for type references only. */
export interface TopicsResponse {
  topics: AlloraTopic[];
  continuation_token?: string | null;
}

/** @deprecated Legacy Upshot envelope — preserved for type references only. */
export interface AlloraAPIResponse<T> {
  request_id: string;
  status: boolean;
  apiResponseMessage?: string;
  data: T;
}

export const DefaultAPIBaseURL = "https://api.developer.allora.network";
export const FORGE_API_KEY_PREFIX = "forge_sk_";
export const MAX_API_RESPONSE_BYTES = 32 << 20; // 32 MiB
