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


@router.post(
    "/hash",
    tags=["证明生成"],
    summary="计算消息摘要与证明预处理信息",
    description="返回 SM3 摘要、padding 后的消息、比特序列和扩展字预览，适合在真正生成证明前做输入检查。",
)
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


@router.post(
    "/prove",
    tags=["证明生成"],
    summary="生成按块 SM3 证明结果包",
    description="对输入消息执行摘要计算、消息拆块、step proof 生成与 proof bundle 汇总，返回真实 proof 与 public signals。",
)
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


@router.post(
    "/verify",
    tags=["证明校验"],
    summary="验证 proof bundle 与摘要一致性",
    description="检查 expected hash、public signals 和整条状态链是否一致，并执行 Groth16 verify。",
)
def verify(request: VerifyRequest) -> dict[str, object]:
    try:
        verified = verify_proof(request.expected_hash, request.proof, request.public_signals)
        return success_response({"verified": verified})
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=error_response(str(exc)))


@router.get(
    "/benchmark",
    tags=["平台观测"],
    summary="读取最新 benchmark 快照",
    description="返回当前最新的 benchmark 结果，用于前端仪表盘与实验分析页展示。",
)
def benchmark() -> dict[str, object]:
    return success_response(load_latest_benchmark())


@router.get(
    "/circuit/meta",
    tags=["平台观测"],
    summary="查看电路与工具链元数据",
    description="返回电路上限、工具链安装状态、证明文件状态、约束规模与关键说明信息。",
)
def circuit_meta() -> dict[str, object]:
    return success_response(get_circuit_meta().model_dump())
