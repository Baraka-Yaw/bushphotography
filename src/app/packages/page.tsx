import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getPackages, getSiteSettings } from "@/lib/content";
import { buildPackageWhatsAppUrl, formatCedis } from "@/lib/contact";
import { buildWorkHref, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Photography packages for graduations, weddings, traditional marriages, corporate events and parties — book on WhatsApp.",
  alternates: { canonical: "/packages" },
};

/**
 * Fixed-price packages. Static like every other route: the WhatsApp links are
 * built at build time from `settings.whatsapp`, so there is nothing per-request.
 *
 * Without a WhatsApp number "Book" falls back to /contact — the form there
 * already says honestly when nothing is connected.
 */
export default async function PackagesPage() {
  const [packages, settings] = await Promise.all([getPackages(), getSiteSettings()]);

  return (
    <Container wide className="pb-8 pt-16 sm:pt-24">
      <header className="max-w-2xl">
        <p className="eyebrow">Packages</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">
          Book a session
        </h1>
        <p className="mt-4 text-muted">
          Every package includes editing and retouching. Pick one and send it on
          WhatsApp with your date and location — I&apos;ll confirm availability.
        </p>
      </header>

      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const bookHref = settings.whatsapp
            ? buildPackageWhatsAppUrl(settings.whatsapp, settings.name, pkg)
            : "/contact";

          return (
            <li
              key={pkg.slug}
              className={cn(
                "glass glass-soft flex flex-col px-6 py-8",
                pkg.highlight && "border-accent/45",
              )}
            >
              {pkg.highlight ? <p className="eyebrow text-accent">Most booked</p> : null}
              <h2 className="mt-2 font-display text-3xl leading-tight">{pkg.name}</h2>

              <p className="mt-4">
                {pkg.priceGhs !== undefined ? (
                  <span className="font-display text-4xl text-accent">
                    {formatCedis(pkg.priceGhs)}
                  </span>
                ) : (
                  <span className="text-lg text-muted">Price on request</span>
                )}
              </p>
              {pkg.unit ? <p className="mt-1 text-sm text-muted">{pkg.unit}</p> : null}

              <p className="mt-5 text-muted">{pkg.summary}</p>

              <ul className="mt-5 space-y-2 border-t border-line/60 pt-5 text-sm">
                {pkg.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-accent">
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* mt-auto pins the actions to the card's foot so a row of cards
                  lines its buttons up whatever the copy length. */}
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <ButtonLink href={bookHref} external={Boolean(settings.whatsapp)}>
                  Book {settings.whatsapp ? "on WhatsApp" : "now"}
                </ButtonLink>
                {pkg.tag ? (
                  <ButtonLink href={buildWorkHref({ tag: pkg.tag })} variant="ghost">
                    See examples
                  </ButtonLink>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
