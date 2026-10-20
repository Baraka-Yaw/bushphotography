import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatCedis } from "@/lib/contact";
import type { Package } from "@/types/content";

/**
 * Price list on the homepage — set like a menu: name on the left, price on the
 * right, a rule between rows. The full cards, with inclusions and the WhatsApp
 * booking buttons, live on /packages.
 */
export function PackagesTeaser({ packages }: { packages: Package[] }) {
  if (packages.length === 0) return null;

  return (
    <Container wide as="section" className="mt-24 sm:mt-32">
      <SectionHeading
        eyebrow="Packages"
        title="Book a session"
        action={{ href: "/packages", label: "All packages" }}
      />

      <ul>
        {packages.map((pkg) => (
          <li key={pkg.slug} className="border-b border-line">
            <Link
              href="/packages"
              className="group flex items-baseline justify-between gap-6 py-5 transition-colors hover:text-accent"
            >
              <span className="min-w-0">
                <span className="block font-display text-2xl sm:text-3xl">{pkg.name}</span>
                <span className="mt-1 block text-sm text-muted">{pkg.summary}</span>
              </span>
              <span className="shrink-0 text-right">
                {pkg.priceGhs !== undefined ? (
                  <span className="font-display text-2xl text-accent sm:text-3xl">
                    {formatCedis(pkg.priceGhs)}
                  </span>
                ) : (
                  <span className="text-sm text-muted">On request</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
