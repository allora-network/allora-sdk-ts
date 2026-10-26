import {
  AlloraAPIError,
  APIError,
  ConfigError,
  ResponseTooLargeError,
} from "./errors";
import {
  assertNetworkInference,
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

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export class AlloraAPIClient {
  private readonly apiKey: string;
  /** Canonical origin with a trailing slash (single owner for URL joining). */
  private readonly baseAPIUrl: string;
  private readonly network: ChainSlug;
  private readonly timeoutMs: number | undefined;
  private readonly signal: AbortSignal | undefined;

  constructor(config: AlloraAPIClientConfig) {
    const apiKey = config.apiKey?.trim() ?? "";
    if (!apiKey) {
      throw new ConfigError("ALLORA_API_KEY is required (forge_sk_…)");
    }
    if (!apiKey.startsWith(FORGE_API_KEY_PREFIX)) {
      throw new ConfigError(`API key must start with ${FORGE_API_KEY_PREFIX}`);
    }

    const network = config.chainSlug ?? ChainSlug.MAINNET;
    if (!VALID_NETWORKS.has(network)) {
      throw new ConfigError(
        `unsupported network ${JSON.stringify(network)} (want testnet|mainnet|offchain)`,
      );
    }

    this.apiKey = apiKey;
    this.network = network;
    this.timeoutMs =
      config.timeoutMs !== undefined &&
      Number.isFinite(config.timeoutMs) &&
      config.timeoutMs > 0
        ? config.timeoutMs
        : undefined;
    this.signal = config.signal;

    const envBase =
      typeof process !== "undefined"
        ? process.env.ALLORA_API_BASE_URL
        : undefined;
    const rawBase = (config.baseAPIUrl || envBase || DefaultAPIBaseURL).trim();
    if (!rawBase) {
      throw new ConfigError("baseAPIUrl is empty");
    }

    let parsed: URL;
    try {
      parsed = new URL(rawBase);
    } catch {
      throw new ConfigError(`baseAPIUrl is not a valid URL: ${rawBase}`);
    }
    const isLocal = LOCAL_HOSTS.has(parsed.hostname);
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocal)) {
      throw new ConfigError(
        `baseAPIUrl must use https:// (got ${parsed.protocol}//${parsed.hostname})`,
      );
    }

    // Single canonical form with trailing slash for `new URL(path, base)`.
    this.baseAPIUrl = parsed.href.replace(/\/?$/, "/");
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
   * If omitted, no `evm_chain_id` is sent and `signature` is typically `""`.
   */
  async getInferenceByTopicID(
    topicID: number,
    signatureFormat?: SignatureFormat | string,
  ): Promise<AlloraInference> {
    const ni = await this.fetchNetworkInference(
      topicID,
      signatureFormat
        ? signatureFormatToEvmChainId(signatureFormat)
        : undefined,
    );
    return networkInferenceToLegacy(ni);
  }

  /**
   * Fetches the full flat gateway inference payload (staleness, decimals,
   * provenance, vector signature, …). Use this when the locked nested
   * `AlloraInference` shape is not enough.
   */
  async getNetworkInference(
    topicID: number,
    signatureFormat?: SignatureFormat | string,
  ): Promise<NetworkInference> {
    return this.fetchNetworkInference(
      topicID,
      signatureFormat
        ? signatureFormatToEvmChainId(signatureFormat)
        : undefined,
    );
  }

  /** Build a gateway URL for an endpoint (kept for back-compat). */
  getRequestUrl(endpoint: string): string {
    return this.gatewayURL(endpoint);
  }

  private async fetchTopics(): Promise<AlloraTopic[]> {
    const path = `${this.network}/topics`;
    const data = await this.gatewayGet<unknown>(path);
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      throw new AlloraAPIError("gateway topics response is not an object");
    }
    const topics = (data as { topics?: unknown }).topics;
    if (!Array.isArray(topics)) {
      throw new AlloraAPIError(
        "gateway topics response missing topics array",
      );
    }
    return (topics as GatewayTopicWire[]).map(mapGatewayTopic);
  }

  private async fetchNetworkInference(
    topicId: number,
    evmChainId?: string,
  ): Promise<NetworkInference> {
    if (!Number.isInteger(topicId) || topicId <= 0) {
      throw new ConfigError(
        `topicID must be a positive integer (got ${JSON.stringify(topicId)})`,
      );
    }
    const path = `${this.network}/inference/${topicId}`;
    const query = evmChainId ? { evm_chain_id: evmChainId } : undefined;
    const data = await this.gatewayGet<unknown>(path, query);
    return assertNetworkInference(data);
  }

  private gatewayURL(path: string, query?: Record<string, string>): string {
    const u = new URL(path.replace(/^\//, ""), this.baseAPIUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== "") {
          u.searchParams.append(k, v);
        }
      }
    }
    return u.href;
  }

  private composeSignal(): { signal?: AbortSignal; cleanup: () => void } {
    if (!this.signal && !this.timeoutMs) {
      return { signal: undefined, cleanup: () => undefined };
    }
    const controller = new AbortController();
    const onExternalAbort = () => controller.abort();
    if (this.signal) {
      if (this.signal.aborted) {
        controller.abort();
      } else {
        this.signal.addEventListener("abort", onExternalAbort, { once: true });
      }
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (this.timeoutMs) {
      timer = setTimeout(() => controller.abort(), this.timeoutMs);
    }
    return {
      signal: controller.signal,
      cleanup: () => {
        if (timer) {
          clearTimeout(timer);
        }
        if (this.signal) {
          this.signal.removeEventListener("abort", onExternalAbort);
        }
      },
    };
  }

  private async gatewayGet<T>(
    path: string,
    query?: Record<string, string>,
  ): Promise<T> {
    const url = this.gatewayURL(path, query);
    const { signal, cleanup } = this.composeSignal();
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal,
      });

      const contentLengthHeader = response.headers.get("content-length");
      const contentLength = contentLengthHeader
        ? Number(contentLengthHeader)
        : NaN;
      if (
        Number.isFinite(contentLength) &&
        contentLength > MAX_API_RESPONSE_BYTES
      ) {
        await this.cancelBody(response);
        throw new ResponseTooLargeError(MAX_API_RESPONSE_BYTES);
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
      try {
        return JSON.parse(bodyText) as T;
      } catch {
        throw new AlloraAPIError("gateway response is not valid JSON");
      }
    } finally {
      // Keep timeout/external abort active through body read, not just headers.
      cleanup();
    }
  }

  private async cancelBody(response: Response): Promise<void> {
    try {
      await response.body?.cancel();
    } catch {
      // best-effort drain / cancel
    }
  }

  /**
   * Read the response body incrementally, counting bytes (not UTF-16 code
   * units). Cancel and reject once `MAX_API_RESPONSE_BYTES` is exceeded.
   */
  private async readBodyLimited(response: Response): Promise<string> {
    if (!response.body) {
      const text = await response.text();
      if (new TextEncoder().encode(text).byteLength > MAX_API_RESPONSE_BYTES) {
        throw new ResponseTooLargeError(MAX_API_RESPONSE_BYTES);
      }
      return text;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    let cancelled = false;
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
          cancelled = true;
          await reader.cancel();
          throw new ResponseTooLargeError(MAX_API_RESPONSE_BYTES);
        }
        chunks.push(value);
      }
    } catch (err) {
      if (!cancelled) {
        try {
          await reader.cancel();
        } catch {
          // ignore secondary cancel failures
        }
      }
      throw err;
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // already released after cancel in some runtimes
      }
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
