#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

from common import write_json
from app.services.sm3 import sm3_hash_hex
from app.services.zkp import prepare_circuit_input
from app.utils.encoding import decode_message
from app.core.config import get_settings
from app.utils.padding import sm3_pad_message_for_max_blocks


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate proof-chain input JSON for the SM3 block-chain proving flow.")
    parser.add_argument("--message", required=True, help="Message value.")
    parser.add_argument("--encoding", default="utf8", choices=["utf8", "hex", "base64"])
    parser.add_argument("--output", type=Path, default=None, help="Output JSON path.")
    parser.add_argument("--summary-output", type=Path, default=None, help="Optional metadata summary JSON path.")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    settings = get_settings()
    message_bytes = decode_message(args.message, args.encoding)
    payload = prepare_circuit_input(message_bytes)
    padded = sm3_pad_message_for_max_blocks(
        message_bytes,
        max_blocks=settings.max_blocks,
        max_len=settings.max_message_length,
    )
    summary = {
        "message": args.message,
        "encoding": args.encoding,
        "message_hex": message_bytes.hex(),
        "message_length": len(message_bytes),
        "block_count": len(padded) // 64,
        "padded_message_hex": padded.hex(),
        "expected_hash_hex": sm3_hash_hex(message_bytes),
    }

    if args.output is not None:
        write_json(args.output, payload)
        if args.summary_output is not None:
            write_json(args.summary_output, summary)
        print(f"Wrote circuit input to {args.output}")
        return

    print(
        json.dumps(
            {
                "circuit_input": payload,
                "summary": summary,
            },
            indent=2,
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
