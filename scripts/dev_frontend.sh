#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../frontend"

if command -v npm >/dev/null 2>&1; then
  exec npm run dev -- --hostname 127.0.0.1 --port 3000
fi

if command -v conda >/dev/null 2>&1; then
  exec conda run -n sm3-zkp npm run dev -- --hostname 127.0.0.1 --port 3000
fi

echo "npm is not available in the current shell, and 'conda run -n sm3-zkp' is unavailable." >&2
echo "Activate the 'sm3-zkp' environment or install frontend dependencies first." >&2
exit 1
