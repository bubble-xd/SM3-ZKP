from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


Encoding = Literal["utf8", "hex", "base64"]


class HashRequest(BaseModel):
    message: str = Field(..., description="Input message string.")
    encoding: Encoding = Field(default="utf8")


class ProveRequest(HashRequest):
    pass


class VerifyRequest(BaseModel):
    expected_hash: str = Field(..., description="Expected SM3 digest in hex.")
    proof: dict[str, Any] = Field(..., description="Groth16 proof JSON.")
    public_signals: list[Any] = Field(..., description="Groth16 public signals JSON array.")

    @field_validator("expected_hash")
    @classmethod
    def validate_hash(cls, value: str) -> str:
        normalized = value.lower().removeprefix("0x")
        if len(normalized) != 64:
            raise ValueError("expected_hash must be a 64-character hex digest")
        try:
            int(normalized, 16)
        except ValueError as exc:
            raise ValueError("expected_hash must be valid hex") from exc
        return normalized


class BenchmarkRecord(BaseModel):
    message_length: int
    witness_generation_ms: float | None = None
    proving_ms: float | None = None
    verification_ms: float | None = None
    proof_size_bytes: int | None = None
    success: bool


class CircuitMeta(BaseModel):
    circuit_name: str
    max_blocks: int
    max_message_length: int
    toolchain: dict[str, bool]
    artifact_status: dict[str, bool]
    constraints: int | None = None
    proving_key_bytes: int | None = None
    verification_key_bytes: int | None = None
    notes: list[str] = Field(default_factory=list)
