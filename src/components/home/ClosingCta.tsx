import Link from "next/link";

import { Container } from "@/components/ui/Container";

/**
 * Closing prompt: a full-bleed band in the accent green — the one large fill
 * on the site, kept for the moment the visitor is asked to book.
 */
export function ClosingCta() {
  return (
    // `-mb-24` cancels the footer's top margin so the band meets the footer
    // with no strip of page colour between them.
    <section className="mt-24 -mb-24 bg-accent text-on-accent sm:mt-32">
      <Container wide className="py-16 sm:py-24">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] opacity-80">
          Now booking
        </p>
        <h2 className="mt-4 max-w-4xl font-display text-[clamp(2.75rem,8vw,6.5rem)]">
          Got a date coming up?
        </h2>
        <p className="mt-5 max-w-lg opacity-85">
          Weddings, traditional marriages, graduations, corporate events and
          parties — pick a package or tell me what you have in mind.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/packages"
            className="interactive pill inline-flex min-h-11 items-center bg-on-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:opacity-90"
          >
            See packages
          </Link>
          <Link
            href="/contact"
            className="interactive pill inline-flex min-h-11 items-center border border-on-accent/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] hover:border-on-accent"
          >
            Get in touch
          </Link>
        </div>
      </Container>
    </section>
  );
}
