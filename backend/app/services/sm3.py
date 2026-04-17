from __future__ import annotations

from dataclasses import dataclass


IV = (
    0x7380166F,
    0x4914B2B9,
    0x172442D7,
    0xDA8A0600,
    0xA96F30BC,
    0x163138AA,
    0xE38DEE4D,
    0xB0FB0E4E,
)

TJ = [0x79CC4519] * 16 + [0x7A879D8A] * 48
MASK32 = 0xFFFFFFFF


def rotl32(value: int, shift: int) -> int:
    shift %= 32
    if shift == 0:
        return value & MASK32
    return ((value << shift) & MASK32) | ((value & MASK32) >> (32 - shift))


def p0(value: int) -> int:
    return value ^ rotl32(value, 9) ^ rotl32(value, 17)


def p1(value: int) -> int:
    return value ^ rotl32(value, 15) ^ rotl32(value, 23)


def ff(x: int, y: int, z: int, round_idx: int) -> int:
    if round_idx < 16:
        return x ^ y ^ z
    return (x & y) | (x & z) | (y & z)


def gg(x: int, y: int, z: int, round_idx: int) -> int:
    if round_idx < 16:
        return x ^ y ^ z
    return (x & y) | ((~x) & z)


def sm3_pad(message: bytes) -> bytes:
    bit_length = len(message) * 8
    padded = bytearray(message)
    padded.append(0x80)
    while len(padded) % 64 != 56:
        padded.append(0)
    padded.extend(bit_length.to_bytes(8, "big"))
    return bytes(padded)


def message_expansion(block: bytes) -> tuple[list[int], list[int]]:
    if len(block) != 64:
        raise ValueError("SM3 compression expects exactly 64 bytes per block")
    w = [int.from_bytes(block[i * 4 : (i + 1) * 4], "big") for i in range(16)]
    for idx in range(16, 68):
        term = w[idx - 16] ^ w[idx - 9] ^ rotl32(w[idx - 3], 15)
        w.append((p1(term) ^ rotl32(w[idx - 13], 7) ^ w[idx - 6]) & MASK32)
    w_prime = [(w[idx] ^ w[idx + 4]) & MASK32 for idx in range(64)]
    return w, w_prime


def compress(state: tuple[int, ...], block: bytes) -> tuple[int, ...]:
    a, b, c, d, e, f, g, h = state
    w, w_prime = message_expansion(block)
    for round_idx in range(64):
        a12 = rotl32(a, 12)
        ss1 = rotl32((a12 + e + rotl32(TJ[round_idx], round_idx)) & MASK32, 7)
        ss2 = ss1 ^ a12
        tt1 = (ff(a, b, c, round_idx) + d + ss2 + w_prime[round_idx]) & MASK32
        tt2 = (gg(e, f, g, round_idx) + h + ss1 + w[round_idx]) & MASK32
        d = c
        c = rotl32(b, 9)
        b = a
        a = tt1
        h = g
        g = rotl32(f, 19)
        f = e
        e = p0(tt2)
    return tuple(((x ^ y) & MASK32) for x, y in zip((a, b, c, d, e, f, g, h), state))


def sm3_hash(message: bytes) -> bytes:
    state = IV
    padded = sm3_pad(message)
    for offset in range(0, len(padded), 64):
        state = compress(state, padded[offset : offset + 64])
    return b"".join(word.to_bytes(4, "big") for word in state)


def sm3_hash_hex(message: bytes) -> str:
    return sm3_hash(message).hex()


@dataclass(frozen=True)
class SM3Trace:
    message: bytes
    padded_block: bytes
    digest_hex: str
    words: list[int]
    expanded_words: list[int]
    expanded_prime_words: list[int]


def single_block_trace(message: bytes, max_len: int = 55) -> SM3Trace:
    if len(message) > max_len:
        raise ValueError(f"single-block trace only supports messages up to {max_len} bytes")
    padded = sm3_pad(message)
    if len(padded) != 64:
        raise ValueError("single-block trace produced more than one block")
    words, words_prime = message_expansion(padded)
    return SM3Trace(
        message=message,
        padded_block=padded,
        digest_hex=sm3_hash_hex(message),
        words=[int.from_bytes(padded[i * 4 : (i + 1) * 4], "big") for i in range(16)],
        expanded_words=words,
        expanded_prime_words=words_prime,
    )

