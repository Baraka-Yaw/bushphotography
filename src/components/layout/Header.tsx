import Link from "next/link";
import Image from "next/image";

import { HeaderShell } from "@/components/layout/HeaderShell";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavLinks } from "@/components/layout/NavLinks";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getSiteSettings } from "@/lib/content";
import { resolveImage } from "@/lib/media";

/**
 * Sticky header: the wordmark, the nav and a "Book" action, on an
 * almost-opaque page-coloured bar with a single bottom rule.
 *
 * Kept a Server Component — the mobile panel, the active-link state and the
 * scroll-direction behaviour each live in their own client component.
 * `HeaderShell` supplies the retract-on-scroll-down behaviour.
 */
export async function Header() {
  const settings = await getSiteSettings();

  return (
    <HeaderShell>
      {/* The bar runs the full width of the viewport; the Container inside it
          keeps the logo and nav on the same gutter as every other page section. */}
      <div className="panel bar">
        <Container wide className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center leading-none">
            {settings.logo ? (
              <Image
                src={resolveImage(settings.logo)}
                alt={settings.logo.alt}
                width={settings.logo.width}
                height={settings.logo.height}
                priority
                className="brand-mark h-9 w-auto transition-opacity hover:opacity-80 sm:h-11"
              />
            ) : (
              <span className="whitespace-nowrap font-display text-xl tracking-[0.06em] transition-colors hover:text-accent sm:text-2xl">
                {settings.name}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2 md:gap-6">
            <nav aria-label="Primary" className="hidden md:block">
              <NavLinks />
            </nav>

            {/* Wrapped, because `hidden` on the link itself loses to the
                button's own `inline-flex`. Phones get "Book" from the hero
                and the menu instead, so the wordmark keeps one line. */}
            <div className="hidden sm:block">
              <ButtonLink href="/packages" className="px-4 py-2">
                Book
              </ButtonLink>
            </div>

            <ThemeToggle />

            <MobileNav />
          </div>
        </Container>
      </div>
    </HeaderShell>
  );
}
