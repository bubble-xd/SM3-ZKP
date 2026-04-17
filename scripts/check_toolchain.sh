#!/usr/bin/env bash
set -euo pipefail

for cmd in python3 node npm circom snarkjs; do
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "$cmd: $("$cmd" --version 2>/dev/null | head -n 1)"
  else
    echo "$cmd: missing"
  fi
done

