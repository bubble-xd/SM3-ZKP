from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.core.config import get_settings


def latest_benchmark_path() -> Path:
    settings = get_settings()
    latest = settings.benchmark_root / "latest.json"
    return latest


def load_latest_benchmark() -> dict[str, Any]:
    path = latest_benchmark_path()
    if not path.exists():
        return {
            "records": [],
            "summary": {
                "available": False,
                "message": "No benchmark results found. Run scripts/benchmark.py first.",
            },
        }
    return json.loads(path.read_text(encoding="utf-8"))

