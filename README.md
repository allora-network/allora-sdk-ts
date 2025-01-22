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
