/**
 * Allora Network configurations for testnet and mainnet
 */

export interface NetworkConfig {
  rpcEndpoint: string;
  chainId: string;
  denom: string;
}

export const NETWORKS: Record<"testnet" | "mainnet", NetworkConfig> = {
  testnet: {
    rpcEndpoint: "https://allora-rpc.testnet.allora.network",
    chainId: "allora-testnet-1",
    denom: "uallo",
  },
  mainnet: {
    rpcEndpoint: "https://allora-rpc.mainnet.allora.network",
    chainId: "allora-mainnet-1",
    denom: "uallo",
  },
};

export type NetworkName = keyof typeof NETWORKS;

/**
 * Get network configuration by name
 */
export function getNetworkConfig(network: NetworkName): NetworkConfig {
  return NETWORKS[network];
}
