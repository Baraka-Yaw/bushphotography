import { CATEGORIES, TAGS } from "@/types/content";
import type { Category, Tag, WorkFilter } from "@/types/content";

/** Minimal class joiner — no dependency needed for the little conditional styling here. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * The one place /work URLs are constructed. Homepage category tiles and the
 * filter bar both go through this, so they cannot disagree about what a filter
 * looks like in the URL.
 */
export function buildWorkHref(filter: WorkFilter): string {
  const params = new URLSearchParams();
  if (filter.category) params.set("category", filter.category);
  if (filter.tag) params.set("tag", filter.tag);
  const query = params.toString();
  return query ? `/work?${query}` : "/work";
}

function isCategory(value: string | null): value is Category {
  return value !== null && (CATEGORIES as readonly string[]).includes(value);
}

function isTag(value: string | null): value is Tag {
  return value !== null && (TAGS as readonly string[]).includes(value);
}

/**
 * Reads a filter out of query params, ignoring anything unrecognised. Search
 * params are user-editable, so an unknown `?tag=whatever` must degrade to "no
 * tag filter" rather than rendering an empty grid.
 */
export function parseWorkFilter(params: {
  get(key: string): string | null;
}): WorkFilter {
  const category = params.get("category");
  const tag = params.get("tag");
  return {
    ...(isCategory(category) ? { category } : {}),
    ...(isTag(tag) ? { tag } : {}),
  };
}

/**
 * Explicit locale and UTC time zone: without them the server and client can
 * format the same date differently and React reports a hydration mismatch.
 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function formatYear(iso: string): string {
  return iso.slice(0, 4);
}

export function categoryLabel(category: Category): string {
  return category === "photography" ? "Photography" : "Videography";
}

/**
 * Canonical origin, used for metadataBase and the sitemap. Set
 * NEXT_PUBLIC_SITE_URL in the Vercel project settings at deploy time.
 */
export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * `tel:` href for a human-formatted phone number.
 *
 * The display string carries a national trunk prefix in brackets — "+233 (0)
 * 554462572" — which is how the number is written for people, but is not what a
 * phone can dial: once the country code is present the leading 0 must be
 * dropped. Stripping only whitespace would produce "+233(0)554462572", which
 * fails to connect on most handsets.
 *
 * So: remove any parenthesised group outright, then keep digits and a leading
 * plus.
 */
export function telHref(phone: string): string {
  const dialable = phone.replace(/\(\d*\)/g, "").replace(/[^\d+]/g, "");
  return `tel:${dialable}`;
}
