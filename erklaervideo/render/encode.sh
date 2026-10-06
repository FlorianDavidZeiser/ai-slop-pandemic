#!/usr/bin/env bash
# Setzt out/frames zu out/erklaervideo.mp4 zusammen. Reproduzierbar: feste Parameter, keine Zeitstempel.
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -y -loglevel error -framerate 30 -i out/frames/%05d.png \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -threads 1 \
  -map_metadata -1 -fflags +bitexact -flags:v +bitexact \
  -movflags +faststart out/erklaervideo.mp4
echo "out/erklaervideo.mp4"
