#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

from common import read_json
from app.services.zkp import verify_proof


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Verify a proof bundle or single proof for the SM3 circuit.")
    parser.add_argument("--proof", type=Path, required=True)
    parser.add_argument("--public-signals", type=Path, required=True)
    parser.add_argument("--expected-hash", required=True, help="Expected hash hex for cross-checking public signals.")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    proof = read_json(args.proof)
    public_signals = read_json(args.public_signals)
    verified = verify_proof(args.expected_hash, proof, public_signals)
    print(json.dumps({"verified": verified}, ensure_ascii=False))


if __name__ == "__main__":
    main()
