#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from common import PROJECT_ROOT, ensure_directory, parse_constraints, require_tools, run, write_json
from app.core.config import get_settings


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Compile the SM3 circuit and perform Groth16 setup.")
    parser.add_argument("--power", type=int, default=17, help="Power of tau exponent. Default: 17")
    parser.add_argument("--force", action="store_true", help="Rebuild artifacts even if they already exist.")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    require_tools("circom", "snarkjs")

    settings = get_settings()
    circuit = settings.circuit_name
    circuit_path = settings.circuits_root / f"{circuit}.circom"
    build_root = ensure_directory(settings.build_root / circuit)
    ptau_root = ensure_directory(settings.circuits_root / "ptau")
    ptau_initial = ptau_root / f"pot{args.power:02d}_0000.ptau"
    ptau_contrib = ptau_root / f"pot{args.power:02d}_0001.ptau"
    ptau_final = settings.powers_of_tau_path

    r1cs_path = build_root / f"{circuit}.r1cs"
    zkey_initial = build_root / f"{circuit}_0000.zkey"
    zkey_final = build_root / f"{circuit}_final.zkey"
    vkey_path = build_root / "verification_key.json"
    meta_path = build_root / "meta.json"

    timings: dict[str, float] = {}

    if args.force or not ptau_final.exists():
        _, timings["ptau_new_ms"] = run(
            ["snarkjs", "powersoftau", "new", "bn128", str(args.power), str(ptau_initial), "-v"]
        )
        _, timings["ptau_contribute_ms"] = run(
            [
                "snarkjs",
                "powersoftau",
                "contribute",
                str(ptau_initial),
                str(ptau_contrib),
                "--name=SM3 ZKP initial contribution",
                "-e=sm3-zkp-platform",
                "-v",
            ]
        )
        _, timings["ptau_phase2_ms"] = run(
            [
                "snarkjs",
                "powersoftau",
                "prepare",
                "phase2",
                str(ptau_contrib),
                str(ptau_final),
                "-v",
            ]
        )

    _, timings["compile_ms"] = run(
        [
            "circom",
            str(circuit_path),
            "--r1cs",
            "--wasm",
            "--sym",
            "--output",
            str(build_root),
        ],
        cwd=PROJECT_ROOT,
    )

    r1cs_info, _ = run(["snarkjs", "r1cs", "info", str(r1cs_path)], cwd=PROJECT_ROOT)
    constraints = parse_constraints(r1cs_info.stdout + r1cs_info.stderr)
    if constraints is not None and constraints * 2 > 2**args.power:
        raise RuntimeError(
            f"Power of tau exponent {args.power} is too small for {constraints} constraints. "
            f"Use --power 17 or larger."
        )

    _, timings["groth16_setup_ms"] = run(
        ["snarkjs", "groth16", "setup", str(r1cs_path), str(ptau_final), str(zkey_initial)],
        cwd=PROJECT_ROOT,
    )
    _, timings["zkey_contribute_ms"] = run(
        [
            "snarkjs",
            "zkey",
            "contribute",
            str(zkey_initial),
            str(zkey_final),
            "--name=SM3 ZKP final contribution",
            "-e=sm3-zkp-final",
        ],
        cwd=PROJECT_ROOT,
    )
    _, timings["export_vkey_ms"] = run(
        ["snarkjs", "zkey", "export", "verificationkey", str(zkey_final), str(vkey_path)],
        cwd=PROJECT_ROOT,
    )

    meta = {
        "circuit_name": circuit,
        "power": args.power,
        "constraints": constraints,
        "paths": {
            "circuit": str(circuit_path),
            "build_root": str(build_root),
            "ptau_final": str(ptau_final),
            "r1cs": str(r1cs_path),
            "zkey_final": str(zkey_final),
            "verification_key": str(vkey_path),
        },
        "sizes": {
            "r1cs_bytes": r1cs_path.stat().st_size if r1cs_path.exists() else None,
            "zkey_bytes": zkey_final.stat().st_size if zkey_final.exists() else None,
            "verification_key_bytes": vkey_path.stat().st_size if vkey_path.exists() else None,
        },
        "timings_ms": timings,
        "r1cs_info": r1cs_info.stdout.strip(),
    }

    write_json(meta_path, meta)
    print(f"Setup completed. Metadata written to {meta_path}")


if __name__ == "__main__":
    main()
