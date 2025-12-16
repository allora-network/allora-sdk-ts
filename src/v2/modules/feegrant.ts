import {
  createProtobufRpcClient,
  DeliverTxResponse,
  QueryClient,
  SigningStargateClient,
  StdFee,
} from "@cosmjs/stargate";
import { BaseModule } from "./base";
import {
  QueryClientImpl as FeegrantQueryClient,
  QueryAllowanceResponse,
  QueryAllowancesResponse,
  QueryAllowancesByGranterResponse,
} from "../types/generated/cosmos/feegrant/v1beta1/query";
import { PageRequest } from "../types/generated/cosmos/base/query/v1beta1/pagination";
import {
  MsgGrantAllowance,
  MsgRevokeAllowance,
} from "../types/generated/cosmos/feegrant/v1beta1/tx";
import {
  BasicAllowance,
  PeriodicAllowance,
  AllowedMsgAllowance,
} from "../types/generated/cosmos/feegrant/v1beta1/feegrant";
import { Any } from "../types/generated/google/protobuf/any";
import { Coin } from "../types/generated/cosmos/base/v1beta1/coin";

export class FeegrantModule extends BaseModule<FeegrantQueryClient> {
  constructor(queryClient: QueryClient, signingClient?: SigningStargateClient) {
    const protoQueryClient = createProtobufRpcClient(queryClient);
    super(new FeegrantQueryClient(protoQueryClient), signingClient);
  }

  // Query methods

  /**
   * Get a specific fee allowance granted from granter to grantee
   */
  public async getAllowance(
    granter: string,
    grantee: string,
  ): Promise<QueryAllowanceResponse> {
    return this.queryService.Allowance({ granter, grantee });
  }

  /**
   * Get all fee allowances for a grantee
   */
  public async getAllowances(
    grantee: string,
    pagination?: PageRequest,
  ): Promise<QueryAllowancesResponse> {
    return this.queryService.Allowances({ grantee, pagination });
  }

  /**
   * Get all fee allowances issued by a granter
   */
  public async getAllowancesByGranter(
    granter: string,
    pagination?: PageRequest,
  ): Promise<QueryAllowancesByGranterResponse> {
    return this.queryService.AllowancesByGranter({ granter, pagination });
  }

  // Transaction methods

  /**
   * Grant a basic fee allowance to a grantee
   * @param granter - Address granting the allowance
   * @param grantee - Address receiving the allowance
   * @param spendLimit - Optional maximum amount of coins that can be spent (empty = unlimited)
   * @param expiration - Optional expiration date for the allowance
   */
  async grantBasicAllowance(
    granter: string,
    grantee: string,
    spendLimit?: Coin[],
    expiration?: Date,
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ): Promise<DeliverTxResponse> {
    const basicAllowance = BasicAllowance.fromPartial({
      spendLimit: spendLimit || [],
      expiration: expiration,
    });

    const allowanceAny: Any = {
      typeUrl: "/cosmos.feegrant.v1beta1.BasicAllowance",
      value: BasicAllowance.encode(basicAllowance).finish(),
    };

    const grantMsg = {
      typeUrl: "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
      value: MsgGrantAllowance.fromPartial({
        granter,
        grantee,
        allowance: allowanceAny,
      }),
    };

    return this.signingClient.signAndBroadcast(granter, [grantMsg], fee, memo);
  }

  /**
   * Grant basic fee allowances to multiple grantees in a single transaction
   * @param granter - Address granting the allowances
   * @param grantees - Array of addresses receiving the allowances
   * @param spendLimit - Optional maximum amount of coins that can be spent per grantee (empty = unlimited)
   * @param expiration - Optional expiration date for the allowances
   */
  async grantBasicAllowances(
    granter: string,
    grantees: string[],
    spendLimit?: Coin[],
    expiration?: Date,
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ): Promise<DeliverTxResponse> {
    const basicAllowance = BasicAllowance.fromPartial({
      spendLimit: spendLimit || [],
      expiration: expiration,
    });

    const allowanceAny: Any = {
      typeUrl: "/cosmos.feegrant.v1beta1.BasicAllowance",
      value: BasicAllowance.encode(basicAllowance).finish(),
    };

    const grantMsgs = grantees.map((grantee) => ({
      typeUrl: "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
      value: MsgGrantAllowance.fromPartial({
        granter,
        grantee,
        allowance: allowanceAny,
      }),
    }));

    return this.signingClient.signAndBroadcast(granter, grantMsgs, fee, memo);
  }

  /**
   * Revoke a fee allowance from a grantee
   * @param granter - Address that granted the allowance
   * @param grantee - Address whose allowance is being revoked
   */
  async revokeAllowance(
    granter: string,
    grantee: string,
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ): Promise<DeliverTxResponse> {
    const revokeMsg = {
      typeUrl: "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
      value: MsgRevokeAllowance.fromPartial({
        granter,
        grantee,
      }),
    };

    return this.signingClient.signAndBroadcast(granter, [revokeMsg], fee, memo);
  }

  /**
   * Revoke fee allowances from multiple grantees in a single transaction
   * @param granter - Address that granted the allowances
   * @param grantees - Array of addresses whose allowances are being revoked
   */
  async revokeAllowances(
    granter: string,
    grantees: string[],
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ): Promise<DeliverTxResponse> {
    const revokeMsgs = grantees.map((grantee) => ({
      typeUrl: "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
      value: MsgRevokeAllowance.fromPartial({
        granter,
        grantee,
      }),
    }));

    return this.signingClient.signAndBroadcast(granter, revokeMsgs, fee, memo);
  }
}
