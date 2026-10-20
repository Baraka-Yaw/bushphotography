#!/usr/bin/env bash
#
# Zero-downtime restart of the running `next start` process.
#
#   /home/obiyoshots.com/public_html/deploy/restart.sh
#
# The app is currently run by hand (no systemd unit installed), one `next start`
# on 127.0.0.1:4300. A plain kill+start leaves a gap where the port is unbound
# and LiteSpeed returns 502. Instead we bind the replacement with SO_REUSEPORT
# (via deploy/reuseport-preload.js), wait for it to listen, then kill the old
# process — the kernel keeps the port bound the whole time.
#
# Run this after a successful `npm run build`.

set -euo pipefail

APP_DIR="/home/obiyoshots.com/public_html"
# Absolute path on purpose — system node is 12.22, below the >=20.9 Next 16
# needs, and a bare `node` under cron/non-login shells resolves to that one.
NODE_BIN="/home/obiyoshots.com/.nvm/versions/node/v26.6.0/bin"
PORT=4300
LOG="/tmp/obiyo-next.log"
PRELOAD="$APP_DIR/deploy/reuseport-preload.js"

export PATH="$NODE_BIN:$PATH"
cd "$APP_DIR"

OLD_PID=$(fuser "$PORT/tcp" 2>/dev/null | awk -F: '{print $NF}' | awk '{print $1}')
echo "==> Starting replacement instance (SO_REUSEPORT)"
NODE_OPTIONS="--require $PRELOAD" nohup node node_modules/next/dist/bin/next start -H 127.0.0.1 -p "$PORT" >> "$LOG" 2>&1 &
NEW_PID=$!

echo "==> Waiting for new instance (pid $NEW_PID) to listen"
LISTENING=""
for _ in $(seq 1 60); do
  if ss -tlnp 2>/dev/null | grep -q "pid=$NEW_PID"; then
    LISTENING=1
    break
  fi
  sleep 0.5
done

if [ -z "$LISTENING" ]; then
  echo "✗ New instance never bound the port. Check: tail $LOG" >&2
  kill "$NEW_PID" 2>/dev/null || true
  exit 1
fi

# Small grace so route setup finishes before we pull the old instance.
sleep 1

if [ -n "$OLD_PID" ]; then
  echo "==> Stopping old instance (pid $OLD_PID)"
  kill "$OLD_PID" 2>/dev/null || true
  for _ in $(seq 1 20); do
    kill -0 "$OLD_PID" 2>/dev/null || break
    sleep 0.5
  done
fi

echo "==> Health check"
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/"; then
    echo "✓ Serving on 127.0.0.1:$PORT (new pid $NEW_PID)."
    exit 0
  fi
  sleep 1
done

echo "✗ App not responding. Check: tail $LOG" >&2
exit 1
