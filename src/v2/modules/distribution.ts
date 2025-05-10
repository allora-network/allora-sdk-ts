import {
  Coin,
  createProtobufRpcClient,
  SigningStargateClient,
  StdFee,
} from "@cosmjs/stargate";
import { BaseModule } from "./base";
import { QueryClient } from "@cosmjs/stargate";
import { QueryClientImpl as DistributionQueryClient } from "../types/generated/cosmos/distribution/v1beta1/query";
import { PageRequest } from "../types/generated/cosmos/base/query/v1beta1/pagination";
import {
  MsgDepositValidatorRewardsPool,
  MsgFundCommunityPool,
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
} from "../types/generated/cosmos/distribution/v1beta1/tx";

export class DistributionModule extends BaseModule<DistributionQueryClient> {
  constructor(queryClient: QueryClient, signingClient?: SigningStargateClient) {
    const protoQueryClient = createProtobufRpcClient(queryClient);
    super(new DistributionQueryClient(protoQueryClient), signingClient);
  }

  async getParams() {
    return this.queryService.Params({});
  }

  async getValidatorDistributionInfo(validatorAddress: string) {
    return this.queryService.ValidatorDistributionInfo({ validatorAddress });
  }

  async getValidatorOutstandingRewards(validatorAddress: string) {
    return this.queryService.ValidatorOutstandingRewards({ validatorAddress });
  }

  async getValidatorCommission(validatorAddress: string) {
    return this.queryService.ValidatorCommission({ validatorAddress });
  }

  async getValidatorSlashes(
    validatorAddress: string,
    startingHeight: string,
    endingHeight: string,
    pagination?: PageRequest,
  ) {
    return this.queryService.ValidatorSlashes({
      validatorAddress,
      startingHeight,
      endingHeight,
      pagination,
    });
  }

  async getDelegationRewards(
    delegatorAddress: string,
    validatorAddress: string,
  ) {
    return this.queryService.DelegationRewards({
      delegatorAddress,
      validatorAddress,
    });
  }

  async getDelegationTotalRewards(delegatorAddress: string) {
    return this.queryService.DelegationTotalRewards({ delegatorAddress });
  }

  async getDelegatorValidators(delegatorAddress: string) {
    return this.queryService.DelegatorValidators({ delegatorAddress });
  }

  async getDelegatorWithdrawAddress(delegatorAddress: string) {
    return this.queryService.DelegatorWithdrawAddress({ delegatorAddress });
  }

  async getCommunityPool() {
    return this.queryService.CommunityPool({});
  }

  async setWithdrawAddress(
    delegatorAddress: string,
    withdrawAddress: string,
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ) {
    const withdrawAddrMsg = {
      typeUrl: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress",
      value: MsgSetWithdrawAddress.fromPartial({
        delegatorAddress,
        withdrawAddress,
      }),
    };

    return this.signingClient.signAndBroadcast(
      delegatorAddress,
      [withdrawAddrMsg],
      fee,
      memo,
    );
  }

  async withdrawDelegatorReward(
    delegatorAddress: string,
    validatorAddress: string,
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ) {
    const withdrawRewardMsg = {
      typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
      value: MsgWithdrawDelegatorReward.fromPartial({
        delegatorAddress,
        validatorAddress,
      }),
    };

    return this.signingClient.signAndBroadcast(
      delegatorAddress,
      [withdrawRewardMsg],
      fee,
      memo,
    );
  }

  async withdrawValidatorCommission(
    validatorAddress: string,
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ) {
    const withdrawCommissionMsg = {
      typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission",
      value: MsgWithdrawValidatorCommission.fromPartial({ validatorAddress }),
    };

    return this.signingClient.signAndBroadcast(
      validatorAddress,
      [withdrawCommissionMsg],
      fee,
      memo,
    );
  }

  async fundCommunityPool(
    depositor: string,
    amount: Coin[],
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ) {
    const fundPoolMsg = {
      typeUrl: "/cosmos.distribution.v1beta1.MsgFundCommunityPool",
      value: MsgFundCommunityPool.fromPartial({ depositor, amount }),
    };

    return this.signingClient.signAndBroadcast(
      depositor,
      [fundPoolMsg],
      fee,
      memo,
    );
  }

  async fundValidatorRewardsPool(
    depositor: string,
    validatorAddress: string,
    amount: Coin[],
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ) {
    const fundValidatorRewardsPoolMsg = {
      typeUrl: "/cosmos.distribution.v1beta1.MsgDepositValidatorRewardsPool",
      value: MsgDepositValidatorRewardsPool.fromPartial({
        depositor,
        validatorAddress,
        amount,
      }),
    };

    return this.signingClient.signAndBroadcast(
      depositor,
      [fundValidatorRewardsPoolMsg],
      fee,
      memo,
    );
  }
}
