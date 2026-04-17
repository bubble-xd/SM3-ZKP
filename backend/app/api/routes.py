from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.responses import error_response, success_response
from app.core.config import get_settings
from app.models.schemas import HashRequest, ProveRequest, VerifyRequest
from app.services.benchmark import load_latest_benchmark
from app.services.circuit_meta import get_circuit_meta
from app.services.sm3 import message_expansion, sm3_hash_hex
from app.services.zkp import prove_message, verify_proof
from app.utils.encoding import decode_message
from app.utils.padding import bytes_to_bits_be, digest_hex_to_words_be, sm3_pad_message_for_max_blocks


router = APIRouter()


@router.post("/hash")
def hash_message(request: HashRequest) -> dict[str, object]:
    try:
        settings = get_settings()
        message_bytes = decode_message(request.message, request.encoding)
        padded = sm3_pad_message_for_max_blocks(
            message_bytes,
            max_blocks=settings.max_blocks,
            max_len=settings.max_message_length,
        )
        digest = sm3_hash_hex(message_bytes)
        expanded_words, _ = message_expansion(padded[:64])
        return success_response(
            {
                "message_length": len(message_bytes),
                "block_count": len(padded) // 64,
                "hash_hex": digest,
                "expected_hash_words": digest_hex_to_words_be(digest),
                "padded_message_hex": padded.hex(),
                "padded_preimage_bits": bytes_to_bits_be(padded),
                "expanded_words_preview": [f"{word:08x}" for word in expanded_words[:20]],
            }
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=error_response(str(exc)))


@router.post("/prove")
def prove(request: ProveRequest) -> dict[str, object]:
    try:
        message_bytes = decode_message(request.message, request.encoding)
        proof_bundle = prove_message(message_bytes)
        input_block_count = proof_bundle.input_json.get("block_count")
        if input_block_count is None:
            input_block_count = int(sum(proof_bundle.input_json.get("active_mask", [])))
        return success_response(
            {
                "message_length": len(message_bytes),
                "block_count": int(input_block_count),
                "hash_hex": proof_bundle.expected_hash,
                "input_json": proof_bundle.input_json,
                "proof": proof_bundle.proof,
                "public_signals": proof_bundle.public_signals,
                "timings": proof_bundle.timings,
                "proof_size_bytes": proof_bundle.proof_size_bytes,
                "mode": proof_bundle.mode,
            }
        )
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=400, detail=error_response(str(exc)))


@router.post("/verify")
def verify(request: VerifyRequest) -> dict[str, object]:
    try:
        verified = verify_proof(request.expected_hash, request.proof, request.public_signals)
        return success_response({"verified": verified})
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=error_response(str(exc)))


@router.get("/benchmark")
def benchmark() -> dict[str, object]:
    return success_response(load_latest_benchmark())


@router.get("/circuit/meta")
def circuit_meta() -> dict[str, object]:
    return success_response(get_circuit_meta().model_dump())
