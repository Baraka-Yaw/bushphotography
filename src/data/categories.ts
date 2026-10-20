/**
 * Homepage "Browse by category" tiles.
 *
 * No cover images here: `getCategories()` in `src/lib/content.ts` borrows the
 * cover of the newest project matching each tile's tag, so the image a visitor
 * clicks is one of the things they land on, and swapping a project's real cover
 * in updates its tile too. (Resolved there rather than here because
 * `npm run check:media` imports this file under plain Node, which cannot
 * follow the `@/` alias or an extensionless relative import.)
 *
 * Each tile carries a tag rather than a URL. `buildWorkHref` turns that into the
 * /work link, so the tiles and the filter bar can never disagree.
 */

import type { Tag } from "@/types/content";

export type CategoryTileSource = { name: string; slug: string; tag: Tag };

export const categoryTiles: CategoryTileSource[] = [
  { name: "Weddings", slug: "weddings", tag: "Wedding" },
  { name: "Traditional", slug: "traditional", tag: "Traditional" },
  { name: "Graduation", slug: "graduation", tag: "Graduation" },
  { name: "Portraits", slug: "portraits", tag: "Portrait" },
  { name: "Corporate", slug: "corporate", tag: "Corporate" },
  { name: "Parties", slug: "parties", tag: "Party" },
  { name: "Concerts", slug: "concerts", tag: "Concert" },
];
