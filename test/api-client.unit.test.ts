import {
  AlloraAPIClient,
  APIError,
  ChainSlug,
  DefaultAPIBaseURL,
  SignatureFormat,
  networkInferenceToLegacy,
} from "../src/v2";
import {
  mockGatewayTopicsResponse,
  mockNetworkInference,
  mockTopic,
} from "./mockData";

const TEST_KEY = "forge_sk_test_key_123";

function jsonResponse(body: unknown, status = 200) {
  const text = JSON.stringify(body);
  return {
    ok: status === 200,
    status,
    headers: new Headers({ "content-length": String(text.length) }),
    text: () => Promise.resolve(text),
  };
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
      expect(() => new AlloraAPIClient({ apiKey: "" })).toThrow(
        /ALLORA_API_KEY is required/,
      );
    });

    it("rejects legacy UP- keys", () => {
      expect(
        () => new AlloraAPIClient({ apiKey: "UP-8cbc632a67a84ac1b4078661" }),
      ).toThrow(/forge_sk_/);
    });

    it("defaults to gateway + mainnet", () => {
      const c = new AlloraAPIClient({ apiKey: TEST_KEY });
      expect(c["baseAPIUrl"]).toBe(DefaultAPIBaseURL);
      expect(c["network"]).toBe(ChainSlug.MAINNET);
    });

    it("accepts overrides and testnet", () => {
      const c = new AlloraAPIClient({
        apiKey: TEST_KEY,
        chainSlug: ChainSlug.TESTNET,
        baseAPIUrl: "https://custom-gateway",
      });
      expect(c["baseAPIUrl"]).toBe("https://custom-gateway");
      expect(c["network"]).toBe(ChainSlug.TESTNET);
    });
  });

  describe("getAllTopics", () => {
    it("hits gateway path with Bearer auth and maps topics", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockGatewayTopicsResponse));

      const topics = await client.getAllTopics();

      expect(topics).toHaveLength(1);
      expect(topics[0].topic_id).toBe(mockTopic.topic_id);
      expect(topics[0].topic_name).toBe("BTC 5min");
      expect(topics[0].epoch_length).toBe(720);
      expect(topics[0].worker_count).toBe(0);
      expect(topics[0].is_active).toBeNull();
      expect(topics[0].updated_at).toBe("");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gateway.test/testnet/topics",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${TEST_KEY}`,
          }),
        }),
      );
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

  describe("getInferenceByTopicID", () => {
    it("maps flat gateway JSON to nested AlloraInference without evm_chain_id by default", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockNetworkInference));

      const inference = await client.getInferenceByTopicID(72);

      expect(inference.signature).toBe("0xabc");
      expect(inference.inference_data.network_inference_normalized).toBe(
        "0.00006678",
      );
      expect(inference.inference_data.network_inference).toBe(
        "66781380725120668592",
      );
      expect(inference.inference_data.topic_id).toBe("72");
      expect(inference.inference_data.timestamp).toBe(1784025644244);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gateway.test/testnet/inference/72",
        expect.any(Object),
      );
    });

    it("sends evm_chain_id only when signatureFormat is provided", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockNetworkInference));

      await client.getInferenceByTopicID(
        72,
        SignatureFormat.ETHEREUM_SEPOLIA,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gateway.test/testnet/inference/72?evm_chain_id=11155111",
        expect.any(Object),
      );
    });

    it("maps ETHEREUM_ALLORA_TESTNET to evm_chain_id=3448148188", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockNetworkInference));

      await client.getInferenceByTopicID(
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

      await client.getInferenceByTopicID(1, "3448148188");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gateway.test/testnet/inference/1?evm_chain_id=3448148188",
        expect.any(Object),
      );
    });
  });

  describe("inference mapping", () => {
    it("networkInferenceToLegacy prefers normalized and keeps nested field names", () => {
      const legacy = networkInferenceToLegacy(mockNetworkInference);
      expect(legacy.signature).toBe("0xabc");
      expect(legacy.inference_data.network_inference_normalized).toBe(
        "0.00006678",
      );
      expect(legacy.inference_data.network_inference_normalized).not.toBe(
        mockNetworkInference.network_inference,
      );
      expect(legacy.inference_data.confidence_interval_percentiles).toEqual([
        "0.25",
        "0.75",
      ]);
    });

    it("falls back to single labeled combined_value when normalized empty", () => {
      const legacy = networkInferenceToLegacy({
        topic_id: 1,
        network_inference_normalized: "  ",
        combined_value: [{ label_name: "y", value: "1.23" }],
        network_inference: "999999",
      });
      expect(legacy.inference_data.network_inference_normalized).toBe("1.23");
    });

    it("leaves normalized empty for multi-label bundles", () => {
      const legacy = networkInferenceToLegacy({
        topic_id: 1,
        network_inference_normalized: "",
        combined_value: [
          { label_name: "a", value: "1" },
          { label_name: "b", value: "2" },
        ],
        network_inference: "999",
      });
      expect(legacy.inference_data.network_inference_normalized).toBe("");
    });

    it("uses timestamp seconds × 1000 when timestamp_ms missing", () => {
      const legacy = networkInferenceToLegacy({
        topic_id: 1,
        timestamp: 1000,
        network_inference_normalized: "1.0",
      });
      expect(legacy.inference_data.timestamp).toBe(1_000_000);
    });
  });
});
