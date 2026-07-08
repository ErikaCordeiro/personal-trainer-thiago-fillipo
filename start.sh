#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -d "$SCRIPT_DIR/backend" ]; then
  cd "$SCRIPT_DIR/backend"
else
  cd "$SCRIPT_DIR"
fi

python -m app.db.seed
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
