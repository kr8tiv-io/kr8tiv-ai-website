#!/usr/bin/env bash
# Post-deploy IndexNow ping for kr8tiv.ai (Bing, Yandex, Seznam, Naver; Google ignores IndexNow).
# Run ONLY after the pages are live and the key file answers 200:
#   curl -s https://kr8tiv.ai/c76645233ae73c7d1d025a8caa968209.txt   -> must print the key
# Usage: scripts/indexnow-ping.sh [url ...]   (defaults to the blog URLs)
set -euo pipefail
KEY=c76645233ae73c7d1d025a8caa968209
URLS=("$@")
if [ ${#URLS[@]} -eq 0 ]; then
  URLS=(https://kr8tiv.ai/blog/ https://kr8tiv.ai/blog/what-ai-can-and-cant-do-for-your-business/ https://kr8tiv.ai/)
fi
[ "$(curl -s https://kr8tiv.ai/$KEY.txt)" = "$KEY" ] || { echo "key file not live yet, stopping"; exit 1; }
LIST=$(printf '"%s",' "${URLS[@]}"); LIST="[${LIST%,}]"
curl -s -o /dev/null -w "IndexNow HTTP %{http_code}\n" -X POST https://api.indexnow.org/indexnow \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d "{\"host\":\"kr8tiv.ai\",\"key\":\"$KEY\",\"keyLocation\":\"https://kr8tiv.ai/$KEY.txt\",\"urlList\":$LIST}"
