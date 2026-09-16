#!/bin/bash
set -u
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "[EventLens] Node.js 18+ was not found."
  echo "Easiest option: double-click Open_Demo.html to run the offline Demo."
  read -r -p "Press Enter to exit..."
  exit 1
fi
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "[EventLens] Current Node.js version is $(node -v); version 18+ is required."
  read -r -p "Press Enter to exit..."
  exit 1
fi

APP_PORT=8787
MOCK_SETTING=""
if [ -f .env ]; then
  P="$(awk -F= '/^[[:space:]]*PORT[[:space:]]*=/{v=$2; gsub(/[[:space:]\r"'"'"']/,"",v); print v; exit}' .env)"
  [ -n "$P" ] && APP_PORT="$P"
  MOCK_SETTING="$(awk -F= '/^[[:space:]]*MOCK_MODE[[:space:]]*=/{v=$2; gsub(/[[:space:]\r"'"'"']/,"",v); print tolower(v); exit}' .env)"
  if [[ ! "$APP_PORT" =~ ^[0-9]+$ ]] || [ "$APP_PORT" -lt 1 ] || [ "$APP_PORT" -gt 65535 ]; then
    echo "[EventLens] Invalid PORT in .env: $APP_PORT"; exit 1
  fi
  if [[ "$MOCK_SETTING" != "true" && "$MOCK_SETTING" != "1" && "$MOCK_SETTING" != "yes" ]]; then
    echo "[EventLens] Real LLM mode detected. Running API preflight first; this may incur a small amount of API/Web Search usage..."
    node scripts/check_live.js || { echo "[EventLens] Preflight failed. Fix the .env or permission error shown above."; read -r -p "Press Enter to exit..."; exit 1; }
  else
    echo "[EventLens] Mock mode is enabled in .env. No external API cost will be incurred."
  fi
  ( sleep 1; open "http://localhost:${APP_PORT}" ) &
  node server.js
else
  echo "[EventLens] No .env found. Starting the Mock backend automatically with no API cost."
  ( sleep 1; open "http://localhost:${APP_PORT}" ) &
  MOCK_MODE=true PORT="$APP_PORT" node server.js
fi
