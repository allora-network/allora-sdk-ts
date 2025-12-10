import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { coin } from "@cosmjs/stargate";
import { AlloraChainClient } from "../src/v2/allora-chain-client";
import { Decimal } from "@cosmjs/math";

const RPC_URL = "https://allora-rpc.testnet.allora.network";

describe("AlloraChainSDK Unit Tests", () => {
  let client: AlloraChainClient;

  beforeAll(async () => {
    client = await AlloraChainClient.init(RPC_URL);
  });

  it("Test running queries", async () => {
    console.log("Fetching total stake...");
    const totalStake = await client.emissions.getTotalStake();
    console.log("Total stake amount: ", totalStake.amount);

    console.log("Fetching latest network inferences on topic");
    const networkInferences =
      await client.emissions.getLatestNetworkInferences("29");
    console.log("Network inferences: ", networkInferences.networkInferences?.combinedValue);

    console.log("Fetch user balance");
    const userBalance = await client.bank.getBalance(
      "allo1853zalc0tgqcn5ma4y8psg6h3kgk2vt68h2ejg",
      "uallo",
    );
    console.log("User balance: ", userBalance.balance);
  });

  it.skip("Test delegate stake to reputer", async () => {
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(
      "rubber vehicle aerobic onion pulse green frost antenna wife sight forget match illegal badge shadow relief feed whisper canyon truth shed wasp damp sail",
      { prefix: "allo" },
    );
    await client.connect(signer);
    const signerAddress = (await signer.getAccounts())[0].address;
    const txResponse = await client.emissions.delegateStakeToReputer(
      signerAddress,
      "29",
      "allo1n29ulnkuze6pwu8tyux6qjvwa2gsjf0983e04u",
      "1",
    );
    console.log("Transaction response: ", txResponse);
  });

  it("Test running transactions", async () => {
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(
      "rubber vehicle aerobic onion pulse green frost antenna wife sight forget match illegal badge shadow relief feed whisper canyon truth shed wasp damp sail",
      { prefix: "allo" },
    );
    await client.connect(signer, {
      gasPrice: {
        amount: Decimal.fromUserInput("10", 0),
        denom: "uallo",
      },
    });

    const signerAddress = (await signer.getAccounts())[0].address;

    const txResponse = await client.bank.send(signerAddress, signerAddress, [
      coin(1, "uallo"),
    ]);

    console.log("Response msg:", txResponse);
    // const msg = await client.tx.emissions.DelegateStake({
    //   sender: signerAddress,
    //   topicId: "29",
    //   reputer: "allo1n29ulnkuze6pwu8tyux6qjvwa2gsjf0983e04u",
    //   amount: "10",
    // });
    // console.log("Transaction: ", msg);
  });
});
