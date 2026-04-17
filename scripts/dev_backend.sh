#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../backend"

if command -v uvicorn >/dev/null 2>&1; then
  exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
fi

if command -v conda >/dev/null 2>&1; then
  exec conda run -n sm3-zkp python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
fi

echo "uvicorn is not available in the current shell, and 'conda run -n sm3-zkp' is unavailable." >&2
echo "Activate the 'sm3-zkp' environment or install backend requirements first." >&2
exit 1
