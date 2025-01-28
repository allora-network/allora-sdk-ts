import {
  AlloraChainClient,
} from "../src/v2/chain-client";
import { QueryBalanceResponse } from "../src/v2/types/generated/cosmos/bank/v1beta1/query";
import { GetActiveReputersForTopicResponse, GetTotalStakeRequest, GetTotalStakeResponse } from "../src/v2/types/generated/emissions/v7/query";

const RPC_URL = "https://allora-rpc.testnet.allora.network";

describe.only("AlloraChainSDK Unit Tests", () => {
  let client: AlloraChainClient;
  
  beforeAll(async () => {
    client = await AlloraChainClient.create(RPC_URL);
  });

  it("Test running queries", async () => {
    console.log("Fetching total stake...");
    const totalStake: GetTotalStakeResponse = await client.query.emissions.GetTotalStake(GetTotalStakeRequest.fromJSON({}));
    console.log("Total stake amount: ", totalStake.amount);

    console.log("Fetching active reputers on topics")
    const activeReputers: GetActiveReputersForTopicResponse = await client.query.emissions.GetActiveReputersForTopic({
      topicId: "29",
    });
    console.log("Active reputers: ", activeReputers.reputers);

    console.log("Fetch user balance")
    const userBalance: QueryBalanceResponse = await client.query.bank.Balance({
      address: "allo1853zalc0tgqcn5ma4y8psg6h3kgk2vt68h2ejg",
      denom: "uallo",
    });
    console.log("User balance: ", userBalance.balance);
  });

});

