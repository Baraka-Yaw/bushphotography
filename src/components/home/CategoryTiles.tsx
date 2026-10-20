import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IMAGE_SIZES, resolveImage } from "@/lib/media";
import { buildWorkHref } from "@/lib/utils";
import type { CategoryTile } from "@/types/content";

/**
 * Featured work-type tiles (spec 3.1). Each links into a pre-filtered /work view
 * via `buildWorkHref`, which is the same function the filter bar writes its URLs
 * with — so a tile and the filter bar can never mean different things.
 */
export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  if (tiles.length === 0) return null;

  return (
    <Container wide as="section" className="mt-24">
      <SectionHeading eyebrow="What I shoot" title="Browse by category" />

      <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tile) => (
          <li key={tile.slug}>
            <Link
              href={buildWorkHref(tile.filter)}
              className="glass-media group relative block"
            >
              <Image
                src={resolveImage(tile.cover)}
                alt=""
                width={tile.cover.width}
                height={tile.cover.height}
                sizes={IMAGE_SIZES.tile}
                className="aspect-[3/4] w-full object-cover opacity-70 transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-100"
              />
              <span aria-hidden="true" className="scrim-tile absolute inset-0" />
              {/* `glass-plate` rather than `glass`: the fill has to be dark in
                  both themes to hold white text over an arbitrary photograph.
                  `on-media` puts the label itself on the dark palette. */}
              <span className="on-media glass-plate absolute inset-x-2 bottom-2 block p-2.5 text-center text-xs uppercase tracking-[0.16em] text-fg sm:inset-x-3 sm:bottom-3 sm:p-3">
                {tile.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
