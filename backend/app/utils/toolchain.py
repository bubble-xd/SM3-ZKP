from __future__ import annotations

from pathlib import Path
from shutil import which


def executable_exists(name: str) -> bool:
    return which(name) is not None


def file_exists(path: Path) -> bool:
    return path.exists() and path.is_file()

