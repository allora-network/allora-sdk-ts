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
  evm_chain_id?: number;
  consumer_address?: string;
  vector_signature?: string;
  vector_signature_public?: string;
  signature_extra_data?: string;
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
  const v = values[0]?.value;
  return v == null ? "" : String(v).trim();
}

/**
 * Normalized price: prefer `network_inference_normalized`; fall back to a
 * single labeled `combined_value` entry only. Never uses raw base-unit
 * `network_inference`.
 */
function resolveNormalized(ni: NetworkInference): string {
  return (ni.network_inference_normalized ?? "").trim()
    || singleLabeledValue(ni.combined_value);
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

/** Validate a parsed gateway inference body before mapping. */
export function assertNetworkInference(data: unknown): NetworkInference {
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
  const hasNormalized =
    typeof ni.network_inference_normalized === "string" &&
    ni.network_inference_normalized.trim() !== "";
  const hasRaw =
    typeof ni.network_inference === "string" &&
    ni.network_inference.trim() !== "";
  const hasCombined =
    Array.isArray(ni.combined_value) &&
    ni.combined_value.some((entry) => {
      if (entry === null || typeof entry !== "object") {
        return false;
      }
      const v = (entry as LabeledValue).value;
      return v != null && String(v).trim() !== "";
    });
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
    signature: ni.signature ?? "",
    inference_data: {
      network_inference: ni.network_inference ?? "",
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
      extra_data: ni.extra_data ?? "",
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
