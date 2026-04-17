from __future__ import annotations

from app.services.sm3 import compress, message_expansion, sm3_hash_hex, sm3_pad


def test_sm3_abc_vector() -> None:
    assert (
        sm3_hash_hex(b"abc")
        == "66c7f0f462eeedd9d1f2d46bdc10e4e2"
        "4167c4875cf2f7a2297da02b8f4ba8e0"
    )


def test_sm3_long_vector() -> None:
    message = b"abcd" * 16
    assert (
        sm3_hash_hex(message)
        == "debe9ff92275b8a138604889c18e5a4d"
        "6fdb70e5387e5765293dcba39c0c5732"
    )


def test_padding_produces_single_block_for_short_message() -> None:
    padded = sm3_pad(b"abc")
    assert len(padded) == 64
    assert padded[:3] == b"abc"
    assert padded[3] == 0x80
    assert padded[-8:] == (24).to_bytes(8, "big")


def test_padding_produces_two_blocks_for_56_byte_message() -> None:
    padded = sm3_pad(b"a" * 56)
    assert len(padded) == 128


def test_message_expansion_matches_known_prefix_for_abc() -> None:
    padded = sm3_pad(b"abc")
    w, w_prime = message_expansion(padded)
    assert w[:16] == [
        0x61626380,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000000,
        0x00000018,
    ]
    assert len(w) == 68
    assert len(w_prime) == 64


def test_single_block_digest_matches_full_hash() -> None:
    padded = sm3_pad(b"abc")
    state = compress(
        (
            0x7380166F,
            0x4914B2B9,
            0x172442D7,
            0xDA8A0600,
            0xA96F30BC,
            0x163138AA,
            0xE38DEE4D,
            0xB0FB0E4E,
        ),
        padded,
    )
    digest = b"".join(word.to_bytes(4, "big") for word in state).hex()
    assert digest == sm3_hash_hex(b"abc")
