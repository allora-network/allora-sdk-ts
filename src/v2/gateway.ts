import { AlloraAPIError } from "./errors";
import {
  AlloraInference,
  AlloraTopic,
  SignatureFormat,
} from "./types";

/** Wire topic from GET /{network}/topics. */
export interface GatewayTopicWire {
  id?: number;
  metadata?: string;
  epoch_length?: number;
  ground_truth_lag?: number;
  loss_method?: string;
  worker_submission_window?: number;
}

/** One label entry in a network-inference bundle. */
export interface LabeledValue {
  label_name: string;
  value: string;
}

/**
 * Flat Forge gateway inference payload (full wire shape).
 * Prefer `getNetworkInference` when you need fields beyond the locked
 * nested `AlloraInference` mapping.
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
  inferer_values?: unknown[];
  forecaster_values?: unknown[];
  inference_block_height?: string;
  cached_at?: string;
  next_prediction_expected_at?: string;
  is_stale?: boolean;
  seconds_late?: number;
  network_inference?: string;
  network_inference_normalized?: string;
  token_decimals?: number;
  /** Gateway Unix-seconds timestamp (fallback when `timestamp_ms` absent). */
  timestamp?: number;
  signature?: string;
  confidence_interval_percentiles?: string[];
  confidence_interval_percentiles_normalized?: string[];
  confidence_interval_values?: string[];
  confidence_interval_values_normalized?: string[];
  /**
   * Gateway may return this as a JSON number or string depending on route.
   * Treat as opaque wire value; do not assume `typeof === "number"`.
   */
  evm_chain_id?: number | string;
  consumer_address?: string;
  vector_signature?: string;
  vector_signature_public?: string;
  signature_extra_data?: string;
}

/** Coerce gateway scalars into trimmed strings for locked string fields. */
function asTrimmedString(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return "";
}

/**
 * Map gateway topic wire fields onto the locked AlloraTopic shape.
 * Only fields the gateway provides are set; everything else stays at defaults.
 * Do not invent `updated_at` from `cached_at` / `created_at`.
 */
export function mapGatewayTopic(gt: GatewayTopicWire): AlloraTopic {
  if (gt === null || typeof gt !== "object" || Array.isArray(gt)) {
    throw new AlloraAPIError(
      `gateway topic entry is not an object (got ${JSON.stringify(gt)})`,
    );
  }
  const id = Number(gt.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AlloraAPIError(
      `gateway topic missing valid id (got ${JSON.stringify(gt.id)})`,
    );
  }
  return {
    topic_id: id,
    topic_name: String(gt.metadata ?? ""),
    description: null,
    epoch_length: Number(gt.epoch_length ?? 0),
    ground_truth_lag: Number(gt.ground_truth_lag ?? 0),
    loss_method: String(gt.loss_method ?? ""),
    worker_submission_window: Number(gt.worker_submission_window ?? 0),
    worker_count: 0,
    reputer_count: 0,
    total_staked_allo: 0,
    total_emissions_allo: 0,
    is_active: null,
    updated_at: "",
  };
}

/** Return the sole label value, or empty if not exactly one entry. */
function singleLabeledValue(
  values: LabeledValue[] | undefined | null,
): string {
  if (!values || values.length !== 1) {
    return "";
  }
  return asTrimmedString(values[0]?.value);
}

/**
 * Normalized price: prefer `network_inference_normalized`; fall back to a
 * single labeled `combined_value` entry only. Never uses raw base-unit
 * `network_inference`.
 */
function resolveNormalized(ni: NetworkInference): string {
  return (
    asTrimmedString(ni.network_inference_normalized) ||
    singleLabeledValue(ni.combined_value)
  );
}

/**
 * Legacy `inference_data.timestamp` is Unix seconds.
 * Prefer `timestamp_ms` (convert ms → s); else use gateway `timestamp` as-is.
 */
function resolveTimestamp(ni: NetworkInference): number {
  if ((ni.timestamp_ms ?? 0) > 0) {
    return Math.floor(ni.timestamp_ms! / 1000);
  }
  if ((ni.timestamp ?? 0) > 0) {
    return ni.timestamp!;
  }
  throw new AlloraAPIError(
    `gateway inference for topic ${ni.topic_id} has no timestamp`,
  );
}

/** Structural check: object + positive integer topic_id. */
export function assertNetworkInferenceShape(
  data: unknown,
): NetworkInference {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AlloraAPIError("gateway inference response is not an object");
  }
  const ni = data as NetworkInference;
  if (
    typeof ni.topic_id !== "number" ||
    !Number.isInteger(ni.topic_id) ||
    ni.topic_id <= 0
  ) {
    throw new AlloraAPIError(
      "gateway inference response missing numeric topic_id",
    );
  }
  return ni;
}

/**
 * Full check for the locked legacy mapper: shape + at least one value the
 * mapper can surface (normalized, raw, or a single labeled combined_value).
 */
export function assertNetworkInference(data: unknown): NetworkInference {
  const ni = assertNetworkInferenceShape(data);
  const hasNormalized = asTrimmedString(ni.network_inference_normalized) !== "";
  const hasRaw = asTrimmedString(ni.network_inference) !== "";
  // Must match singleLabeledValue: multi-entry bundles do not yield a value.
  const hasCombined = singleLabeledValue(ni.combined_value) !== "";
  if (!hasNormalized && !hasRaw && !hasCombined) {
    throw new AlloraAPIError(
      `gateway inference for topic ${ni.topic_id} has no inference values`,
    );
  }
  return ni;
}

/**
 * Populate the locked nested AlloraInference shape from flat gateway JSON.
 */
export function networkInferenceToLegacy(
  ni: NetworkInference,
): AlloraInference {
  return {
    signature: asTrimmedString(ni.signature),
    inference_data: {
      network_inference: asTrimmedString(ni.network_inference),
      network_inference_normalized: resolveNormalized(ni),
      confidence_interval_percentiles:
        ni.confidence_interval_percentiles ?? [],
      confidence_interval_percentiles_normalized:
        ni.confidence_interval_percentiles_normalized ?? [],
      confidence_interval_values: ni.confidence_interval_values ?? [],
      confidence_interval_values_normalized:
        ni.confidence_interval_values_normalized ?? [],
      topic_id: String(ni.topic_id),
      timestamp: resolveTimestamp(ni),
      // Opaque wire field — preserve whitespace; coerce non-strings to "".
      extra_data: typeof ni.extra_data === "string" ? ni.extra_data : "",
    },
  };
}

/** Map a `SignatureFormat` / raw chain-id string to its `evm_chain_id` query value. */
export function signatureFormatToEvmChainId(
  signatureFormat: SignatureFormat | string,
): string {
  const dash = signatureFormat.lastIndexOf("-");
  if (dash >= 0) {
    const suffix = signatureFormat.slice(dash + 1);
    if (/^\d+$/.test(suffix)) {
      return suffix;
    }
  }
  return signatureFormat;
}
