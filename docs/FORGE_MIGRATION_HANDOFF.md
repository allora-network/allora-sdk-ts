# Forge migration handoff — TypeScript SDK (`allora-sdk-ts`)

**Target format:** align public types with the **native Forge/Atlas wire shapes** (same as Go PR #29).  
Do **not** keep Upshot-era compat field names (`topic_id` / nested-only slim wrappers) as the long-term public contract — enlarge/replace to match Go.

**Canonical response shapes (copy these):**  
[`FORGE_API_RESPONSE_SHAPES.md`](./FORGE_API_RESPONSE_SHAPES.md) (local copy) · [Go shapes doc](https://github.com/allora-network/allora-sdk-go/blob/main/docs/FORGE_API_RESPONSE_SHAPES.md)

**Reference implementation:** https://github.com/allora-network/allora-sdk-go/pull/29  
**Linear:** [ENGN-9548](https://linear.app/alloralabs/issue/ENGN-9548)

---

## What to reuse vs change

| Layer | Action |
|-------|--------|
| Gateway + Atlas hosts, paths, auth (`Bearer` / `X-API-Key`) | Same as Go |
| Dataset/candle/`next` rules, ticker pick | Same as Go |
| Public `Topic` / `NetworkInference` / `Candle` | **Match Go JSON field names** |
| Old Upshot `AlloraTopic.topic_id` / nested-only `inference_data` as *sole* public shape | **Break / migrate** — optional deprecated adapters OK for one release |

---

## Defaults

| Item | Value |
|------|--------|
| Gateway | `https://api.developer.allora.network` |
| Data | `https://forge-data.allora.run/api` |
| Network | `mainnet` (`testnet` \| `mainnet` \| `offchain`) |
| Key | required; server validates (no client-side `forge_sk_` hard reject required) |

---

## Public types (align to Go)

See the Go shapes doc for full JSON. Summary:

- **`Topic`:** `id`, `creator`, `metadata`, `loss_method`, `epoch_*`, `ground_truth_lag`, `worker_submission_window`, `created_at`; optional SDK-only `latest_network_inference`
- **`NetworkInference`:** flat gateway payload (`network_inference_normalized`, labeled `combined_value`, CI arrays, signatures, …)
- **`Candle`:** float `open`/`high`/`low`/`close`/`volume`, `timestamp`, `dataset_id`

Prefer `network_inference_normalized` for prices; never treat raw `network_inference` as a decimal price.

---

## Methods

| Capability | Suggested |
|------------|-----------|
| List topics | `getAllTopics()` → `Topic[]` |
| One topic | `getTopic(id)` — best-effort attach inference |
| Inference | `getNetworkInference(id, signatureFormat?, opts?)` |
| Candles | `getCandles(query)` + async iterator over pages |

---

## Tests

Rewrite unit mocks against gateway/Atlas envelopes in the Go shapes doc.  
Integration: `ALLORA_API_KEY=…` against prod defaults (or stage overrides).

---

## Acceptance

- [ ] Public types match Go JSON tags / shapes doc
- [ ] Dual base URLs + dual auth
- [ ] Prod data default `forge-data.allora.run`
- [ ] Pagination host check + cycle/cap for Atlas `next`
- [ ] Breaking change documented for Upshot field renames
