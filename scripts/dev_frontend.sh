#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../frontend"

if [[ "${CONDA_DEFAULT_ENV:-}" == "sm3-zkp" ]]; then
  exec npm run dev -- --hostname 127.0.0.1 --port 3000
fi

if command -v conda >/dev/null 2>&1; then
  exec conda run --no-capture-output -n sm3-zkp npm run dev -- --hostname 127.0.0.1 --port 3000
fi

if command -v npm >/dev/null 2>&1; then
  echo "Warning: 'conda' is unavailable, falling back to the current shell npm." >&2
  exec npm run dev -- --hostname 127.0.0.1 --port 3000
fi

echo "'conda run -n sm3-zkp' and 'npm' are both unavailable." >&2
echo "Install Conda or activate the 'sm3-zkp' environment before starting the frontend." >&2
exit 1
