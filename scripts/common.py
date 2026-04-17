from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = PROJECT_ROOT / "backend"

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


def run(cmd: list[str], cwd: Path | None = None) -> tuple[subprocess.CompletedProcess[str], float]:
    start = time.perf_counter()
    result = subprocess.run(
        cmd,
        cwd=str(cwd or PROJECT_ROOT),
        text=True,
        capture_output=True,
        check=True,
    )
    elapsed_ms = (time.perf_counter() - start) * 1000
    return result, elapsed_ms


def require_tools(*names: str) -> None:
    missing = [name for name in names if shutil.which(name) is None]
    if missing:
        raise RuntimeError(f"Missing required tools: {', '.join(missing)}")


def ensure_directory(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def write_json(path: Path, payload: Any) -> None:
    ensure_directory(path.parent)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_constraints(snarkjs_info_output: str) -> int | None:
    match = re.search(r"constraints:\s*([0-9,]+)", snarkjs_info_output, flags=re.IGNORECASE)
    if not match:
        return None
    return int(match.group(1).replace(",", ""))

