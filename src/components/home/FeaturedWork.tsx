import { Container } from "@/components/ui/Container";
import { ProjectGrid } from "@/components/work/ProjectGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ProjectSummary } from "@/types/content";

/** Curated highlights grid (spec 3.1). */
export function FeaturedWork({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) return null;

  return (
    <Container wide as="section" className="mt-24">
      <SectionHeading
        eyebrow="Selected projects"
        title="Recent work"
        action={{ href: "/work", label: "See all" }}
      />
      <ProjectGrid projects={projects} className="mt-10" />
    </Container>
  );
}
