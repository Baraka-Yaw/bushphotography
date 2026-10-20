import type { Metadata } from "next";
import Image from "next/image";

import { ProjectVideo } from "@/components/media/ProjectVideo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { getAbout, getSiteSettings } from "@/lib/content";
import { IMAGE_SIZES, resolveImage } from "@/lib/media";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Kofi Bush — wedding, portrait and event photographer in Ghana, with editing and retouching included.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSiteSettings()]);

  return (
    <Container wide className="pb-8 pt-16 sm:pt-24">
      <header className="max-w-3xl">
        <p className="eyebrow">About</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">
          {about.heading}
        </h1>
      </header>

      <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Image
          src={resolveImage(about.portrait)}
          alt={about.portrait.alt}
          width={about.portrait.width}
          height={about.portrait.height}
          sizes={IMAGE_SIZES.portrait}
          priority
          className="glass-media h-auto w-full object-cover"
        />

        <div className="glass glass-soft h-fit px-6 py-8 sm:px-9 sm:py-10">
          <div className="space-y-5 text-base leading-relaxed text-muted">
            {about.bio.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <h2 className="eyebrow mt-12 border-b border-line/60 pb-4">Specialties</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {about.specialties.map((specialty) => (
              <li key={specialty}>
                <Tag>{specialty}</Tag>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Work with me</ButtonLink>
            <ButtonLink href="/work" variant="outline">
              See the work
            </ButtonLink>
          </div>
        </div>
      </div>

      <figure className="mt-20">
        <Image
          src={resolveImage(about.behindTheScenes)}
          alt={about.behindTheScenes.alt}
          width={about.behindTheScenes.width}
          height={about.behindTheScenes.height}
          sizes={IMAGE_SIZES.full}
          // The frame is square, and a square at full container width is taller
          // than the viewport. Crop the *display* to a band; the intrinsic
          // width/height in the data stay true to the file, which is what
          // `next/image` needs to reserve layout and what `check:media` asserts.
          className="glass-media aspect-[4/3] w-full object-cover"
        />
        <figcaption className="mt-3 text-xs text-muted">On set.</figcaption>
      </figure>

      {/* Optional per spec 3.4 — the section is omitted entirely when there is no
          showreel, rather than rendering an empty player. */}
      {about.showreel ? (
        <section className="mt-20">
          <h2 className="eyebrow border-b border-line/60 pb-4">Showreel</h2>
          <div className="glass-media mt-6">
            <ProjectVideo media={about.showreel} className="w-full" />
          </div>
        </section>
      ) : null}

      <p className="glass glass-sm mt-20 px-5 py-4 text-sm text-muted">
        Based in {settings.location}. Available for work worldwide.
      </p>
    </Container>
  );
}
