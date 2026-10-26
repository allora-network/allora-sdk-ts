# Allora SDK

TypeScript client for the Allora **Forge API Gateway** (topics + network inferences).

Published as [`@alloralabs/allora-sdk`](https://www.npmjs.com/package/@alloralabs/allora-sdk).

### Installation

```
npm install @alloralabs/allora-sdk
```

### Breaking changes (Forge migration)

This release replaces the legacy Upshot `/v2` client:

| Before | After |
|--------|--------|
| Optional embedded `UP-…` key | **Required** `forge_sk_…` from the [Developer Portal](https://developer.allora.network) |
| `https://api.upshot.xyz/v2` | Gateway `https://api.developer.allora.network` |
| Cosmos `ChainID` in paths | Network path segment: `testnet` \| `mainnet` \| `offchain` (default **mainnet**) |
| Header `x-api-key` | `Authorization: Bearer …` |
| `getAllTopics` followed Upshot `continuation_token` pagination | Gateway returns the catalog in one response |
| `getPriceInference(asset, timeframe)` | **Removed** — the Forge gateway has no price-by-asset endpoint. Use `getInferenceByTopicID(knownTopicId)` instead (see migration below) |
| `getInferenceByTopicID` defaulted `signatureFormat` to Sepolia | No default — `evm_chain_id` is sent only if you pass `signatureFormat`. **Without it, `signature` is typically `""`** (gateway does not sign). Pass a format / chain id if you need on-chain verification. |

**Unchanged:** public TypeScript shapes `AlloraTopic`, `AlloraInference`, and `AlloraInferenceData` (including nested `inference.inference_data.network_inference_normalized`), and the core signatures of `getAllTopics` and `getInferenceByTopicID`.

Topic fields the gateway does not return (`worker_count`, stakes, `is_active`, `updated_at`, …) stay at zero / `null` / `""` — they are not invented.

For staleness / provenance / `token_decimals` / vector signatures, use `getNetworkInference(topicId)` which returns the full flat gateway payload.

#### Migrating off `getPriceInference`

The Forge gateway exposes topics by id, not by asset/timeframe. To replace a `getPriceInference(BTC, "5m")` call:

1. Browse the catalog once: `const topics = await client.getAllTopics();`
2. Pick the topic id whose `topic_name` matches your asset/timeframe (e.g. `"BTC 5min"`)
3. Fetch its inference: `await client.getInferenceByTopicID(topicId)`

### Usage

```typescript
import {
  AlloraAPIClient,
  ChainSlug,
  SignatureFormat,
} from '@alloralabs/allora-sdk'

const alloraClient = new AlloraAPIClient({
  apiKey: process.env.ALLORA_API_KEY!, // forge_sk_…
  chainSlug: ChainSlug.MAINNET,       // optional; default mainnet
  // Or set ALLORA_API_BASE_URL — read automatically when baseAPIUrl is omitted
  // baseAPIUrl: process.env.ALLORA_API_BASE_URL,
});

// Topics (gateway catalog; no inference attached)
const topics = await alloraClient.getAllTopics();
if (topics.length === 0) {
  throw new Error('no topics');
}

// Nested inference — same field path as before.
// Without signatureFormat, signature is usually "" (no evm_chain_id).
const inference = await alloraClient.getInferenceByTopicID(topics[0].topic_id);
const price = inference.inference_data.network_inference_normalized;
console.log({ price, signature: inference.signature });

// Optional: request a consumer signature for a specific EVM chain
// (ethereum-11155111 → evm_chain_id=11155111).
const signed = await alloraClient.getInferenceByTopicID(
  topics[0].topic_id,
  SignatureFormat.ETHEREUM_SEPOLIA,
);
console.log({ signed: signed.signature });

// Full flat gateway payload (is_stale, token_decimals, …)
// const raw = await alloraClient.getNetworkInference(topics[0].topic_id);

// Cancel a single in-flight call (does not disable the client):
// const ac = new AbortController();
// const pending = alloraClient.getAllTopics({ signal: ac.signal });
// ac.abort();
```

### Environment variables

```bash
ALLORA_API_KEY=forge_sk_…
# Optional — used when `baseAPIUrl` is omitted from the constructor:
ALLORA_API_BASE_URL=…
```

### Tests

```bash
yarn test:unit
ALLORA_API_KEY=forge_sk_… yarn test:integration
```
