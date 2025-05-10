import {
  createProtobufRpcClient,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { BaseModule } from "./base";
import { QueryClient } from "@cosmjs/stargate";
import { QueryClientImpl as AuthQueryClient } from "../types/generated/cosmos/auth/v1beta1/query";
import { PageRequest } from "../types/generated/cosmos/base/query/v1beta1/pagination";

export class AuthModule extends BaseModule<AuthQueryClient> {
  constructor(queryClient: QueryClient, signingClient?: SigningStargateClient) {
    const protoQueryClient = createProtobufRpcClient(queryClient);
    super(new AuthQueryClient(protoQueryClient), signingClient);
  }

  async getAccounts(pagination?: PageRequest) {
    return this.queryService.Accounts({ pagination });
  }

  async getAccount(address: string) {
    return this.queryService.Account({ address });
  }

  async getAccountAddressByID(id: string, accountId: string) {
    return this.queryService.AccountAddressByID({ id, accountId });
  }

  async getModuleAccounts() {
    return this.queryService.ModuleAccounts({});
  }

  async getModuleAccountByName(name: string) {
    return this.queryService.ModuleAccountByName({ name });
  }

  async getBetch32Prefix() {
    return this.queryService.Bech32Prefix({});
  }

  async addressBytesToString(addressBytes: Uint8Array) {
    return this.queryService.AddressBytesToString({ addressBytes });
  }

  async addressStringToBytes(addressString: string) {
    return this.queryService.AddressStringToBytes({ addressString });
  }

  async getAccountInfo(address: string) {
    return this.queryService.AccountInfo({ address });
  }
}
