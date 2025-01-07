import {
  AlloraAPIClient,
  ChainSlug,
  PricePredictionToken,
  PricePredictionTimeframe,
  ChainID,
  SignatureFormat,
} from "../src/v2";
import { mockTopic, mockInference, mockAPIResponse } from "./mockData";

describe("AlloraAPIClient Unit Tests", () => {
  let client: AlloraAPIClient;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    client = new AlloraAPIClient({
      chainSlug: ChainSlug.TESTNET,
      apiKey: "test-api-key",
      baseAPIUrl: "https://test-api.com",
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with correct default values", () => {
      const testClient = new AlloraAPIClient({
        chainSlug: ChainSlug.TESTNET,
        apiKey: "test-api-key",
      });
      expect(testClient["baseAPIUrl"]).toBe("https://api.upshot.xyz/v2");
      expect(testClient["chainID"]).toBe(ChainID.TESTNET);
      expect(testClient["apiKey"]).toBe("test-api-key");
    });

    it("should use mainnet chain ID when chainSlug is MAINNET", () => {
      const mainnetClient = new AlloraAPIClient({
        chainSlug: ChainSlug.MAINNET,
        apiKey: "test-api-key",
      });
      expect(mainnetClient["chainID"]).toBe(ChainID.MAINNET);
    });

    it("should use custom baseAPIUrl when provided", () => {
      const customBaseAPIUrl = "https://custom-api.com";
      const customClient = new AlloraAPIClient({
        chainSlug: ChainSlug.TESTNET,
        apiKey: "test-api-key",
        baseAPIUrl: customBaseAPIUrl,
      });
      expect(customClient["baseAPIUrl"]).toBe(customBaseAPIUrl);
    });
  });

  describe("getAllTopics", () => {
    it("should fetch all topics with pagination", async () => {
      const expectedTopics = [mockTopic, { ...mockTopic, topic_id: 2 }];
      const firstResponse = {
        status: true,
        request_id: "test",
        data: {
          topics: [expectedTopics[0]],
          continuation_token: "next-page",
        },
      };

      const secondResponse = {
        status: true,
        request_id: "test",
        data: {
          topics: [expectedTopics[1]],
          continuation_token: null,
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(firstResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(secondResponse),
        });

      const topics = await client.getAllTopics();

      expect(topics).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(2);

      for (let i = 0; i < topics.length; i++) {
        expect(topics[i].topic_id).toBe(expectedTopics[i].topic_id);
        expect(topics[i].topic_name).toBe(expectedTopics[i].topic_name);
      }
    });

    it("should throw an error if the API request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({}),
      });
      await expect(client.getAllTopics()).rejects.toThrow();
    });
  });

  describe("getInferenceByTopicID", () => {
    it("should fetch inference data correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAPIResponse),
      });

      const topicID = 1;
      const inference = await client.getInferenceByTopicID(
        topicID,
        SignatureFormat.ETHEREUM_SEPOLIA,
      );

      expect(inference.inference_data.network_inference).toEqual(
        mockInference.inference_data.network_inference,
      );
      expect(inference.inference_data.network_inference_normalized).toEqual(
        mockInference.inference_data.network_inference_normalized,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `/allora/consumer/${SignatureFormat.ETHEREUM_SEPOLIA}?allora_topic_id=${topicID}&inference_value_type=uint256`,
        ),
        expect.any(Object),
      );
    });

    it("should throw an error if the API request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({}),
      });
      await expect(client.getInferenceByTopicID(1)).rejects.toThrow();
    });
  });

  describe("getPricePrediction", () => {
    it("should fetch price prediction data correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAPIResponse),
      });

      const prediction = await client.getPricePrediction(
        PricePredictionToken.BTC,
        PricePredictionTimeframe.FIVE_MIN,
      );

      expect(prediction.inference_data.network_inference).toEqual(
        mockInference.inference_data.network_inference,
      );
      expect(prediction.inference_data.network_inference_normalized).toEqual(
        mockInference.inference_data.network_inference_normalized,
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `/allora/consumer/price/${SignatureFormat.ETHEREUM_SEPOLIA}/${PricePredictionToken.BTC}/${PricePredictionTimeframe.FIVE_MIN}`,
        ),
        expect.any(Object),
      );
    });

    it("should throw error when inference data is missing", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockAPIResponse,
            data: { signature: "0x1234" },
          }),
      });

      await expect(
        client.getPricePrediction(
          PricePredictionToken.BTC,
          PricePredictionTimeframe.FIVE_MIN,
        ),
      ).rejects.toThrow("Failed to fetch price prediction");
    });

    it("should throw an error if the API request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({}),
      });
      await expect(
        client.getPricePrediction(
          PricePredictionToken.BTC,
          PricePredictionTimeframe.FIVE_MIN,
        ),
      ).rejects.toThrow();
    });
  });
});
