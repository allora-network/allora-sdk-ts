import { OfflineSigner, Registry } from "@cosmjs/proto-signing";
import {
  QueryClient,
  SigningStargateClient,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { BankModule } from "./modules/bank";
import { EmissionsModule } from "./modules/emissions";
import { registryTypes } from "./types/registryTypes";
import { Decimal } from "@cosmjs/math";
import { BlockModule } from "./modules/block";
import { AuthModule } from "./modules/auth";

const defaultSigningClientOptions: SigningStargateClientOptions = {
  registry: new Registry([...registryTypes]),
  gasPrice: {
    amount: Decimal.fromUserInput("10", 0),
    denom: "uallo",
  },
};

export class AlloraChainClient {
  private endpoint: string;
  private queryClient: QueryClient;
  private signer?: OfflineSigner;
  private signingClient?: SigningStargateClient;

  // Modules
  public bank: BankModule;
  public emissions: EmissionsModule;
  public block: BlockModule;
  public auth: AuthModule;

  public static async init(
    endpoint: string,
    signer?: OfflineSigner,
    signingClientOptions: SigningStargateClientOptions = defaultSigningClientOptions,
  ) {
    const tmClient = await Tendermint34Client.connect(endpoint);
    if (signer) {
      const signingClient = await SigningStargateClient.connectWithSigner(
        endpoint,
        signer,
        signingClientOptions,
      );
      return new AlloraChainClient(tmClient, endpoint, signingClient);
    }
    return new AlloraChainClient(tmClient, endpoint);
  }

  protected constructor(
    tmClient: Tendermint34Client,
    endpoint: string,
    signingClient?: SigningStargateClient,
  ) {
    this.endpoint = endpoint;
    this.queryClient = new QueryClient(tmClient);
    this.signingClient = signingClient;

    // Initialize modules
    this.bank = new BankModule(this.queryClient, this.signingClient);
    this.emissions = new EmissionsModule(this.queryClient, this.signingClient);
    this.block = new BlockModule(this.queryClient, this.signingClient);
    this.auth = new AuthModule(this.queryClient, this.signingClient);
  }

  public async connect(
    newSigner: OfflineSigner,
    signingClientOptions: SigningStargateClientOptions = defaultSigningClientOptions,
  ): Promise<AlloraChainClient> {
    this.signingClient = await SigningStargateClient.connectWithSigner(
      this.endpoint,
      newSigner,
      signingClientOptions,
    );

    this.bank = new BankModule(this.queryClient, this.signingClient);
    this.emissions = new EmissionsModule(this.queryClient, this.signingClient);
    this.block = new BlockModule(this.queryClient, this.signingClient);
    this.auth = new AuthModule(this.queryClient, this.signingClient);

    return this;
  }
}

export default AlloraChainClient;
