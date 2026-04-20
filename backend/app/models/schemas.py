from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


Encoding = Literal["utf8", "hex", "base64"]


class HashRequest(BaseModel):
    message: str = Field(
        ...,
        description="待处理消息内容。默认按 UTF-8 解释，也支持 Hex 与 Base64。",
        examples=["Hello, SM3 ZKP!"],
    )
    encoding: Encoding = Field(
        default="utf8",
        description="消息编码方式，可选 `utf8`、`hex`、`base64`。",
        examples=["utf8"],
    )


class ProveRequest(HashRequest):
    pass


class VerifyRequest(BaseModel):
    expected_hash: str = Field(
        ...,
        description="期望的 SM3 摘要，使用 64 位十六进制字符串表示。",
        examples=["66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0"],
    )
    proof: dict[str, Any] = Field(
        ...,
        description="Groth16 proof JSON，通常直接来自 `/api/prove` 的返回值。",
    )
    public_signals: list[Any] = Field(
        ...,
        description="Groth16 public signals 数组，通常与 proof 配套使用。",
    )

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
