# Deploying to a plain nginx VPS

> **This is not the current production setup.** obiyoshots.com runs on
> CyberPanel/OpenLiteSpeed — see [README.md](README.md). Keep this runbook for a
> future move to a plain VPS; the paths below (`/var/www/obiyo`) do not exist on
> the current server.
>
> Files used by this runbook: `nginx.conf`, `obiyo.service`, `update.sh`.

Node.js server (`next start`) behind nginx, managed by systemd. TLS is terminated
upstream, so nginx listens on `:80` and asserts the forwarded scheme.

This app **cannot** be deployed as a static export — the contact form is a Server
Action and needs a running Node process.

Assumes Ubuntu/Debian. Adjust paths for other distros.

---

## 1. Server prep

Next 16 requires Node **≥ 20.9**; use 22 LTS.

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git

sudo useradd --system --create-home --home-dir /var/www/obiyo --shell /bin/bash obiyo
sudo mkdir -p /var/www/obiyo
sudo chown obiyo:obiyo /var/www/obiyo
```

**If the VPS has ≤ 1 GB RAM, add swap before building** — `next build` on a box
this size is the step that OOMs, and it dies without a clear message:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 2. Get the code

```bash
sudo -u obiyo git clone <your-repo-url> /var/www/obiyo
cd /var/www/obiyo
sudo -u obiyo npm ci
```

`npm ci` must install optional dependencies — `sharp` reaches this project only
as an optional dependency of `next`, and both `next/image` optimization and
`npm run check:media` need it. Do not pass `--omit=optional`.

## 3. Environment

```bash
sudo -u obiyo tee /var/www/obiyo/.env.production >/dev/null <<'EOF'
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
RESEND_API_KEY=""
CONTACT_TO_EMAIL=""
EOF
sudo chmod 600 /var/www/obiyo/.env.production
```

Two things about this file that will bite otherwise:

**`NEXT_PUBLIC_SITE_URL` is baked in at build time.** It is inlined into the
client bundle by `next build`, and `siteUrl()` derives `metadataBase`, every
canonical URL, the OG image URLs and `sitemap.xml` from it. Set it *before* the
first build; changing it later needs a rebuild, not a restart. Get it wrong and
the site works fine while every canonical tag and social preview points at
localhost.

**Leave the two mail variables empty until email is actually implemented.**
`sendContactEmail()` in `src/lib/mail.ts` throws if credentials are present but
the provider call hasn't been written. Empty is the safe state: the form then
tells visitors it isn't connected and shows the direct email and phone, rather
than claiming success for a message that went nowhere.

## 4. Build

```bash
cd /var/www/obiyo
sudo -u obiyo npm run check:media
sudo -u obiyo npm run build
```

Every route in this app prerenders. If the build output shows `/work` as `ƒ`
(dynamic) rather than `○` (static), something started reading `searchParams` or
another request-time API on the server — see the `<Suspense>` note in
`src/app/work/page.tsx`.

## 5. systemd

```bash
sudo cp deploy/obiyo.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now obiyo
sudo systemctl status obiyo
```

The unit binds Next to `127.0.0.1:3000` so the Node server is never reachable
except through nginx.

## 6. nginx

Edit `server_name` in `deploy/nginx.conf` to your domain, then:

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/obiyo
sudo ln -sf /etc/nginx/sites-available/obiyo /etc/nginx/sites-enabled/obiyo
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Since TLS terminates upstream, make sure that layer is set to full/strict
origin-pull if it supports it, and that only the upstream proxy can reach port
80 on this box:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 7. Redeploying

```bash
sudo -u obiyo /var/www/obiyo/deploy/update.sh
```

Give the `obiyo` user permission for just the restart:

```bash
echo 'obiyo ALL=(root) NOPASSWD: /bin/systemctl restart obiyo' \
  | sudo tee /etc/sudoers.d/obiyo-restart
sudo chmod 440 /etc/sudoers.d/obiyo-restart
```

---

## Troubleshooting

**Contact form returns a CSRF / "Invalid Server Actions request" error.** The
`Host` or forwarded scheme is being rewritten in transit. Next compares the
request's `Origin` against the host and rejects a mismatch. Confirm nginx passes
`Host $host` and `X-Forwarded-Proto https` (both are in `deploy/nginx.conf`). If
requests legitimately arrive from a different origin, add it to
`experimental.serverActions.allowedOrigins` in `next.config.ts`.

**Pages arrive all at once instead of streaming.** `proxy_buffering off` is
missing, or something upstream is buffering.

**Images 404 or come back distorted.** Run `npm run check:media` — it verifies
that each file exists *and* that declared `width`/`height` match the file on
disk.

**Logs:** `journalctl -u obiyo -f`, and `/var/log/nginx/obiyo.error.log`.

**Rollback:** `git checkout <last-good-sha> && npm ci && npm run build && sudo
systemctl restart obiyo`.
