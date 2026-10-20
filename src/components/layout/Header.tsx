import Link from "next/link";
import Image from "next/image";

import { HeaderShell } from "@/components/layout/HeaderShell";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavLinks } from "@/components/layout/NavLinks";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Container } from "@/components/ui/Container";
import { getSiteSettings } from "@/lib/content";
import { resolveImage } from "@/lib/media";

/**
 * Sticky glass header.
 *
 * Kept a Server Component — the mobile panel, the active-link state and the
 * scroll-direction behaviour each live in their own client component.
 *
 * The bar spans the viewport edge to edge. Content still scrolls underneath it,
 * so the blur and the saturation boost are doing the work of keeping it legible
 * over the hero photograph — no scroll listener swapping backgrounds.
 * `HeaderShell` supplies the retract-on-scroll-down behaviour.
 */
export async function Header() {
  const settings = await getSiteSettings();

  return (
    <HeaderShell>
      {/* The glass runs the full width of the viewport; the Container inside it
          keeps the logo and nav on the same gutter as every other page section. */}
      <div className="glass glass-bar">
        <Container wide className="flex items-center justify-between gap-4 py-2">
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
              <span className="font-display text-2xl transition-opacity hover:opacity-80 sm:text-3xl">
                {settings.name}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2 md:gap-6">
            <nav aria-label="Primary" className="hidden md:block">
              <NavLinks />
            </nav>

            <ThemeToggle />

            <MobileNav />
          </div>
        </Container>
      </div>
    </HeaderShell>
  );
}
