import type { AlloraTopic } from "../src/v2";
import type { NetworkInference } from "../src/v2/gateway";

export const mockGatewayTopicsResponse = {
  network: "testnet",
  count: 1,
  cached_at: "2026-07-14T10:40:00Z",
  topics: [
    {
      id: 72,
      creator: "allo1…",
      metadata: "BTC 5min",
      loss_method: "mse",
      epoch_last_ended: 0,
      epoch_length: 720,
      ground_truth_lag: 1,
      worker_submission_window: 10,
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
};

/** Independent expected topic — do not derive via `mapGatewayTopic`. */
export const mockTopic: AlloraTopic = {
  topic_id: 72,
  topic_name: "BTC 5min",
  description: null,
  epoch_length: 720,
  ground_truth_lag: 1,
  loss_method: "mse",
  worker_submission_window: 10,
  worker_count: 0,
  reputer_count: 0,
  total_staked_allo: 0,
  total_emissions_allo: 0,
  is_active: null,
  updated_at: "",
};

export const mockNetworkInference: NetworkInference = {
  topic_id: 72,
  combined_value: [{ label_name: "y", value: "0.00006678" }],
  naive_value: [{ label_name: "y", value: "0.00006" }],
  timestamp_ms: 1784025644244,
  network_inference: "66781380725120668592",
  network_inference_normalized: "0.00006678",
  signature: "0xabc",
  token_decimals: 18,
  confidence_interval_percentiles: ["0.25", "0.75"],
  confidence_interval_percentiles_normalized: ["0.25", "0.75"],
  confidence_interval_values: ["0.9", "1.1"],
  confidence_interval_values_normalized: ["0.9", "1.1"],
  extra_data: "",
};
