import Link from "next/link";

import { NAV_LINKS } from "@/components/layout/nav";
import { Container } from "@/components/ui/Container";
import { SocialIcon, socialIconPath } from "@/components/ui/SocialIcon";
import { getSiteSettings } from "@/lib/content";
import { cn } from "@/lib/utils";
import { telHref } from "@/lib/utils";

export async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    // A full-bleed glass band closing the page. `border-b-0` because it ends at
    // the bottom of the document — a rule there would draw a hairline along the
    // edge of the viewport with nothing beneath it to separate from.
    <footer className="mt-24">
      <div className="glass glass-band border-b-0 py-14">
        <Container wide>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-display text-2xl">{settings.name}</p>
              <p className="mt-2 text-sm text-muted">{settings.location}</p>
            </div>

            <div>
              <h2 className="eyebrow mb-4">Navigate</h2>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="eyebrow mb-4">Contact</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-muted transition-colors hover:text-accent"
                  >
                    {settings.email}
                  </a>
                </li>
                <li>
                  <a
                    href={telHref(settings.phone)}
                    className="text-muted transition-colors hover:text-accent"
                  >
                    {settings.phone}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="eyebrow mb-4">Follow</h2>
              <ul className="flex flex-wrap gap-2">
                {settings.socials.map((social) => {
                  const icon = socialIconPath(social.label);
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        // noreferrer alongside noopener: don't leak the referrer to
                        // third-party profiles.
                        rel="noopener noreferrer"
                        // No `text-*` utility here: utilities outrank the
                        // components layer, so one would override the brand
                        // colour `.social-link` sets. The text fallback below
                        // has no brand colour, so it keeps `text-muted`.
                        data-social={social.label.toLowerCase()}
                        className={cn(
                          "social-link glass-inset glass-pill flex min-h-11 items-center justify-center transition-colors",
                          // Square for a glyph, padded for the text fallback.
                          icon ? "w-11" : "px-4 text-sm text-muted hover:text-accent",
                        )}
                      >
                        {icon ? (
                          <>
                            <SocialIcon path={icon} />
                            {/* The link's only content is a decorative glyph, so
                                it needs an accessible name of its own. */}
                            <span className="sr-only">{social.label}</span>
                          </>
                        ) : (
                          social.label
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <p className="mt-14 border-t border-line/60 pt-6 text-xs text-muted">
            © {year} {settings.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
