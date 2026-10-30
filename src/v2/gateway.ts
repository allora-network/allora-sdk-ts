import { AlloraAPIError } from "./errors";
import { NetworkInference, SignatureFormat, Topic } from "./types";

/**
 * Validate a gateway topic catalog entry.
 * Requires a JSON number positive integer `id`; other wire fields pass through.
 * Strips reserved SDK-only `latest_network_inference` if present on the wire.
 */
export function assertTopic(data: unknown): Topic {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AlloraAPIError(
      `gateway topic entry is not an object (got ${JSON.stringify(data)})`,
    );
  }
  const raw = data as Record<string, unknown>;
  if (
    typeof raw.id !== "number" ||
    !Number.isInteger(raw.id) ||
    raw.id <= 0
  ) {
    throw new AlloraAPIError(
      `gateway topic missing valid id (got ${JSON.stringify(raw.id)})`,
    );
  }
  const topic = { ...(data as Topic), id: raw.id };
  delete (topic as { latest_network_inference?: unknown }).latest_network_inference;
  return topic;
}

/** Structural check: object + positive integer topic_id. */
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
  return ni;
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
