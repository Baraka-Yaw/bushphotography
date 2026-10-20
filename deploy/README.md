# Deploying

Production is **obiyoshots.com on CyberPanel / OpenLiteSpeed 1.8.4 (Open edition)**,
behind Cloudflare. That is what this document covers.

For a plain nginx VPS instead, see [nginx-vps.md](nginx-vps.md) — a different, currently
unused target.

| File | Used by |
| --- | --- |
| `litespeed-vhost.conf`, `obiyo-cyberpanel.service`, `update-cyberpanel.sh` | this runbook |
| `nginx.conf`, `obiyo.service`, `update.sh` | [nginx-vps.md](nginx-vps.md) |

This app **cannot** be a static export — the contact form is a Server Action and needs a
running Node process. LiteSpeed does not run it; it reverse-proxies to it.

---

## The shape of it

LiteSpeed terminates TLS and proxies **every** request to `next start` on
`127.0.0.1:4300`. Next serves its own static assets under `/_next/static`, so there is no
second static context to keep in sync.

```
Cloudflare ──► LiteSpeed :443 ──► proxy ──► node next start 127.0.0.1:4300
```

**Port 3000 is already occupied on this box** by an unrelated `nghttpx`. Use 4300. If you
ever move the port, it must change in both `litespeed-vhost.conf` (the `extprocessor
nextjs` address) and `obiyo-cyberpanel.service` (the `-p` flag).

## Node

The system Node is **12.22** — far below the ≥20.9 that Next 16 requires. The working
interpreter is nvm's:

```
/home/obiyoshots.com/.nvm/versions/node/v26.6.0/bin/node
```

Always use that absolute path in the service unit and in scripts. Resolving `node` from
`PATH` under systemd finds v12 and the app dies on start. Interactively:

```bash
export PATH=/home/obiyoshots.com/.nvm/versions/node/v26.6.0/bin:$PATH
```

If you upgrade Node via nvm, update `ExecStart` in the unit and the `NODE_BIN` in
`update-cyberpanel.sh` — nothing discovers the version automatically.

## The docroot is the repo

`docRoot` is `/home/obiyoshots.com/public_html`, which is also the git working tree. With
the stock PHP vhost, LiteSpeed served that tree directly: `/.git/config`, `/package.json`
and `/src/...` were all publicly readable, and a `.env.production` placed there would have
been served too.

Proxying `context /` to Node is what fixes this — requests stop reaching the filesystem.
`.htaccess` in the docroot blocks the same paths as defence in depth, but note **OpenLiteSpeed
only reloads `.htaccess` on restart**, so it is not a mechanism to rely on for anything
urgent.

Do not leave archives or backups in this directory. They are web-served until the proxy is
in place, and 344 MB of zip is not something you want discoverable.

---

## First-time setup

### 1. Environment

```bash
tee /home/obiyoshots.com/public_html/.env.production >/dev/null <<'EOF'
NEXT_PUBLIC_SITE_URL="https://obiyoshots.com"
RESEND_API_KEY=""
CONTACT_TO_EMAIL=""
EOF
chmod 600 /home/obiyoshots.com/public_html/.env.production
```

**`NEXT_PUBLIC_SITE_URL` is inlined at build time**, not read at runtime. `siteUrl()`
derives `metadataBase`, every canonical URL, the OG image URLs and `sitemap.xml` from it.
Set it *before* building; changing it later needs a rebuild, not a restart. Get it wrong
and the site works perfectly while every canonical tag and social preview points at
`http://localhost:3000`.

**Leave the two mail variables empty** until email is actually implemented.
`sendContactEmail()` in `src/lib/mail.ts` throws if credentials are present but the
provider call is still a stub. Empty is the safe state: the form then tells visitors it
isn't connected and shows the direct email and phone, rather than claiming success for a
message that went nowhere.

### 2. Build

```bash
export PATH=/home/obiyoshots.com/.nvm/versions/node/v26.6.0/bin:$PATH
cd /home/obiyoshots.com/public_html
npm ci
npm run check:media
npm run build
```

`npm ci` must install optional dependencies — `sharp` reaches this project only as an
optional dependency of `next`, and both `next/image` optimization and `npm run check:media`
need it. Do not pass `--omit=optional`.

Every route prerenders. If the build output shows `/work` as `ƒ` (dynamic) rather than `○`
(static), something started reading `searchParams` or another request-time API on the
server — see the `<Suspense>` note in `src/app/work/page.tsx`.

### 3. systemd (as root)

```bash
cp deploy/obiyo-cyberpanel.service /etc/systemd/system/obiyo.service
systemctl daemon-reload
systemctl enable --now obiyo
systemctl status obiyo
```

`ProtectHome=false` is deliberate and required — the app lives under `/home`, and the
default `ProtectHome=true` would hide its own working directory from it.

### 4. Vhost (as root)

```bash
cp deploy/litespeed-vhost.conf /usr/local/lsws/conf/vhosts/obiyoshots.com/vhost.conf
/usr/local/lsws/bin/lswsctrl restart
```

The PHP `scripthandler` and `extprocessor` from the stock CyberPanel conf are deliberately
absent. Nothing here is PHP, and leaving them means an uploaded `.php` file would execute.

The `/.well-known/acme-challenge` context stays on the filesystem and is declared **before**
`context /`, so certificate renewal keeps working instead of being proxied into the app.

### 5. Verify

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4300/     # Node itself
curl -sI https://obiyoshots.com/ | head -3                          # through the stack
curl -s https://obiyoshots.com/sitemap.xml | head -5                # must NOT say localhost
curl -s -o /dev/null -w '%{http_code}\n' https://obiyoshots.com/.git/config   # want 404
```

---

## Redeploying

```bash
/home/obiyoshots.com/public_html/deploy/update-cyberpanel.sh
```

Pull → `npm ci` → `check:media` → build → restart → health check. It builds before
restarting, so a failed build leaves the running site untouched.

Give the vhost user permission for just the restart:

```bash
echo 'obiyo2159 ALL=(root) NOPASSWD: /bin/systemctl restart obiyo' \
  | sudo tee /etc/sudoers.d/obiyo-restart
sudo chmod 440 /etc/sudoers.d/obiyo-restart
```

---

## Troubleshooting

**Every URL 404s with `x-turbo-charged-by: LiteSpeed`.** The vhost is still the stock PHP
one, serving the docroot as static files with no `index.html` to find. Apply step 4. A 404
carrying that header is from your origin, not Cloudflare.

**502 / connection refused.** Node isn't running or is on the wrong port.
`systemctl status obiyo`, then `curl 127.0.0.1:4300`. If the unit is failing instantly,
the usual cause is `ExecStart` resolving to system Node 12.

**Canonical tags and `sitemap.xml` say `localhost:3000`.** `NEXT_PUBLIC_SITE_URL` was unset
at build time. Fix `.env.production` and **rebuild** — restarting is not enough.

**Contact form returns a CSRF / "Invalid Server Actions request" error.** Next compares the
request's `Origin` against the host and rejects a mismatch. Confirm Cloudflare isn't
rewriting `Host`, and that the forwarded scheme arrives as `https`. If requests legitimately
come from another origin, add it to `experimental.serverActions.allowedOrigins` in
`next.config.ts`.

**Images 404 or come back distorted.** Run `npm run check:media` — it verifies each file
exists *and* that declared `width`/`height` match the image on disk.

**Changes to `.htaccess` do nothing.** OpenLiteSpeed loads it at restart:
`/usr/local/lsws/bin/lswsctrl restart`.

**Logs:** `journalctl -u obiyo -f`, and `/home/obiyoshots.com/logs/obiyoshots.com.error_log`.

**Rollback:** `git checkout <last-good-sha> && npm ci && npm run build && systemctl restart obiyo`.
