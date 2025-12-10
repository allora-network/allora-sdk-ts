import { AlloraChainClient, NETWORKS, getNetworkConfig } from "../src/v2";

describe("Network Configuration", () => {
  it("should have correct testnet configuration", () => {
    const config = getNetworkConfig("testnet");
    expect(config.rpcEndpoint).toBe(
      "https://allora-rpc.testnet.allora.network",
    );
    expect(config.chainId).toBe("allora-testnet-1");
    expect(config.denom).toBe("uallo");
  });

  it("should have correct mainnet configuration", () => {
    const config = getNetworkConfig("mainnet");
    expect(config.rpcEndpoint).toBe(
      "https://allora-rpc.mainnet.allora.network",
    );
    expect(config.chainId).toBe("allora-mainnet-1");
    expect(config.denom).toBe("uallo");
  });
});

describe("AlloraChainClient Factory Methods", () => {
  it("should create client from network name", async () => {
    const client = await AlloraChainClient.fromNetwork("testnet");
    expect(client).toBeDefined();
    expect(client.emissions).toBeDefined();
    expect(client.bank).toBeDefined();
  });

  // TODO: Emissions v7 protobufs may be out of sync with current testnet version
  it.skip("should get next topic ID from testnet", async () => {
    const client = await AlloraChainClient.fromNetwork("testnet");
    const response = await client.emissions.getNextTopicId();
    expect(response.nextTopicId).toBeDefined();
    expect(Number(response.nextTopicId)).toBeGreaterThan(0);
  });

  it("should create signing client from private key", async () => {
    // Use a test private key (32 bytes hex)
    const testPrivateKey =
      "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const client = await AlloraChainClient.fromPrivateKey(
      "testnet",
      testPrivateKey,
    );
    expect(client).toBeDefined();

    // Should be able to get signer address
    const address = await client.getSignerAddress();
    expect(address).toMatch(/^allo1/);
  });
});
