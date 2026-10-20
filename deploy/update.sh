#!/usr/bin/env bash
#
# Redeploy the current main branch. Run as the `obiyo` user on the VPS:
#
#   sudo -u obiyo /var/www/obiyo/deploy/update.sh
#
# Builds into a fresh .next before restarting, so a failed build leaves the
# running site untouched rather than taking it down.

set -euo pipefail

APP_DIR="/var/www/obiyo"
cd "$APP_DIR"

echo "==> Pulling"
git pull --ff-only

echo "==> Installing dependencies"
# Not --omit=dev: the build needs typescript, tailwind and eslint-config-next.
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
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then
    echo "✓ Deployed and responding."
    exit 0
  fi
  sleep 1
done

echo "✗ App did not respond within 30s. Check: journalctl -u obiyo -n 50" >&2
exit 1
