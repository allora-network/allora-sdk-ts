# Allora SDK

The **Allora SDK** provides easy access to the Allora Network, enabling developers to interact with decentralized inference models and obtain real-time predictions for various assets and topics.

## Installation

To install the Allora SDK, run the following command:

```bash
npm install @alloralabs/allora-sdk
```

### Usage

First, import the SDK and initialize the AlloraAPIClient with the desired chain configuration:

```typescript
import { AlloraAPIClient } from '@alloralabs/allora-sdk/v2'

const alloraClient = new AlloraAPIClient({
    chainSlug: ChainSlug.TESTNET,
    apiKey: 'UP-8cbc632a67a84ac1b4078661', // Optional
  });

### Examples

1. Fetch Allora Topics

Retrieve a list of all available topics within the Allora Network.
// Fetch topic inference by ID
const ethPrice5m = await  alloraClient.getInferenceByTopicID(3);

3. Predict Asset Prices

Request price predictions for specific assets (e.g., Bitcoin) over different timeframes.

// Fetch asset price prediction
const btc8h = await alloraClient.getPricePrediction(
  PricePredictionToken.BTC,
  PricePredictionTimeframe.EIGHT_HOURS
);
```
