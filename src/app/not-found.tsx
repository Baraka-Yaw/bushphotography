import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60svh] flex-col items-center justify-center py-24">
      <div className="glass glass-soft w-full max-w-2xl px-6 py-20 text-center sm:px-12">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          That page doesn&apos;t exist — it may have moved, or the link may be out of
          date.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/work">Browse the work</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Home
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
