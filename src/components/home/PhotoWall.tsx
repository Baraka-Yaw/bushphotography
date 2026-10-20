import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { WallPhoto } from "@/lib/content";
import { IMAGE_SIZES, resolveImage } from "@/lib/media";

/**
 * Masonry wall of individual frames — the homepage's main body of work.
 *
 * Uncropped: CSS columns (`.photo-wall` in globals.css) let portrait and square
 * frames keep their own proportions, which is the point for a photographer.
 * Each frame opens the project it belongs to.
 */
export function PhotoWall({ photos }: { photos: WallPhoto[] }) {
  if (photos.length === 0) return null;

  return (
    <Container wide as="section" className="mt-24 sm:mt-32">
      <SectionHeading
        eyebrow="Recent frames"
        title="The work"
        action={{ href: "/work", label: "All projects" }}
      />

      <ul className="photo-wall mt-8">
        {photos.map(({ image, slug, title }) => (
          <li key={image.src}>
            <Link href={`/work/${slug}`} className="frame group relative block">
              <Image
                src={resolveImage(image)}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes={IMAGE_SIZES.wall}
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <span className="sr-only">Open {title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
