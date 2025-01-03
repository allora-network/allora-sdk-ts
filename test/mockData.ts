import {
  AlloraTopic,
  AlloraInferenceData,
  AlloraInference,
} from "../src/api-client";

export const mockTopic: AlloraTopic = {
  topic_id: 1,
  topic_name: "Test Topic",
  description: "Test Description",
  epoch_length: 300,
  ground_truth_lag: 60,
  loss_method: "mse",
  worker_submission_window: 30,
  worker_count: 5,
  reputer_count: 3,
  total_staked_allo: 1000,
  total_emissions_allo: 100,
  is_active: true,
  updated_at: "2024-03-20T00:00:00Z",
};

export const mockInferenceData: AlloraInferenceData = {
  network_inference: "1000000000000000000",
  network_inference_normalized: "1.0",
  confidence_interval_percentiles: ["0.25", "0.75"],
  confidence_interval_percentiles_normalized: ["0.25", "0.75"],
  confidence_interval_values: ["900000000000000000", "1100000000000000000"],
  confidence_interval_values_normalized: ["0.9", "1.1"],
  topic_id: "1",
  timestamp: 1679529600,
  extra_data: "",
};

export const mockInference: AlloraInference = {
  signature: "0x1234567890",
  inference_data: mockInferenceData,
};

export const mockAPIResponse = {
  request_id: "test-request-id",
  status: true,
  data: mockInference,
};
