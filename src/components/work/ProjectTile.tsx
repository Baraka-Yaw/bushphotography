import Link from "next/link";

import { HoverPreview } from "@/components/media/HoverPreview";
import { IMAGE_SIZES } from "@/lib/media";
import { categoryLabel, cn, formatYear } from "@/lib/utils";
import type { ProjectSummary } from "@/types/content";

/**
 * A single project in a grid.
 *
 * The link is an overlay covering the whole tile rather than a wrapper around the
 * media. That keeps exactly one focusable element per tile (so tabbing through the
 * grid is one stop per project), while letting focus bubble up to `HoverPreview`
 * so keyboard users get the same preview behaviour as mouse users.
 */
export function ProjectTile({
  project,
  priority = false,
  className,
}: {
  project: ProjectSummary;
  priority?: boolean;
  className?: string;
}) {
  return (
    <article className={cn("group relative", className)}>
      <HoverPreview
        cover={project.cover}
        preview={project.preview}
        sizes={IMAGE_SIZES.grid}
        priority={priority}
        className="frame aspect-[4/5] w-full"
      />

      {/* Caption on the page under the photograph, magazine-style — not on a
          plate over it — so it reads in both themes with no scrim. */}
      <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-fg pt-3">
        <h3 className="font-display text-2xl transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        <p className="shrink-0 text-xs text-muted">{formatYear(project.date)}</p>
      </div>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
        {project.tags.join(" · ")}
      </p>

      <Link href={`/work/${project.slug}`} className="absolute inset-0">
        {/* The overlay link has no text content of its own, so give it an
            accessible name. The visible <h3> stays in the accessibility tree as a
            heading, which is what makes the grid navigable by headings too. */}
        <span className="sr-only">
          {project.title} — {categoryLabel(project.category)}
        </span>
      </Link>
    </article>
  );
}
