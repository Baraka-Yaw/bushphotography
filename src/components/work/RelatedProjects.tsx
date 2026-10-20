import { ProjectGrid } from "@/components/work/ProjectGrid";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ProjectSummary } from "@/types/content";

/** Keeps visitors browsing at the bottom of a project page (spec 3.3). */
export function RelatedProjects({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) return null;

  return (
    <Container wide as="section" className="mt-24">
      <SectionHeading
        eyebrow="Keep looking"
        title="Related work"
        action={{ href: "/work", label: "All work" }}
      />
      <ProjectGrid projects={projects} className="mt-10" />
    </Container>
  );
}
