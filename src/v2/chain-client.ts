import { SigningStargateClient } from "@cosmjs/stargate";
import { createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

// Import all generated query clients
import { QueryServiceClientImpl as EmissionsQueryClient } from "./types/generated/emissions/v7/query";
import { QueryClientImpl as BankQueryClient } from "./types/generated/cosmos/bank/v1beta1/query";
import { QueryClientImpl as AuthQueryClient } from "./types/generated/cosmos/auth/v1beta1/query";
import { QueryClientImpl as AuthzQueryClient } from "./types/generated/cosmos/authz/v1beta1/query";
import { QueryClientImpl as CircuitQueryClient } from "./types/generated/cosmos/circuit/v1/query";
import { QueryClientImpl as ConsensusQueryClient } from "./types/generated/cosmos/consensus/v1/query";
import { QueryClientImpl as DistributionQueryClient } from "./types/generated/cosmos/distribution/v1beta1/query";
import { QueryClientImpl as EvidenceQueryClient } from "./types/generated/cosmos/evidence/v1beta1/query";
import { QueryClientImpl as FeeGrantQueryClient } from "./types/generated/cosmos/feegrant/v1beta1/query";
import { QueryClientImpl as GovQueryClient } from "./types/generated/cosmos/gov/v1/query";
import { QueryClientImpl as MintQueryClient } from "./types/generated/cosmos/mint/v1beta1/query";
import { QueryClientImpl as ParamsQueryClient } from "./types/generated/cosmos/params/v1beta1/query";
import { QueryClientImpl as SlashingQueryClient } from "./types/generated/cosmos/slashing/v1beta1/query";
import { QueryClientImpl as StakingQueryClient } from "./types/generated/cosmos/staking/v1beta1/query";
import { QueryClientImpl as UpgradeQueryClient } from "./types/generated/cosmos/upgrade/v1beta1/query";

// Import all generated tx clients
import { MsgClientImpl as EmissionsMsgClient } from "./types/generated/emissions/v3/tx";
import { MsgClientImpl as BankMsgClient } from "./types/generated/cosmos/bank/v1beta1/tx";
import { MsgClientImpl as AuthMsgClient } from "./types/generated/cosmos/auth/v1beta1/tx";
import { MsgClientImpl as AuthzMsgClient } from "./types/generated/cosmos/authz/v1beta1/tx";
import { MsgClientImpl as CircuitMsgClient } from "./types/generated/cosmos/circuit/v1/tx";
import { MsgClientImpl as ConsensusMsgClient } from "./types/generated/cosmos/consensus/v1/tx";
import { MsgClientImpl as DistributionMsgClient } from "./types/generated/cosmos/distribution/v1beta1/tx";
import { MsgClientImpl as EvidenceMsgClient } from "./types/generated/cosmos/evidence/v1beta1/tx";
import { MsgClientImpl as FeeGrantMsgClient } from "./types/generated/cosmos/feegrant/v1beta1/tx";
import { MsgClientImpl as GovMsgClient } from "./types/generated/cosmos/gov/v1/tx";
import { MsgClientImpl as MintMsgClient } from "./types/generated/cosmos/mint/v1beta1/tx";
import { MsgClientImpl as SlashingMsgClient } from "./types/generated/cosmos/slashing/v1beta1/tx";
import { MsgClientImpl as StakingMsgClient } from "./types/generated/cosmos/staking/v1beta1/tx";
import { MsgClientImpl as UpgradeMsgClient } from "./types/generated/cosmos/upgrade/v1beta1/tx";


type QuerySubcommands = {
  emissions: EmissionsQueryClient;
  bank: BankQueryClient;
  auth: AuthQueryClient;
  authz: AuthzQueryClient;
  circuit: CircuitQueryClient;
  consensus: ConsensusQueryClient;
  distribution: DistributionQueryClient;
  evidence: EvidenceQueryClient;
  feegrant: FeeGrantQueryClient;
  gov: GovQueryClient;
  mint: MintQueryClient;
  params: ParamsQueryClient;
  slashing: SlashingQueryClient;
  staking: StakingQueryClient;
  upgrade: UpgradeQueryClient;
};

type TxSubcommands = {
  emissions: EmissionsMsgClient;
  bank: BankMsgClient;
  auth: AuthMsgClient;
  authz: AuthzMsgClient;
  circuit: CircuitMsgClient;
  consensus: ConsensusMsgClient;
  distribution: DistributionMsgClient;
  evidence: EvidenceMsgClient;
  feegrant: FeeGrantMsgClient;
  gov: GovMsgClient;
  mint: MintMsgClient;
  slashing: SlashingMsgClient;
  staking: StakingMsgClient;
  upgrade: UpgradeMsgClient;
};

export class AlloraChainClient {
  private signingClient: SigningStargateClient | null = null;

  public query!: QuerySubcommands;
  
  public tx!: TxSubcommands;

  constructor(
    private rpcUrl: string,
  ) {}

  public static async create(
    rpcUrl: string,
  ): Promise<AlloraChainClient> {
    const instance = new AlloraChainClient(rpcUrl);
    await instance.initialize();
    return instance;
  }

  private async initialize() {
    const cometClient = await Tendermint34Client.connect(this.rpcUrl);
    const queryClient = new QueryClient(cometClient);
    const rpcClient = createProtobufRpcClient(queryClient);

    this.tx = {
      emissions: new EmissionsMsgClient(rpcClient),
      bank: new BankMsgClient(rpcClient),
      auth: new AuthMsgClient(rpcClient),
      authz: new AuthzMsgClient(rpcClient),
      circuit: new CircuitMsgClient(rpcClient),
      consensus: new ConsensusMsgClient(rpcClient),
      distribution: new DistributionMsgClient(rpcClient),
      evidence: new EvidenceMsgClient(rpcClient),
      feegrant: new FeeGrantMsgClient(rpcClient),
      gov: new GovMsgClient(rpcClient),
      mint: new MintMsgClient(rpcClient),
      slashing: new SlashingMsgClient(rpcClient),
      staking: new StakingMsgClient(rpcClient),
      upgrade: new UpgradeMsgClient(rpcClient),
    };

    this.query = {
      emissions: new EmissionsQueryClient(rpcClient),
      bank: new BankQueryClient(rpcClient),
      auth: new AuthQueryClient(rpcClient),
      authz: new AuthzQueryClient(rpcClient),
      circuit: new CircuitQueryClient(rpcClient),
      consensus: new ConsensusQueryClient(rpcClient),
      distribution: new DistributionQueryClient(rpcClient),
      evidence: new EvidenceQueryClient(rpcClient),
      feegrant: new FeeGrantQueryClient(rpcClient),
      gov: new GovQueryClient(rpcClient),
      mint: new MintQueryClient(rpcClient),
      params: new ParamsQueryClient(rpcClient),
      slashing: new SlashingQueryClient(rpcClient),
      staking: new StakingQueryClient(rpcClient),
      upgrade: new UpgradeQueryClient(rpcClient),
    };
  }

  // // Helper for transactions
  // async getTxClient() {
  //   if (!this.signer) {
  //     throw new Error("Signer not provided");
  //   }
    
  //   if (!this.signingClient) {
  //     this.signingClient = await SigningStargateClient.connectWithSigner(
  //       this.rpcUrl,
  //       this.signer
  //     );
  //   }
    
  //   return this.signingClient;
  // }
}