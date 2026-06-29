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

The `./signing` subpath relies on cosmjs, declared as optional `peerDependencies` — a plain
`npm install @alloralabs/allora-sdk` does **not** pull them in. Install them alongside the
SDK before using `ForgeRemoteSigner`:

```
npm install @cosmjs/amino @cosmjs/crypto @cosmjs/encoding @cosmjs/proto-signing cosmjs-types @cosmjs/stargate
```

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

// To subsidize gas via the Forge master feegrant, set `fee.granter` to the master
// wallet's allo1… address. The signer discovers it at runtime from the backend and
// exposes it as `signer.masterGranter`; prefer that, falling back to the canonical
// `FORGE_MASTER_GRANTER_ADDRESS` env var. Omit `granter` to pay gas from the signing
// wallet itself.
const fee = {
  amount: [{ denom: 'uallo', amount: '2000' }],
  gas: '200000',
  // Discovered value preferred, env var as override/fallback.
  granter: signer.masterGranter ?? process.env.FORGE_MASTER_GRANTER_ADDRESS,
}
await client.signAndBroadcast(signer.address, msgs, fee)
```

> **Fee-granter discovery & env var:** `signer.masterGranter` exposes the master
> fee-granter (allo1…) the Forge backend advertises for the wallet, discovered at
> runtime from the wallet-info/provision response (the `master_granter` field), so a
> master-wallet rotation needs no reconfiguration. `FORGE_MASTER_GRANTER_ADDRESS` is the
> canonical env-var name for the granter across the Allora SDKs (Python, TS, Go); this
> SDK does not read it directly — apply it yourself as the override/fallback shown above
> (`signer.masterGranter ?? process.env.FORGE_MASTER_GRANTER_ADDRESS`). Using the same
> variable name keeps TS, Python, and Go workers that target the same Forge tenant
> configured consistently. (The Python SDK still accepts the former name `FEE_GRANTER`
> for one release, with a deprecation warning.)

> **Node version:** the `./signing` subpath pulls in cosmjs, whose `@noble/*` v2
> dependencies are ESM-only. CommonJS (`require()`) consumers therefore need Node
> **≥20.19** (or **≥22.12**), where `require(ESM)` is supported; ESM `import` works
> on Node ≥18. The data-only main entrypoint (`@alloralabs/allora-sdk/v2`) has no
> such requirement.
