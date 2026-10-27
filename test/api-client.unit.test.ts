import {
  AlloraAPIClient,
  AlloraAPIError,
  APIError,
  ChainSlug,
  ConfigError,
  DefaultAPIBaseURL,
  MAX_API_RESPONSE_BYTES,
  ResponseTooLargeError,
  SignatureFormat,
  TopicNotFoundError,
  networkInferenceToLegacy,
} from "../src/v2";
import {
  mockGatewayTopicsResponse,
  mockNetworkInference,
  mockTopic,
} from "./mockData";

const TEST_KEY = "forge_sk_test_key_123";

function withTrailingSlash(url: string): string {
  return url.replace(/\/?$/, "/");
}

function jsonResponse(body: unknown, status = 200) {
  const text = JSON.stringify(body);
  const bytes = new TextEncoder().encode(text);
  return new Response(text, {
    status,
    headers: {
      "content-type": "application/json",
      "content-length": String(bytes.byteLength),
    },
  });
}

describe("AlloraAPIClient Unit Tests", () => {
  let client: AlloraAPIClient;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    client = new AlloraAPIClient({
      chainSlug: ChainSlug.TESTNET,
      apiKey: TEST_KEY,
      baseAPIUrl: "https://gateway.test",
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("constructor", () => {
    it("rejects empty key", () => {
      expect(() => new AlloraAPIClient({ apiKey: "" })).toThrow(ConfigError);
    });

    it("rejects undefined key at runtime", () => {
      expect(
        () =>
          new AlloraAPIClient({
            apiKey: undefined as unknown as string,
          }),
      ).toThrow(ConfigError);
    });

    it("rejects legacy UP- keys", () => {
      expect(
        () => new AlloraAPIClient({ apiKey: "UP-8cbc632a67a84ac1b4078661" }),
      ).toThrow(/forge_sk_/);
    });

    it("rejects empty baseAPIUrl", () => {
      expect(
        () => new AlloraAPIClient({ apiKey: TEST_KEY, baseAPIUrl: "   " }),
      ).toThrow(/baseAPIUrl is empty/);
    });

    it("rejects non-https remote baseAPIUrl", () => {
      expect(
        () =>
          new AlloraAPIClient({
            apiKey: TEST_KEY,
            baseAPIUrl: "http://evil.example",
          }),
      ).toThrow(/must use https/);
    });

    it("allows http://localhost", () => {
      const c = new AlloraAPIClient({
        apiKey: TEST_KEY,
        baseAPIUrl: "http://localhost:8082",
      });
      expect(c["baseAPIUrl"]).toBe("http://localhost:8082/");
    });

    it("defaults to gateway + mainnet", () => {
      const prev = process.env.ALLORA_API_BASE_URL;
      delete process.env.ALLORA_API_BASE_URL;
      try {
        const c = new AlloraAPIClient({ apiKey: TEST_KEY });
        expect(c["baseAPIUrl"]).toBe(withTrailingSlash(DefaultAPIBaseURL));
        expect(c["network"]).toBe(ChainSlug.MAINNET);
      } finally {
        if (prev === undefined) {
          delete process.env.ALLORA_API_BASE_URL;
        } else {
          process.env.ALLORA_API_BASE_URL = prev;
        }
      }
    });

    it("reads ALLORA_API_BASE_URL when baseAPIUrl omitted", () => {
      const prev = process.env.ALLORA_API_BASE_URL;
      process.env.ALLORA_API_BASE_URL = "https://env-gateway.example/";
      try {
        const c = new AlloraAPIClient({ apiKey: TEST_KEY });
        expect(c["baseAPIUrl"]).toBe("https://env-gateway.example/");
      } finally {
        if (prev === undefined) {
          delete process.env.ALLORA_API_BASE_URL;
        } else {
          process.env.ALLORA_API_BASE_URL = prev;
        }
      }
    });

    it("falls back when baseAPIUrl is empty string", () => {
      const prev = process.env.ALLORA_API_BASE_URL;
      delete process.env.ALLORA_API_BASE_URL;
      try {
        const c = new AlloraAPIClient({
          apiKey: TEST_KEY,
          baseAPIUrl: "",
        });
        expect(c["baseAPIUrl"]).toBe(withTrailingSlash(DefaultAPIBaseURL));
      } finally {
        if (prev === undefined) {
          delete process.env.ALLORA_API_BASE_URL;
        } else {
          process.env.ALLORA_API_BASE_URL = prev;
        }
      }
    });

    it("accepts overrides and testnet", () => {
      const c = new AlloraAPIClient({
        apiKey: TEST_KEY,
        chainSlug: ChainSlug.TESTNET,
        baseAPIUrl: "https://custom-gateway",
      });
      expect(c["baseAPIUrl"]).toBe("https://custom-gateway/");
      expect(c["network"]).toBe(ChainSlug.TESTNET);
    });

    it("rejects invalid chainSlug", () => {
      expect(
        () =>
          new AlloraAPIClient({
            apiKey: TEST_KEY,
            chainSlug: "bogus" as ChainSlug,
          }),
      ).toThrow(ConfigError);
    });

    it("rejects non-finite timeoutMs", () => {
      expect(
        () =>
          new AlloraAPIClient({
            apiKey: TEST_KEY,
            timeoutMs: Infinity,
          }),
      ).toThrow(ConfigError);
    });

    it("rejects timeoutMs above setTimeout ceiling", () => {
      expect(
        () =>
          new AlloraAPIClient({
            apiKey: TEST_KEY,
            timeoutMs: 3_000_000_000,
          }),
      ).toThrow(ConfigError);
    });
  });

  describe("request cancellation", () => {
    it("aborts only the call that received the signal", async () => {
      const ac = new AbortController();
      mockFetch.mockImplementationOnce((_url: string, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          const signal = init?.signal;
          if (!signal) {
            reject(new Error("expected signal"));
            return;
          }
          if (signal.aborted) {
            reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
            return;
          }
          signal.addEventListener(
            "abort",
            () => {
              reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
            },
            { once: true },
          );
        });
      });

      const pending = client.getAllTopics({ signal: ac.signal });
      ac.abort();
      await expect(pending).rejects.toMatchObject({ name: "AbortError" });

      mockFetch.mockImplementationOnce((_url: string, init?: RequestInit) => {
        expect(init?.signal?.aborted).not.toBe(true);
        return Promise.resolve(jsonResponse(mockGatewayTopicsResponse));
      });
      const topics = await client.getAllTopics();
      expect(topics).toHaveLength(1);
    });
  });

  describe("getAllTopics", () => {
    it("hits gateway path with Bearer auth and returns wire Topic", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockGatewayTopicsResponse));

      const topics = await client.getAllTopics();

      expect(topics).toHaveLength(1);
      expect(topics[0].id).toBe(mockTopic.id);
      expect(topics[0].metadata).toBe("BTC 5min");
      expect(topics[0].epoch_length).toBe(720);
      expect(topics[0].creator).toBe("allo1…");
      expect(topics[0]).not.toHaveProperty("topic_id");
      expect(topics[0]).not.toHaveProperty("topic_name");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gateway.test/testnet/topics",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${TEST_KEY}`,
          }),
        }),
      );
    });

    it("throws when topics array is missing", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ network: "testnet" }));
      await expect(client.getAllTopics()).rejects.toBeInstanceOf(AlloraAPIError);
    });

    it("throws AlloraAPIError for null topic entries", async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ topics: [null, mockGatewayTopicsResponse.topics[0]] }),
      );
      await expect(client.getAllTopics()).rejects.toBeInstanceOf(AlloraAPIError);
    });

    it("throws APIError on non-200", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ error: "forbidden" }, 403));
      await expect(client.getAllTopics()).rejects.toBeInstanceOf(APIError);
    });

    it("parses error message from body", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ error: "nope" }, 402));
      await expect(client.getAllTopics()).rejects.toMatchObject({
        statusCode: 402,
        apiMessage: "nope",
      });
    });
  });

  describe("getTopic", () => {
    it("returns catalog topic and attaches latest inference", async () => {
      mockFetch
        .mockResolvedValueOnce(jsonResponse(mockGatewayTopicsResponse))
        .mockResolvedValueOnce(jsonResponse(mockNetworkInference));

      const topic = await client.getTopic(72);
      expect(topic.id).toBe(72);
      expect(topic.metadata).toBe("BTC 5min");
      expect(topic.latest_network_inference?.network_inference_normalized).toBe(
        "0.00006678",
      );
    });

    it("leaves latest_network_inference null when inference fails", async () => {
      mockFetch
        .mockResolvedValueOnce(jsonResponse(mockGatewayTopicsResponse))
        .mockResolvedValueOnce(jsonResponse({ error: "billing" }, 402));

      const topic = await client.getTopic(72);
      expect(topic.latest_network_inference).toBeNull();
    });

    it("throws TopicNotFoundError for unknown id", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockGatewayTopicsResponse));
      await expect(client.getTopic(999)).rejects.toBeInstanceOf(
        TopicNotFoundError,
      );
    });
  });

  describe("getNetworkInference", () => {
    it("returns the flat gateway payload without nested wrapping", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockNetworkInference));

      const inference = await client.getNetworkInference(72);

      expect(inference.signature).toBe("0xabc");
      expect(inference.network_inference_normalized).toBe("0.00006678");
      expect(inference.network_inference).toBe("66781380725120668592");
      expect(inference.topic_id).toBe(72);
      expect(inference.timestamp_ms).toBe(1784025644244);
      expect(inference).not.toHaveProperty("inference_data");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gateway.test/testnet/inference/72",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${TEST_KEY}`,
          }),
        }),
      );
    });

    it("rejects non-positive topicID", async () => {
      await expect(client.getNetworkInference(0)).rejects.toBeInstanceOf(
        ConfigError,
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("rejects unexpected 200 shapes", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ count: 1 }));
      await expect(client.getNetworkInference(72)).rejects.toBeInstanceOf(
        AlloraAPIError,
      );
    });

    it("allows stale payloads without inference values", async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          topic_id: 42,
          is_stale: true,
          seconds_late: 900,
          token_decimals: 9,
          cached_at: "2026-01-01T00:00:00Z",
        }),
      );
      const ni = await client.getNetworkInference(42);
      expect(ni.is_stale).toBe(true);
      expect(ni.seconds_late).toBe(900);
    });

    it("sends evm_chain_id when signatureFormat is provided", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockNetworkInference));

      await client.getNetworkInference(72, SignatureFormat.ETHEREUM_SEPOLIA);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gateway.test/testnet/inference/72?evm_chain_id=11155111",
        expect.any(Object),
      );
    });

    it("maps ETHEREUM_ALLORA_TESTNET to evm_chain_id=3448148188", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockNetworkInference));

      await client.getNetworkInference(
        1,
        SignatureFormat.ETHEREUM_ALLORA_TESTNET,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gateway.test/testnet/inference/1?evm_chain_id=3448148188",
        expect.any(Object),
      );
    });

    it("accepts a raw chain id string", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockNetworkInference));

      await client.getNetworkInference(1, "3448148188");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gateway.test/testnet/inference/1?evm_chain_id=3448148188",
        expect.any(Object),
      );
    });

    it("getInferenceByTopicID aliases getNetworkInference", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockNetworkInference));
      const inference = await client.getInferenceByTopicID(72);
      expect(inference.network_inference_normalized).toBe("0.00006678");
      expect(inference).not.toHaveProperty("inference_data");
    });
  });

  describe("response size guard", () => {
    it("rejects when streamed (decompressed) bytes exceed the limit", async () => {
      const chunk = new Uint8Array(1024);
      let remaining = MAX_API_RESPONSE_BYTES + chunk.byteLength;
      const body = new ReadableStream<Uint8Array>({
        pull(controller) {
          if (remaining <= 0) {
            controller.close();
            return;
          }
          const size = Math.min(chunk.byteLength, remaining);
          remaining -= size;
          controller.enqueue(chunk.subarray(0, size));
        },
      });

      mockFetch.mockResolvedValueOnce(
        new Response(body, {
          status: 200,
          headers: {
            "content-type": "application/json",
            "content-length": "5129",
          },
        }),
      );

      await expect(client.getAllTopics()).rejects.toBeInstanceOf(
        ResponseTooLargeError,
      );
    });
  });

  describe("deprecated legacy adapter", () => {
    it("networkInferenceToLegacy still maps to nested shape", () => {
      const legacy = networkInferenceToLegacy(mockNetworkInference);
      expect(legacy.signature).toBe("0xabc");
      expect(legacy.inference_data.network_inference_normalized).toBe(
        "0.00006678",
      );
      expect(legacy.inference_data.timestamp).toBe(1784025644);
    });
  });
});
