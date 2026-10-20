import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { resolveImage } from "@/lib/media";
import type { ClientLogo } from "@/types/content";

/**
 * Social-proof strip (spec 3.1). Renders nothing when there are no logos, so an
 * empty client list leaves no gap in the page rather than an orphaned heading.
 *
 * The logos run as a single horizontal line that drifts slowly and loops. That
 * is two identical rows in a track translated by half its width — see
 * `.logo-marquee` in globals.css for why the spacing sits on the items rather
 * than in a flex `gap`. The second row is `aria-hidden`, so a screen reader
 * hears each client once, not twice. It is pure CSS, so this stays a Server
 * Component and the row is already moving before any JavaScript arrives.
 *
 * Every mark sits on a fixed light plate, `object-contain` inside it. Client
 * logos arrive in whatever shape and format the brand issues them — square and
 * wide, transparent PNG and opaque JPEG and WebP, on white and on black — and
 * laying those out by intrinsic size alone gives a ragged line where the square
 * ones read as tiny and the white-backed ones read as bright rectangles on the
 * dark page. A uniform plate normalises all of it without anyone having to
 * re-cut the assets, and it gives the black wordmarks among them something to be
 * legible against.
 */
export function LogoStrip({ logos }: { logos: ClientLogo[] }) {
  if (logos.length === 0) return null;

  return (
    <section className="mt-24">
      {/* The band spans the viewport; the Container keeps the heading on the
          same gutter as the rest of the page, while the marquee below runs the
          full width so logos enter and leave at the screen edge. */}
      <div className="panel band py-10">
        <Container wide>
          <h2 className="eyebrow text-center">Selected clients</h2>
        </Container>

        <div className="logo-marquee mt-8">
          <div className="logo-marquee-track">
            <LogoRow logos={logos} />
            {/* The seamless half of the loop. Hidden from assistive tech and
                from the reduced-motion layout, where there is nothing to loop. */}
            <LogoRow logos={logos} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoRow({
  logos,
  ...props
}: { logos: ClientLogo[] } & React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className="logo-marquee-row" {...props}>
      {logos.map((logo) => {
        const plate = (
          <span className="flex h-16 w-28 items-center justify-center rounded-panel-sm bg-logo-plate p-3 opacity-85 transition-opacity duration-300 hover:opacity-100 sm:h-20 sm:w-36 sm:p-4">
            <Image
              src={resolveImage(logo.logo)}
              alt={logo.name}
              width={logo.logo.width}
              height={logo.logo.height}
              // The plate is at most 144px wide, so this never ships more.
              sizes="144px"
              className="h-full w-full object-contain"
            />
          </span>
        );

        return (
          // `pr` rather than a flex `gap`, and on every item including the last,
          // so the two rows butt together at an even spacing and each row is
          // exactly N × item width.
          <li key={logo.name} className="shrink-0 pr-3 sm:pr-4">
            {logo.href ? (
              <a href={logo.href} target="_blank" rel="noopener noreferrer">
                {plate}
              </a>
            ) : (
              plate
            )}
          </li>
        );
      })}
    </ul>
  );
}
