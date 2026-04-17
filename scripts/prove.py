#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from common import PROJECT_ROOT, ensure_directory, write_json
from app.services.zkp import prove_message
from app.utils.encoding import decode_message


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate a proof bundle for SM3 block-chain proving.")
    parser.add_argument("--message", required=True, help="Input message.")
    parser.add_argument("--encoding", default="utf8", choices=["utf8", "hex", "base64"])
    parser.add_argument("--output-dir", type=Path, default=Path("examples/latest-proof"))
    return parser


def main() -> None:
    args = build_parser().parse_args()
    output_dir = ensure_directory((PROJECT_ROOT / args.output_dir).resolve() if not args.output_dir.is_absolute() else args.output_dir)
    message_bytes = decode_message(args.message, args.encoding)
    bundle = prove_message(message_bytes)

    input_path = output_dir / "input.json"
    proof_path = output_dir / "proof.json"
    public_path = output_dir / "public_signals.json"
    report_path = output_dir / "report.json"

    write_json(input_path, bundle.input_json)
    write_json(proof_path, bundle.proof)
    write_json(public_path, bundle.public_signals)

    write_json(
        report_path,
        {
            "message": args.message,
            "encoding": args.encoding,
            "hash_hex": bundle.expected_hash,
            "mode": bundle.mode,
            "block_count": bundle.input_json.get("block_count"),
            "timings_ms": bundle.timings,
            "proof_size_bytes": bundle.proof_size_bytes,
            "paths": {
                "input": str(input_path),
                "proof": str(proof_path),
                "public_signals": str(public_path),
            },
        },
    )
    print(f"Proof artifacts written to {output_dir}")


if __name__ == "__main__":
    main()
