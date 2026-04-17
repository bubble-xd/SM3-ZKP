from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


def _env_list(name: str, default: str) -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    app_name: str
    version: str
    api_prefix: str
    cors_origins: list[str]
    auto_setup: bool
    project_root: Path
    backend_root: Path
    frontend_root: Path
    circuits_root: Path
    build_root: Path
    benchmark_root: Path
    example_root: Path
    scripts_root: Path
    max_blocks: int
    max_message_length: int
    powers_of_tau_path: Path
    circuit_name: str


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    backend_root = Path(__file__).resolve().parents[2]
    project_root = backend_root.parent
    circuit_name = os.getenv("CIRCUIT_NAME", "sm3_compression_step")
    default_blocks = {
        "sm3_single_block": 1,
        "sm3_multi_block": 4,
        "sm3_compression_step": 4,
    }.get(circuit_name, 4)
    max_blocks = int(os.getenv("MAX_BLOCKS", str(default_blocks)))
    circuits_root = project_root / "circuits"
    build_root = circuits_root / "build"
    return Settings(
        app_name=os.getenv("APP_NAME", "SM3 + ZKP Platform"),
        version=os.getenv("APP_VERSION", "0.1.0"),
        api_prefix=os.getenv("API_PREFIX", "/api"),
        cors_origins=_env_list(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000",
        ),
        auto_setup=os.getenv("AUTO_SETUP", "false").lower() == "true",
        project_root=project_root,
        backend_root=backend_root,
        frontend_root=project_root / "frontend",
        circuits_root=circuits_root,
        build_root=build_root,
        benchmark_root=project_root / "benchmarks" / "results",
        example_root=project_root / "examples",
        scripts_root=project_root / "scripts",
        max_blocks=max_blocks,
        max_message_length=int(os.getenv("MAX_MESSAGE_LENGTH", str((max_blocks * 64) - 9))),
        powers_of_tau_path=Path(
            os.getenv(
                "POWERS_OF_TAU_PATH",
                str(circuits_root / "ptau" / "powersOfTau28_hez_final_17.ptau"),
            )
        ),
        circuit_name=circuit_name,
    )
