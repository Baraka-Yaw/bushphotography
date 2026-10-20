/**
 * Media resolution seam.
 *
 * Every image/video URL in the app passes through here. Today these functions
 * return the local `/public` path unchanged. Moving to Cloudinary means building
 * a transform URL inside `resolveImage` / `resolveVideo` — no call site changes.
 *
 * Example of what the Cloudinary version of `resolveImage` would look like:
 *
 *   const base = `https://res.cloudinary.com/${cloud}/image/upload`;
 *   return `${base}/f_auto,q_auto,w_${opts.width}/${ref.src}`;
 */

import type { EmbedRef, ImageRef, PlayableRef, VideoRef } from "@/types/content";

export function resolveImage(ref: ImageRef): string {
  return ref.src;
}

export function resolveVideo(ref: VideoRef): string {
  return ref.src;
}

/** Watch URL for a third-party embed. */
export function resolveEmbed(ref: EmbedRef): string {
  return ref.provider === "vimeo"
    ? `https://player.vimeo.com/video/${ref.id}`
    : `https://www.youtube-nocookie.com/embed/${ref.id}`;
}

export function isVideo(ref: PlayableRef): ref is VideoRef {
  return ref.kind === "video";
}

/** Poster still for any playable, used for `<video poster>` and as the OG image. */
export function posterOf(ref: PlayableRef): ImageRef {
  return ref.poster;
}

export function aspectRatio(ref: { width: number; height: number }): number {
  return ref.width / ref.height;
}

/**
 * `sizes` values for `next/image`.
 *
 * Getting these right is the single highest-leverage change for the spec's ~2s
 * mobile target: without `sizes`, Next.js assumes `100vw` and ships a
 * desktop-width image to a phone rendering a three-up grid.
 */
export const IMAGE_SIZES = {
  /** Full-bleed hero. */
  full: "100vw",
  /** Work grid + homepage highlights: 1 col mobile, 2 tablet, 3 desktop. */
  grid: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  /** Featured category tiles: 2 col mobile, 3 desktop. */
  tile: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  /** Project detail gallery: single column on mobile, two up above that. */
  gallery: "(max-width: 768px) 100vw, 50vw",
  /** Portrait on the about page. */
  portrait: "(max-width: 768px) 100vw, 40vw",
  /** Lightbox — always the largest thing on screen. */
  lightbox: "100vw",
} as const;
