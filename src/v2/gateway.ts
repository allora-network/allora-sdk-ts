import { AlloraAPIError } from "./errors";
import {
  AlloraInference,
  LabeledValue,
  NetworkInference,
  SignatureFormat,
  Topic,
} from "./types";

/** @deprecated Use {@link Topic}. */
export type GatewayTopicWire = Topic;

/** Coerce gateway scalars into trimmed strings for legacy adapters. */
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

/** Validate a gateway topic catalog entry. */
export function assertTopic(data: unknown): Topic {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AlloraAPIError(
      `gateway topic entry is not an object (got ${JSON.stringify(data)})`,
    );
  }
  const t = data as Topic;
  const id = Number(t.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AlloraAPIError(
      `gateway topic missing valid id (got ${JSON.stringify(t.id)})`,
    );
  }
  return {
    id,
    creator: String(t.creator ?? ""),
    metadata: String(t.metadata ?? ""),
    loss_method: String(t.loss_method ?? ""),
    epoch_last_ended: Number(t.epoch_last_ended ?? 0),
    epoch_length: Number(t.epoch_length ?? 0),
    ground_truth_lag: Number(t.ground_truth_lag ?? 0),
    worker_submission_window: Number(t.worker_submission_window ?? 0),
    created_at: t.created_at ?? null,
  };
}

/**
 * @deprecated Use {@link assertTopic}. Previously mapped wire → Upshot AlloraTopic.
 */
export function mapGatewayTopic(gt: Topic): Topic {
  return assertTopic(gt);
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
 * Full check when callers require at least one usable inference value
 * (normalized, raw, or a single labeled combined_value).
 */
export function assertNetworkInference(data: unknown): NetworkInference {
  const ni = assertNetworkInferenceShape(data);
  const hasNormalized = asTrimmedString(ni.network_inference_normalized) !== "";
  const hasRaw = asTrimmedString(ni.network_inference) !== "";
  const hasCombined = singleLabeledValue(ni.combined_value) !== "";
  if (!hasNormalized && !hasRaw && !hasCombined) {
    throw new AlloraAPIError(
      `gateway inference for topic ${ni.topic_id} has no inference values`,
    );
  }
  return ni;
}

/**
 * @deprecated Prefer returning {@link NetworkInference} directly.
 * Populate the old nested AlloraInference shape from flat gateway JSON.
 */
export function networkInferenceToLegacy(
  ni: NetworkInference,
): AlloraInference {
  return {
    signature: asTrimmedString(ni.signature),
    inference_data: {
      network_inference: asTrimmedString(ni.network_inference),
      network_inference_normalized:
        asTrimmedString(ni.network_inference_normalized) ||
        singleLabeledValue(ni.combined_value),
      confidence_interval_percentiles:
        ni.confidence_interval_percentiles ?? [],
      confidence_interval_percentiles_normalized:
        ni.confidence_interval_percentiles_normalized ?? [],
      confidence_interval_values: ni.confidence_interval_values ?? [],
      confidence_interval_values_normalized:
        ni.confidence_interval_values_normalized ?? [],
      topic_id: String(ni.topic_id),
      timestamp: resolveTimestamp(ni),
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
