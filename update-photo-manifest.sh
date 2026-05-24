#!/usr/bin/env bash
# Regenerate the photography gallery manifest.
# Run this whenever you add or remove photos from images/photographyCollection/.
#
# Usage:   ./update-photo-manifest.sh
set -euo pipefail
cd "$(dirname "$0")/images/photographyCollection"
ls -1 \
  | grep -Ei '\.(jpe?g|png|gif|webp|avif|bmp|heic|heif)$' \
  | python3 -c '
import json, sys
files = sorted((line.strip() for line in sys.stdin if line.strip()), key=str.lower)
print(json.dumps(files, indent=2))
' > manifest.json
echo "Updated manifest.json — $(grep -c '\.' manifest.json) photos."
