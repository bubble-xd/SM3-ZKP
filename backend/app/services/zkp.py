from __future__ import annotations

import json
import subprocess
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.core.config import get_settings
from app.services.sm3 import IV, compress, sm3_hash_hex
from app.utils.padding import (
    bytes_to_bits_be,
    digest_hex_to_words_be,
    sm3_pad_message_for_max_blocks,
    zero_pad_blocks,
)
from app.utils.toolchain import executable_exists


STEP_CIRCUIT_NAME = "sm3_compression_step"


@dataclass(frozen=True)
class ProofBundle:
    expected_hash: str
    input_json: dict[str, Any]
    proof: dict[str, Any]
    public_signals: list[Any]
    timings: dict[str, float]
    proof_size_bytes: int
    mode: str


WITNESS_TIMEOUT_SECONDS = 120
PROVE_TIMEOUT_SECONDS = 120
VERIFY_TIMEOUT_SECONDS = 30


def _build_root(circuit_name: str | None = None) -> Path:
    settings = get_settings()
    return settings.build_root / (circuit_name or settings.circuit_name)


def _step_public_signals(state_in_words: list[int], state_out_words: list[int]) -> list[str]:
    return [str(word) for word in (state_in_words + state_out_words)]


def _split_padded_blocks(message: bytes) -> list[bytes]:
    settings = get_settings()
    padded = sm3_pad_message_for_max_blocks(
        message,
        max_blocks=settings.max_blocks,
        max_len=settings.max_message_length,
    )
    return [padded[offset : offset + 64] for offset in range(0, len(padded), 64)]


def _build_step_input(block: bytes, state_in_words: list[int], state_out_words: list[int], index: int) -> dict[str, Any]:
    return {
        "index": index,
        "block_hex": block.hex(),
        "block_bits": bytes_to_bits_be(block),
        "state_in_words": state_in_words,
        "state_out_words": state_out_words,
    }


def prepare_monolithic_circuit_input(message: bytes) -> dict[str, Any]:
    settings = get_settings()
    padded = sm3_pad_message_for_max_blocks(
        message,
        max_blocks=settings.max_blocks,
        max_len=settings.max_message_length,
    )
    block_count = len(padded) // 64
    digest = sm3_hash_hex(message)
    return {
        "preimage_bits": bytes_to_bits_be(zero_pad_blocks(padded, settings.max_blocks)),
        "active_mask": ([1] * block_count) + ([0] * (settings.max_blocks - block_count)),
        "expected_hash_words": digest_hex_to_words_be(digest),
    }


def build_proof_chain_inputs(message: bytes) -> dict[str, Any]:
    blocks = _split_padded_blocks(message)
    digest = sm3_hash_hex(message)
    state = IV
    step_inputs: list[dict[str, Any]] = []

    for index, block in enumerate(blocks):
        state_in_words = [int(word) for word in state]
        next_state = compress(state, block)
        state_out_words = [int(word) for word in next_state]
        step_inputs.append(_build_step_input(block, state_in_words, state_out_words, index))
        state = next_state

    return {
        "scheme": "block_chain",
        "step_circuit": get_settings().circuit_name,
        "block_count": len(step_inputs),
        "expected_hash_words": digest_hex_to_words_be(digest),
        "step_inputs": step_inputs,
    }


def prepare_circuit_input(message: bytes) -> dict[str, Any]:
    if get_settings().circuit_name == STEP_CIRCUIT_NAME:
        return build_proof_chain_inputs(message)
    return prepare_monolithic_circuit_input(message)


def _request_dir() -> Path:
    settings = get_settings()
    root = settings.backend_root / ".artifacts" / "requests"
    root.mkdir(parents=True, exist_ok=True)
    workdir = root / f"{int(time.time())}-{uuid.uuid4().hex[:8]}"
    workdir.mkdir(parents=True, exist_ok=True)
    return workdir


def _run(cmd: list[str], cwd: Path, *, step: str, timeout_seconds: int) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            cmd,
            cwd=str(cwd),
            check=True,
            text=True,
            capture_output=True,
            timeout=timeout_seconds,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(f"{step} timed out after {timeout_seconds}s") from exc
    except subprocess.CalledProcessError as exc:
        stderr = (exc.stderr or "").strip()
        stdout = (exc.stdout or "").strip()
        details = stderr or stdout or f"exit code {exc.returncode}"
        raise RuntimeError(f"{step} failed: {details}") from exc


def ensure_real_mode_available(circuit_name: str | None = None) -> None:
    settings = get_settings()
    target_circuit = circuit_name or settings.circuit_name
    if not all(executable_exists(name) for name in ("node", "circom", "snarkjs")):
        raise RuntimeError("Node.js, circom, and snarkjs must be installed for Groth16 proving and verification")

    build_root = _build_root(target_circuit)
    required_paths = (
        build_root / f"{target_circuit}.r1cs",
        build_root / f"{target_circuit}_js" / f"{target_circuit}.wasm",
        build_root / f"{target_circuit}_final.zkey",
        build_root / "verification_key.json",
    )
    if not all(path.exists() for path in required_paths):
        raise RuntimeError(f"Circuit artifacts for `{target_circuit}` are missing. Run scripts/setup_circuit.py first")


def _proof_chain_payload(
    chain_input: dict[str, Any],
    steps: list[dict[str, Any]],
    total_timings: dict[str, float],
    total_proof_size_bytes: int,
    mode: str,
) -> dict[str, Any]:
    return {
        "scheme": "block_chain",
        "aggregation": "application_bundle",
        "step_circuit": chain_input["step_circuit"],
        "block_count": chain_input["block_count"],
        "expected_hash_words": chain_input["expected_hash_words"],
        "steps": steps,
        "summary": {
            "total_witness_generation_ms": total_timings["witness_generation_ms"],
            "total_proving_ms": total_timings["proving_ms"],
            "total_verification_ms": total_timings["verification_ms"],
            "total_proof_size_bytes": total_proof_size_bytes,
            "mode": mode,
        },
    }


def prove_monolithic_real(message: bytes) -> ProofBundle:
    settings = get_settings()
    ensure_real_mode_available()
    workdir = _request_dir()
    input_json = prepare_monolithic_circuit_input(message)
    input_path = workdir / "input.json"
    input_path.write_text(json.dumps(input_json, indent=2), encoding="utf-8")

    build_root = _build_root()
    wasm_dir = build_root / f"{settings.circuit_name}_js"
    witness_path = workdir / "witness.wtns"
    proof_path = workdir / "proof.json"
    public_path = workdir / "public_signals.json"
    vkey_path = build_root / "verification_key.json"
    zkey_path = build_root / f"{settings.circuit_name}_final.zkey"

    start = time.perf_counter()
    _run(
        [
            "node",
            str(wasm_dir / "generate_witness.js"),
            str(wasm_dir / f"{settings.circuit_name}.wasm"),
            str(input_path),
            str(witness_path),
        ],
        cwd=settings.project_root,
        step="Witness generation",
        timeout_seconds=WITNESS_TIMEOUT_SECONDS,
    )
    witness_ms = (time.perf_counter() - start) * 1000

    start = time.perf_counter()
    _run(
        [
            "snarkjs",
            "groth16",
            "prove",
            str(zkey_path),
            str(witness_path),
            str(proof_path),
            str(public_path),
        ],
        cwd=settings.project_root,
        step="Groth16 prove",
        timeout_seconds=PROVE_TIMEOUT_SECONDS,
    )
    proving_ms = (time.perf_counter() - start) * 1000

    proof = json.loads(proof_path.read_text(encoding="utf-8"))
    public_signals = json.loads(public_path.read_text(encoding="utf-8"))

    start = time.perf_counter()
    _run(
        [
            "snarkjs",
            "groth16",
            "verify",
            str(vkey_path),
            str(public_path),
            str(proof_path),
        ],
        cwd=settings.project_root,
        step="Groth16 verify",
        timeout_seconds=VERIFY_TIMEOUT_SECONDS,
    )
    verification_ms = (time.perf_counter() - start) * 1000

    return ProofBundle(
        expected_hash=sm3_hash_hex(message),
        input_json=input_json,
        proof=proof,
        public_signals=public_signals,
        timings={
            "witness_generation_ms": witness_ms,
            "proving_ms": proving_ms,
            "verification_ms": verification_ms,
        },
        proof_size_bytes=proof_path.stat().st_size,
        mode="real-monolithic",
    )


def prove_chain_real(message: bytes) -> ProofBundle:
    settings = get_settings()
    ensure_real_mode_available(settings.circuit_name)

    chain_input = build_proof_chain_inputs(message)
    build_root = _build_root()
    wasm_dir = build_root / f"{settings.circuit_name}_js"
    zkey_path = build_root / f"{settings.circuit_name}_final.zkey"
    vkey_path = build_root / "verification_key.json"
    workdir = _request_dir()

    total_timings = {
        "witness_generation_ms": 0.0,
        "proving_ms": 0.0,
        "verification_ms": 0.0,
    }
    total_proof_size_bytes = 0
    steps: list[dict[str, Any]] = []

    for step_input in chain_input["step_inputs"]:
        step_index = step_input["index"]
        step_dir = workdir / f"step_{step_index:02d}"
        step_dir.mkdir(parents=True, exist_ok=True)

        input_payload = {
            "block_bits": step_input["block_bits"],
            "state_in_words": step_input["state_in_words"],
            "state_out_words": step_input["state_out_words"],
        }

        input_path = step_dir / "input.json"
        witness_path = step_dir / "witness.wtns"
        proof_path = step_dir / "proof.json"
        public_path = step_dir / "public_signals.json"
        input_path.write_text(json.dumps(input_payload, indent=2), encoding="utf-8")

        start = time.perf_counter()
        _run(
            [
                "node",
                str(wasm_dir / "generate_witness.js"),
                str(wasm_dir / f"{settings.circuit_name}.wasm"),
                str(input_path),
                str(witness_path),
            ],
            cwd=settings.project_root,
            step=f"Witness generation for step {step_index}",
            timeout_seconds=WITNESS_TIMEOUT_SECONDS,
        )
        witness_ms = (time.perf_counter() - start) * 1000

        start = time.perf_counter()
        _run(
            [
                "snarkjs",
                "groth16",
                "prove",
                str(zkey_path),
                str(witness_path),
                str(proof_path),
                str(public_path),
            ],
            cwd=settings.project_root,
            step=f"Groth16 prove for step {step_index}",
            timeout_seconds=PROVE_TIMEOUT_SECONDS,
        )
        proving_ms = (time.perf_counter() - start) * 1000

        proof_json = json.loads(proof_path.read_text(encoding="utf-8"))
        public_signals = json.loads(public_path.read_text(encoding="utf-8"))

        start = time.perf_counter()
        _run(
            [
                "snarkjs",
                "groth16",
                "verify",
                str(vkey_path),
                str(public_path),
                str(proof_path),
            ],
            cwd=settings.project_root,
            step=f"Groth16 verify for step {step_index}",
            timeout_seconds=VERIFY_TIMEOUT_SECONDS,
        )
        verification_ms = (time.perf_counter() - start) * 1000

        step_proof_size = proof_path.stat().st_size
        total_proof_size_bytes += step_proof_size
        total_timings["witness_generation_ms"] += witness_ms
        total_timings["proving_ms"] += proving_ms
        total_timings["verification_ms"] += verification_ms

        steps.append(
            {
                "index": step_index,
                "state_in_words": step_input["state_in_words"],
                "state_out_words": step_input["state_out_words"],
                "public_signals": public_signals,
                "proof": proof_json,
                "proof_size_bytes": step_proof_size,
                "timings": {
                    "witness_generation_ms": witness_ms,
                    "proving_ms": proving_ms,
                    "verification_ms": verification_ms,
                },
                "mode": "real",
            }
        )

    expected_hash_words = chain_input["expected_hash_words"]
    proof = _proof_chain_payload(chain_input, steps, total_timings, total_proof_size_bytes, "real")
    return ProofBundle(
        expected_hash=sm3_hash_hex(message),
        input_json=chain_input,
        proof=proof,
        public_signals=[str(word) for word in expected_hash_words],
        timings=total_timings,
        proof_size_bytes=total_proof_size_bytes,
        mode="real-block-chain",
    )


def prove_message(message: bytes) -> ProofBundle:
    if get_settings().circuit_name == STEP_CIRCUIT_NAME:
        return prove_chain_real(message)
    return prove_monolithic_real(message)


def _normalize_words(values: Any, label: str, expected_len: int) -> list[int]:
    if not isinstance(values, list) or len(values) < expected_len:
        raise RuntimeError(f"{label} must contain at least {expected_len} items")
    try:
        return [int(values[index]) for index in range(expected_len)]
    except (TypeError, ValueError) as exc:
        raise RuntimeError(f"{label} must contain integer-compatible values") from exc


def _normalize_optional_words(values: Any, label: str, expected_len: int) -> list[int]:
    if values is None:
        return []
    return _normalize_words(values, label, expected_len)


def _parse_proof_chain(proof: dict[str, Any]) -> dict[str, Any]:
    if proof.get("scheme") != "block_chain":
        raise RuntimeError("proof scheme must be `block_chain`")

    steps_raw = proof.get("steps")
    if not isinstance(steps_raw, list) or not steps_raw:
        raise RuntimeError("block_chain proof must contain at least one step")

    expected_hash_words = proof.get("expected_hash_words")
    parsed_steps: list[dict[str, Any]] = []

    for step_index, step in enumerate(steps_raw):
        if not isinstance(step, dict):
            raise RuntimeError(f"step {step_index} must be an object")

        step_public_signals = step.get("public_signals")
        step_words = _normalize_words(step_public_signals, f"step {step_index} public_signals", 16)
        state_in_from_signals = step_words[:8]
        state_out_from_signals = step_words[8:16]

        state_in_words = _normalize_optional_words(step.get("state_in_words"), f"step {step_index} state_in_words", 8)
        state_out_words = _normalize_optional_words(step.get("state_out_words"), f"step {step_index} state_out_words", 8)

        if state_in_words and state_in_words != state_in_from_signals:
            raise RuntimeError(f"step {step_index} state_in_words does not match public_signals")
        if state_out_words and state_out_words != state_out_from_signals:
            raise RuntimeError(f"step {step_index} state_out_words does not match public_signals")

        step_proof = step.get("proof")
        if not isinstance(step_proof, dict):
            raise RuntimeError(f"step {step_index} proof must be an object")

        parsed_steps.append(
            {
                "index": int(step.get("index", step_index)),
                "state_in_words": state_in_from_signals,
                "state_out_words": state_out_from_signals,
                "public_signals": step_public_signals,
                "proof": step_proof,
            }
        )

    return {
        "block_count": int(proof.get("block_count", len(parsed_steps))),
        "expected_hash_words": _normalize_optional_words(expected_hash_words, "expected_hash_words", 8),
        "steps": parsed_steps,
    }


def _verify_monolithic_public_signals(expected_hash: str, public_signals: list[Any]) -> bool:
    normalized = [str(item) for item in public_signals[:8]]
    expected_words = [str(word) for word in digest_hex_to_words_be(expected_hash)]
    return normalized == expected_words


def verify_monolithic_real(expected_hash: str, proof: dict[str, Any], public_signals: list[Any]) -> bool:
    if not _verify_monolithic_public_signals(expected_hash, public_signals):
        return False

    ensure_real_mode_available()
    settings = get_settings()
    workdir = _request_dir()
    proof_path = workdir / "proof.json"
    public_path = workdir / "public_signals.json"
    proof_path.write_text(json.dumps(proof, indent=2), encoding="utf-8")
    public_path.write_text(json.dumps(public_signals, indent=2), encoding="utf-8")
    vkey_path = _build_root() / "verification_key.json"
    result = _run(
        [
            "snarkjs",
            "groth16",
            "verify",
            str(vkey_path),
            str(public_path),
            str(proof_path),
        ],
        cwd=settings.project_root,
        step="Groth16 verify",
        timeout_seconds=VERIFY_TIMEOUT_SECONDS,
    )
    output = (result.stdout + result.stderr).lower()
    return "invalid" not in output and "ok" in output


def _verify_chain_structure(expected_hash: str, proof: dict[str, Any], public_signals: list[Any]) -> bool:
    parsed = _parse_proof_chain(proof)
    expected_words = digest_hex_to_words_be(expected_hash)

    if public_signals and _normalize_words(public_signals, "public_signals", 8) != expected_words:
        return False
    if parsed["expected_hash_words"] and parsed["expected_hash_words"] != expected_words:
        return False
    if parsed["block_count"] != len(parsed["steps"]):
        return False

    previous_state = None
    for step_index, step in enumerate(parsed["steps"]):
        if step_index == 0 and step["state_in_words"] != list(IV):
            return False
        if previous_state is not None and step["state_in_words"] != previous_state:
            return False
        previous_state = step["state_out_words"]

    return previous_state == expected_words


def verify_chain_real(expected_hash: str, proof: dict[str, Any], public_signals: list[Any]) -> bool:
    if not _verify_chain_structure(expected_hash, proof, public_signals):
        return False

    ensure_real_mode_available(get_settings().circuit_name)
    parsed = _parse_proof_chain(proof)
    settings = get_settings()
    vkey_path = _build_root() / "verification_key.json"
    workdir = _request_dir()

    for step in parsed["steps"]:
        step_dir = workdir / f"step_{step['index']:02d}"
        step_dir.mkdir(parents=True, exist_ok=True)
        proof_path = step_dir / "proof.json"
        public_path = step_dir / "public_signals.json"
        proof_path.write_text(json.dumps(step["proof"], indent=2), encoding="utf-8")
        public_path.write_text(json.dumps(step["public_signals"], indent=2), encoding="utf-8")

        result = _run(
            [
                "snarkjs",
                "groth16",
                "verify",
                str(vkey_path),
                str(public_path),
                str(proof_path),
            ],
            cwd=settings.project_root,
            step=f"Groth16 verify for step {step['index']}",
            timeout_seconds=VERIFY_TIMEOUT_SECONDS,
        )
        output = (result.stdout + result.stderr).lower()
        if "invalid" in output or "ok" not in output:
            return False

    return True


def verify_proof(expected_hash: str, proof: dict[str, Any], public_signals: list[Any]) -> bool:
    if proof.get("scheme") == "block_chain":
        return verify_chain_real(expected_hash, proof, public_signals)
    return verify_monolithic_real(expected_hash, proof, public_signals)
