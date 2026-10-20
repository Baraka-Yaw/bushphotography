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
    <Container wide as="section" className="mt-24 sm:mt-32">
      <SectionHeading eyebrow="What I shoot" title="By occasion" />

      <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.slug}>
            <Link href={buildWorkHref(tile.filter)} className="group block">
              <span className="frame block">
                <Image
                  src={resolveImage(tile.cover)}
                  alt=""
                  width={tile.cover.width}
                  height={tile.cover.height}
                  sizes={IMAGE_SIZES.tile}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </span>
              {/* Label on the page, under the photograph — no plate, no scrim. */}
              <span className="mt-3 flex items-center justify-between border-t border-fg pt-3 font-display text-xl transition-colors group-hover:text-accent sm:text-2xl">
                {tile.name}
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
