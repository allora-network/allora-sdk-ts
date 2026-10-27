import type { NetworkInference, Topic } from "../src/v2";

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

/** Independent expected topic — wire shape. */
export const mockTopic: Topic = {
  id: 72,
  creator: "allo1…",
  metadata: "BTC 5min",
  loss_method: "mse",
  epoch_last_ended: 0,
  epoch_length: 720,
  ground_truth_lag: 1,
  worker_submission_window: 10,
  created_at: "2026-01-01T00:00:00Z",
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
  is_stale: false,
  confidence_interval_percentiles: ["0.25", "0.75"],
  confidence_interval_percentiles_normalized: ["0.25", "0.75"],
  confidence_interval_values: ["0.9", "1.1"],
  confidence_interval_values_normalized: ["0.9", "1.1"],
  extra_data: "",
};
