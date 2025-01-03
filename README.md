# Allora SDK

### Usage

```typescript
import { AlloraAPIClient } from '@alloralabs/allora-sdk/v2'

const alloraClient = new AlloraAPIClient({
    chainSlug: ChainSlug.TESTNET,
    apiKey: 'UP-632d1a59f49448ca8b914427', // Optional
  });

// Examples:

// Fetch Allora topics
const topics = await alloraClient.getAllTopics();

// Fetch topic inference by ID
const ethPrice5m = await  alloraClient.getInferenceByTopicID(3);

// Fetch asset price prediction
const btc8h = await alloraClient.getPricePrediction(
  PricePredictionToken.BTC,
  PricePredictionTimeframe.EIGHT_HOURS
);
```
