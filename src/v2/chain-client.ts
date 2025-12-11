import { SigningStargateClient } from "@cosmjs/stargate";
import { createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { Decimal } from "@cosmjs/math";
// Import all generated query clients
import { QueryServiceClientImpl as EmissionsQueryClient } from "./types/generated/emissions/v9/query";
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
import {
  DelegateStakeRequest,
  MsgServiceClientImpl as EmissionsMsgClient,
} from "./types/generated/emissions/v9/tx";
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
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import { MsgSend } from "./types/generated/cosmos/bank/v1beta1/tx";

import { TxResponse } from "cosmjs-types/cosmos/base/abci/v1beta1/abci";

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

interface RpcClient {
  request(
    service: string,
    method: string,
    data: Uint8Array,
  ): Promise<Uint8Array>;
}

// class AlloraChainRpcClient implements RpcClient {
//   private rpcUrl: string;
//   private signingClient: SigningStargateClient | null = null;
//   private signer: DirectSecp256k1HdWallet | null = null;

//   constructor(rpcUrl: string, signer: DirectSecp256k1HdWallet) {
//     this.rpcUrl = rpcUrl;
//     this.signer = signer;

//   }

//   async connectWithSigner(signer: DirectSecp256k1HdWallet) {
//     this.signingClient = await SigningStargateClient.connectWithSigner(
//       this.rpcUrl,
//       signer,
//       {
//         gasPrice: {
//           amount: Decimal.fromUserInput("10", 0),
//           denom: "uallo",
//         },
//       }
//     );
//   }

//   async request(service: string, method: string, data: Uint8Array): Promise<Uint8Array> {
//     if (!this.signer) {
//       throw new Error("Client not connected. Call connect() first");
//     }

//     const account = (await this.signer.getAccounts())[0];
//     const MessageType = this.getMessageType(service, method);
//     const decodedMsg = MessageType.decode(data);

//     // Create the transaction message
//     const msg = {
//       typeUrl: this.getTypeUrl(service, method),
//       value: decodedMsg
//     };

//     // Sign and broadcast
//     const txResult = await this.signer.signAndBroadcast(
//       account.address,
//       [msg],
//       "auto"
//     );

//     // Convert response to expected format
//     const jsonString = JSON.stringify(txResult, (_, value) =>
//       typeof value === 'bigint' ? value.toString() : value
//     );

//     const txResp = TxResponse.fromJSON(JSON.parse(jsonString));
//     return TxResponse.encode(txResp).finish();
//   }

//   private getMessageType(service: string, method: string) {
//     // Map service+method to corresponding protobuf message type
//     const messageTypes: Record<string, any> = {
//       "emissions.v7.DelegateStake": DelegateStakeRequest,
//       "bank.v1beta1.Send": MsgSend,
//     };

//     const key = `${service}.${method}`;
//     const MessageType = messageTypes[key];

//     if (!MessageType) {
//       throw new Error(`Unknown message type for ${key}`);
//     }
//     return MessageType;
//   }

//   private getTypeUrl(service: string, method: string) {
//     // Map service+method to corresponding protobuf type URL
//     const typeUrls: Record<string, string> = {
//       "emissions.v7.DelegateStake": "/emissions.v7.MsgDelegateStake",
//       "bank.v1beta1.Send": "/cosmos.bank.v1beta1.MsgSend",
//     };

//     const key = `${service}.${method}`;
//     const typeUrl = typeUrls[key];

//     if (!typeUrl) {
//       throw new Error(`Unknown type URL for ${key}`);
//     }
//     return typeUrl;
//   }
// }

export class AlloraChainClient {
  private signingClient: SigningStargateClient | null = null;
  private signer: DirectSecp256k1HdWallet | null = null;

  public query!: QuerySubcommands;

  public tx!: TxSubcommands;

  constructor(private rpcUrl: string) {}

  public static async create(rpcUrl: string): Promise<AlloraChainClient> {
    const instance = new AlloraChainClient(rpcUrl);
    await instance.initialize();
    return instance;
  }

  private async initialize() {
    const cometClient = await Tendermint34Client.connect(this.rpcUrl);
    const queryClient = new QueryClient(cometClient);
    const client = createProtobufRpcClient(queryClient);

    this.query = {
      emissions: new EmissionsQueryClient(client),
      bank: new BankQueryClient(client),
      auth: new AuthQueryClient(client),
      authz: new AuthzQueryClient(client),
      circuit: new CircuitQueryClient(client),
      consensus: new ConsensusQueryClient(client),
      distribution: new DistributionQueryClient(client),
      evidence: new EvidenceQueryClient(client),
      feegrant: new FeeGrantQueryClient(client),
      gov: new GovQueryClient(client),
      mint: new MintQueryClient(client),
      params: new ParamsQueryClient(client),
      slashing: new SlashingQueryClient(client),
      staking: new StakingQueryClient(client),
      upgrade: new UpgradeQueryClient(client),
    };
  }

  public async connectSigner(signer: DirectSecp256k1HdWallet) {
    this.signingClient = await SigningStargateClient.connectWithSigner(
      this.rpcUrl,
      signer,
      {
        gasPrice: {
          amount: Decimal.fromUserInput("10", 0),
          denom: "uallo",
        },
      },
    );
    this.signer = signer;

    const signingRpc: RpcClient = {
      request: async (service: string, method: string, data: Uint8Array) => {
        console.log("request", service, method, data);
        if (!this.signingClient) {
          throw new Error("Signing client not connected");
        }

        if (!this.signer) {
          throw new Error("Signer not connected");
        }

        const account = (await this.signer.getAccounts())[0];

        const msgSend = MsgSend.decode(data);
        console.log("msgSend", msgSend);

        // Create the transaction message
        const msg = {
          typeUrl: `/cosmos.bank.v1beta1.MsgSend`,
          value: msgSend,
        };

        console.log(account.address, [msg], "auto");

        // Sign and broadcast the transaction
        const txResult = await this.signingClient.signAndBroadcast(
          account.address,
          [msg],
          "auto",
        );

        return txResult.msgResponses[0].value;
      },
    };

    this.tx = {
      emissions: new EmissionsMsgClient(signingRpc, {
        service: "emissions.v7",
      }),
      bank: new BankMsgClient(signingRpc),
      auth: new AuthMsgClient(signingRpc),
      authz: new AuthzMsgClient(signingRpc),
      circuit: new CircuitMsgClient(signingRpc),
      consensus: new ConsensusMsgClient(signingRpc),
      distribution: new DistributionMsgClient(signingRpc),
      evidence: new EvidenceMsgClient(signingRpc),
      feegrant: new FeeGrantMsgClient(signingRpc),
      gov: new GovMsgClient(signingRpc),
      mint: new MintMsgClient(signingRpc),
      slashing: new SlashingMsgClient(signingRpc),
      staking: new StakingMsgClient(signingRpc),
      upgrade: new UpgradeMsgClient(signingRpc),
    };
  }
}
