#!/usr/bin/env python3
from __future__ import annotations

import argparse
import time
from datetime import UTC, datetime
from pathlib import Path

from common import PROJECT_ROOT, ensure_directory, write_json
from app.core.config import get_settings
from app.services.sm3 import sm3_hash_hex
from app.services.zkp import prove_message
from app.utils.toolchain import executable_exists


def benchmark_lengths(max_message_length: int) -> list[int]:
    candidates = [8, 16, 32, 55, 96, 160, max_message_length]
    return sorted({length for length in candidates if length <= max_message_length})


def deterministic_message(length: int) -> bytes:
    return bytes(((index * 17) + length) % 256 for index in range(length))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run reproducible SM3 + ZKP benchmarks.")
    parser.add_argument("--output-dir", type=Path, default=None, help="Benchmark output directory.")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    settings = get_settings()
    lengths = benchmark_lengths(settings.max_message_length)

    timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
    output_dir = ensure_directory(
        args.output_dir
        if args.output_dir is not None
        else settings.benchmark_root / timestamp
    )

    records: list[dict[str, object]] = []
    available = all(executable_exists(name) for name in ("node", "circom", "snarkjs")) and (
        settings.build_root / settings.circuit_name / f"{settings.circuit_name}_final.zkey"
    ).exists()

    for length in lengths:
        message = deterministic_message(length)
        hash_start = time.perf_counter()
        digest = sm3_hash_hex(message)
        hash_ms = (time.perf_counter() - hash_start) * 1000

        record: dict[str, object] = {
            "message_length": length,
            "message_hex": message.hex(),
            "hash_hex": digest,
            "software_hash_ms": hash_ms,
            "success": False,
        }

        if available:
            bundle = prove_message(message)
            record.update(
                {
                    "witness_generation_ms": bundle.timings["witness_generation_ms"],
                    "proving_ms": bundle.timings["proving_ms"],
                    "verification_ms": bundle.timings["verification_ms"],
                    "proof_size_bytes": bundle.proof_size_bytes,
                    "public_signals": bundle.public_signals,
                    "mode": bundle.mode,
                    "success": True,
                }
            )
        else:
            record.update(
                {
                    "witness_generation_ms": None,
                    "proving_ms": None,
                    "verification_ms": None,
                    "proof_size_bytes": None,
                    "public_signals": [],
                    "mode": "unavailable",
                    "note": "Install Node.js, circom, snarkjs, and run scripts/setup_circuit.py to enable real benchmarks.",
                }
            )

        records.append(record)

    summary = {
        "available": available,
        "generated_at_utc": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        "circuit_name": settings.circuit_name,
        "lengths": lengths,
    }

    latest_path = settings.benchmark_root / "latest.json"
    payload = {"summary": summary, "records": records}

    write_json(output_dir / "results.json", payload)
    write_json(latest_path, payload)
    print(f"Benchmark results written to {output_dir / 'results.json'}")


if __name__ == "__main__":
    main()
