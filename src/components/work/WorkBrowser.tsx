"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ProjectGrid } from "@/components/work/ProjectGrid";
import { WorkFilters } from "@/components/work/WorkFilters";
import { buildWorkHref, parseWorkFilter } from "@/lib/utils";
import { CATEGORIES } from "@/types/content";
import type { ProjectSummary, WorkFilter } from "@/types/content";

/**
 * The /work grid and its filters.
 *
 * Filter state lives in the URL rather than in React state, for two reasons the
 * spec asks for directly: homepage category tiles must "link to a filtered view
 * of /work" (a plain `<Link>` now does that), and a filtered view is shareable
 * and survives the back button.
 *
 * Filtering itself happens here on the client over the full list, which is why
 * /work stays a static page. Reading `searchParams` on the server would opt the
 * route into per-request rendering, and with a dataset this small that would be
 * paying latency for a filter that can run instantly against data already in the
 * browser.
 */
export function WorkBrowser({ projects }: { projects: ProjectSummary[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filter = parseWorkFilter(searchParams);

  const visible = useMemo(
    () =>
      projects.filter((project) => {
        if (filter.category && project.category !== filter.category) return false;
        if (filter.tag && !project.tags.includes(filter.tag)) return false;
        return true;
      }),
    [projects, filter.category, filter.tag],
  );

  /** Tags that still have results under the current category — never a dead end. */
  const availableTags = useMemo(() => {
    const scope = filter.category
      ? projects.filter((p) => p.category === filter.category)
      : projects;
    return [...new Set(scope.flatMap((p) => p.tags))];
  }, [projects, filter.category]);

  /**
   * Disciplines that actually have work. With only one (all photography today)
   * the discipline row is hidden — an "All / Photography / Videography" toggle
   * where two of three options are identical and the third is empty.
   */
  const availableCategories = useMemo(
    () => CATEGORIES.filter((c) => projects.some((p) => p.category === c)),
    [projects],
  );

  function apply(next: WorkFilter) {
    // `replace` rather than `push`: flipping between filters shouldn't bury the
    // previous page under a stack of history entries. `scroll: false` keeps the
    // viewport where it is instead of jumping to the top on every change.
    router.replace(buildWorkHref(next), { scroll: false });
  }

  return (
    <>
      <WorkFilters
        filter={filter}
        availableTags={availableTags}
        availableCategories={availableCategories}
        resultCount={visible.length}
        onChange={apply}
      />

      {visible.length > 0 ? (
        <ProjectGrid projects={visible} className="mt-10" priorityCount={3} />
      ) : (
        <div className="panel panel-soft mt-16 px-6 py-16 text-center">
          <p className="font-display text-2xl">Nothing here yet</p>
          <p className="mt-2 text-sm text-muted">
            No projects match this combination of filters.
          </p>
          <button
            type="button"
            onClick={() => apply({})}
            className="chip pill mt-6 min-h-11 border-accent/40 px-5 text-xs uppercase tracking-[0.18em] text-accent transition-opacity hover:opacity-70"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
