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
      // Only the Forge override — never fall back to legacy ALLORA_API_URL.
      baseAPIUrl: process.env.ALLORA_API_BASE_URL,
    });
  });

  describe("getAllTopics", () => {
    it(
      "should fetch topics from the gateway",
      async () => {
        const topics = await client.getAllTopics();
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBeGreaterThan(0);
        expect(topics[0]).toHaveProperty("topic_id");
        expect(topics[0]).toHaveProperty("topic_name");
        console.log(
          `topics count=${topics.length} first=${topics[0].topic_name}`,
        );
      },
      DEFAULT_TEST_TIMEOUT,
    );
  });

  describe("getInferenceByTopicID", () => {
    it(
      "should fetch nested inference without evm_chain_id",
      async () => {
        const inference = await client.getInferenceByTopicID(topicId);
        expect(inference).toHaveProperty("signature");
        expect(inference).toHaveProperty("inference_data");
        expect(inference.inference_data).toHaveProperty("network_inference");
        expect(inference.inference_data).toHaveProperty(
          "network_inference_normalized",
        );
        const normalized = inference.inference_data.network_inference_normalized;
        expect(normalized.length).toBeGreaterThan(0);
        // Without chain id the gateway returns an empty signature.
        expect(inference.signature).toBe("");
        console.log(
          `without-chain topic=${topicId} normalized=${normalized} signatureLen=${inference.signature.length}`,
        );
      },
      DEFAULT_TEST_TIMEOUT,
    );

    it(
      "should fetch nested inference with evm_chain_id=3448148188",
      async () => {
        const inference = await client.getInferenceByTopicID(
          topicId,
          SignatureFormat.ETHEREUM_ALLORA_TESTNET,
        );
        expect(inference).toHaveProperty("signature");
        expect(inference).toHaveProperty("inference_data");
        const normalized = inference.inference_data.network_inference_normalized;
        expect(normalized.length).toBeGreaterThan(0);
        expect(inference.signature).toMatch(/^0x[0-9a-fA-F]+$/);
        console.log(
          `with-chain topic=${topicId} normalized=${normalized} signature=${inference.signature.slice(0, 18)}…`,
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
