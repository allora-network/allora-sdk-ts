import {
  AlloraAPIClient,
  ChainSlug,
  PricePredictionToken,
  PricePredictionTimeframe,
} from "../src/api-client";

const DEFAULT_TEST_TIMEOUT = 30000;

describe("AlloraAPIClient Integration Tests", () => {
  let client: AlloraAPIClient;

  beforeAll(() => {
    client = new AlloraAPIClient({
      chainSlug: ChainSlug.TESTNET,
      apiKey: process.env.ALLORA_API_KEY,
      baseAPIUrl: process.env.ALLORA_API_URL,
    });
  });

  describe("getAllTopics", () => {
    it(
      "should fetch topics from the API",
      async () => {
        const topics = await client.getAllTopics();
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBeGreaterThan(0);
        expect(topics[0]).toHaveProperty("topic_id");
        expect(topics[0]).toHaveProperty("topic_name");
      },
      DEFAULT_TEST_TIMEOUT,
    );
  });

  describe("getInference", () => {
    it(
      "should fetch inference data for a valid topic",
      async () => {
        const topics = await client.getAllTopics();
        if (topics.length === 0) {
          console.warn("No topics available for testing");
          return;
        }

        const inference = await client.getInference(topics[0].topic_id);
        expect(inference).toHaveProperty("signature");
        expect(inference).toHaveProperty("inference_data");
        expect(inference.inference_data).toHaveProperty("network_inference");
        expect(inference.inference_data).toHaveProperty(
          "network_inference_normalized",
        );
      },
      DEFAULT_TEST_TIMEOUT,
    );
  });

  describe("getPricePrediction", () => {
    it(
      "should fetch BTC price prediction",
      async () => {
        const prediction = await client.getPricePrediction(
          PricePredictionToken.BTC,
          PricePredictionTimeframe.EIGHT_HOURS,
        );

        expect(prediction).toHaveProperty("network_inference");
        expect(prediction).toHaveProperty("network_inference_normalized");
      },
      DEFAULT_TEST_TIMEOUT,
    );
  });
});
