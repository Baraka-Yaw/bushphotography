/**
 * Validates every media reference in `src/data/`.
 *
 * Rather than grepping the source, this imports the data modules and walks the
 * object graph, so computed paths (the `gallery()` helper in projects.ts) are
 * checked too. Node strips the types natively; the data files import types only,
 * so nothing needs compiling first.
 *
 * For each reference it checks:
 *   - the file exists in `public/`
 *   - the declared width/height match the file on disk
 *
 * That second check is the one that matters after handoff: `next/image` reserves
 * layout space from the declared dimensions, so a mismatch is a guaranteed layout
 * shift and a distorted image — exactly the mistake someone makes when swapping a
 * placeholder for a real photo and forgetting to update the numbers.
 *
 * Run with: npm run check:media
 */

import { access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = path.join(process.cwd(), "public");

const MODULES = [
  "../src/data/projects.ts",
  "../src/data/categories.ts",
  "../src/data/clients.ts",
  "../src/data/packages.ts",
  "../src/data/settings.ts",
];

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Recursively collects every ImageRef/VideoRef in an arbitrary value. */
function collectRefs(value, trail, found) {
  if (value === null || typeof value !== "object") return;

  if (Array.isArray(value)) {
    value.forEach((item, i) => collectRefs(item, `${trail}[${i}]`, found));
    return;
  }

  if ((value.kind === "image" || value.kind === "video") && typeof value.src === "string") {
    found.push({ ref: value, trail });
  }

  for (const [key, child] of Object.entries(value)) {
    collectRefs(child, `${trail}.${key}`, found);
  }
}

/** Must mirror `images.remotePatterns` in next.config.ts. */
const REMOTE_HOSTS = new Set([
  "mir-s3-cdn-cf.behance.net",
  "mir-cdn.behance.net",
  "i.vimeocdn.com",
]);

async function main() {
  const found = [];

  for (const specifier of MODULES) {
    const mod = await import(specifier);
    const name = path.basename(specifier);
    for (const [exportName, exported] of Object.entries(mod)) {
      collectRefs(exported, `${name}:${exportName}`, found);
    }
  }

  const problems = [];
  let placeholders = 0;
  let remote = 0;

  for (const { ref, trail } of found) {
    if (ref.src.includes("placeholder-")) placeholders += 1;

    /*
      Remotely hosted media (Behance CDN). There is no file to stat, and the
      declared dimensions cannot be checked without downloading the image on
      every run — which is the thing hosting it remotely exists to avoid. So
      validate what is cheap and still catches the real mistakes: it must be an
      absolute https URL on a host `next.config.ts` allows, or `next/image`
      refuses it at runtime with an opaque error.
    */
    if (/^https?:\/\//.test(ref.src)) {
      remote += 1;
      let host = null;
      try {
        const url = new URL(ref.src);
        host = url.hostname;
        if (url.protocol !== "https:") {
          problems.push(`${trail}\n    not https: ${ref.src}`);
          continue;
        }
      } catch {
        problems.push(`${trail}\n    unparseable URL: ${ref.src}`);
        continue;
      }
      if (!REMOTE_HOSTS.has(host)) {
        problems.push(
          `${trail}\n    ${ref.src}\n` +
            `    host "${host}" is not in images.remotePatterns in next.config.ts`,
        );
      }
      continue;
    }

    const filePath = path.join(PUBLIC_DIR, ref.src);
    if (!(await exists(filePath))) {
      problems.push(`${trail}\n    missing file: ${ref.src}`);
      continue;
    }

    // Videos carry no intrinsic dimensions we can cheaply read here; existence is
    // all we verify for them.
    if (ref.kind !== "image") continue;

    const meta = await sharp(filePath).metadata();
    if (meta.width !== ref.width || meta.height !== ref.height) {
      problems.push(
        `${trail}\n    ${ref.src}\n` +
          `    declared ${ref.width}×${ref.height} but file is ${meta.width}×${meta.height}`,
      );
    }
  }

  if (problems.length > 0) {
    console.error(`✗ ${problems.length} problem(s) in ${found.length} media references:\n`);
    for (const p of problems) console.error(`  ${p}\n`);
    process.exit(1);
  }

  console.log(`✓ ${found.length} media references resolve with matching dimensions.`);
  if (remote > 0) {
    console.log(
      `  ${remote} are hosted remotely — URL and host checked, dimensions taken on trust.`,
    );
  }
  if (placeholders > 0) {
    console.log(`  ${placeholders} still point at generated placeholders.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
