from __future__ import annotations

from subprocess import CompletedProcess

from app.services.sm3 import IV
from app.services.sm3 import sm3_hash_hex
from app.services.zkp import prepare_circuit_input, verify_proof


def _build_chain_proof(payload: dict[str, object]) -> tuple[dict[str, object], list[str]]:
    step_inputs = payload["step_inputs"]
    assert isinstance(step_inputs, list)

    steps = []
    for step_input in step_inputs:
        assert isinstance(step_input, dict)
        state_in_words = step_input["state_in_words"]
        state_out_words = step_input["state_out_words"]
        assert isinstance(state_in_words, list)
        assert isinstance(state_out_words, list)
        steps.append(
            {
                "index": step_input["index"],
                "state_in_words": state_in_words,
                "state_out_words": state_out_words,
                "public_signals": [str(word) for word in (state_in_words + state_out_words)],
                "proof": {
                    "pi_a": ["0", "0", "1"],
                    "pi_b": [["0", "0"], ["0", "0"], ["1", "0"]],
                    "pi_c": ["0", "0", "1"],
                    "protocol": "groth16",
                    "curve": "bn128",
                },
            }
        )

    expected_hash_words = payload["expected_hash_words"]
    assert isinstance(expected_hash_words, list)
    proof = {
        "scheme": "block_chain",
        "aggregation": "application_bundle",
        "step_circuit": payload["step_circuit"],
        "block_count": payload["block_count"],
        "expected_hash_words": expected_hash_words,
        "steps": steps,
    }
    return proof, [str(word) for word in expected_hash_words]


def test_prepare_circuit_input_for_abc_returns_single_step_chain() -> None:
    payload = prepare_circuit_input(b"abc")
    assert payload["scheme"] == "block_chain"
    assert payload["block_count"] == 1
    assert len(payload["step_inputs"]) == 1

    first_step = payload["step_inputs"][0]
    assert first_step["index"] == 0
    assert len(first_step["block_bits"]) == 512
    assert first_step["state_in_words"] == list(IV)
    assert first_step["state_out_words"] == payload["expected_hash_words"]


def test_prepare_circuit_input_for_two_block_message_returns_two_steps() -> None:
    payload = prepare_circuit_input(b"a" * 56)
    assert payload["scheme"] == "block_chain"
    assert payload["block_count"] == 2
    assert len(payload["step_inputs"]) == 2
    assert payload["step_inputs"][0]["state_out_words"] == payload["step_inputs"][1]["state_in_words"]
    assert payload["step_inputs"][-1]["state_out_words"] == payload["expected_hash_words"]


def test_block_chain_proof_verifies(monkeypatch) -> None:
    payload = prepare_circuit_input(b"abc")
    proof, public_signals = _build_chain_proof(payload)

    monkeypatch.setattr("app.services.zkp.ensure_real_mode_available", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(
        "app.services.zkp._run",
        lambda *_args, **_kwargs: CompletedProcess(args=[], returncode=0, stdout="OK\n", stderr=""),
    )

    assert verify_proof(sm3_hash_hex(b"abc"), proof, public_signals) is True


def test_block_chain_proof_detects_broken_chain() -> None:
    payload = prepare_circuit_input(b"a" * 56)
    proof, public_signals = _build_chain_proof(payload)
    tampered_proof = dict(proof)
    tampered_steps = [dict(step) for step in proof["steps"]]
    tampered_steps[1]["state_in_words"] = tampered_steps[1]["state_in_words"][:-1] + [0]
    tampered_steps[1]["public_signals"] = [str(word) for word in (tampered_steps[1]["state_in_words"] + tampered_steps[1]["state_out_words"])]
    tampered_proof["steps"] = tampered_steps
    assert verify_proof(sm3_hash_hex(b"a" * 56), tampered_proof, public_signals) is False
