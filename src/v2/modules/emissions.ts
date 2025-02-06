import { createProtobufRpcClient, DeliverTxResponse, QueryClient, StdFee } from "@cosmjs/stargate";
import {
  QueryServiceClientImpl as EmissionsQueryClient,
  GetDelegateStakeInTopicInReputerResponse,
  GetDelegateStakeRemovalsUpUntilBlockResponse,
  GetForecasterNetworkRegretResponse,
  GetForecastsAtBlockResponse,
  GetInferencesAtBlockResponse,
  GetInfererNetworkRegretResponse,
  GetLatestAvailableNetworkInferencesOutlierResistantResponse,
  GetLatestAvailableNetworkInferencesResponse,
  GetLatestTopicInferencesResponse,
  GetMultiReputerStakeInTopicResponse,
  GetNetworkInferencesAtBlockOutlierResistantResponse,
  GetNetworkInferencesAtBlockResponse,
  GetNetworkLossBundleAtBlockResponse,
  GetNextTopicIdResponse,
  GetOneInForecasterNetworkRegretResponse,
  GetReputerNodeInfoResponse,
  GetReputerStakeInTopicResponse,
  GetStakeFromDelegatorInTopicInReputerResponse,
  GetStakeFromDelegatorInTopicResponse,
  GetStakeFromReputerInTopicInSelfResponse,
  GetStakeRemovalInfoResponse,
  GetStakeRemovalsUpUntilBlockResponse,
  GetTopicResponse,
  GetTopicStakeResponse,
  GetTotalStakeResponse,
  GetUnfulfilledWorkerNoncesResponse,
  GetWorkerLatestInferenceByTopicIdResponse,
  GetWorkerNodeInfoResponse,
  IsReputerNonceUnfulfilledResponse,
  IsReputerRegisteredInTopicIdResponse,
  IsWorkerNonceUnfulfilledResponse,
  IsWorkerRegisteredInTopicIdResponse,
  GetUnfulfilledReputerNoncesResponse,
  IsWhitelistAdminResponse,
  GetTopicLastWorkerCommitInfoResponse,
  GetTopicLastReputerCommitInfoResponse,
  GetTopicRewardNonceResponse,
  GetReputerLossBundlesAtBlockResponse,
  GetDelegateStakePlacementResponse,
  GetStakeReputerAuthorityResponse,
  GetDelegateStakeUponReputerResponse,
  GetDelegateRewardPerShareResponse,
  GetStakeRemovalForReputerAndTopicIdResponse,
  GetDelegateStakeRemovalResponse,
  GetPreviousTopicWeightResponse,
  GetTotalSumPreviousTopicWeightsResponse,
  TopicExistsResponse,
  IsTopicActiveResponse,
  GetTopicFeeRevenueResponse,
  GetInfererScoreEmaResponse,
  GetForecasterScoreEmaResponse,
  GetReputerScoreEmaResponse,
  GetInferenceScoresUntilBlockResponse,
  GetPreviousTopicQuantileForecasterScoreEmaResponse,
  GetPreviousTopicQuantileInfererScoreEmaResponse,
  GetPreviousTopicQuantileReputerScoreEmaResponse,
  GetWorkerInferenceScoresAtBlockResponse,
  GetCurrentLowestInfererScoreResponse,
  GetForecastScoresUntilBlockResponse,
  GetWorkerForecastScoresAtBlockResponse,
  GetCurrentLowestForecasterScoreResponse,
  GetReputersScoresAtBlockResponse,
  GetCurrentLowestReputerScoreResponse,
  GetListeningCoefficientResponse,
  GetPreviousReputerRewardFractionResponse,
  GetPreviousInferenceRewardFractionResponse,
  GetOneOutInfererForecasterNetworkRegretResponse,
  GetPreviousForecastRewardFractionResponse,
  GetPreviousPercentageRewardToStakedReputersResponse,
  GetTotalRewardToDistributeResponse,
  GetNaiveInfererNetworkRegretResponse,
  GetOneOutInfererInfererNetworkRegretResponse,
  GetOneOutForecasterInfererNetworkRegretResponse,
  GetOneOutForecasterForecasterNetworkRegretResponse,
  GetActiveTopicsAtBlockResponse,
  GetNextChurningBlockByTopicIdResponse,
  GetCountInfererInclusionsInTopicResponse,
  GetCountForecasterInclusionsInTopicResponse,
  GetActiveReputersForTopicResponse,
  GetActiveForecastersForTopicResponse,
  GetActiveInferersForTopicResponse,
  IsWhitelistedGlobalWorkerResponse,
  IsWhitelistedGlobalReputerResponse,
  IsWhitelistedGlobalAdminResponse,
  IsTopicWorkerWhitelistEnabledResponse,
  IsTopicReputerWhitelistEnabledResponse,
  IsWhitelistedTopicCreatorResponse,
  IsWhitelistedGlobalActorResponse,
  IsWhitelistedTopicWorkerResponse,
  IsWhitelistedTopicReputerResponse,
  CanUpdateAllGlobalWhitelistsResponse,
  CanUpdateGlobalWorkerWhitelistResponse,
  CanUpdateGlobalReputerWhitelistResponse,
  CanUpdateParamsResponse,
  CanUpdateTopicWhitelistResponse,
  CanCreateTopicResponse,
  CanSubmitWorkerPayloadResponse,
  CanSubmitReputerPayloadResponse,
  GetTopicInitialInfererEmaScoreResponse,
  GetTopicInitialForecasterEmaScoreResponse,
  GetTopicInitialReputerEmaScoreResponse,
} from "../types/generated/emissions/v7/query";
import { BaseModule } from "./base";
import { SigningStargateClient } from "@cosmjs/stargate";
import { AddStakeRequest, AddToGlobalAdminWhitelistRequest, AddToGlobalReputerWhitelistRequest, AddToGlobalWhitelistRequest, AddToGlobalWorkerWhitelistRequest, AddToTopicCreatorWhitelistRequest, AddToTopicReputerWhitelistRequest, AddToTopicWorkerWhitelistRequest, AddToWhitelistAdminRequest, BulkAddToGlobalReputerWhitelistRequest, BulkAddToGlobalWorkerWhitelistRequest, BulkAddToTopicReputerWhitelistRequest, BulkAddToTopicWorkerWhitelistRequest, BulkRemoveFromGlobalReputerWhitelistRequest, BulkRemoveFromGlobalWorkerWhitelistRequest, BulkRemoveFromTopicReputerWhitelistRequest, BulkRemoveFromTopicWorkerWhitelistRequest, CancelRemoveDelegateStakeRequest, CancelRemoveStakeRequest, CreateNewTopicRequest, DelegateStakeRequest, DisableTopicReputerWhitelistRequest, DisableTopicWorkerWhitelistRequest, EnableTopicReputerWhitelistRequest, EnableTopicWorkerWhitelistRequest, FundTopicRequest, InsertReputerPayloadRequest, InsertWorkerPayloadRequest, RegisterRequest, RemoveDelegateStakeRequest, RemoveFromGlobalAdminWhitelistRequest, RemoveFromGlobalReputerWhitelistRequest, RemoveFromGlobalWhitelistRequest, RemoveFromGlobalWorkerWhitelistRequest, RemoveFromTopicCreatorWhitelistRequest, RemoveFromTopicReputerWhitelistRequest, RemoveFromTopicWorkerWhitelistRequest, RemoveFromWhitelistAdminRequest, RemoveRegistrationRequest, RemoveStakeRequest, RewardDelegateStakeRequest } from "../types/generated/emissions/v7/tx";
import { ReputerDataBundle, WorkerDataBundle } from "../types/worker";

export class EmissionsModule extends BaseModule<EmissionsQueryClient> {
  constructor(queryClient: QueryClient, signingClient?: SigningStargateClient) {
    const protoQueryClient = createProtobufRpcClient(queryClient);
    super(new EmissionsQueryClient(protoQueryClient), signingClient);
  }

  // Query methods
  public async getNextTopicId(): Promise<GetNextTopicIdResponse> {
    return this.queryService.GetNextTopicId({});
  }

  public async getTopic(topicId: string): Promise<GetTopicResponse> {
    return this.queryService.GetTopic({ topicId });
  }

  public async getWorkerLatestInferenceByTopicId(
    topicId: string,
    workerAddress: string,
  ): Promise<GetWorkerLatestInferenceByTopicIdResponse> {
    return this.queryService.GetWorkerLatestInferenceByTopicId({
      topicId,
      workerAddress,
    });
  }

  public async getInferencesAtBlock(
    topicId: string,
    blockHeight: string,
  ): Promise<GetInferencesAtBlockResponse> {
    return this.queryService.GetInferencesAtBlock({ topicId, blockHeight });
  }

  public async getLatestTopicInferences(
    topicId: string,
  ): Promise<GetLatestTopicInferencesResponse> {
    return this.queryService.GetLatestTopicInferences({ topicId });
  }

  public async getForecastsAtBlock(
    topicId: string,
    blockHeight: string,
  ): Promise<GetForecastsAtBlockResponse> {
    return this.queryService.GetForecastsAtBlock({ topicId, blockHeight });
  }

  public async getNetworkLossBundleAtBlock(
    topicId: string,
    blockHeight: string,
  ): Promise<GetNetworkLossBundleAtBlockResponse> {
    return this.queryService.GetNetworkLossBundleAtBlock({
      topicId,
      blockHeight,
    });
  }

  public async getTotalStake(): Promise<GetTotalStakeResponse> {
    return this.queryService.GetTotalStake({});
  }

  public async getReputerStakeInTopic(
    address: string,
    topicId: string,
  ): Promise<GetReputerStakeInTopicResponse> {
    return this.queryService.GetReputerStakeInTopic({ address, topicId });
  }

  public async getMultiReputerStakeInTopic(
    addresses: string[],
    topicId: string,
  ): Promise<GetMultiReputerStakeInTopicResponse> {
    return this.queryService.GetMultiReputerStakeInTopic({
      addresses,
      topicId,
    });
  }

  public async getStakeFromReputerInTopicInSelf(
    reputerAddress: string,
    topicId: string,
  ): Promise<GetStakeFromReputerInTopicInSelfResponse> {
    return this.queryService.GetStakeFromReputerInTopicInSelf({
      reputerAddress,
      topicId,
    });
  }

  public async getDelegateStakeInTopicInReputer(
    reputerAddress: string,
    topicId: string,
  ): Promise<GetDelegateStakeInTopicInReputerResponse> {
    return this.queryService.GetDelegateStakeInTopicInReputer({
      reputerAddress,
      topicId,
    });
  }

  public async getStakeFromDelegatorInTopicInReputer(
    delegatorAddress: string,
    reputerAddress: string,
    topicId: string,
  ): Promise<GetStakeFromDelegatorInTopicInReputerResponse> {
    return this.queryService.GetStakeFromDelegatorInTopicInReputer({
      delegatorAddress,
      reputerAddress,
      topicId,
    });
  }

  public async getStakeFromDelegatorInTopic(
    delegatorAddress: string,
    topicId: string,
  ): Promise<GetStakeFromDelegatorInTopicResponse> {
    return this.queryService.GetStakeFromDelegatorInTopic({
      delegatorAddress,
      topicId,
    });
  }

  public async getTopicStake(topicId: string): Promise<GetTopicStakeResponse> {
    return this.queryService.GetTopicStake({ topicId });
  }

  public async getStakeRemovalsUpUntilBlock(
    blockHeight: string,
  ): Promise<GetStakeRemovalsUpUntilBlockResponse> {
    return this.queryService.GetStakeRemovalsUpUntilBlock({ blockHeight });
  }

  public async getDelegateStakeRemovalsUpUntilBlock(
    blockHeight: string,
  ): Promise<GetDelegateStakeRemovalsUpUntilBlockResponse> {
    return this.queryService.GetDelegateStakeRemovalsUpUntilBlock({
      blockHeight,
    });
  }

  public async getStakeRemovalInfo(
    topicId: string,
    reputer: string,
  ): Promise<GetStakeRemovalInfoResponse> {
    return this.queryService.GetStakeRemovalInfo({ topicId, reputer });
  }

  public async getWorkerNodeInfo(
    address: string,
  ): Promise<GetWorkerNodeInfoResponse> {
    return this.queryService.GetWorkerNodeInfo({ address });
  }

  public async getReputerNodeInfo(
    address: string,
  ): Promise<GetReputerNodeInfoResponse> {
    return this.queryService.GetReputerNodeInfo({ address });
  }

  public async isWorkerRegisteredInTopicId(
    topicId: string,
    address: string,
  ): Promise<IsWorkerRegisteredInTopicIdResponse> {
    return this.queryService.IsWorkerRegisteredInTopicId({ topicId, address });
  }

  public async isReputerRegisteredInTopicId(
    topicId: string,
    address: string,
  ): Promise<IsReputerRegisteredInTopicIdResponse> {
    return this.queryService.IsReputerRegisteredInTopicId({ topicId, address });
  }

  public async getNetworkInferencesAtBlock(
    topicId: string,
    blockHeight: string,
  ): Promise<GetNetworkInferencesAtBlockResponse> {
    return this.queryService.GetNetworkInferencesAtBlock({
      topicId,
      blockHeightLastInference: blockHeight,
    });
  }

  public async getNetworkInferencesAtBlockOutlierResistant(
    topicId: string,
    blockHeight: string,
  ): Promise<GetNetworkInferencesAtBlockOutlierResistantResponse> {
    return this.queryService.GetNetworkInferencesAtBlockOutlierResistant({
      topicId,
      blockHeightLastInference: blockHeight,
    });
  }

  public async getLatestAvailableNetworkInferences(
    topicId: string,
  ): Promise<GetLatestAvailableNetworkInferencesResponse> {
    return this.queryService.GetLatestAvailableNetworkInferences({ topicId });
  }

  public async getLatestAvailableNetworkInferencesOutlierResistant(
    topicId: string,
  ): Promise<GetLatestAvailableNetworkInferencesOutlierResistantResponse> {
    return this.queryService.GetLatestAvailableNetworkInferencesOutlierResistant(
      { topicId },
    );
  }

  public async IsWorkerNonceUnfulfilled(
    topicId: string,
    blockHeight: string,
  ): Promise<IsWorkerNonceUnfulfilledResponse> {
    return this.queryService.IsWorkerNonceUnfulfilled({ topicId, blockHeight });
  }

  public async isReputerNonceUnfulfilled(
    topicId: string,
    blockHeight: string,
  ): Promise<IsReputerNonceUnfulfilledResponse> {
    return this.queryService.IsReputerNonceUnfulfilled({
      topicId,
      blockHeight,
    });
  }

  public async getUnfulfilledWorkerNonces(
    topicId: string,
  ): Promise<GetUnfulfilledWorkerNoncesResponse> {
    return this.queryService.GetUnfulfilledWorkerNonces({ topicId });
  }

  public async getUnfulfilledReputerNonces(
    topicId: string,
  ): Promise<GetUnfulfilledReputerNoncesResponse> {
    return this.queryService.GetUnfulfilledReputerNonces({ topicId });
  }

  public async getInfererNetworkRegret(
    topicId: string,
    actorId: string,
  ): Promise<GetInfererNetworkRegretResponse> {
    return this.queryService.GetInfererNetworkRegret({ topicId, actorId });
  }

  public async getForecasterNetworkRegret(
    topicId: string,
    worker: string,
  ): Promise<GetForecasterNetworkRegretResponse> {
    return this.queryService.GetForecasterNetworkRegret({ topicId, worker });
  }

  public async getOneInForecasterNetworkRegret(
    topicId: string,
    forecaster: string,
    inferer: string,
  ): Promise<GetOneInForecasterNetworkRegretResponse> {
    return this.queryService.GetOneInForecasterNetworkRegret({
      topicId,
      forecaster,
      inferer,
    });
  }

  public async isWhitelistAdmin(
    address: string,
  ): Promise<IsWhitelistAdminResponse> {
    return this.queryService.IsWhitelistAdmin({ address });
  }

  public async getTopicLastWorkerCommitInfo(
    topicId: string,
  ): Promise<GetTopicLastWorkerCommitInfoResponse> {
    return this.queryService.GetTopicLastWorkerCommitInfo({ topicId });
  }

  public async getTopicLastReputerCommitInfo(
    topicId: string,
  ): Promise<GetTopicLastReputerCommitInfoResponse> {
    return this.queryService.GetTopicLastReputerCommitInfo({ topicId });
  }

  public async getTopicRewardNonce(
    topicId: string,
  ): Promise<GetTopicRewardNonceResponse> {
    return this.queryService.GetTopicRewardNonce({ topicId });
  }

  public async getReputerLossBundlesAtBlock(
    topicId: string,
    blockHeight: string,
  ): Promise<GetReputerLossBundlesAtBlockResponse> {
    return this.queryService.GetReputerLossBundlesAtBlock({
      topicId,
      blockHeight,
    });
  }

  public async getStakeReputerAuthority(
    topicId: string,
    reputer: string,
  ): Promise<GetStakeReputerAuthorityResponse> {
    return this.queryService.GetStakeReputerAuthority({ topicId, reputer });
  }

  public async getDelegateStakePlacement(
    topicId: string,
    delegator: string,
    target: string,
  ): Promise<GetDelegateStakePlacementResponse> {
    return this.queryService.GetDelegateStakePlacement({
      topicId,
      delegator,
      target,
    });
  }

  public async getDelegateStakeUponReputer(
    topicId: string,
    target: string,
  ): Promise<GetDelegateStakeUponReputerResponse> {
    return this.queryService.GetDelegateStakeUponReputer({ topicId, target });
  }

  public async getDelegateRewardPerShare(
    topicId: string,
    reputer: string,
  ): Promise<GetDelegateRewardPerShareResponse> {
    return this.queryService.GetDelegateRewardPerShare({ topicId, reputer });
  }

  public async getStakeRemovalForReputerAndTopicId(
    reputer: string,
    topicId: string,
  ): Promise<GetStakeRemovalForReputerAndTopicIdResponse> {
    return this.queryService.GetStakeRemovalForReputerAndTopicId({
      reputer,
      topicId,
    });
  }

  public async getDelegateStakeRemoval(
    blockHeight: string,
    topicId: string,
    delegator: string,
    reputer: string,
  ): Promise<GetDelegateStakeRemovalResponse> {
    return this.queryService.GetDelegateStakeRemoval({
      blockHeight,
      topicId,
      delegator,
      reputer,
    });
  }

  public async getPreviousTopicWeight(
    topicId: string,
  ): Promise<GetPreviousTopicWeightResponse> {
    return this.queryService.GetPreviousTopicWeight({ topicId });
  }

  public async getTotalSumPreviousTopicWeights(): Promise<GetTotalSumPreviousTopicWeightsResponse> {
    return this.queryService.GetTotalSumPreviousTopicWeights({});
  }

  public async topicExists(topicId: string): Promise<TopicExistsResponse> {
    return this.queryService.TopicExists({ topicId });
  }

  public async isTopicActive(topicId: string): Promise<IsTopicActiveResponse> {
    return this.queryService.IsTopicActive({ topicId });
  }

  public async getTopicFeeRevenue(
    topicId: string,
  ): Promise<GetTopicFeeRevenueResponse> {
    return this.queryService.GetTopicFeeRevenue({ topicId });
  }

  public async getInfererScoreEma(
    topicId: string,
    inferer: string,
  ): Promise<GetInfererScoreEmaResponse> {
    return this.queryService.GetInfererScoreEma({ topicId, inferer });
  }

  public async getForecasterScoreEma(
    topicId: string,
    forecaster: string,
  ): Promise<GetForecasterScoreEmaResponse> {
    return this.queryService.GetForecasterScoreEma({ topicId, forecaster });
  }

  public async getReputerScoreEma(
    topicId: string,
    reputer: string,
  ): Promise<GetReputerScoreEmaResponse> {
    return this.queryService.GetReputerScoreEma({ topicId, reputer });
  }

  public async getInferenceScoresUntilBlock(
    topicId: string,
    blockHeight: string,
  ): Promise<GetInferenceScoresUntilBlockResponse> {
    return this.queryService.GetInferenceScoresUntilBlock({
      topicId,
      blockHeight,
    });
  }

  public async getPreviousTopicQuantileForecasterScoreEma(
    topicId: string,
  ): Promise<GetPreviousTopicQuantileForecasterScoreEmaResponse> {
    return this.queryService.GetPreviousTopicQuantileForecasterScoreEma({
      topicId,
    });
  }

  public async getPreviousTopicQuantileInfererScoreEma(
    topicId: string,
  ): Promise<GetPreviousTopicQuantileInfererScoreEmaResponse> {
    return this.queryService.GetPreviousTopicQuantileInfererScoreEma({
      topicId,
    });
  }

  public async getPreviousTopicQuantileReputerScoreEma(
    topicId: string,
  ): Promise<GetPreviousTopicQuantileReputerScoreEmaResponse> {
    return this.queryService.GetPreviousTopicQuantileReputerScoreEma({
      topicId,
    });
  }

  public async getWorkerInferenceScoresAtBlock(
    topicId: string,
    blockHeight: string,
  ): Promise<GetWorkerInferenceScoresAtBlockResponse> {
    return this.queryService.GetWorkerInferenceScoresAtBlock({
      topicId,
      blockHeight,
    });
  }

  public async getCurrentLowestInfererScore(
    topicId: string,
  ): Promise<GetCurrentLowestInfererScoreResponse> {
    return this.queryService.GetCurrentLowestInfererScore({ topicId });
  }

  public async getForecastScoresUntilBlock(
    topicId: string,
    blockHeight: string,
  ): Promise<GetForecastScoresUntilBlockResponse> {
    return this.queryService.GetForecastScoresUntilBlock({
      topicId,
      blockHeight,
    });
  }

  public async getWorkerForecastScoresAtBlock(
    topicId: string,
    blockHeight: string,
  ): Promise<GetWorkerForecastScoresAtBlockResponse> {
    return this.queryService.GetWorkerForecastScoresAtBlock({
      topicId,
      blockHeight,
    });
  }

  public async getCurrentLowestForecasterScore(
    topicId: string,
  ): Promise<GetCurrentLowestForecasterScoreResponse> {
    return this.queryService.GetCurrentLowestForecasterScore({ topicId });
  }

  public async getReputersScoresAtBlock(
    topicId: string,
    blockHeight: string,
  ): Promise<GetReputersScoresAtBlockResponse> {
    return this.queryService.GetReputersScoresAtBlock({ topicId, blockHeight });
  }

  public async getCurrentLowestReputerScore(
    topicId: string,
  ): Promise<GetCurrentLowestReputerScoreResponse> {
    return this.queryService.GetCurrentLowestReputerScore({ topicId });
  }

  public async getListeningCoefficient(
    topicId: string,
    reputer: string,
  ): Promise<GetListeningCoefficientResponse> {
    return this.queryService.GetListeningCoefficient({ topicId, reputer });
  }

  public async getPreviousReputerRewardFraction(
    topicId: string,
    reputer: string,
  ): Promise<GetPreviousReputerRewardFractionResponse> {
    return this.queryService.GetPreviousReputerRewardFraction({
      topicId,
      reputer,
    });
  }

  public async getPreviousInferenceRewardFraction(
    topicId: string,
    worker: string,
  ): Promise<GetPreviousInferenceRewardFractionResponse> {
    return this.queryService.GetPreviousInferenceRewardFraction({
      topicId,
      worker,
    });
  }

  public async getPreviousForecastRewardFraction(
    topicId: string,
    worker: string,
  ): Promise<GetPreviousForecastRewardFractionResponse> {
    return this.queryService.GetPreviousForecastRewardFraction({
      topicId,
      worker,
    });
  }

  public async getPreviousPercentageRewardToStakedReputers(
    topicId: string,
  ): Promise<GetPreviousPercentageRewardToStakedReputersResponse> {
    return this.queryService.GetPreviousPercentageRewardToStakedReputers({
      topicId,
    });
  }

  public async getTotalRewardToDistribute(
    topicId: string,
  ): Promise<GetTotalRewardToDistributeResponse> {
    return this.queryService.GetTotalRewardToDistribute({ topicId });
  }

  public async getNaiveInfererNetworkRegret(
    topicId: string,
    inferer: string,
  ): Promise<GetNaiveInfererNetworkRegretResponse> {
    return this.queryService.GetNaiveInfererNetworkRegret({ topicId, inferer });
  }

  public async getOneOutInfererInfererNetworkRegret(
    topicId: string,
    oneOutInferer: string,
    inferer: string,
  ): Promise<GetOneOutInfererInfererNetworkRegretResponse> {
    return this.queryService.GetOneOutInfererInfererNetworkRegret({
      topicId,
      oneOutInferer,
      inferer,
    });
  }

  public async getOneOutInfererForecasterNetworkRegret(
    topicId: string,
    oneOutInferer: string,
    forecaster: string,
  ): Promise<GetOneOutInfererForecasterNetworkRegretResponse> {
    return this.queryService.GetOneOutInfererForecasterNetworkRegret({
      topicId,
      oneOutInferer,
      forecaster,
    });
  }

  public async getOneOutForecasterInfererNetworkRegret(
    topicId: string,
    oneOutForecaster: string,
    inferer: string,
  ): Promise<GetOneOutForecasterInfererNetworkRegretResponse> {
    return this.queryService.GetOneOutForecasterInfererNetworkRegret({
      topicId,
      oneOutForecaster,
      inferer,
    });
  }

  public async getOneOutForecasterForecasterNetworkRegret(
    topicId: string,
    oneOutForecaster: string,
    forecaster: string,
  ): Promise<GetOneOutForecasterForecasterNetworkRegretResponse> {
    return this.queryService.GetOneOutForecasterForecasterNetworkRegret({
      topicId,
      oneOutForecaster,
      forecaster,
    });
  }

  public async getActiveTopicsAtBlock(
    blockHeight: string,
  ): Promise<GetActiveTopicsAtBlockResponse> {
    return this.queryService.GetActiveTopicsAtBlock({ blockHeight });
  }

  public async getNextChurningBlockByTopicId(
    topicId: string,
  ): Promise<GetNextChurningBlockByTopicIdResponse> {
    return this.queryService.GetNextChurningBlockByTopicId({ topicId });
  }

  public async getCountInfererInclusionsInTopic(
    topicId: string,
    inferer: string,
  ): Promise<GetCountInfererInclusionsInTopicResponse> {
    return this.queryService.GetCountInfererInclusionsInTopic({
      topicId,
      inferer,
    });
  }

  public async getCountForecasterInclusionsInTopic(
    topicId: string,
    forecaster: string,
  ): Promise<GetCountForecasterInclusionsInTopicResponse> {
    return this.queryService.GetCountForecasterInclusionsInTopic({
      topicId,
      forecaster,
    });
  }

  public async getActiveReputersForTopic(
    topicId: string,
  ): Promise<GetActiveReputersForTopicResponse> {
    return this.queryService.GetActiveReputersForTopic({ topicId });
  }

  public async getActiveForecastersForTopic(
    topicId: string,
  ): Promise<GetActiveForecastersForTopicResponse> {
    return this.queryService.GetActiveForecastersForTopic({ topicId });
  }

  public async getActiveInferersForTopic(
    topicId: string,
  ): Promise<GetActiveInferersForTopicResponse> {
    return this.queryService.GetActiveInferersForTopic({ topicId });
  }

  public async isWhitelistedGlobalWorker(
    address: string,
  ): Promise<IsWhitelistedGlobalWorkerResponse> {
    return this.queryService.IsWhitelistedGlobalWorker({ address });
  }

  public async isWhitelistedGlobalReputer(
    address: string,
  ): Promise<IsWhitelistedGlobalReputerResponse> {
    return this.queryService.IsWhitelistedGlobalReputer({ address });
  }

  public async isWhitelistedGlobalAdmin(
    address: string,
  ): Promise<IsWhitelistedGlobalAdminResponse> {
    return this.queryService.IsWhitelistedGlobalAdmin({ address });
  }

  public async isTopicWorkerWhitelistEnabled(
    topicId: string,
  ): Promise<IsTopicWorkerWhitelistEnabledResponse> {
    return this.queryService.IsTopicWorkerWhitelistEnabled({ topicId });
  }

  public async isTopicReputerWhitelistEnabled(
    topicId: string,
  ): Promise<IsTopicReputerWhitelistEnabledResponse> {
    return this.queryService.IsTopicReputerWhitelistEnabled({ topicId });
  }

  public async isWhitelistedTopicCreator(
    address: string,
  ): Promise<IsWhitelistedTopicCreatorResponse> {
    return this.queryService.IsWhitelistedTopicCreator({ address });
  }

  public async isWhitelistedGlobalActor(
    address: string,
  ): Promise<IsWhitelistedGlobalActorResponse> {
    return this.queryService.IsWhitelistedGlobalActor({ address });
  }

  public async isWhitelistedTopicWorker(
    address: string,
    topicId: string,
  ): Promise<IsWhitelistedTopicWorkerResponse> {
    return this.queryService.IsWhitelistedTopicWorker({ address, topicId });
  }

  public async isWhitelistedTopicReputer(
    address: string,
    topicId: string,
  ): Promise<IsWhitelistedTopicReputerResponse> {
    return this.queryService.IsWhitelistedTopicReputer({ address, topicId });
  }

  public async canUpdateAllGlobalWhitelists(
    address: string,
  ): Promise<CanUpdateAllGlobalWhitelistsResponse> {
    return this.queryService.CanUpdateAllGlobalWhitelists({ address });
  }

  public async canUpdateGlobalWorkerWhitelist(
    address: string,
  ): Promise<CanUpdateGlobalWorkerWhitelistResponse> {
    return this.queryService.CanUpdateGlobalWorkerWhitelist({ address });
  }

  public async canUpdateGlobalReputerWhitelist(
    address: string,
  ): Promise<CanUpdateGlobalReputerWhitelistResponse> {
    return this.queryService.CanUpdateGlobalReputerWhitelist({ address });
  }

  public async canUpdateParams(
    address: string,
  ): Promise<CanUpdateParamsResponse> {
    return this.queryService.CanUpdateParams({ address });
  }

  public async canUpdateTopicWhitelist(
    address: string,
    topicId: string,
  ): Promise<CanUpdateTopicWhitelistResponse> {
    return this.queryService.CanUpdateTopicWhitelist({ address, topicId });
  }

  public async canCreateTopic(
    address: string,
  ): Promise<CanCreateTopicResponse> {
    return this.queryService.CanCreateTopic({ address });
  }

  public async canSubmitWorkerPayload(
    address: string,
    topicId: string,
  ): Promise<CanSubmitWorkerPayloadResponse> {
    return this.queryService.CanSubmitWorkerPayload({ address, topicId });
  }

  public async canSubmitReputerPayload(
    address: string,
    topicId: string,
  ): Promise<CanSubmitReputerPayloadResponse> {
    return this.queryService.CanSubmitReputerPayload({ address, topicId });
  }

  public async getTopicInitialInfererEmaScore(
    topicId: string,
  ): Promise<GetTopicInitialInfererEmaScoreResponse> {
    return this.queryService.GetTopicInitialInfererEmaScore({ topicId });
  }

  public async getTopicInitialForecasterEmaScore(
    topicId: string,
  ): Promise<GetTopicInitialForecasterEmaScoreResponse> {
    return this.queryService.GetTopicInitialForecasterEmaScore({ topicId });
  }

  public async getTopicInitialReputerEmaScore(
    topicId: string,
  ): Promise<GetTopicInitialReputerEmaScoreResponse> {
    return this.queryService.GetTopicInitialReputerEmaScore({ topicId });
  }

  // Tx methods
  async createNewTopic(
    topicConfig: CreateNewTopicRequest,
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ): Promise<DeliverTxResponse> {
    const createNewTopicMsg = {
      typeUrl: "/emissions.v7.CreateNewTopicRequest",
      value: topicConfig,
    };

    return this.signingClient.signAndBroadcast(
      topicConfig.creator,
      [createNewTopicMsg],
      fee,
      memo,
    );
  }

  async register(sender: string, topicId: string, owner: string, isReputer: boolean, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const registerMsg = {
      typeUrl: "/emissions.v7.RegisterRequest",
      value: RegisterRequest.fromPartial({
        sender,
        topicId,
        owner,
        isReputer,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [registerMsg],
      fee,
      memo,
    );
  }

  async removeRegistration(sender: string, topicId: string, isReputer: boolean, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const removeRegistrationMsg = {
      typeUrl: "/emissions.v7.RemoveRegistrationRequest",
      value: RemoveRegistrationRequest.fromPartial({
        sender,
        topicId,
        isReputer,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [removeRegistrationMsg],
      fee,
      memo,
    );
  }

  async addStake(sender: string, topicId: string, amount: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const addStakeMsg = {
      typeUrl: "/emissions.v7.AddStakeRequest",
      value: AddStakeRequest.fromPartial({
        sender,
        topicId,
        amount,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [addStakeMsg],
      fee,
      memo,
    );
  }

  async removeStake(sender: string, topicId: string, amount: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const removeStakeMsg = {
      typeUrl: "/emissions.v7.RemoveStakeRequest",
      value: RemoveStakeRequest.fromPartial({
        sender,
        topicId,
        amount,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [removeStakeMsg],
      fee,
      memo,
    );
  }

  async cancelRemoveStake(sender: string, topicId: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const cancelRemoveStakeMsg = {
      typeUrl: "/emissions.v7.CancelRemoveStakeRequest",
      value: CancelRemoveStakeRequest.fromPartial({
        sender,
        topicId,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [cancelRemoveStakeMsg],
      fee,
      memo,
    );
  }

  async delegateStakeToReputer(sender: string, topicId: string, reputer: string, amount: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const delegateStakeMsg = {
      typeUrl: "/emissions.v7.DelegateStakeRequest",
      value: DelegateStakeRequest.fromPartial({
        sender,
        topicId,
        reputer,
        amount,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [delegateStakeMsg],
      fee,
      memo,
    );
  }

  async withdrawReputerDelegationRewards(sender: string, topicId: string, reputer: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const withdrawReputerDelegationRewardsMsg = {
      typeUrl: "/emissions.v7.RewardDelegateStakeRequest",
      value: RewardDelegateStakeRequest.fromPartial({
        sender,
        topicId,
        reputer,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [withdrawReputerDelegationRewardsMsg],
      fee,
      memo,
    );
  }

  async removeStakeFromReputer(sender: string, topicId: string, reputer: string, amount: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const removeDelegateStakeMsg = {
      typeUrl: "/emissions.v7.RemoveDelegateStakeRequest",
      value: RemoveDelegateStakeRequest.fromPartial({
        sender,
        topicId,
        reputer,
        amount,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [removeDelegateStakeMsg],
      fee,
      memo,
    );
  }

  async cancelRemoveStakeFromReputer(sender: string, topicId: string, delegator: string, reputer: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const cancelRemoveStakeFromReputerMsg = {
      typeUrl: "/emissions.v7.CancelRemoveDelegateStakeRequest",
      value: CancelRemoveDelegateStakeRequest.fromPartial({
        sender,
        topicId,
        delegator,
        reputer,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [cancelRemoveStakeFromReputerMsg],
      fee,
      memo,
    );
  }

  async fundTopic(sender: string, topicId: string, amount: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const fundTopicMsg = {
      typeUrl: "/emissions.v7.FundTopicRequest",
      value: FundTopicRequest.fromPartial({
        sender,
        topicId,
        amount,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [fundTopicMsg],
      fee,
      memo,
    );
  }

  async addToWhitelistAdmin(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const addToWhitelistAdminMsg = {
      typeUrl: "/emissions.v7.AddToWhitelistAdminRequest",
      value: AddToWhitelistAdminRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [addToWhitelistAdminMsg],
      fee,
      memo,
    );
  }

  async removeFromWhitelistAdmin(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const removeFromWhitelistAdminMsg = {
      typeUrl: "/emissions.v7.RemoveFromWhitelistAdminRequest",
      value: RemoveFromWhitelistAdminRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [removeFromWhitelistAdminMsg],
      fee,
      memo,
    );
  }

  async insertWorkerPayload(sender: string, workerDataBundle: WorkerDataBundle, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const insertWorkerPayloadMsg = {
      typeUrl: "/emissions.v7.InsertWorkerPayloadRequest",
      value: InsertWorkerPayloadRequest.fromPartial({
        sender,
        workerDataBundle,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [insertWorkerPayloadMsg],
      fee,
      memo,
    );
  }

  async insertReputerPayload(sender: string, reputerDataBundle: ReputerDataBundle, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const insertReputerPayloadMsg = {
      typeUrl: "/emissions.v7.InsertReputerPayloadRequest",
      value: InsertReputerPayloadRequest.fromPartial({
        sender,
        reputerValueBundle: reputerDataBundle,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [insertReputerPayloadMsg],
      fee,
      memo,
    );
  }

  async addToGlobalWhitelist(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const addToGlobalWhitelistMsg = {
      typeUrl: "/emissions.v7.AddToGlobalWhitelistRequest",
      value: AddToGlobalWhitelistRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [addToGlobalWhitelistMsg],
      fee,
      memo,
    );
  }

  async removeFromGlobalWhitelist(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const removeFromGlobalWhitelistMsg = {
      typeUrl: "/emissions.v7.RemoveFromGlobalWhitelistRequest",
      value: RemoveFromGlobalWhitelistRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [removeFromGlobalWhitelistMsg],
      fee,
      memo,
    );
  }

  async addToGlobalWorkerWhitelist(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const addToGlobalWorkerWhitelistMsg = {
      typeUrl: "/emissions.v7.AddToGlobalWorkerWhitelistRequest",
      value: AddToGlobalWorkerWhitelistRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [addToGlobalWorkerWhitelistMsg],
      fee,
      memo,
    );
  }

  async removeFromGlobalWorkerWhitelist(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const removeFromGlobalWorkerWhitelistMsg = {
      typeUrl: "/emissions.v7.RemoveFromGlobalWorkerWhitelistRequest",
      value: RemoveFromGlobalWorkerWhitelistRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [removeFromGlobalWorkerWhitelistMsg],
      fee,
      memo,
    );
  }

  async addToGlobalReputerWhitelist(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const addToGlobalReputerWhitelistMsg = {
      typeUrl: "/emissions.v7.AddToGlobalReputerWhitelistRequest",
      value: AddToGlobalReputerWhitelistRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [addToGlobalReputerWhitelistMsg],
      fee,
      memo,
    );
  }

  async removeFromGlobalReputerWhitelist(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const removeFromGlobalReputerWhitelistMsg = {
      typeUrl: "/emissions.v7.RemoveFromGlobalReputerWhitelistRequest",
      value: RemoveFromGlobalReputerWhitelistRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [removeFromGlobalReputerWhitelistMsg],
      fee,
      memo,
    );
  }
  
  async addToGlobalAdminWhitelist(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const addToGlobalAdminWhitelistMsg = {
      typeUrl: "/emissions.v7.AddToGlobalAdminWhitelistRequest",
      value: AddToGlobalAdminWhitelistRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [addToGlobalAdminWhitelistMsg],
      fee,
      memo,
    );
  }

  async removeFromGlobalAdminWhitelist(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const removeFromGlobalAdminWhitelistMsg = {
      typeUrl: "/emissions.v7.RemoveFromGlobalAdminWhitelistRequest",
      value: RemoveFromGlobalAdminWhitelistRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [removeFromGlobalAdminWhitelistMsg],
      fee,
      memo,
    );
  }

  async bulkAddToGlobalWorkerWhitelist(sender: string, addresses: string[], fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const bulkAddToGlobalWorkerWhitelistMsg = {
      typeUrl: "/emissions.v7.BulkAddToGlobalWorkerWhitelistRequest",
      value: BulkAddToGlobalWorkerWhitelistRequest.fromPartial({
        sender,
        addresses,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [bulkAddToGlobalWorkerWhitelistMsg],
      fee,
      memo,
    );
  }
  
  async bulkRemoveFromGlobalWorkerWhitelist(sender: string, addresses: string[], fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const bulkRemoveFromGlobalWorkerWhitelistMsg = {
      typeUrl: "/emissions.v7.BulkRemoveFromGlobalWorkerWhitelistRequest",
      value: BulkRemoveFromGlobalWorkerWhitelistRequest.fromPartial({
        sender,
        addresses,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [bulkRemoveFromGlobalWorkerWhitelistMsg],
      fee,
      memo,
    );
  }

  async bulkAddToGlobalReputerWhitelist(sender: string, addresses: string[], fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const bulkAddToGlobalReputerWhitelistMsg = {
      typeUrl: "/emissions.v7.BulkAddToGlobalReputerWhitelistRequest",
      value: BulkAddToGlobalReputerWhitelistRequest.fromPartial({
        sender,
        addresses,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [bulkAddToGlobalReputerWhitelistMsg],
      fee,
      memo,
    );
  }

  async bulkRemoveFromGlobalReputerWhitelist(sender: string, addresses: string[], fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const bulkRemoveFromGlobalReputerWhitelistMsg = {
      typeUrl: "/emissions.v7.BulkRemoveFromGlobalReputerWhitelistRequest",
      value: BulkRemoveFromGlobalReputerWhitelistRequest.fromPartial({
        sender,
        addresses,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [bulkRemoveFromGlobalReputerWhitelistMsg],
      fee,
      memo,
    );
  }

  async bulkAddToTopicWorkerWhitelist(sender: string, topicId: string, addresses: string[], fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const bulkAddToTopicWorkerWhitelistMsg = {
      typeUrl: "/emissions.v7.BulkAddToTopicWorkerWhitelistRequest",
      value: BulkAddToTopicWorkerWhitelistRequest.fromPartial({
        sender,
        topicId,
        addresses,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [bulkAddToTopicWorkerWhitelistMsg],
      fee,
      memo,
    );
  }

  async bulkRemoveFromTopicWorkerWhitelist(sender: string, topicId: string, addresses: string[], fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const bulkRemoveFromTopicWorkerWhitelistMsg = {
      typeUrl: "/emissions.v7.BulkRemoveFromTopicWorkerWhitelistRequest",
      value: BulkRemoveFromTopicWorkerWhitelistRequest.fromPartial({
        sender,
        topicId,
        addresses,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [bulkRemoveFromTopicWorkerWhitelistMsg],
      fee,
      memo,
    );
  }

  async bulkAddToTopicReputerWhitelist(sender: string, topicId: string, addresses: string[], fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const bulkAddToTopicReputerWhitelistMsg = {
      typeUrl: "/emissions.v7.BulkAddToTopicReputerWhitelistRequest",
      value: BulkAddToTopicReputerWhitelistRequest.fromPartial({
        sender,
        topicId,
        addresses,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [bulkAddToTopicReputerWhitelistMsg],
      fee,
      memo,
    );
  }

  async bulkRemoveFromTopicReputerWhitelist(sender: string, topicId: string, addresses: string[], fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const bulkRemoveFromTopicReputerWhitelistMsg = {
      typeUrl: "/emissions.v7.BulkRemoveFromTopicReputerWhitelistRequest",
      value: BulkRemoveFromTopicReputerWhitelistRequest.fromPartial({
        sender,
        topicId,
        addresses,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [bulkRemoveFromTopicReputerWhitelistMsg],
      fee,
      memo,
    );
  }

  async enableTopicWorkerWhitelistRequest(sender: string, topicId: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const enableTopicWorkerWhitelistMsg = {
      typeUrl: "/emissions.v7.EnableTopicWorkerWhitelistRequest",
      value: EnableTopicWorkerWhitelistRequest.fromPartial({
        sender,
        topicId,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [enableTopicWorkerWhitelistMsg],
      fee,
      memo,
    );
  }

  async disableTopicWorkerWhitelistRequest(sender: string, topicId: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const disableTopicWorkerWhitelistMsg = {
      typeUrl: "/emissions.v7.DisableTopicWorkerWhitelistRequest",
      value: DisableTopicWorkerWhitelistRequest.fromPartial({
        sender,
        topicId,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [disableTopicWorkerWhitelistMsg],
      fee,
      memo,
    );
  }

  async enableTopicReputerWhitelistRequest(sender: string, topicId: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const enableTopicReputerWhitelistMsg = {
      typeUrl: "/emissions.v7.EnableTopicReputerWhitelistRequest",
      value: EnableTopicReputerWhitelistRequest.fromPartial({
        sender,
        topicId,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [enableTopicReputerWhitelistMsg],
      fee,
      memo,
    );
  }
 
  async disableTopicReputerWhitelistRequest(sender: string, topicId: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const disableTopicReputerWhitelistMsg = {
      typeUrl: "/emissions.v7.DisableTopicReputerWhitelistRequest",
      value: DisableTopicReputerWhitelistRequest.fromPartial({
        sender,
        topicId,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [disableTopicReputerWhitelistMsg],
      fee,
      memo,
    );
  }

  async addToTopicCreatorWhitelistRequest(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const addToTopicCreatorWhitelistMsg = {
      typeUrl: "/emissions.v7.AddToTopicCreatorWhitelistRequest",
      value: AddToTopicCreatorWhitelistRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [addToTopicCreatorWhitelistMsg],
      fee,
      memo,
    );
  }
  
  async removeFromTopicCreatorWhitelistRequest(sender: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const removeFromTopicCreatorWhitelistMsg = {
      typeUrl: "/emissions.v7.RemoveFromTopicCreatorWhitelistRequest",
      value: RemoveFromTopicCreatorWhitelistRequest.fromPartial({
        sender,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [removeFromTopicCreatorWhitelistMsg],
      fee,
      memo,
    );
  }

  async addToTopicWorkerWhitelistRequest(sender: string, topicId: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const addToTopicWorkerWhitelistMsg = {
      typeUrl: "/emissions.v7.AddToTopicWorkerWhitelistRequest",
      value: AddToTopicWorkerWhitelistRequest.fromPartial({
        sender,
        topicId,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [addToTopicWorkerWhitelistMsg],
      fee,
      memo,
    );
  }

  async removeFromTopicWorkerWhitelistRequest(sender: string, topicId: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const removeFromTopicWorkerWhitelistMsg = {
      typeUrl: "/emissions.v7.RemoveFromTopicWorkerWhitelistRequest",
      value: RemoveFromTopicWorkerWhitelistRequest.fromPartial({
        sender,
        topicId,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [removeFromTopicWorkerWhitelistMsg],
      fee,
      memo,
    );
  }

  async addToTopicReputerWhitelistRequest(sender: string, topicId: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const addToTopicReputerWhitelistMsg = {
      typeUrl: "/emissions.v7.AddToTopicReputerWhitelistRequest",
      value: AddToTopicReputerWhitelistRequest.fromPartial({
        sender,
        topicId,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [addToTopicReputerWhitelistMsg],
      fee,
      memo,
    );
  }

  async removeFromTopicReputerWhitelistRequest(sender: string, topicId: string, address: string, fee: StdFee | "auto" | number = "auto", memo: string = "") {
    const removeFromTopicReputerWhitelistMsg = {
      typeUrl: "/emissions.v7.RemoveFromTopicReputerWhitelistRequest",
      value: RemoveFromTopicReputerWhitelistRequest.fromPartial({
        sender,
        topicId,
        address,
      }),
    };

    return this.signingClient.signAndBroadcast(
      sender,
      [removeFromTopicReputerWhitelistMsg],
      fee,
      memo,
    );
  }
}

