/**
 * Content repository — the single seam between the UI and the content source.
 *
 * Pages and components import from here and never from `src/data/`. Every
 * function is async even though local module reads are synchronous: that is
 * deliberate, so moving to Sanity/Payload/Contentful later is a rewrite of these
 * function bodies and nothing else.
 */

import { about, siteSettings } from "@/data/settings";
import { categoryTiles } from "@/data/categories";
import { clientLogos } from "@/data/clients";
import { packages } from "@/data/packages";
import { projects } from "@/data/projects";
import type {
  AboutContent,
  CategoryTile,
  ClientLogo,
  Package,
  Project,
  ProjectSummary,
  SiteSettings,
  Tag,
  WorkFilter,
} from "@/types/content";

/** Newest first — the order the grid and sitemap both want. */
function byDateDesc(a: Project, b: Project): number {
  return b.date.localeCompare(a.date);
}

/**
 * Homepage highlights order: all photography first, then videography, most
 * recent first within each. (Every project is photography today; the ordering
 * is kept so adding video later needs no code change.)
 *
 * Only the homepage grid uses this. `/work` and everything else stay on plain
 * date order, because there the category is something the visitor filters by
 * rather than something the page decides for them.
 */
function byCategoryThenDate(a: Project, b: Project): number {
  if (a.category !== b.category) return a.category === "photography" ? -1 : 1;
  return byDateDesc(a, b);
}

export function matchesFilter(project: Project, filter: WorkFilter): boolean {
  if (filter.category && project.category !== filter.category) return false;
  if (filter.tag && !project.tags.includes(filter.tag)) return false;
  return true;
}

export async function getAllProjects(filter: WorkFilter = {}): Promise<Project[]> {
  return projects.filter((p) => matchesFilter(p, filter)).sort(byDateDesc);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return projects.find((p) => p.slug === slug) ?? null;
}

function toSummary(project: Project): ProjectSummary {
  return {
    title: project.title,
    slug: project.slug,
    category: project.category,
    tags: project.tags,
    cover: project.cover,
    preview: project.preview,
    date: project.date,
  };
}

/**
 * Grid-sized projects for /work, which filters on the client. Sending summaries
 * instead of full projects keeps galleries and credits out of the RSC payload.
 */
export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  return [...projects].sort(byDateDesc).map(toSummary);
}

export async function getFeaturedProjects(limit = 6): Promise<Project[]> {
  const featured = projects.filter((p) => p.featured).sort(byCategoryThenDate);
  // Fall back to most recent so the homepage never renders an empty grid if
  // nobody has flagged anything as featured.
  const source =
    featured.length > 0 ? featured : [...projects].sort(byCategoryThenDate);
  return source.slice(0, limit);
}

/**
 * Related projects for the bottom of a detail page: shared genre tags rank
 * highest, then same category, then anything recent. Always excludes itself.
 */
export async function getRelatedProjects(project: Project, limit = 3): Promise<Project[]> {
  const others = projects.filter((p) => p.slug !== project.slug);

  const scored = others.map((candidate) => {
    const sharedTags = candidate.tags.filter((t) => project.tags.includes(t)).length;
    const sameCategory = candidate.category === project.category ? 1 : 0;
    return { candidate, score: sharedTags * 2 + sameCategory };
  });

  return scored
    .sort((a, b) => b.score - a.score || byDateDesc(a.candidate, b.candidate))
    .slice(0, limit)
    .map((s) => s.candidate);
}

/** Tags that actually have projects behind them, so filters are never dead ends. */
export async function getActiveTags(filter: WorkFilter = {}): Promise<Tag[]> {
  const scope = projects.filter((p) => matchesFilter(p, { category: filter.category }));
  const seen = new Set<Tag>();
  for (const project of scope) {
    for (const tag of project.tags) seen.add(tag);
  }
  return [...seen];
}

/**
 * Each tile borrows the cover of the newest project carrying its tag. A tile
 * with nothing behind it is dropped rather than rendered as a dead end.
 */
export async function getCategories(): Promise<CategoryTile[]> {
  const newestFirst = [...projects].sort(byDateDesc);
  return categoryTiles.flatMap(({ name, slug, tag }) => {
    const source = newestFirst.find((p) => p.tags.includes(tag));
    return source ? [{ name, slug, cover: source.cover, filter: { tag } }] : [];
  });
}

export async function getPackages(): Promise<Package[]> {
  return packages;
}

export async function getClientLogos(): Promise<ClientLogo[]> {
  return clientLogos;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettings;
}

export async function getAbout(): Promise<AboutContent> {
  return about;
}
