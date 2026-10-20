"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { resolveEmbed, resolveImage, resolveVideo } from "@/lib/media";
import type { PlayableRef } from "@/types/content";

/**
 * The one place video is played, so the deferred hosting decision stays a
 * one-file change. It renders whichever `PlayableRef` it is handed:
 *
 *  - `video` — a self-hosted/CDN file today, a Cloudinary URL later (that change
 *    happens in `lib/media.ts`, not here).
 *  - `embed` — Vimeo/YouTube, behind a click-to-load facade so a third-party
 *    player's scripts never load unless the visitor actually presses play.
 *
 * `mode="background"` is the muted, looping, chromeless hero treatment.
 * `mode="player"` is a normal video with controls.
 */
export function ProjectVideo({
  media,
  mode = "player",
  priority = false,
  className,
}: {
  media: PlayableRef;
  mode?: "background" | "player";
  priority?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [embedActivated, setEmbedActivated] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // A looping, autoplaying background is exactly what "reduce motion" is about.
  // Fall back to the poster still rather than playing anyway.
  const autoPlayBackground = mode === "background" && !reducedMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || mode !== "background") return;

    if (!autoPlayBackground) {
      video.pause();
      return;
    }

    // iOS Safari often refuses the first play() before any data has loaded,
    // so retry once the video is ready instead of relying on the mount call.
    const tryPlay = () => void video.play().catch(() => undefined);
    tryPlay();
    video.addEventListener("loadedmetadata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    return () => {
      video.removeEventListener("loadedmetadata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };
  }, [autoPlayBackground, mode]);

  if (media.kind === "embed") {
    if (!embedActivated) {
      return (
        <button
          type="button"
          onClick={() => setEmbedActivated(true)}
          className={cn("frame group relative block w-full", className)}
        >
          <Image
            src={resolveImage(media.poster)}
            alt={media.poster.alt}
            width={media.poster.width}
            height={media.poster.height}
            sizes="100vw"
            priority={priority}
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-bg/30 transition-colors group-hover:bg-bg/15">
            <PlayGlyph />
          </span>
          <span className="sr-only">
            Play video (loads {media.provider})
          </span>
        </button>
      );
    }

    return (
      <div className={cn("frame relative aspect-video w-full", className)}>
        <iframe
          src={`${resolveEmbed(media)}?autoplay=1`}
          title="Project video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      poster={resolveImage(media.poster)}
      width={media.width}
      height={media.height}
      controls={mode === "player"}
      autoPlay={autoPlayBackground}
      muted={mode === "background"}
      loop={mode === "background"}
      // Required for inline playback on iOS Safari — without it the video takes
      // over the screen in fullscreen the moment it plays.
      playsInline
      // Only the hero is worth pre-buffering; everything else waits for intent.
      // The hero uses `auto` rather than `metadata`: iOS Safari needs data in
      // the buffer before it will honour an autoplay request.
      preload={priority ? "auto" : "none"}
      className={cn("h-full w-full object-cover", className)}
    >
      <source src={resolveVideo(media)} />
      Your browser does not support embedded video.
    </video>
  );
}

function PlayGlyph() {
  return (
    <span
      aria-hidden="true"
      // `on-media` because the plate is dark in both themes — without it the
      // glyph would be near-black on near-black in light mode.
      className="on-media caption-plate flex h-20 w-20 items-center justify-center rounded-full text-fg transition-transform duration-300 group-hover:scale-105"
    >
      <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor">
        <path d="M0 0l20 12L0 24z" />
      </svg>
    </span>
  );
}
