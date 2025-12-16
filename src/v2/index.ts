// Main client
export { AlloraChainClient } from "./allora-chain-client";
export {
  AlloraAPIClient,
  ChainSlug,
  ChainID,
  PriceInferenceToken,
  PriceInferenceTimeframe,
  SignatureFormat,
} from "./api-client";
export type {
  AlloraAPIClientConfig,
  AlloraTopic,
  AlloraInferenceData,
  AlloraInference,
  TopicsResponse,
  AlloraAPIResponse,
} from "./api-client";

// Network configuration
export { NETWORKS, getNetworkConfig } from "./networks";
export type { NetworkConfig, NetworkName } from "./networks";

// Modules
export { EmissionsModule } from "./modules/emissions";
export { BankModule } from "./modules/bank";
export { FeegrantModule } from "./modules/feegrant";
export { AuthModule } from "./modules/auth";
export { BlockModule } from "./modules/block";

// Re-export useful types from emissions
export type {
  CreateNewTopicRequest,
  FundTopicRequest,
  RegisterRequest,
} from "./types/generated/emissions/v9/tx";

export type {
  GetNextTopicIdResponse,
  GetTopicResponse,
  TopicExistsResponse,
  IsTopicActiveResponse,
  GetTopicStakeResponse,
  GetTopicFeeRevenueResponse,
  IsWhitelistedTopicWorkerResponse,
  IsWhitelistedTopicReputerResponse,
  IsTopicWorkerWhitelistEnabledResponse,
  IsTopicReputerWhitelistEnabledResponse,
  GetWorkerNodeInfoResponse,
  GetReputerNodeInfoResponse,
  GetLatestTopicInferencesResponse,
  GetLatestNetworkInferencesResponse,
  GetInfererScoreEmaResponse,
  GetForecasterScoreEmaResponse,
  GetReputerScoreEmaResponse,
  GetReputerStakeInTopicResponse,
  IsWorkerRegisteredInTopicIdResponse,
  IsReputerRegisteredInTopicIdResponse,
} from "./types/generated/emissions/v9/query";
