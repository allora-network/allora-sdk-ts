# Forge API — response shapes (SDK alignment contract)

Copied from the Go SDK shapes doc for this repo. Public TypeScript types match these wire shapes (no Upshot nested compat wrappers).

See also: https://github.com/allora-network/allora-sdk-go/pull/29 · [ENGN-9548](https://linear.app/alloralabs/issue/ENGN-9548)

## Topics — `GET /{network}/topics`

Envelope: `{ network, count, cached_at, topics: Topic[] }`

### `Topic`

| JSON field | Type |
|------------|------|
| `id` | number |
| `creator` | string |
| `metadata` | string |
| `loss_method` | string |
| `epoch_last_ended` | number |
| `epoch_length` | number |
| `ground_truth_lag` | number |
| `worker_submission_window` | number |
| `created_at` | RFC3339 string \| null |
| `latest_network_inference` | `NetworkInference \| null` (SDK-only; attached by `getTopic`; `null` on inference failure) |

## Network inference — `GET /{network}/inference/{topic_id}`

Flat `NetworkInference` (prefer `network_inference_normalized` for prices). Optional query: `evm_chain_id`.

Nested helpers: `LabeledValue` `{ label_name, value }`, `WorkerInference` `{ worker, values }`.
