from __future__ import annotations

import base64
import binascii


def decode_message(message: str, encoding: str) -> bytes:
    if encoding == "utf8":
        return message.encode("utf-8")
    if encoding == "hex":
        normalized = message.lower().removeprefix("0x")
        try:
            return bytes.fromhex(normalized)
        except ValueError as exc:
            raise ValueError("message is not valid hex") from exc
    if encoding == "base64":
        try:
            return base64.b64decode(message, validate=True)
        except binascii.Error as exc:
            raise ValueError("message is not valid base64") from exc
    raise ValueError(f"unsupported encoding: {encoding}")

