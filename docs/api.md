# API

All API responses follow the same envelope:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Endpoints

### `POST /api/hash`

Request:

```json
{
  "message": "abc",
  "encoding": "utf8"
}
```

Response fields:

- `hash_hex`
- `expected_hash_words`
- `padded_message_hex`
- `padded_preimage_bits`
- `expanded_words_preview`

### `POST /api/prove`

Request:

```json
{
  "message": "abc",
  "encoding": "utf8"
}
```

Response fields:

- `hash_hex`
- `input_json`
- `proof`
- `public_signals`
- `timings`
- `proof_size_bytes`
- `mode`

说明：

- `/api/prove` 只返回真实 Groth16 证明
- 若工具链或电路产物缺失，接口会直接报错，不再回落到 mock

### `POST /api/verify`

Request:

```json
{
  "expected_hash": "66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0",
  "proof": {},
  "public_signals": []
}
```

Response:

```json
{
  "success": true,
  "data": {
    "verified": true
  },
  "error": null
}
```

### `GET /api/benchmark`

Returns `benchmarks/results/latest.json`.

### `GET /api/circuit/meta`

Returns toolchain availability, artifact status, key sizes, and setup metadata.
