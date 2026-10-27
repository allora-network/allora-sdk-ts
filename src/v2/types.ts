/** Gateway path segment (not a Cosmos chain id). */
export enum ChainSlug {
  TESTNET = "testnet",
  MAINNET = "mainnet",
  OFFCHAIN = "offchain",
}

/**
 * @deprecated Cosmos chain ids used historically by RPC/worker code — not Forge
 * gateway paths. The gateway client uses `ChainSlug`.
 */
export enum ChainID {
  TESTNET = "allora-testnet-1",
  MAINNET = "allora-mainnet-1",
}

/** @deprecated No longer used by any method. */
export enum PriceInferenceToken {
  BTC = "BTC",
  ETH = "ETH",
}

/** @deprecated No longer used by any method. */
export enum PriceInferenceTimeframe {
  FIVE_MIN = "5m",
  EIGHT_HOURS = "8h",
}

/**
 * Consumer signature format; mapped to `evm_chain_id` query when possible.
 * You may also pass a raw chain id string (e.g. `"3448148188"`) or
 * `"ethereum-<chainId>"`.
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

/**
 * Per-call options (cancellation is request-scoped, not client-scoped).
 *
 * Abort contract (fetch-style):
 * - Caller cancellation via `AbortController.abort()` rejects with
 *   `AbortError` / `DOMException`, or with the caller's abort reason if one
 *   was supplied.
 * - Client `timeoutMs` deadline rejects with {@link TimeoutError} (an
 *   `AlloraAPIError` subclass), not a bare abort.
 */
export interface AlloraRequestOptions {
  /** AbortSignal to cancel this request only. */
  signal?: AbortSignal;
}

/** One label entry in a network-inference bundle (gateway wire). */
export interface LabeledValue {
  label_name: string;
  value: string;
}

/** One worker's labeled values — inferer or forecaster (gateway wire). */
export interface WorkerInference {
  worker: string;
  values: LabeledValue[];
}

/**
 * Flat Forge gateway inference payload — public SDK type = wire JSON.
 * Prefer `network_inference_normalized` for human-readable prices.
 */
export interface NetworkInference {
  network?: string;
  topic_id: number;
  combined_value?: LabeledValue[];
  naive_value?: LabeledValue[];
  label_names?: string[];
  nonce?: number;
  extra_data?: string;
  timestamp_ms?: number;
  consensus_time?: string;
  height_tx?: number;
  outlier_resistant?: boolean;
  inference_block_height?: string;
  inferer_values?: WorkerInference[];
  forecaster_values?: WorkerInference[];
  cached_at?: string;
  next_prediction_expected_at?: string;
  is_stale?: boolean;
  seconds_late?: number | null;
  network_inference?: string;
  network_inference_normalized?: string;
  token_decimals?: number;
  /** Gateway Unix-seconds timestamp. */
  timestamp?: number;
  signature?: string;
  confidence_interval_percentiles?: string[];
  confidence_interval_percentiles_normalized?: string[];
  confidence_interval_values?: string[];
  confidence_interval_values_normalized?: string[];
  /**
   * Gateway may return this as a JSON number or string depending on route.
   */
  evm_chain_id?: number | string;
  consumer_address?: string;
  vector_signature?: string;
  vector_signature_public?: string;
  signature_extra_data?: string;
}

/**
 * Forge gateway catalog topic — public SDK type = wire JSON.
 * `latest_network_inference` is SDK-only (attached by {@link AlloraAPIClient.getTopic}).
 */
export interface Topic {
  id: number;
  creator: string;
  metadata: string;
  loss_method: string;
  epoch_last_ended: number;
  epoch_length: number;
  ground_truth_lag: number;
  worker_submission_window: number;
  created_at?: string | null;
  /** Attached by `getTopic` (best-effort); not on the topics list payload. */
  latest_network_inference?: NetworkInference | null;
}

/** Gateway topics list envelope. */
export interface TopicsResponse {
  network?: string;
  count?: number;
  cached_at?: string;
  topics: Topic[];
}

/**
 * @deprecated Upshot nested inference shape. Prefer {@link NetworkInference}.
 * Kept only for transitional imports — not returned by public methods.
 */
export interface AlloraInferenceData {
  network_inference: string;
  network_inference_normalized: string;
  confidence_interval_percentiles: string[];
  confidence_interval_percentiles_normalized: string[];
  confidence_interval_values: string[];
  confidence_interval_values_normalized: string[];
  topic_id: string;
  timestamp: number;
  extra_data: string;
}

/**
 * @deprecated Upshot nested inference envelope. Prefer {@link NetworkInference}.
 */
export interface AlloraInference {
  signature: string;
  inference_data: AlloraInferenceData;
}

/**
 * @deprecated Upshot topic shape (`topic_id` / `topic_name`). Prefer {@link Topic}.
 */
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

/** @deprecated Legacy Upshot envelope. */
export interface AlloraAPIResponse<T> {
  request_id: string;
  status: boolean;
  apiResponseMessage?: string;
  data: T;
}

export const DefaultAPIBaseURL = "https://api.developer.allora.network";
export const FORGE_API_KEY_PREFIX = "forge_sk_";
export const MAX_API_RESPONSE_BYTES = 32 << 20; // 32 MiB
