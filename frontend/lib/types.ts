export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: ApiError | null;
};

export type HashResponse = {
  message_length: number;
  block_count: number;
  hash_hex: string;
  expected_hash_words: number[];
  padded_message_hex: string;
  padded_preimage_bits: number[];
  expanded_words_preview: string[];
};

export type ProveResponse = {
  message_length: number;
  block_count: number;
  hash_hex: string;
  input_json: Record<string, unknown>;
  proof: Record<string, unknown>;
  public_signals: Array<string | number>;
  timings: {
    witness_generation_ms: number;
    proving_ms: number;
    verification_ms: number;
  };
  proof_size_bytes: number;
  mode: string;
};

export type VerifyResponse = {
  verified: boolean;
};

export type BenchmarkRecord = {
  message_length: number;
  message_hex: string;
  hash_hex: string;
  software_hash_ms: number;
  witness_generation_ms: number | null;
  proving_ms: number | null;
  verification_ms: number | null;
  proof_size_bytes: number | null;
  public_signals: Array<string | number>;
  success: boolean;
  mode: string;
  note?: string;
};

export type BenchmarkResponse = {
  summary: {
    available: boolean;
    generated_at_utc?: string;
    circuit_name?: string;
    lengths?: number[];
    message?: string;
  };
  records: BenchmarkRecord[];
};

export type CircuitMetaResponse = {
  circuit_name: string;
  max_blocks: number;
  max_message_length: number;
  toolchain: {
    node: boolean;
    circom: boolean;
    snarkjs: boolean;
  };
  artifact_status: {
    r1cs: boolean;
    wasm: boolean;
    zkey: boolean;
    vkey: boolean;
  };
  constraints: number | null;
  proving_key_bytes: number | null;
  verification_key_bytes: number | null;
  notes: string[];
};
