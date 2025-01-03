# Allora SDK

### Usage

```typescript
const alloraClient = new AlloraApiClient({
    chainSlug: ChainSlug.TESTNET,
    apiKey: 'your-allora-api-key'
  });

// Examples:

// Fetch Allora topics
const topics = await alloraClient.getAllTopics();

// Fetch topic inference
const ethPrice5m = await  alloraClient.getInference(3);

// Fetch asset price prediction
const btc8h = await alloraClient.getPricePrediction(
  PricePredictionToken.BTC,
  PricePredictionTimeframe.EIGHT_HOURS
);
```