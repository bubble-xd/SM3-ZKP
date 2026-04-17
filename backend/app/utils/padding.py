from __future__ import annotations

from typing import Iterable


def max_message_length_for_blocks(max_blocks: int) -> int:
    if max_blocks < 1:
        raise ValueError("max_blocks must be >= 1")
    return (max_blocks * 64) - 9


def sm3_pad_message_for_max_blocks(message: bytes, max_blocks: int, max_len: int | None = None) -> bytes:
    if max_blocks < 1:
        raise ValueError("max_blocks must be >= 1")
    effective_max_len = max_message_length_for_blocks(max_blocks) if max_len is None else max_len
    if len(message) > effective_max_len:
        raise ValueError(f"message length must be <= {effective_max_len} bytes for the {max_blocks}-block circuit")
    bit_length = len(message) * 8
    padded = bytearray(message)
    padded.append(0x80)
    while len(padded) % 64 != 56:
        padded.append(0x00)
    padded.extend(bit_length.to_bytes(8, "big"))
    if len(padded) > max_blocks * 64:
        raise ValueError(f"message requires more than {max_blocks} SM3 blocks after padding")
    return bytes(padded)


def zero_pad_blocks(padded_message: bytes, max_blocks: int) -> bytes:
    max_bytes = max_blocks * 64
    if len(padded_message) % 64 != 0:
        raise ValueError("padded_message must contain whole 64-byte SM3 blocks")
    if len(padded_message) > max_bytes:
        raise ValueError("padded_message exceeds the configured block budget")
    return padded_message + bytes(max_bytes - len(padded_message))


def sm3_pad_message_single_block(message: bytes, max_len: int = 55) -> bytes:
    padded = sm3_pad_message_for_max_blocks(message, max_blocks=1, max_len=max_len)
    if len(padded) != 64:
        raise ValueError("single-block padding must yield exactly 64 bytes")
    return padded


def bytes_to_bits_be(data: bytes) -> list[int]:
    bits: list[int] = []
    for byte in data:
        for shift in range(7, -1, -1):
            bits.append((byte >> shift) & 1)
    return bits


def digest_hex_to_bits_be(digest_hex: str) -> list[int]:
    normalized = digest_hex.lower().removeprefix("0x")
    return bytes_to_bits_be(bytes.fromhex(normalized))


def digest_hex_to_words_be(digest_hex: str) -> list[int]:
    normalized = digest_hex.lower().removeprefix("0x")
    return chunk_words_be(bytes.fromhex(normalized))


def chunk_words_be(data: bytes) -> list[int]:
    if len(data) % 4 != 0:
        raise ValueError("data length must be a multiple of 4 bytes")
    return [int.from_bytes(data[index : index + 4], "big") for index in range(0, len(data), 4)]


def bits_to_hex(bits: Iterable[int]) -> str:
    material = list(bits)
    if len(material) % 8 != 0:
        raise ValueError("bit length must be a multiple of 8")
    output = bytearray()
    for offset in range(0, len(material), 8):
        byte = 0
        for bit in material[offset : offset + 8]:
            byte = (byte << 1) | int(bit)
        output.append(byte)
    return output.hex()
