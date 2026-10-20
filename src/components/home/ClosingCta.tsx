import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/** Closing prompt to book a package or get in touch. */
export function ClosingCta() {
  return (
    <Container as="section" className="mt-28">
      <div className="glass glass-soft px-6 py-20 text-center">
        <p className="eyebrow">Now booking</p>
        <h2 className="mx-auto mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.1]">
          Got a date coming up?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted">
          Weddings, traditional marriages, graduations, corporate events and
          parties — pick a package or tell me what you have in mind.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/packages">See packages</ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Get in touch
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
