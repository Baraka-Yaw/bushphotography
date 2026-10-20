<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# obiyoshots.com — photography portfolio

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript. Dark editorial portfolio; built to `Portfolio_Website_Documentation.pdf`. All routes must stay **prerendered**. It needs a live Node process — the contact form is a Server Action, so it can never be a static export.

Deeper docs: `CLAUDE.md` (architecture + conventions), `deploy/README.md` (production runbook), `README.md` (overview).

## Commands

```bash
npm run dev          # dev server — on this box use `npm run dev -- -p 4300`; plain 3000 is occupied
npm run build        # production build — /work must show ○ (static), not ƒ (dynamic)
npm run lint         # ESLint
npm start            # serve the production build
npm run check:media  # verify every media ref exists AND width/height match disk
npm run placeholders # regenerate stand-in media in public/placeholder/
```

**No test suite exists** — `npm run check:media` is the verification step. Run it after touching `src/data/` or `public/`. Add a project by appending to `src/data/projects.ts`, then run it.

## Two seams — never bypass

- **Content:** pages/components must call the `async` accessors in `src/lib/content.ts` (`getAllProjects()`, `getProjectBySlug()`, `getProjectSummaries()`, …). Never import `src/data/…` directly from a page or component. They're async deliberately so a future CMS is a rewrite of those function bodies only.
- **Media:** every image/video URL passes through `resolveImage()` / `resolveVideo()` / `resolveEmbed()` in `src/lib/media.ts`. Cloudinary = transform URLs inside those functions, nothing else.

## Gotchas

- **Node version:** system Node is 12.22 (too old for Next 16). Always use nvm Node by absolute path: `/home/obiyoshots.com/.nvm/versions/node/v26.6.0/bin/node` — a bare `node` under systemd/cron resolves to v12 and dies. (An interactive shell may resolve `node` to a third install at v20.19.4, which works — the danger zone is anything systemd/cron runs, including `deploy/update-cyberpanel.sh`.)
- **App runs on port 4300**, not 3000 — 3000 is taken by an unrelated `nghttpx`. Never "fix" routing by pointing LiteSpeed back at the directory: the docroot is the git working tree, so a PHP-style serve would expose `/.git/config` and `/src/…`. Don't leave archives in it — a stray ~360 MB `obiyo.zip` currently sits there (gitignored and `.htaccess`-blocked); that's exactly what this rule forbids.
- **`npm ci` must keep optional dependencies** — `sharp` arrives only as an optional dep of `next`, and both image optimization and `check:media` need it.
- **`NEXT_PUBLIC_SITE_URL` is inlined at build time.** Canonical URLs, OG images and `sitemap.xml` derive from it via `siteUrl()`; changing it needs a rebuild, not a restart.
- **The contact form delivers over WhatsApp.** `submitContact` validates then returns a `wa.me` link (`buildWhatsAppUrl`, number from `settings.whatsapp`); the success panel renders it as a button to click. Building the link sends nothing, so the copy says "Ready to send", never "sent". Email is a best-effort second copy and does not gate the submit. With neither WhatsApp nor mail configured the form still reports "not connected" — keep that. Mail vars stay empty until `sendContactEmail()` is implemented: credentials present + stub = it throws.
- **`/work` filtering runs on the client** (`WorkBrowser`) so the route stays static; filter state lives in the URL. Keep the `<Suspense>` boundary in `src/app/work/page.tsx` around `useSearchParams`.
- **`"use server"` modules may only export async functions.** Shared types/schemas live in `src/lib/contact.ts`, not in the action file, or they arrive on the client as server-reference proxies.
- **Placeholder media is fake** — every project and every `public/placeholder/` file is a stand-in. Find what to replace with `git grep placeholder-`. Swapping in real files means updating `src`, the **true** `width`/`height`, and `alt`, then `check:media` (dimension mismatch = layout shift).
- **`next/image` needs `sizes` from `IMAGE_SIZES`** in `src/lib/media.ts`; without it Next assumes `100vw` and ships desktop-width images to mobile.
- **Design tokens** live in `src/app/globals.css`; components use `bg-bg` / `text-muted` / `text-accent`, never literal colours. Fonts are the two `next/font` calls in `src/app/layout.tsx`. The accent has **two** values (`#c9a96a` dark, `#8a6a2b` light — the gold fails AA on white); change both.
- **Theming is light/dark/system, and dark is the default.** `prefers-color-scheme` is deliberately not used — adding it would silently revert the default. `<html>` carries `data-theme-choice` (what was picked) and `data-theme` (what it resolves to); `src/lib/theme.ts` owns both plus the inline `<head>` script that must stay synchronous to avoid a flash on prerendered pages.
- **Anything drawn over a `.scrim` needs `.on-media`** (Hero, ProjectTile, CategoryTiles). Scrims stay dark in both themes, so `.on-media` re-maps the tokens to the dark palette for that subtree; omit it and the text goes near-black on near-black in light mode.
- **Dates render with explicit locale + UTC** (`formatDate` in `src/lib/utils.ts`) — otherwise server/client hydration mismatches.

## Deploy

Production: CyberPanel/OpenLiteSpeed behind Cloudflare, proxying everything to `next start` on `127.0.0.1:4300`. Runbook is `deploy/README.md`; redeploy via `deploy/update-cyberpanel.sh` (pull → ci → check:media → build → restart). Do **not** follow `deploy/nginx-vps.md` / `deploy/nginx.conf` — that's an unused alternative target. Build before restarting; a failed build must leave the running site untouched.
