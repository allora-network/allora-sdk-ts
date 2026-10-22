import { APIError } from "./errors";
import {
  GatewayTopicWire,
  mapGatewayTopic,
  NetworkInference,
  networkInferenceToLegacy,
  signatureFormatToEvmChainId,
} from "./gateway";
import {
  AlloraAPIClientConfig,
  AlloraInference,
  AlloraTopic,
  ChainSlug,
  DefaultAPIBaseURL,
  FORGE_API_KEY_PREFIX,
  MAX_API_RESPONSE_BYTES,
  SignatureFormat,
} from "./types";

const VALID_NETWORKS = new Set<ChainSlug>([
  ChainSlug.TESTNET,
  ChainSlug.MAINNET,
  ChainSlug.OFFCHAIN,
]);

export class AlloraAPIClient {
  private readonly apiKey: string;
  private readonly baseAPIUrl: string;
  private readonly network: ChainSlug;

  constructor(config: AlloraAPIClientConfig) {
    const apiKey = config.apiKey?.trim() ?? "";
    if (!apiKey) {
      throw new Error("ALLORA_API_KEY is required (forge_sk_…)");
    }
    if (!apiKey.startsWith(FORGE_API_KEY_PREFIX)) {
      throw new Error(`API key must start with ${FORGE_API_KEY_PREFIX}`);
    }

    const network = config.chainSlug ?? ChainSlug.MAINNET;
    if (!VALID_NETWORKS.has(network)) {
      throw new Error(
        `unsupported network ${JSON.stringify(network)} (want testnet|mainnet|offchain)`,
      );
    }

    this.apiKey = apiKey;
    const envBase =
      typeof process !== "undefined"
        ? process.env.ALLORA_API_BASE_URL
        : undefined;
    this.baseAPIUrl = (
      config.baseAPIUrl ??
      envBase ??
      DefaultAPIBaseURL
    ).replace(/\/$/, "");
    this.network = network;
  }

  /**
   * Fetches all available topics from the Forge API Gateway.
   * Mapped topics only — does not attach inference.
   */
  async getAllTopics(): Promise<AlloraTopic[]> {
    return this.fetchTopics();
  }

  /**
   * Fetches an inference for a specific topic from the Forge API Gateway.
   * Returns the locked nested AlloraInference shape.
   *
   * If `signatureFormat` is provided, it is mapped onto the gateway
   * `evm_chain_id` query (e.g. ethereum-11155111 → 11155111).
   * If omitted, no `evm_chain_id` is sent.
   */
  async getInferenceByTopicID(
    topicID: number,
    signatureFormat?: SignatureFormat | string,
  ): Promise<AlloraInference> {
    const evmChainId = signatureFormat
      ? signatureFormatToEvmChainId(signatureFormat)
      : undefined;
    const ni = await this.fetchNetworkInference(topicID, evmChainId);
    return networkInferenceToLegacy(ni);
  }

  /** Build a gateway URL for an endpoint (kept for back-compat). */
  getRequestUrl(endpoint: string): string {
    return this.gatewayURL(endpoint);
  }

  private async fetchTopics(): Promise<AlloraTopic[]> {
    const path = `${this.network}/topics`;
    const data = await this.gatewayGet<{ topics?: GatewayTopicWire[] }>(path);
    return (data.topics ?? []).map(mapGatewayTopic);
  }

  private async fetchNetworkInference(
    topicId: number,
    evmChainId?: string,
  ): Promise<NetworkInference> {
    const path = `${this.network}/inference/${topicId}`;
    const query = evmChainId ? { evm_chain_id: evmChainId } : undefined;
    return this.gatewayGet<NetworkInference>(path, query);
  }

  private gatewayURL(path: string, query?: Record<string, string>): string {
    const u = new URL(
      path.replace(/^\//, ""),
      this.baseAPIUrl.replace(/\/?$/, "/"),
    );
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== "") {
          u.searchParams.append(k, v);
        }
      }
    }
    return u.href;
  }

  private async gatewayGet<T>(
    path: string,
    query?: Record<string, string>,
  ): Promise<T> {
    const url = this.gatewayURL(path, query);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_API_RESPONSE_BYTES) {
      throw new Error(
        `response body exceeds ${MAX_API_RESPONSE_BYTES} bytes`,
      );
    }

    const bodyText = await this.readBodyLimited(response);

    if (response.status !== 200) {
      let message = "";
      try {
        const parsed = JSON.parse(bodyText) as { error?: string };
        if (parsed && typeof parsed.error === "string") {
          message = parsed.error;
        }
      } catch {
        // ignore parse errors
      }
      throw new APIError(response.status, message, bodyText);
    }

    if (!bodyText) {
      throw new APIError(response.status, "empty response body", "");
    }
    return JSON.parse(bodyText) as T;
  }

  /**
   * Read the response body incrementally, counting bytes (not UTF-16 code
   * units). Cancel and reject once `MAX_API_RESPONSE_BYTES` is exceeded.
   */
  private async readBodyLimited(response: Response): Promise<string> {
    if (!response.body) {
      // Fallback for mocks / environments without a stream body.
      const text = await response.text();
      if (new TextEncoder().encode(text).byteLength > MAX_API_RESPONSE_BYTES) {
        throw new Error(
          `response body exceeds ${MAX_API_RESPONSE_BYTES} bytes`,
        );
      }
      return text;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        if (!value || value.byteLength === 0) {
          continue;
        }
        total += value.byteLength;
        if (total > MAX_API_RESPONSE_BYTES) {
          await reader.cancel();
          throw new Error(
            `response body exceeds ${MAX_API_RESPONSE_BYTES} bytes`,
          );
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder().decode(merged);
  }
}
