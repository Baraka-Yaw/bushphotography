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
        className="glass-media aspect-[4/5] w-full"
      >
        <div
          aria-hidden="true"
          className="scrim-tile pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100"
        />

        {/* Sits on the scrim over the cover image, so it keeps the dark palette
            in both themes — see `.on-media` in globals.css. `glass-plate` is the
            over-photography glass: a dark tint in both themes, because a light
            one would blow out the image and lose the white text on top of it. */}
        <div className="on-media glass-plate pointer-events-none absolute inset-x-3 bottom-3 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-accent">
            {categoryLabel(project.category)}
          </p>
          <h3 className="mt-1.5 font-display text-2xl leading-tight text-fg">
            {project.title}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {project.tags.join(" · ")} — {formatYear(project.date)}
          </p>
        </div>
      </HoverPreview>

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
