# Allora SDK

TypeScript client for the Allora **Forge API Gateway** (topics + network inferences).

Published as [`@alloralabs/allora-sdk`](https://www.npmjs.com/package/@alloralabs/allora-sdk).

Public types match the Forge gateway wire JSON (same contract as [Go PR #29](https://github.com/allora-network/allora-sdk-go/pull/29) / [`docs/FORGE_API_RESPONSE_SHAPES.md`](docs/FORGE_API_RESPONSE_SHAPES.md)).

### Installation

```
npm install @alloralabs/allora-sdk
```

### Breaking changes (Forge wire shapes)

| Before (Upshot / early Forge port) | After |
|------------------------------------|--------|
| Required nested `AlloraInference.inference_data.*` | Flat `NetworkInference` (gateway JSON) |
| `AlloraTopic.topic_id` / `topic_name` | `Topic.id` / `Topic.metadata` |
| Optional embedded `UP-…` key | **Required** `forge_sk_…` |
| `https://api.upshot.xyz/v2` | `https://api.developer.allora.network` |
| `getPriceInference` | **Removed** — use `getAllTopics` + `getNetworkInference` |

Prefer `network_inference_normalized` for human-readable prices (raw `network_inference` is base units).

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
});

// Catalog — wire Topic fields (id, metadata, …)
const topics = await alloraClient.getAllTopics();
if (topics.length === 0) {
  throw new Error('no topics');
}

// Flat gateway inference
const inference = await alloraClient.getNetworkInference(topics[0].id);
const price = inference.network_inference_normalized;
console.log({ price, signature: inference.signature, is_stale: inference.is_stale });

// Optional consumer signature (ethereum-11155111 → evm_chain_id=11155111)
const signed = await alloraClient.getNetworkInference(
  topics[0].id,
  SignatureFormat.ETHEREUM_SEPOLIA,
);
console.log({ signed: signed.signature });

// One topic + best-effort latest inference
// const topic = await alloraClient.getTopic(topics[0].id);

// Cancel a single in-flight call:
// const ac = new AbortController();
// const pending = alloraClient.getAllTopics({ signal: ac.signal });
// ac.abort();
// await pending.catch(() => undefined); // AbortError / caller reason
```

### Errors and cancellation

| Failure | Result |
|---------|--------|
| Invalid client configuration | Constructor **throws** `ConfigError` (`AlloraAPIError` subclass) |
| Topic missing from catalog | Request **rejects** with `TopicNotFoundError` |
| HTTP non-2xx / bad payload | Request **rejects** with `AlloraAPIError` subclasses (`APIError`, …) |
| Client `timeoutMs` deadline | Request **rejects** with `TimeoutError` (`AlloraAPIError` subclass) |
| Caller cancel via `AbortController.abort()` | Request **rejects** with `AbortError` / `DOMException`, or the reason passed to `abort(reason)` — **not** wrapped as `AlloraAPIError` (fetch-style) |

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
