import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/ui/Container";
import { WorkBrowser } from "@/components/work/WorkBrowser";
import { getProjectSummaries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Wedding, traditional marriage, graduation, portrait, corporate and party photography.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const projects = await getProjectSummaries();

  return (
    <Container wide className="pb-8 pt-16 sm:pt-24">
      <header className="max-w-2xl">
        <p className="eyebrow">Portfolio</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">
          Work
        </h1>
        <p className="mt-4 text-muted">
          Filter by occasion. Every project opens to its own page with the full
          set of images.
        </p>
      </header>

      <div className="mt-14">
        {/*
          `useSearchParams` inside WorkBrowser needs a Suspense boundary, otherwise
          this statically-rendered route would be forced into dynamic rendering at
          build time. The fallback is deliberately minimal — the boundary resolves
          on hydration, not over the network.
        */}
        <Suspense fallback={<div className="h-32" />}>
          <WorkBrowser projects={projects} />
        </Suspense>
      </div>
    </Container>
  );
}
