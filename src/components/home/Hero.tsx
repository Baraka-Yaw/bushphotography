import Image from "next/image";

import { ProjectVideo } from "@/components/media/ProjectVideo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IMAGE_SIZES, resolveImage } from "@/lib/media";
import type { SiteSettings } from "@/types/content";

/**
 * Split editorial hero: the headline set large on the page colour, the
 * photograph beside it rather than behind it. No scrim — the type sits on
 * paper, so it reads in both themes without `.on-media`.
 *
 * Mobile-first order is headline → photograph, so the promise and the "Book"
 * action are above the fold on a phone; from `lg` the two sit side by side.
 *
 * `heroMedia` may be a video; `<ProjectVideo>` handles that branch, so a reel
 * is a content change, not a code change. The still is the LCP element on the
 * most-visited page, so it is the one image on the site marked `priority`.
 */
export function Hero({ settings }: { settings: SiteSettings }) {
  const media = settings.heroMedia;

  return (
    <Container wide as="section" className="pt-10 sm:pt-14">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-14">
        <div className="lg:pb-6">
          <p className="eyebrow">{settings.tagline}</p>
          {/* Sized to the column, not the viewport: from `lg` the headline has
              half the width, and its longest word ("BEAUTIFULLY.") must fit. */}
          <h1 className="mt-5 font-display text-[clamp(2.75rem,13vw,6rem)] lg:text-[min(6.2vw,7.5rem)]">
            {settings.heroHeadline}
          </h1>
          <p className="mt-6 max-w-md text-base text-muted sm:text-lg">
            Weddings, traditional marriages, graduations, portraits and events
            across {settings.location} — edited and retouched, every time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/packages">Book a session</ButtonLink>
            <ButtonLink href="/work" variant="outline">
              See the work
            </ButtonLink>
          </div>
        </div>

        <div className="frame relative aspect-[4/5] lg:aspect-[4/5] lg:max-h-[82svh]">
          {media.kind === "video" ? (
            <ProjectVideo media={media} mode="background" priority className="h-full w-full" />
          ) : (
            <Image
              src={resolveImage(media)}
              alt={media.alt}
              fill
              sizes={IMAGE_SIZES.heroSplit}
              priority
              // Start fetching before the rest of the document is parsed.
              fetchPriority="high"
              className="object-cover object-[50%_30%]"
            />
          )}
        </div>
      </div>
    </Container>
  );
}
