import {
  DirectSecp256k1Wallet,
  OfflineSigner,
  Registry,
} from "@cosmjs/proto-signing";
import { NETWORKS, NetworkName } from "./networks";
import {
  QueryClient,
  SigningStargateClient,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { BankModule } from "./modules/bank";
import { EmissionsModule } from "./modules/emissions";
import { FeegrantModule } from "./modules/feegrant";
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
  public feegrant: FeegrantModule;
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
      return new AlloraChainClient(tmClient, endpoint, signingClient, signer);
    }
    return new AlloraChainClient(tmClient, endpoint);
  }

  /**
   * Create a client from a network name (testnet/mainnet) without signing capability
   */
  public static async fromNetwork(network: NetworkName) {
    const config = NETWORKS[network];
    return AlloraChainClient.init(config.rpcEndpoint);
  }

  /**
   * Create a signing client from a private key and network name
   * @param network - The network to connect to (testnet/mainnet)
   * @param privateKey - The private key as hex string (with or without 0x prefix)
   */
  public static async fromPrivateKey(network: NetworkName, privateKey: string) {
    const config = NETWORKS[network];
    const cleanKey = privateKey.startsWith("0x")
      ? privateKey.slice(2)
      : privateKey;
    const wallet = await DirectSecp256k1Wallet.fromKey(
      Buffer.from(cleanKey, "hex"),
      "allo",
    );
    return AlloraChainClient.init(config.rpcEndpoint, wallet);
  }

  /**
   * Get the address of the connected signer
   */
  public async getSignerAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error("No signer available");
    }
    const accounts = await this.signer.getAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts found in signer");
    }
    return accounts[0].address;
  }

  protected constructor(
    tmClient: Tendermint34Client,
    endpoint: string,
    signingClient?: SigningStargateClient,
    signer?: OfflineSigner,
  ) {
    this.endpoint = endpoint;
    this.queryClient = new QueryClient(tmClient);
    this.signingClient = signingClient;
    this.signer = signer;

    // Initialize modules
    this.bank = new BankModule(this.queryClient, this.signingClient);
    this.emissions = new EmissionsModule(this.queryClient, this.signingClient);
    this.feegrant = new FeegrantModule(this.queryClient, this.signingClient);
    this.block = new BlockModule(this.queryClient, this.signingClient);
    this.auth = new AuthModule(this.queryClient, this.signingClient);
  }

  public async connect(
    newSigner: OfflineSigner,
    signingClientOptions: SigningStargateClientOptions = defaultSigningClientOptions,
  ): Promise<AlloraChainClient> {
    this.signer = newSigner;
    this.signingClient = await SigningStargateClient.connectWithSigner(
      this.endpoint,
      newSigner,
      signingClientOptions,
    );

    this.bank = new BankModule(this.queryClient, this.signingClient);
    this.emissions = new EmissionsModule(this.queryClient, this.signingClient);
    this.feegrant = new FeegrantModule(this.queryClient, this.signingClient);
    this.block = new BlockModule(this.queryClient, this.signingClient);
    this.auth = new AuthModule(this.queryClient, this.signingClient);

    return this;
  }
}

export default AlloraChainClient;
