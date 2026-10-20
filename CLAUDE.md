# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Portfolio + booking site for **Bush Photography** (Kofi Bush, @bushphotography_official) —
weddings, traditional marriages, graduations, portraits, corporate events and parties in
Ghana. Forked from the Obiyo Shots site (obiyoshots.com) and rebranded; the architecture
is unchanged.

**Differences from Obiyo:** genre tags are the client's services (`Tag` in
`src/types/content.ts`); a `/packages` page renders `src/data/packages.ts`, each card
booking over WhatsApp (`buildPackageWhatsAppUrl` in `src/lib/contact.ts`); category tiles
borrow their cover from the newest matching project in `getCategories()`; the header
falls back to a text wordmark when `settings.logo` is unset; the /work discipline toggle
hides itself while only one discipline has projects.

**Launch blockers** — all marked `TODO` in `src/data/`: real email, phone, WhatsApp
number, city and bio in `settings.ts`; confirmed package prices/inclusions in
`packages.ts`; real photographs replacing every `placeholder-` file; a logo; and the
deploy files (below), which still describe Obiyo's server. Next.js 16 (App Router) · React 19 · Tailwind CSS
v4 · TypeScript. All routes prerender — keep it that way.

It still needs a Node process, not a static export: the contact form is a Server Action.

## Commands

```bash
npm run dev              # dev server, http://localhost:3000
npm run build            # production build (all routes must still prerender)
npm start                # serve the production build
npm run lint             # ESLint
npm run check:media      # verify every media ref resolves AND dimensions match
npm run placeholders     # regenerate stand-in media in public/placeholder/
```

There is no test suite. `npm run check:media` is the closest thing — run it after any
change to `src/data/` or to files in `public/`.

## The two seams

Most of this is ordinary page code. Two modules exist so decisions the spec left open
stay cheap to make later. Respect them.

**`src/lib/content.ts` — where content comes from.** Pages and components never import
from `src/data/`; they call `getAllProjects()`, `getProjectBySlug()`,
`getFeaturedProjects()`, `getProjectSummaries()`, `getRelatedProjects()` and friends.
Every one is `async` even though local module reads are synchronous — that is deliberate,
so moving to a CMS is a rewrite of those function bodies and nothing else. Do not add a
direct `@/data/...` import to a page or component.

**`src/lib/media.ts` — where media is served from.** Every image/video URL passes through
`resolveImage()` / `resolveVideo()` / `resolveEmbed()`, which currently return the
`/public` path unchanged. Cloudinary support means building transform URLs inside those
functions; call sites do not change.

## Content model

Types live in [src/types/content.ts](src/types/content.ts) and are the contract between
content source and UI.

- Media is never a bare string — it's a tagged `ImageRef` / `VideoRef` / `EmbedRef`.
- `ImageRef.alt` is **required**, so the spec's "alt text on all images" rule is enforced
  by the compiler rather than by review.
- Intrinsic `width`/`height` are required so `next/image` always reserves layout space.
- `Category` and `Tag` are unions, not `string`, so a typo fails the build.

Adding a project: append to [src/data/projects.ts](src/data/projects.ts), then
`npm run check:media`. The work grid, filters, sitemap, related-projects and per-project
OG image all derive from it. `featured: true` surfaces it in the homepage highlights grid.

## Conventions that are load-bearing

**`/work` is static; filtering runs on the client.** Reading `searchParams` on the server
would opt the route into per-request rendering. `WorkBrowser` is a client component that
filters `ProjectSummary[]` already in the browser, with filter state in the URL — so
category tiles are plain links and filtered views are shareable. `useSearchParams` needs
the `<Suspense>` boundary in [src/app/work/page.tsx](src/app/work/page.tsx); removing it
forces dynamic rendering at build time.

**`ProjectSummary`, not `Project`, crosses to the client.** It narrows away galleries,
credits and descriptions — the bulk of the payload.

**URL construction goes through `buildWorkHref()` / `parseWorkFilter()`** in
[src/lib/utils.ts](src/lib/utils.ts), so the tiles and the filter bar can't disagree.
`parseWorkFilter` deliberately ignores unrecognised values rather than rendering an empty
grid.

**Dates format with explicit locale + UTC** (`formatDate`) — otherwise server and client
disagree and React reports a hydration mismatch.

**Lightbox and mobile nav are native `<dialog>`.** Focus trapping, Esc, background
inertness and focus restoration come from the platform. Don't reimplement them.

**Hover previews respect the user and the network.** Disabled under
`prefers-reduced-motion` and on devices without a fine pointer; triggered by keyboard focus
as well as hover; clips fetch on first hover intent, never on page load.

**Always pass a `sizes` from `IMAGE_SIZES`** in `src/lib/media.ts` when using `next/image`.
Without it Next assumes `100vw` and ships desktop-width images to phones — the single
highest-leverage factor for the spec's ~2s mobile target.

**Design tokens live in one place.** [src/app/globals.css](src/app/globals.css) — components
reference `bg-bg`, `text-muted`, `border-line`, `text-accent` and never a literal colour,
which is why light mode needed no per-component `dark:` variants. Fonts are the two
`next/font` calls at the top of [src/app/layout.tsx](src/app/layout.tsx). The accent is the
spec's placeholder and has **two** values — `#c9a96a` for dark, `#8a6a2b` for light, because
the gold is ~1.9:1 on near-white and fails AA. Replacing it with the client's real brand
colour means setting both.

**Theming: dark is the default, and `prefers-color-scheme` is deliberately absent.** The
site is dark by design, so an unset visitor — and a visitor with JS disabled — gets dark
whatever their OS says. The OS only gets a vote once someone picks *System* in the switcher.
Don't "fix" this by adding a `prefers-color-scheme` media query; that silently reverts the
default. Two attributes live on `<html>`, and the split matters:

- `data-theme-choice` — what the user picked (`light` / `dark` / `system`); the switcher's
  active highlight keys off this
- `data-theme` — what that currently resolves to (`light` / `dark`); the palette keys off this

so *System* stays visibly selected while the palette follows the OS underneath it.
[src/lib/theme.ts](src/lib/theme.ts) owns both, plus the inline script that sets them.

**The theme script must stay inline and synchronous in `<head>`.** Every route is
prerendered, so the server cannot know the preference; the script runs during HTML parsing,
before first paint. `useEffect` lands after paint and flashes, and reading a cookie would
opt the whole site into per-request rendering. `<html>` needs `suppressHydrationWarning`
because the script mutates it before React hydrates.

**The switcher shows one icon, and which one is CSS, not React state.** It is a single
button that cycles light → dark → system. All three icons are in the DOM; `.theme-icon`
rules match `html[data-theme-choice]` and reveal exactly one, so the right icon is on
screen in the first frame with no flash. [ThemeToggle](src/components/layout/ThemeToggle.tsx)
reads that attribute back via `useSyncExternalStore` (a `MutationObserver` on `<html>`)
purely to keep the button's `aria-label` truthful — so CSS and React cannot disagree, and
there is no `setState` in an effect for ESLint to reject.

**Content over photography needs `.on-media`.** Hero, ProjectTile and CategoryTiles draw
`text-fg`/`text-muted`/`.eyebrow` on top of a `.scrim` over a photo, and scrims stay dark in
both themes. `.on-media` re-maps the tokens to the dark palette for that subtree, so the
children keep using plain `text-fg` and inherit the right values. **Any new element placed
over a scrim needs it** — without it the text goes near-black on near-black in light mode.
Pair every `.scrim` / `.scrim-tile` with an `.on-media` wrapper on the content above it.

**`"use server"` modules may only export async functions.** The contact schema, project
types and state type therefore live in [src/lib/contact.ts](src/lib/contact.ts), not in
`src/app/actions/contact.ts` — a non-function export from there arrives on the client as a
server-reference proxy.

## Placeholder media

**Everything in `public/placeholder/` is a stand-in**, and every project in
`src/data/projects.ts` is invented. Find what still needs replacing with
`git grep placeholder-`.

When swapping in a real file: update `src`, set the **true** `width`/`height`, and rewrite
`alt` to describe the actual photograph (current strings describe the intended shot). Then
`npm run check:media` — it verifies the file exists *and* that declared dimensions match
the file on disk, because a mismatch is a guaranteed layout shift and a distorted image.

## Deferred decisions and where they land

| Decision | Where to implement |
| --- | --- |
| CMS | function bodies in `src/lib/content.ts` |
| Cloudinary / media CDN | `resolveImage` / `resolveVideo` in `src/lib/media.ts` |
| Video hosting, embeds | `src/components/media/ProjectVideo.tsx` (already handles self-hosted + Vimeo/YouTube behind a click-to-load facade) |
| Hover-preview clips | supply `Project.preview`; no code change |
| Email delivery (optional second copy) | `sendContactEmail()` in `src/lib/mail.ts` (Resend sketch in the comment) |
| WhatsApp destination number | `settings.whatsapp` in `src/data/settings.ts` |

**The contact form delivers over WhatsApp, not email.** `submitContact` validates, then
builds a `wa.me` deep link with the enquiry pre-composed (`buildWhatsAppUrl` in
[src/lib/contact.ts](src/lib/contact.ts), number from `settings.whatsapp`). The success
panel renders that link as a button the visitor clicks — building the URL transmits
nothing, so the copy says **"Ready to send"**, never "sent". An automatic redirect would be
both hostile and popup-blocked, since it is not tied to a user gesture.

Email is attempted alongside it as a best-effort second copy and **no longer gates the
submit** — an undelivered email while WhatsApp is available is not a lost enquiry. The
honest-failure path still exists for when *neither* is configured: with no `settings.whatsapp`
and no mail provider, the form says it isn't connected rather than claiming success.
Preserve that.

## Environment

`NEXT_PUBLIC_SITE_URL` must be set to the production origin **before the first build** —
canonical URLs, OG image URLs and `sitemap.xml` all derive from it via `siteUrl()`, and it
is inlined into the client bundle at build time. Changing it later needs a rebuild, not a
restart; get it wrong and the site works fine while every canonical tag and social preview
points at localhost.

`RESEND_API_KEY` + `CONTACT_TO_EMAIL` gate email delivery. Leave them **empty** until
`sendContactEmail()` is actually implemented — it throws if credentials are present but the
provider call is still a stub. See `.env.example`.

## Deployment

> ⚠️ Everything under `deploy/` was copied verbatim from Obiyo and still names
> `obiyoshots.com`, its paths, user and port. Re-point it at Bush's host before using
> any of it — nothing here has been deployed yet.

Production is **CyberPanel / OpenLiteSpeed behind Cloudflare**, which reverse-proxies every
request to `next start` on `127.0.0.1:4300`. `deploy/README.md` is the runbook;
`deploy/update-cyberpanel.sh` is the redeploy. `deploy/nginx-vps.md` documents a plain
nginx VPS instead — an alternative target that is not currently in use, so don't follow it
by accident.

Three facts about this box that will waste an afternoon otherwise:

- **Port 3000 is taken** by an unrelated `nghttpx`. The app uses 4300.
- **System Node is 12.22**, below the ≥20.9 Next 16 requires. The real interpreter is
  `/home/obiyoshots.com/.nvm/versions/node/v26.6.0/bin/node`, and it must be referenced by
  absolute path anywhere systemd or cron is involved.
- **The docroot is the git working tree.** With the stock PHP vhost, `/.git/config` and
  `/src/...` were publicly readable. Proxying `context /` to Node is what fixes it, since
  requests then never reach the filesystem — so never "fix" a routing problem by pointing
  LiteSpeed back at the directory. Don't leave archives or backups in there.

Two things easy to reintroduce from the code side:

- **`npm ci` must keep optional dependencies.** `sharp` arrives only as an optional dep of
  `next`, and both `next/image` optimization and `npm run check:media` need it.
- **Watch the build output for `/work`.** `○` static is correct; `ƒ` dynamic means
  something started reading `searchParams` or another request-time API on the server.

A Server Actions CSRF error in production means `Host` or the forwarded scheme is being
rewritten in transit — Next compares `Origin` against the host.
