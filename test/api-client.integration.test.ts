import {
  AlloraAPIClient,
  ChainSlug,
  SignatureFormat,
} from "../src/v2";

const DEFAULT_TEST_TIMEOUT = 30000;
const apiKey = process.env.ALLORA_API_KEY ?? "";
const hasForgeKey =
  apiKey.startsWith("forge_sk_") && !apiKey.includes("…");
const topicId = Number(process.env.ALLORA_TEST_TOPIC_ID ?? "1");
const validTopicId = Number.isInteger(topicId) && topicId > 0;

const describeIntegration =
  hasForgeKey && validTopicId ? describe : describe.skip;

describeIntegration("AlloraAPIClient Integration Tests", () => {
  let client: AlloraAPIClient;

  beforeAll(() => {
    client = new AlloraAPIClient({
      chainSlug: (process.env.ALLORA_NETWORK as ChainSlug) || ChainSlug.TESTNET,
      apiKey,
      baseAPIUrl: process.env.ALLORA_API_BASE_URL,
    });
  });

  describe("getAllTopics", () => {
    it(
      "should fetch wire Topic catalog from the gateway",
      async () => {
        const topics = await client.getAllTopics();
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBeGreaterThan(0);
        expect(topics[0]).toHaveProperty("id");
        expect(topics[0]).toHaveProperty("metadata");
        expect(topics[0]).not.toHaveProperty("topic_id");
        console.log(
          `topics count=${topics.length} first=${topics[0].metadata}`,
        );
      },
      DEFAULT_TEST_TIMEOUT,
    );
  });

  describe("getNetworkInference", () => {
    it(
      "should fetch flat inference without evm_chain_id",
      async () => {
        const inference = await client.getNetworkInference(topicId);
        expect(inference.topic_id).toBe(topicId);
        expect(typeof inference.network_inference_normalized).toBe("string");
        expect(
          (inference.network_inference_normalized ?? "").length,
        ).toBeGreaterThan(0);
        expect(inference).not.toHaveProperty("inference_data");
        expect(inference.signature ?? "").toBe("");
        console.log(
          `without-chain topic=${topicId} normalized=${inference.network_inference_normalized}`,
        );
      },
      DEFAULT_TEST_TIMEOUT,
    );

    it(
      "should fetch flat inference with evm_chain_id=3448148188",
      async () => {
        const inference = await client.getNetworkInference(
          topicId,
          SignatureFormat.ETHEREUM_ALLORA_TESTNET,
        );
        expect(
          (inference.network_inference_normalized ?? "").length,
        ).toBeGreaterThan(0);
        expect(inference.signature).toMatch(/^0x[0-9a-fA-F]+$/);
        console.log(
          `with-chain topic=${topicId} signature=${inference.signature?.slice(0, 18)}…`,
        );
      },
      DEFAULT_TEST_TIMEOUT,
    );
  });
});

describe("AlloraAPIClient Integration gate", () => {
  it("documents forge_sk requirement when key missing", () => {
    if (!hasForgeKey || !validTopicId) {
      console.warn(
        "Skipping live integration tests: set ALLORA_API_KEY=forge_sk_… and ALLORA_TEST_TOPIC_ID",
      );
    }
    expect(true).toBe(true);
  });
});
