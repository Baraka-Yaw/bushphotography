import { ProjectTile } from "@/components/work/ProjectTile";
import { cn } from "@/lib/utils";
import type { ProjectSummary } from "@/types/content";

export function ProjectGrid({
  projects,
  className,
  /** How many tiles load eagerly — only ever the ones above the fold. */
  priorityCount = 0,
}: {
  projects: ProjectSummary[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6",
        className,
      )}
    >
      {projects.map((project, index) => (
        <li key={project.slug}>
          <ProjectTile project={project} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
