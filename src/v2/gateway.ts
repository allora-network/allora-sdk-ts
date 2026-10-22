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

/** Full flat Forge gateway inference payload. */
export interface NetworkInference {
  network?: string;
  topic_id: number;
  combined_value?: LabeledValue[];
  naive_value?: LabeledValue[];
  label_names?: string[];
  nonce?: number;
  extra_data?: string;
  timestamp_ms?: number;
  network_inference?: string;
  network_inference_normalized?: string;
  token_decimals?: number;
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
  return {
    topic_id: Number(gt.id ?? 0),
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
  return values[0].value ?? "";
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
  return ni.timestamp ?? 0;
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
