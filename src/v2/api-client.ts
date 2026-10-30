import {
  AlloraAPIError,
  APIError,
  ConfigError,
  ResponseTooLargeError,
  TimeoutError,
  TopicNotFoundError,
} from "./errors";
import {
  assertNetworkInference,
  assertTopic,
  signatureFormatToEvmChainId,
} from "./gateway";
import {
  AlloraAPIClientConfig,
  AlloraRequestOptions,
  ChainSlug,
  DefaultAPIBaseURL,
  FORGE_API_KEY_PREFIX,
  MAX_API_RESPONSE_BYTES,
  NetworkInference,
  SignatureFormat,
  Topic,
  TopicWithInference,
} from "./types";

const VALID_NETWORKS = new Set<ChainSlug>([
  ChainSlug.TESTNET,
  ChainSlug.MAINNET,
  ChainSlug.OFFCHAIN,
]);

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Node/browser `setTimeout` delay ceiling (2^31 - 1). */
const MAX_TIMEOUT_MS = 2_147_483_647;

export class AlloraAPIClient {
  private readonly apiKey: string;
  /** Canonical origin with a trailing slash (single owner for URL joining). */
  private readonly baseAPIUrl: string;
  private readonly network: ChainSlug;
  private readonly timeoutMs: number | undefined;

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

    if (config.timeoutMs !== undefined) {
      if (typeof config.timeoutMs !== "number" || !Number.isFinite(config.timeoutMs)) {
        throw new ConfigError(
          `timeoutMs must be a finite number (got ${JSON.stringify(config.timeoutMs)})`,
        );
      }
      if (config.timeoutMs <= 0) {
        throw new ConfigError("timeoutMs must be > 0");
      }
      if (config.timeoutMs > MAX_TIMEOUT_MS) {
        throw new ConfigError(
          `timeoutMs exceeds maximum of ${MAX_TIMEOUT_MS}`,
        );
      }
      this.timeoutMs = config.timeoutMs;
    } else {
      this.timeoutMs = undefined;
    }

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
   * Fetches catalog topics from the Forge API Gateway (wire `Topic` shape).
   * Does not attach inference.
   *
   * Rejection contract: caller `opts.signal` cancel → `AbortError` / caller
   * reason; client `timeoutMs` → {@link TimeoutError}; transport failures
   * surface as the raw fetch error.
   */
  async getAllTopics(opts?: AlloraRequestOptions): Promise<Topic[]> {
    return this.fetchTopics(opts?.signal);
  }

  /**
   * Returns one topic from the catalog and best-effort attaches
   * `latest_network_inference`. The gateway has no single-topic route yet, so
   * this scans the catalog list (validating only the matching row).
   *
   * NOTE: `timeoutMs` bounds each underlying HTTP request, so this method may
   * take up to ~2× `timeoutMs` in total (catalog scan, then inference attach).
   *
   * Best-effort attach: HTTP `APIError` / raw transport failures set
   * `latest_network_inference` to `null`. Cancel, timeout, config mistakes,
   * {@link ResponseTooLargeError}, and shape / topic-id mismatches still reject.
   *
   * Invalid `topicID` → {@link ConfigError}; missing catalog id →
   * {@link TopicNotFoundError}.
   */
  async getTopic(
    topicID: number,
    opts?: AlloraRequestOptions,
  ): Promise<TopicWithInference> {
    this.requireTopicId(topicID);
    // Cancellation wins over anything concurrent, at every await boundary.
    this.throwIfAborted(opts?.signal);
    let topic: Topic;
    try {
      topic = await this.fetchTopicById(topicID, opts?.signal);
    } catch (err) {
      if (opts?.signal?.aborted) {
        throw opts.signal.reason ?? this.abortError();
      }
      throw err;
    }
    this.throwIfAborted(opts?.signal);
    try {
      const inference = await this.getNetworkInference(
        topicID,
        undefined,
        opts,
      );
      return { ...topic, latest_network_inference: inference };
    } catch (err) {
      if (opts?.signal?.aborted) {
        throw opts.signal.reason ?? this.abortError();
      }
      // Best-effort: only genuine no-data outcomes resolve to null.
      // Cancellation, deadlines, configuration, size-cap, and corrupt payloads reject.
      if (
        err instanceof TimeoutError ||
        err instanceof ConfigError ||
        err instanceof ResponseTooLargeError ||
        this.isAbortError(err) ||
        (err instanceof AlloraAPIError && !(err instanceof APIError))
      ) {
        throw err;
      }
      return { ...topic, latest_network_inference: null };
    }
  }

  /**
   * Fetches the full flat gateway inference payload (`NetworkInference` wire).
   *
   * If `signatureFormat` is provided, it is mapped onto the gateway
   * `evm_chain_id` query. If omitted, no `evm_chain_id` is sent and
   * `signature` is typically `""`.
   *
   * Rejection contract: invalid `topicID` → {@link ConfigError}; caller
   * `opts.signal` cancel → `AbortError` / caller reason; client `timeoutMs` →
   * {@link TimeoutError}; transport failures surface as the raw fetch error.
   */
  async getNetworkInference(
    topicID: number,
    signatureFormat?: SignatureFormat | string,
    opts?: AlloraRequestOptions,
  ): Promise<NetworkInference> {
    return this.fetchNetworkInference(
      topicID,
      signatureFormat
        ? signatureFormatToEvmChainId(signatureFormat)
        : undefined,
      opts?.signal,
    );
  }

  /** Build a gateway URL for an endpoint (kept for back-compat). */
  getRequestUrl(endpoint: string): string {
    return this.gatewayURL(endpoint);
  }

  private requireTopicId(topicId: number): void {
    if (!Number.isInteger(topicId) || topicId <= 0) {
      throw new ConfigError(
        `topicID must be a positive integer (got ${JSON.stringify(topicId)})`,
      );
    }
  }

  private isAbortError(err: unknown): boolean {
    return (
      !!err &&
      typeof err === "object" &&
      "name" in err &&
      (err as { name?: string }).name === "AbortError"
    );
  }

  private abortError(): DOMException {
    return new DOMException("Aborted", "AbortError");
  }

  private throwIfAborted(signal?: AbortSignal): void {
    if (signal?.aborted) {
      throw signal.reason ?? this.abortError();
    }
  }

  private parseTopicsEnvelope(data: unknown): unknown[] {
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      throw new AlloraAPIError("gateway topics response is not an object");
    }
    const topics = (data as { topics?: unknown }).topics;
    if (!Array.isArray(topics)) {
      throw new AlloraAPIError(
        "gateway topics response missing topics array",
      );
    }
    return topics;
  }

  private async fetchTopics(signal?: AbortSignal): Promise<Topic[]> {
    const path = `${this.network}/topics`;
    const data = await this.gatewayGet<unknown>(path, undefined, signal);
    return this.parseTopicsEnvelope(data).map(assertTopic);
  }

  /**
   * Catalog lookup for one id: skips validation of unrelated rows so a bad
   * sibling entry cannot fail a valid topic's getTopic.
   */
  private async fetchTopicById(
    topicId: number,
    signal?: AbortSignal,
  ): Promise<Topic> {
    const path = `${this.network}/topics`;
    const data = await this.gatewayGet<unknown>(path, undefined, signal);
    const rows = this.parseTopicsEnvelope(data);
    const row = rows.find(
      (r) =>
        typeof r === "object" &&
        r !== null &&
        !Array.isArray(r) &&
        (r as { id?: unknown }).id === topicId,
    );
    if (!row) {
      throw new TopicNotFoundError(topicId);
    }
    return assertTopic(row);
  }

  private async fetchNetworkInference(
    topicId: number,
    evmChainId: string | undefined,
    signal?: AbortSignal,
  ): Promise<NetworkInference> {
    this.requireTopicId(topicId);
    const path = `${this.network}/inference/${topicId}`;
    const query = evmChainId ? { evm_chain_id: evmChainId } : undefined;
    const data = await this.gatewayGet<unknown>(path, query, signal);
    const ni = assertNetworkInference(data);
    if (ni.topic_id !== topicId) {
      throw new AlloraAPIError(
        `gateway inference topic_id ${ni.topic_id} does not match requested ${topicId}`,
      );
    }
    return ni;
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

  private composeSignal(requestSignal?: AbortSignal): {
    signal?: AbortSignal;
    cleanup: () => void;
    abortReason: () => unknown;
  } {
    if (!requestSignal && !this.timeoutMs) {
      return {
        signal: undefined,
        cleanup: () => undefined,
        abortReason: () => undefined,
      };
    }
    const controller = new AbortController();
    const onExternalAbort = () => {
      controller.abort(requestSignal?.reason);
    };
    if (requestSignal) {
      if (requestSignal.aborted) {
        controller.abort(requestSignal.reason);
      } else {
        requestSignal.addEventListener("abort", onExternalAbort, {
          once: true,
        });
      }
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (this.timeoutMs) {
      const timeoutMs = this.timeoutMs;
      timer = setTimeout(() => {
        controller.abort(new TimeoutError(timeoutMs));
      }, timeoutMs);
    }
    return {
      signal: controller.signal,
      abortReason: () => controller.signal.reason,
      cleanup: () => {
        if (timer) {
          clearTimeout(timer);
        }
        if (requestSignal) {
          requestSignal.removeEventListener("abort", onExternalAbort);
        }
      },
    };
  }

  private async gatewayGet<T>(
    path: string,
    query?: Record<string, string>,
    requestSignal?: AbortSignal,
  ): Promise<T> {
    const url = this.gatewayURL(path, query);
    const { signal, cleanup, abortReason } = this.composeSignal(requestSignal);
    try {
      let response: Response;
      try {
        response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          signal,
        });
      } catch (err) {
        throw this.normalizeAbortError(err, abortReason());
      }

      // Do not trust content-length for size limits: under compression it is
      // the encoded size, while body chunks are decompressed. Bound memory via
      // the streaming byte counter in readBodyLimited instead.

      let bodyText: string;
      try {
        bodyText = await this.readBodyLimited(response);
      } catch (err) {
        throw this.normalizeAbortError(err, abortReason());
      }

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

  private normalizeAbortError(err: unknown, signalReason?: unknown): unknown {
    // Prefer the composed signal reason — some Fetch impls surface a generic
    // AbortError even when abort(TimeoutError) was used.
    if (signalReason instanceof TimeoutError) {
      return signalReason;
    }
    if (signalReason instanceof AlloraAPIError) {
      return signalReason;
    }
    if (err instanceof TimeoutError || err instanceof AlloraAPIError) {
      return err;
    }
    if (
      err &&
      typeof err === "object" &&
      "name" in err &&
      (err as { name?: string }).name === "AbortError" &&
      "cause" in err &&
      (err as { cause?: unknown }).cause instanceof TimeoutError
    ) {
      return (err as { cause: TimeoutError }).cause;
    }
    if (
      err &&
      typeof err === "object" &&
      "name" in err &&
      (err as { name?: string }).name === "TimeoutError"
    ) {
      return err;
    }
    return err;
  }

  /**
   * Read the response body incrementally, counting decompressed bytes.
   * Cancel and reject once `MAX_API_RESPONSE_BYTES` is exceeded.
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
