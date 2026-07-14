#!/usr/bin/env bash
# Launch all OpenMarble services. All caches/models stay on /media/Storage
# (see .env.storage). Logs go to ./logs/.
#
# Services:
#   SHARP Gradio app   :7860  (engine #1 — fast 3D photo)
#   WorldGen service   :7861  (engine #2 — 360° explorable world)
#   FastAPI backend    :8000  (proxy + file serving)
#   Next.js frontend   :3080  (MarbleOS UI; serves SuperSplat at /supersplat/)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$ROOT/.env.storage"
mkdir -p "$ROOT/logs"

echo "Starting SHARP Gradio app on :7860 ..."
(cd "$ROOT/Apple-Sharp-Image-to-3D-View-Synthesis" && uv run python app.py) \
  >"$ROOT/logs/sharp.log" 2>&1 &
SHARP_PID=$!

echo "Starting WorldGen service on :7861 ..."
(cd /media/Storage/WorldGen && .venv/bin/uvicorn serve:app --host 0.0.0.0 --port 7861) \
  >"$ROOT/logs/worldgen.log" 2>&1 &
WORLDGEN_PID=$!

echo "Starting FastAPI backend on :8000 ..."
(cd "$ROOT/backend" && .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000) \
  >"$ROOT/logs/backend.log" 2>&1 &
BACKEND_PID=$!

echo "Starting Next.js frontend on :3080 ..."
(cd "$ROOT/frontend" && npm run dev) \
  >"$ROOT/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!

trap 'echo "Stopping..."; kill $SHARP_PID $WORLDGEN_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null || true' INT TERM

echo ""
echo "PIDs: sharp=$SHARP_PID worldgen=$WORLDGEN_PID backend=$BACKEND_PID frontend=$FRONTEND_PID"
echo "Open http://localhost:3080/openmarble once the SHARP app finishes loading."
echo "Logs: tail -f logs/{sharp,worldgen,backend,frontend}.log"
wait
