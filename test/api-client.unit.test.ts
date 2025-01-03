import {
  AlloraApiClient,
  ChainSlug,
  PricePredictionToken,
  PricePredictionTimeframe,
  ChainId,
  SignatureFormat,
} from "../src/api-client";
import { mockTopic, mockInference, mockApiResponse } from "./mockData";

describe("AlloraApiClient Unit Tests", () => {
  let client: AlloraApiClient;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    client = new AlloraApiClient({
      chainSlug: ChainSlug.TESTNET,
      apiKey: "test-api-key",
      baseApiUrl: "https://test-api.com",
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with correct default values", () => {
      const testClient = new AlloraApiClient({
        chainSlug: ChainSlug.TESTNET,
        apiKey: "test-api-key",
      });
      expect(testClient["baseApiUrl"]).toBe("https://api.upshot.xyz/v2");
      expect(testClient["chainId"]).toBe(ChainId.TESTNET);
      expect(testClient["apiKey"]).toBe("test-api-key");
    });

    it("should use mainnet chain ID when chainSlug is MAINNET", () => {
      const mainnetClient = new AlloraApiClient({
        chainSlug: ChainSlug.MAINNET,
        apiKey: "test-api-key",
      });
      expect(mainnetClient["chainId"]).toBe(ChainId.MAINNET);
    });

    it("should use custom baseApiUrl when provided", () => {
      const customBaseApiUrl = "https://custom-api.com";
      const customClient = new AlloraApiClient({
        chainSlug: ChainSlug.TESTNET,
        apiKey: "test-api-key",
        baseApiUrl: customBaseApiUrl,
      });
      expect(customClient["baseApiUrl"]).toBe(customBaseApiUrl);
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

  describe("getInference", () => {
    it("should fetch inference data correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const topicId = 1;
      const inference = await client.getInference(
        topicId,
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
          `/allora/consumer/${SignatureFormat.ETHEREUM_SEPOLIA}?allora_topic_id=${topicId}&inference_value_type=uint256`,
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
      await expect(client.getInference(1)).rejects.toThrow();
    });
  });

  describe("getPricePrediction", () => {
    it("should fetch price prediction data correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const prediction = await client.getPricePrediction(
        PricePredictionToken.BTC,
        PricePredictionTimeframe.FIVE_MIN,
      );

      expect(prediction.network_inference).toEqual(
        mockInference.inference_data.network_inference,
      );
      expect(prediction.network_inference_normalized).toEqual(
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
            ...mockApiResponse,
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
