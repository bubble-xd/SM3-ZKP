from __future__ import annotations

from pathlib import Path
import json

from app.core.config import get_settings
from app.models.schemas import CircuitMeta
from app.utils.toolchain import executable_exists, file_exists


def _artifact_size(path: Path) -> int | None:
    if not file_exists(path):
        return None
    return path.stat().st_size


def _read_constraints(sym_path: Path) -> int | None:
    if not file_exists(sym_path):
        return None
    # The .sym file is line-oriented. Counting non-empty lines gives a stable upper bound
    # for symbol entries, but not the exact R1CS size. The exact count should come from
    # `snarkjs r1cs info`; we expose `None` until that artifact is available.
    return None


def get_circuit_meta() -> CircuitMeta:
    settings = get_settings()
    circuit = settings.circuit_name
    build_root = settings.build_root / circuit
    meta_path = build_root / "meta.json"
    artifact_status = {
        "r1cs": file_exists(build_root / f"{circuit}.r1cs"),
        "wasm": file_exists(build_root / f"{circuit}_js" / f"{circuit}.wasm"),
        "zkey": file_exists(build_root / f"{circuit}_final.zkey"),
        "vkey": file_exists(build_root / "verification_key.json"),
    }
    meta_json = json.loads(meta_path.read_text(encoding="utf-8")) if file_exists(meta_path) else {}
    notes = []
    if not all(artifact_status.values()):
        notes.append("Circuit artifacts are incomplete. Run scripts/setup_circuit.py first.")
    if not executable_exists("circom"):
        notes.append("`circom` is not installed.")
    if not executable_exists("snarkjs"):
        notes.append("`snarkjs` is not installed.")
    if not executable_exists("node"):
        notes.append("`node` is not installed.")
    return CircuitMeta(
        circuit_name=circuit,
        max_blocks=settings.max_blocks,
        max_message_length=settings.max_message_length,
        toolchain={
            "node": executable_exists("node"),
            "circom": executable_exists("circom"),
            "snarkjs": executable_exists("snarkjs"),
        },
        artifact_status=artifact_status,
        constraints=meta_json.get("constraints") or _read_constraints(build_root / f"{circuit}.sym"),
        proving_key_bytes=meta_json.get("sizes", {}).get("zkey_bytes") or _artifact_size(build_root / f"{circuit}_final.zkey"),
        verification_key_bytes=meta_json.get("sizes", {}).get("verification_key_bytes")
        or _artifact_size(build_root / "verification_key.json"),
        notes=notes,
    )
