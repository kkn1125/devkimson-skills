#!/bin/bash
# Lobster soul gacha machine - thin shell wrapper.
# The implementation is in gacha.py (Python's secrets module supplies randomness).
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "${SCRIPT_DIR}/gacha.py" "$@"
