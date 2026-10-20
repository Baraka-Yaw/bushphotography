import Image from "next/image";

import { ProjectVideo } from "@/components/media/ProjectVideo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IMAGE_SIZES, resolveImage } from "@/lib/media";
import type { SiteSettings } from "@/types/content";

/**
 * Full-bleed homepage hero (spec 3.1).
 *
 * The spec says to lead with motion if there is reel footage and with a still if
 * not. That branch is data-driven off `settings.heroMedia`, so the day a reel
 * exists it is a content change, not a code change.
 *
 * The still is the LCP element on the most-visited page, so it is the one image
 * on the site marked `priority` — it must not wait for lazy-loading.
 */
export function Hero({ settings }: { settings: SiteSettings }) {
  const media = settings.heroMedia;

  return (
    <section className="relative flex min-h-[82svh] items-end overflow-hidden sm:min-h-[88svh]">
      <div className="absolute inset-0">
        {media.kind === "video" ? (
          <ProjectVideo media={media} mode="background" priority className="h-full w-full" />
        ) : (
          <Image
            src={resolveImage(media)}
            alt={media.alt}
            width={media.width}
            height={media.height}
            sizes={IMAGE_SIZES.full}
            priority
            // Tells the browser to start fetching this before it finishes parsing
            // the rest of the document.
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        )}
        <div aria-hidden="true" className="scrim absolute inset-0" />
      </div>

      {/* `on-media` keeps this text on the dark palette in both themes — it sits
          on the scrim over the photograph, not on the page background. */}
      <Container wide className="on-media relative pb-16 pt-32 sm:pb-24">
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/work">View the work</ButtonLink>
          <ButtonLink href="/packages" variant="outline">
            Book a session
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
