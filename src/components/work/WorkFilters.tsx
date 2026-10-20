"use client";

import { categoryLabel, cn } from "@/lib/utils";
import type { Category, Tag, WorkFilter } from "@/types/content";

/**
 * Category tabs plus genre chips (spec 3.2).
 *
 * The category row is a real tab-style control, so it is marked up with
 * `aria-pressed` toggle buttons rather than links — the page never navigates, it
 * just rewrites the query string.
 */
export function WorkFilters({
  filter,
  availableTags,
  availableCategories,
  resultCount,
  onChange,
}: {
  filter: WorkFilter;
  availableTags: Tag[];
  /** The discipline row only renders when there is more than one to choose. */
  availableCategories: readonly Category[];
  resultCount: number;
  onChange: (next: WorkFilter) => void;
}) {
  return (
    // A green rule down the leading edge and a faint green wash tie the filter
    // bar to the accent without turning it into a slab of colour.
    <div className="panel panel-soft border-l-4 border-l-accent bg-accent/[0.04] px-5 py-5 sm:px-7 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
        {availableCategories.length > 1 ? (
        <div className="flex flex-wrap items-center gap-1">
          <FilterButton
            active={!filter.category}
            // Clearing the category can strand a tag that only exists in the
            // other one, so drop the tag unless it survives.
            onClick={() => onChange({ tag: filter.tag })}
          >
            All
          </FilterButton>

          {availableCategories.map((category) => (
            <FilterButton
              key={category}
              active={filter.category === category}
              onClick={() =>
                onChange(
                  filter.category === category
                    ? { tag: filter.tag }
                    : { category, tag: filter.tag },
                )
              }
            >
              {categoryLabel(category)}
            </FilterButton>
          ))}
        </div>
        ) : null}

        <p aria-live="polite" className="text-xs text-muted">
          <span className="font-display text-lg text-accent">{resultCount}</span>{" "}
          {resultCount === 1 ? "project" : "projects"}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1">Genre</span>

        {availableTags.map((tag) => {
          const active = filter.tag === tag;
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChange({
                  category: filter.category,
                  tag: active ? undefined : tag,
                })
              }
              className={cn(
                "chip pill min-h-9 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors",
                // Selected is a solid green block; idle chips carry a green
                // rule and text that deepen on hover.
                active
                  ? "border-accent bg-accent text-on-accent"
                  : "border-accent/35 text-accent hover:border-accent hover:bg-accent/10",
              )}
            >
              {tag}
            </button>
          );
        })}

        {filter.category || filter.tag ? (
          <button
            type="button"
            onClick={() => onChange({})}
            className="min-h-9 px-3 text-[11px] uppercase tracking-[0.14em] text-muted underline underline-offset-4 transition-colors hover:text-accent"
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "pill relative min-h-11 border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors",
        active
          ? "border-transparent bg-accent/12 text-fg"
          : "border-transparent text-muted hover:text-fg",
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-4 bottom-1.5 h-px origin-left bg-accent transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </button>
  );
}
