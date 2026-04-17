# Architecture

## Monorepo Layout

```text
.
├── frontend/              # Next.js 15 App Router UI
├── backend/               # FastAPI API + Python SM3 reference
├── circuits/              # Circom gadgets and SM3 compression step circuit
├── scripts/               # Setup / prove / verify / benchmark / dev helpers
├── benchmarks/results/    # Benchmark JSON output
├── examples/              # Example input and proof payloads
└── docs/                  # Supplemental docs
```

## Circuit Interface

- Step private input: `block_bits[512]`
- Step public input: `state_in_words[8]` + `state_out_words[8]`
- Aggregate public output: `expected_hash_words[8]`
- Message length: `<= 247 bytes`
- Padding: outside the circuit
- Scope: up to 4 chained SM3 compression blocks via proof bundle

## Runtime Flow

1. Frontend sends a message to `/api/hash`.
2. Backend computes SM3 with the Python reference implementation.
3. Backend pads the message externally, splits it into 64-byte blocks, and builds the proving step chain.
4. Proving mode:
   - 每个 block 复用 `sm3_compression_step` 生成 witness / proof / public signals
   - 后端把所有 step proof 组装成 proof bundle
5. Verification mode:
   - frontend submits `expected_hash + proof bundle + public_signals`
   - backend first checks the state chain, then verifies each step with `snarkjs groth16 verify`

## Proving Requirements

系统只支持真实 Groth16 证明与验证。
如果 `node / circom / snarkjs` 或电路构建产物缺失，`/api/prove` 和 `/api/verify` 会直接返回错误。
