import {
  Coin,
  createProtobufRpcClient,
  DeliverTxResponse,
  QueryClient,
  SigningStargateClient,
  StdFee,
} from "@cosmjs/stargate";
import { BaseModule } from "./base";
import {
  QueryClientImpl as BankQueryClient,
  QueryAllBalancesResponse,
  QueryBalanceResponse,
  QueryDenomMetadataByQueryStringResponse,
  QueryDenomMetadataResponse,
  QueryDenomOwnersByQueryResponse,
  QueryDenomOwnersResponse,
  QueryDenomsMetadataResponse,
  QuerySendEnabledResponse,
  QuerySpendableBalanceByDenomResponse,
  QuerySpendableBalancesResponse,
  QuerySupplyOfResponse,
  QueryTotalSupplyResponse,
} from "../types/generated/cosmos/bank/v1beta1/query";
import { PageRequest } from "../types/generated/cosmos/base/query/v1beta1/pagination";
import {
  MsgMultiSend,
  MsgSend,
  MsgSetSendEnabled,
  MsgUpdateParams,
} from "../types/generated/cosmos/bank/v1beta1/tx";
import {
  Input,
  Output,
  Params,
  SendEnabled,
} from "../types/generated/cosmos/bank/v1beta1/bank";

export class BankModule extends BaseModule<BankQueryClient> {
  constructor(queryClient: QueryClient, signingClient?: SigningStargateClient) {
    const protoQueryClient = createProtobufRpcClient(queryClient);
    super(new BankQueryClient(protoQueryClient), signingClient);
  }

  // Query methods
  public async getBalance(
    address: string,
    denom: string,
  ): Promise<QueryBalanceResponse> {
    return this.queryService.Balance({ address, denom });
  }

  public async getAllBalances(
    address: string,
    resolveDenom: boolean,
    pagination?: PageRequest,
  ): Promise<QueryAllBalancesResponse> {
    return this.queryService.AllBalances({ address, resolveDenom, pagination });
  }

  public async getSpendableBalances(
    address: string,
    pagination?: PageRequest,
  ): Promise<QuerySpendableBalancesResponse> {
    return this.queryService.SpendableBalances({ address, pagination });
  }

  public async getSpendableBalanceByDenom(
    address: string,
    denom: string,
  ): Promise<QuerySpendableBalanceByDenomResponse> {
    return this.queryService.SpendableBalanceByDenom({ address, denom });
  }

  public async getTotalSupply(
    pagination?: PageRequest,
  ): Promise<QueryTotalSupplyResponse> {
    return this.queryService.TotalSupply({ pagination });
  }

  public async getSupplyOf(denom: string): Promise<QuerySupplyOfResponse> {
    return this.queryService.SupplyOf({ denom });
  }

  public async getDenomMetadata(
    denom: string,
  ): Promise<QueryDenomMetadataResponse> {
    return this.queryService.DenomMetadata({ denom });
  }

  public async getDenomMetadataByQueryString(
    denom: string,
  ): Promise<QueryDenomMetadataByQueryStringResponse> {
    return this.queryService.DenomMetadataByQueryString({ denom });
  }

  public async getDenomsMetadata(
    pagination?: PageRequest,
  ): Promise<QueryDenomsMetadataResponse> {
    return this.queryService.DenomsMetadata({ pagination });
  }

  public async getDenomOwners(
    denom: string,
    pagination?: PageRequest,
  ): Promise<QueryDenomOwnersResponse> {
    return this.queryService.DenomOwners({ denom, pagination });
  }

  public async getDenomOwnersByQuery(
    denom: string,
    pagination?: PageRequest,
  ): Promise<QueryDenomOwnersByQueryResponse> {
    return this.queryService.DenomOwnersByQuery({ denom, pagination });
  }

  public async getSendEnabled(
    denoms: string[],
    pagination?: PageRequest,
  ): Promise<QuerySendEnabledResponse> {
    return this.queryService.SendEnabled({ denoms, pagination });
  }

  // Tx methods
  async send(
    fromAddress: string,
    toAddress: string,
    amount: Coin[],
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ): Promise<DeliverTxResponse> {
    const sendMsg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.fromPartial({
        fromAddress,
        toAddress,
        amount,
      }),
    };

    return this.signingClient.signAndBroadcast(
      fromAddress,
      [sendMsg],
      fee,
      memo,
    );
  }

  async multiSend(
    inputs: Input[],
    outputs: Output[],
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ): Promise<DeliverTxResponse> {
    const multiSendMsg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgMultiSend",
      value: MsgMultiSend.fromPartial({
        inputs,
        outputs,
      }),
    };

    return this.signingClient.signAndBroadcast(
      inputs[0].address,
      [multiSendMsg],
      fee,
      memo,
    );
  }

  async updateParams(
    authority: string,
    params: Params,
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ): Promise<DeliverTxResponse> {
    const updateParamsMsg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgUpdateParams",
      value: MsgUpdateParams.fromPartial({
        authority,
        params,
      }),
    };

    return this.signingClient.signAndBroadcast(
      authority,
      [updateParamsMsg],
      fee,
      memo,
    );
  }

  async setSendEnabled(
    authority: string,
    sendEnabled: SendEnabled[],
    useDefaultFor: string[],
    fee: StdFee | "auto" | number = "auto",
    memo: string = "",
  ): Promise<DeliverTxResponse> {
    const setSendEnabledMsg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSetSendEnabled",
      value: MsgSetSendEnabled.fromPartial({
        authority,
        sendEnabled,
        useDefaultFor,
      }),
    };

    return this.signingClient.signAndBroadcast(
      authority,
      [setSendEnabledMsg],
      fee,
      memo,
    );
  }
}
