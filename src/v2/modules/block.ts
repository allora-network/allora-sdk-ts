import {
  createProtobufRpcClient,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { BaseModule } from "./base";
import { QueryClient } from "@cosmjs/stargate";
import { ServiceClientImpl as BlockQueryClient } from "../types/generated/cosmos/base/tendermint/v1beta1/query";

export class BlockModule extends BaseModule<BlockQueryClient> {
  constructor(queryClient: QueryClient, signingClient?: SigningStargateClient) {
    const protoQueryClient = createProtobufRpcClient(queryClient);
    super(new BlockQueryClient(protoQueryClient), signingClient);
  }

  async getNodeInfo() {
    return this.queryService.GetNodeInfo({});
  }

  async getSyncing() {
    return this.queryService.GetSyncing({});
  }

  async getLatestBlock() {
    return this.queryService.GetLatestBlock({});
  }

  async getBlockByHeight(height: number) {
    return this.queryService.GetBlockByHeight({ height: height.toString() });
  }

  async getLatestValidatorSet() {
    return this.queryService.GetLatestValidatorSet({});
  }

  async getValidatorSetByHeight(height: number) {
    return this.queryService.GetValidatorSetByHeight({
      height: height.toString(),
    });
  }
}
