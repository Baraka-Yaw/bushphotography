/**
 * Generates stand-in media for `public/placeholder/`.
 *
 * These are real JPEGs at realistic dimensions, not SVGs. Two reasons:
 *  1. `next/image` refuses to optimize SVG unless you enable `dangerouslyAllowSVG`,
 *     which is a security relaxation not worth taking on a client site.
 *  2. Vector placeholders are a few KB and would make Lighthouse look great right
 *     up until real photography lands. Raster stand-ins at true dimensions keep the
 *     performance picture honest.
 *
 * Every file is prefixed `placeholder-`, so finding what still needs replacing is
 * one `git grep placeholder-`.
 *
 * Run with: npm run placeholders
 */

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "placeholder");

/** Deterministic — reruns must produce identical files, so no Math.random(). */
function hueFor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c],
  );
}

/**
 * Builds the placeholder artwork as SVG, which sharp then rasterizes to JPEG/PNG.
 * Geometry carries the design so the tile is still distinguishable even if the
 * text fails to render on a machine without the named fonts.
 */
function artwork({ width, height, label, caption, hue }) {
  const short = Math.min(width, height);
  const titleSize = Math.round(short * 0.055);
  const metaSize = Math.round(short * 0.026);
  const cx = width / 2;
  const cy = height / 2;
  const ring = short * 0.18;

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 14% 13%)"/>
      <stop offset="55%" stop-color="hsl(${hue} 10% 8%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 40) % 360} 16% 15%)"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.05)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
    </radialGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <rect width="${width}" height="${height}" fill="url(#v)"/>

  <circle cx="${cx}" cy="${cy}" r="${ring}" fill="none"
          stroke="rgba(201,169,106,0.22)" stroke-width="${short * 0.004}"/>
  <circle cx="${cx}" cy="${cy}" r="${ring * 0.62}" fill="none"
          stroke="rgba(245,245,245,0.10)" stroke-width="${short * 0.003}"/>
  <line x1="${cx - ring * 1.5}" y1="${cy}" x2="${cx - ring * 1.15}" y2="${cy}"
        stroke="rgba(245,245,245,0.18)" stroke-width="${short * 0.003}"/>
  <line x1="${cx + ring * 1.15}" y1="${cy}" x2="${cx + ring * 1.5}" y2="${cy}"
        stroke="rgba(245,245,245,0.18)" stroke-width="${short * 0.003}"/>

  <rect x="${short * 0.035}" y="${short * 0.035}"
        width="${width - short * 0.07}" height="${height - short * 0.07}"
        fill="none" stroke="rgba(245,245,245,0.08)" stroke-width="${short * 0.0035}"/>

  <text x="${cx}" y="${cy + ring * 1.9}" text-anchor="middle"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${titleSize}" fill="rgba(245,245,245,0.88)" letter-spacing="${titleSize * 0.02}">
    ${escapeXml(label)}
  </text>

  <text x="${cx}" y="${cy + ring * 1.9 + metaSize * 2}" text-anchor="middle"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${metaSize}" fill="rgba(201,169,106,0.75)" letter-spacing="${metaSize * 0.22}">
    ${escapeXml(caption.toUpperCase())}
  </text>

  <text x="${short * 0.075}" y="${height - short * 0.075}"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${metaSize * 0.85}" fill="rgba(140,140,140,0.6)" letter-spacing="${metaSize * 0.12}">
    ${width} × ${height}
  </text>
</svg>`);
}

async function writeImage({ file, width, height, label, caption, seed, png = false }) {
  const svg = artwork({ width, height, label, caption, hue: hueFor(seed) });
  // Density must stay at the nominal 72 DPI: anything higher scales the raster
  // above the SVG's declared px size, and the file would no longer match the
  // width/height declared alongside it in `src/data/`.
  const pipeline = sharp(svg, { density: 72 });
  const out = png
    ? pipeline.png({ compressionLevel: 9 })
    : // Quality 72 keeps files in the same ballpark as a web-exported photo, so
      // the performance profile during review resembles the real thing.
      pipeline.jpeg({ quality: 72, progressive: true, mozjpeg: true });
  await out.toFile(path.join(OUT_DIR, file));
  return file;
}

/** Aspect presets, in the shapes a real portfolio actually uses. */
const SHAPE = {
  hero: { width: 2400, height: 1350 },
  landscape: { width: 1600, height: 1067 },
  portrait: { width: 1200, height: 1500 },
  galleryLandscape: { width: 1800, height: 1200 },
  galleryPortrait: { width: 1200, height: 1600 },
  square: { width: 1400, height: 1400 },
  og: { width: 1200, height: 630 },
};

/**
 * Must stay in step with `src/data/*.ts`. `npm run check:media` verifies that
 * every media path referenced in the data files actually exists here.
 */
const PROJECTS = [
  { slug: "ama-and-kwame-wedding", title: "Ama & Kwame", shape: "portrait", gallery: 6 },
  { slug: "adwoa-traditional-marriage", title: "Adwoa's Knocking", shape: "landscape", gallery: 6 },
  { slug: "class-of-2026", title: "Class of 2026", shape: "portrait", gallery: 5 },
  { slug: "studio-portraits", title: "Studio Portraits", shape: "portrait", gallery: 5 },
  { slug: "annual-awards-night", title: "Annual Awards Night", shape: "landscape", gallery: 5 },
  { slug: "thirtieth-birthday", title: "Thirtieth", shape: "landscape", gallery: 5 },
];

async function main() {
  /*
    DESTRUCTIVE: this deletes `public/placeholder/` in full before regenerating
    it. Anything in there that this script does not itself produce is gone —
    which is why real client assets (the logo, the hero reel and its poster) live
    in `public/brand/`, and real project media in `public/work/`. Never park a
    delivered file in the placeholder directory.
  */
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const written = [];

  // Homepage hero.
  written.push(
    await writeImage({
      file: "placeholder-hero.jpg",
      ...SHAPE.hero,
      label: "Hero Media",
      caption: "placeholder",
      seed: "hero",
    }),
  );

  // Default Open Graph share image.
  written.push(
    await writeImage({
      file: "placeholder-og.jpg",
      ...SHAPE.og,
      label: "Share Image",
      caption: "placeholder",
      seed: "og",
    }),
  );

  // About page.
  written.push(
    await writeImage({
      file: "placeholder-about-portrait.jpg",
      ...SHAPE.portrait,
      label: "Photographer Portrait",
      caption: "placeholder",
      seed: "about-portrait",
    }),
    await writeImage({
      file: "placeholder-about-bts.jpg",
      ...SHAPE.landscape,
      label: "Behind the Scenes",
      caption: "placeholder",
      seed: "about-bts",
    }),
  );

  // Project covers and galleries.
  for (const project of PROJECTS) {
    written.push(
      await writeImage({
        file: `placeholder-${project.slug}-cover.jpg`,
        ...SHAPE[project.shape],
        label: project.title,
        caption: "cover — placeholder",
        seed: project.slug,
      }),
    );

    for (let i = 1; i <= project.gallery; i += 1) {
      // Alternate orientation so the gallery looks like a real edit, not a grid
      // of identical crops.
      const shape = i % 3 === 0 ? SHAPE.galleryPortrait : SHAPE.galleryLandscape;
      written.push(
        await writeImage({
          file: `placeholder-${project.slug}-${String(i).padStart(2, "0")}.jpg`,
          ...shape,
          label: project.title,
          caption: `frame ${i} — placeholder`,
          seed: `${project.slug}-${i}`,
        }),
      );
    }
  }

  // Category tiles borrow real project covers — nothing generated.

  // No client logos here: those are real assets now and live in
  // `public/clients/`. Nothing under `public/placeholder/` survives this script,
  // which deletes the directory before it regenerates it.

  await writeFile(
    path.join(OUT_DIR, "README.md"),
    [
      "# Placeholder media",
      "",
      "Generated by `npm run placeholders`. Every file here is a stand-in for client",
      "assets that have not been delivered yet.",
      "",
      "To replace: drop the real image in at the same path (or update the `src` in",
      "`src/data/projects.ts`), set the true `width`/`height`, and write a real `alt`.",
      "Then run `npm run check:media` to confirm nothing is dangling.",
      "",
      `${written.length} files generated.`,
      "",
    ].join("\n"),
  );

  console.log(`Generated ${written.length} placeholder files in public/placeholder/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
