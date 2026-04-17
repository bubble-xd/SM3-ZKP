from __future__ import annotations

import pytest

from app.utils.padding import (
    bytes_to_bits_be,
    digest_hex_to_bits_be,
    max_message_length_for_blocks,
    sm3_pad_message_for_max_blocks,
    sm3_pad_message_single_block,
    zero_pad_blocks,
)


def test_single_block_padding_length() -> None:
    padded = sm3_pad_message_single_block(b"zk")
    assert len(padded) == 64


def test_single_block_padding_rejects_large_message() -> None:
    with pytest.raises(ValueError, match="<= 55"):
        sm3_pad_message_single_block(b"a" * 56)


def test_multi_block_padding_accepts_two_block_message() -> None:
    padded = sm3_pad_message_for_max_blocks(b"a" * 56, max_blocks=4)
    assert len(padded) == 128


def test_multi_block_padding_rejects_message_beyond_capacity() -> None:
    max_len = max_message_length_for_blocks(4)
    with pytest.raises(ValueError, match=str(max_len)):
        sm3_pad_message_for_max_blocks(b"a" * (max_len + 1), max_blocks=4)


def test_zero_pad_blocks_extends_to_full_circuit_budget() -> None:
    padded = sm3_pad_message_for_max_blocks(b"a" * 56, max_blocks=4)
    zero_padded = zero_pad_blocks(padded, max_blocks=4)
    assert len(zero_padded) == 256
    assert zero_padded[: len(padded)] == padded


def test_bytes_to_bits_be_roundtrip_shape() -> None:
    bits = bytes_to_bits_be(bytes.fromhex("a5"))
    assert bits == [1, 0, 1, 0, 0, 1, 0, 1]


def test_digest_bits_length() -> None:
    bits = digest_hex_to_bits_be("00" * 32)
    assert len(bits) == 256
