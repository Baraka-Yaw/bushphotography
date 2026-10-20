# Bush Photography

A dark, editorial portfolio site for a photographer/videographer, built to the
spec in `Portfolio_Website_Documentation.pdf`.

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript.

Needs a Node process, not a static export — the contact form is a Server Action.
Deployment runbook: [`deploy/README.md`](deploy/README.md).

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build (all routes prerender) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run placeholders` | Regenerate the stand-in media in `public/placeholder/` |
| `npm run check:media` | Verify every media reference resolves and dimensions match |

---

## The two seams

Almost everything here is ordinary page code. Two modules exist specifically so
the decisions the spec left open stay cheap to make later.

**`src/lib/content.ts` — where content comes from.**
Pages never import from `src/data/`. They call `getAllProjects()`,
`getProjectBySlug()`, `getFeaturedProjects()` and friends. Every one is `async`
even though local reads aren't, so moving to a CMS means reimplementing that one
file against the same types. No page or component changes.

**`src/lib/media.ts` — where media is served from.**
Every image and video URL passes through `resolveImage()` / `resolveVideo()`,
which currently return the `/public` path unchanged. Moving to Cloudinary means
building transform URLs inside those two functions. Call sites don't change.

---

## Content model

Types live in `src/types/content.ts` and mirror Section 4 of the spec.

Media is never a bare string. It's a tagged `ImageRef` / `VideoRef` / `EmbedRef`,
and `ImageRef.alt` is **required** — the spec's "alt text on all images"
requirement is enforced by the compiler rather than by code review. Intrinsic
`width`/`height` are required too, so `next/image` always reserves layout space.

### Adding a project

Add an entry to `src/data/projects.ts`, then `npm run check:media`. The work grid,
filters, sitemap, related-projects and per-project OG image all pick it up
automatically — nothing is hand-maintained.

Set `featured: true` to surface it in the homepage highlights grid.

---

## Replacing the placeholder media

**Everything in `public/placeholder/` is a stand-in.** Find what still needs
replacing with:

```bash
git grep placeholder-
```

For each one: drop the real file in, update `src`, set the **true** `width` and
`height`, and rewrite `alt` to describe the actual photograph (the current strings
describe the intended shot, not a real one). Then:

```bash
npm run check:media
```

That verifies the file exists *and* that the declared dimensions match the file on
disk — a mismatch is a guaranteed layout shift and a distorted image, which is the
exact mistake made when swapping a placeholder and forgetting to update the numbers.

---

## Wiring up the deferred decisions

### Video hosting

`src/components/media/ProjectVideo.tsx` is the only place video is played, and it
already renders both self-hosted files and Vimeo/YouTube embeds (behind a
click-to-load facade, so a third-party player never loads unless someone presses
play).

To use Cloudinary, put the transform logic in `resolveVideo()` in `src/lib/media.ts`.

**Hover previews:** `Project.preview` is an optional short muted clip. None of the
seed projects have one, because no footage exists yet — `<HoverPreview>` currently
falls back to a slow scale on the still. Supplying a `preview` turns on real
video-on-hover with no code change. Clips are fetched on first hover intent only,
never on page load.

### A CMS

Reimplement the function bodies in `src/lib/content.ts`. That's the whole job.

### Email delivery

`src/lib/mail.ts` has a `sendContactEmail()` with a commented Resend
implementation. Until a provider is configured the contact form **reports honestly
that it isn't connected** rather than showing a false success — an unconfigured
form that says "message sent" silently loses real enquiries.

Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL`, then fill in the function body.

### Brand colour and fonts

The accent `#C9A96A` is the spec's placeholder. It lives in one line of
`src/app/globals.css`. Fonts are two calls at the top of `src/app/layout.tsx`.

---

## Notable implementation decisions

**`/work` is static; filtering runs on the client.** Reading `searchParams` on the
server would opt the route into per-request rendering. With a dataset this small,
filtering against data already in the browser is instant, and the page still
prerenders. Filter state lives in the URL, so homepage category tiles are plain
links, filtered views are shareable, and the back button works.

**The lightbox and mobile nav are native `<dialog>`.** Focus trapping, Esc to
close, background inertness and — the part usually missed — returning focus to the
element that opened it all come from the platform.

**Hover previews respect the user and the network.** Disabled under
`prefers-reduced-motion`, disabled on devices without a fine pointer (the spec
notes most traffic is mobile), and triggered by keyboard focus as well as hover.

---

## Before deploying

Set `NEXT_PUBLIC_SITE_URL` to the production origin. Canonical URLs, OG image URLs
and `sitemap.xml` are all derived from it and will otherwise point at localhost.
See `.env.example`.
