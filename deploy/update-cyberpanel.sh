#!/usr/bin/env bash
#
# Redeploy the current main branch on the CyberPanel/LiteSpeed box:
#
#   /home/obiyoshots.com/public_html/deploy/update-cyberpanel.sh
#
# Builds into a fresh .next before restarting, so a failed build leaves the
# running site untouched rather than taking it down.
#
# For the plain nginx VPS target, use update.sh instead.

set -euo pipefail

APP_DIR="/home/obiyoshots.com/public_html"

# Absolute path on purpose. System node is 12.22, below the >=20.9 Next 16
# needs; a bare `node` resolves to that one under cron or a non-login shell.
# Update this when the nvm version changes.
NODE_BIN="/home/obiyoshots.com/.nvm/versions/node/v26.6.0/bin"

export PATH="$NODE_BIN:$PATH"
cd "$APP_DIR"

echo "==> Node $(node -v)"

echo "==> Pulling"
git pull --ff-only

echo "==> Installing dependencies"
# Not --omit=dev: the build needs typescript, tailwind and eslint-config-next.
# Not --omit=optional either: sharp arrives only as an optional dep of next.
npm ci

echo "==> Verifying media references"
# Catches a missing file or a width/height that no longer matches the image on
# disk, which would otherwise ship as a layout shift and a distorted photo.
npm run check:media

echo "==> Building"
# NEXT_PUBLIC_SITE_URL is read from .env.production here and INLINED into the
# client bundle. Changing it later requires a rebuild, not just a restart.
npm run build

echo "==> Restarting"
sudo systemctl restart obiyo

echo "==> Waiting for health"
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null http://127.0.0.1:4300/; then
    echo "✓ Deployed and responding on 127.0.0.1:4300."
    exit 0
  fi
  sleep 1
done

echo "✗ App did not respond within 30s. Check: journalctl -u obiyo -n 50" >&2
exit 1
