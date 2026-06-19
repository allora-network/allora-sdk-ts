# Allora SDK

### Installation
```
npm install @alloralabs/allora-sdk
```

### Usage

```typescript
import { AlloraAPIClient } from '@alloralabs/allora-sdk/v2'

const alloraClient = new AlloraAPIClient({
    chainSlug: ChainSlug.TESTNET,
    apiKey: 'UP-8cbc632a67a84ac1b4078661', // Optional
  });

// Examples:

// Fetch Allora topics
const topics = await alloraClient.getAllTopics();

// Fetch topic inference by ID
const ethPrice5m = await  alloraClient.getInferenceByTopicID(3);

// Fetch asset price inference
const btc8h = await alloraClient.getPriceInference(
  PriceInferenceToken.BTC,
  PriceInferenceTimeframe.EIGHT_HOURS
);
```

### Privy-Managed Signing (delegated)

Delegate transaction signing to the Forge backend (a Privy-managed server wallet) instead
of holding a private key. `ForgeRemoteSigner` is a cosmjs `OfflineDirectSigner`, so it
plugs straight into `SigningStargateClient`.

```typescript
import { ForgeRemoteSigner } from '@alloralabs/allora-sdk/signing'
import { SigningStargateClient } from '@cosmjs/stargate'

// walletId + apiKey are minted in the Forge web app.
const signer = await ForgeRemoteSigner.create({
  backendUrl: 'https://forge.allora.network',
  apiKey: process.env.FORGE_API_KEY!,
  walletId: process.env.FORGE_SIGNING_WALLET_ID!,
})

const client = await SigningStargateClient.connectWithSigner(rpcUrl, signer)
// Set fee.granter to the master wallet to subsidize gas via feegrant.
await client.signAndBroadcast(signer.address, msgs, fee)
```

> **Node version:** the `./signing` subpath pulls in cosmjs, whose `@noble/*` v2
> dependencies are ESM-only. CommonJS (`require()`) consumers therefore need Node
> **≥20.19** (or **≥22.12**), where `require(ESM)` is supported; ESM `import` works
> on Node ≥18. The data-only main entrypoint (`@alloralabs/allora-sdk/v2`) has no
> such requirement.
