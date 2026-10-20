import Image from "next/image";

import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { ProjectVideo } from "@/components/media/ProjectVideo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IMAGE_SIZES, resolveImage } from "@/lib/media";
import type { SiteSettings } from "@/types/content";

/** What runs along the green strip under the banner. */
const SERVICES = [
  "Weddings",
  "Traditional marriages",
  "Graduations",
  "Portraits",
  "Corporate events",
  "Concerts",
  "Parties",
];

/**
 * Homepage banner: the photograph full-bleed — or, with `heroSlides`, a
 * crossfading rotation of them (`<HeroSlideshow>`) — the headline set huge across its
 * lower edge, and a green strip beneath it running the list of services.
 *
 * The text sits on a scrim, so it is wrapped in `.on-media` to keep the light
 * palette over the photo in both themes.
 *
 * `heroMedia` may be a video; `<ProjectVideo>` handles that branch, so a reel
 * is a content change, not a code change. The still is the LCP element on the
 * most-visited page, so it is the one image on the site marked `priority`.
 */
export function Hero({ settings }: { settings: SiteSettings }) {
  const media = settings.heroMedia;
  const slides = settings.heroSlides ?? [];

  return (
    <section>
      <div className="relative flex min-h-[78svh] items-end overflow-hidden sm:min-h-[86svh]">
        <div className="absolute inset-0">
          {slides.length > 1 ? (
            <HeroSlideshow slides={slides} />
          ) : media.kind === "video" ? (
            <ProjectVideo
              media={media}
              mode="background"
              priority
              className="h-full w-full"
            />
          ) : (
            <Image
              src={resolveImage(media)}
              alt={media.alt}
              fill
              sizes={IMAGE_SIZES.full}
              priority
              // Start fetching before the rest of the document is parsed.
              fetchPriority="high"
              // Biased upward: the client's work is portrait-format, and a
              // centred crop to a wide banner cuts through faces.
              className="object-cover object-[50%_28%]"
            />
          )}
          <div aria-hidden="true" className="scrim absolute inset-0" />
          {/* Extra shade under the text block: on a phone the copy covers most
              of the photo, often over a white dress, and the standard scrim
              alone leaves the small label unreadable there. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[rgb(18_17_14/0.55)] to-transparent sm:h-1/2"
          />
        </div>

        <Container wide className="on-media relative pb-10 pt-40 sm:pb-14">
          {/* Ivory, not the accent: the slides change colour underneath, and
              green vanishes on the orange concert frame. */}
          <p className="eyebrow text-fg">{settings.tagline}</p>
          <h1 className="mt-4 max-w-5xl font-display text-[clamp(3rem,12vw,9.5rem)]">
            {settings.heroHeadline}
          </h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <p className="max-w-md text-base text-fg/85 sm:text-lg">
              Edited and retouched photography across {settings.location} — for
              the days you will want to look back on.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/packages">Book a session</ButtonLink>
              <ButtonLink href="/work" variant="outline">
                See the work
              </ButtonLink>
            </div>
          </div>
        </Container>
      </div>

      {/* Services ticker: two identical rows translating by half the track
          (`.logo-marquee` in globals.css) loop seamlessly; the copy is hidden
          from assistive tech so the list is read once, and reduced motion
          stops it. The green sits on this wrapper, not the marquee, because
          the marquee's edge mask would fade the background out too. */}
      <div className="bg-accent py-3.5 text-on-accent">
        <div className="logo-marquee [--logo-marquee-duration:40s]">
          <div className="logo-marquee-track">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
                className="logo-marquee-row"
              >
                {SERVICES.map((service) => (
                  <li
                    key={service}
                    className="flex items-center whitespace-nowrap pl-8 font-display text-lg sm:text-xl"
                  >
                    {service}
                    <span aria-hidden="true" className="pl-8 opacity-60">
                      ✦
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
