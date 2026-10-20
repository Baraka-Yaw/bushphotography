"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { resolveImage, resolveVideo } from "@/lib/media";
import type { ImageRef, VideoRef } from "@/types/content";

/**
 * The signature interaction from the spec: a project still that swaps to a short
 * muted loop on hover.
 *
 * Three rules that are easy to get wrong and are requirements here:
 *
 *  - `prefers-reduced-motion: reduce` disables it outright.
 *  - It only activates on `(hover: hover) and (pointer: fine)`. The spec says most
 *    traffic arrives from Instagram on mobile, and a phone firing hover events
 *    would download video nobody asked for.
 *  - Keyboard focus activates it too, not just the mouse. React's onFocus/onBlur
 *    map to focusin/focusout, which bubble, so focusing the covering link inside
 *    `children` reaches the handler on this wrapper.
 *
 * The clip is only mounted after the first activation, so a grid of ten tiles
 * issues zero video requests on load.
 */
export function HoverPreview({
  cover,
  preview,
  sizes,
  priority = false,
  className,
  children,
}: {
  cover: ImageRef;
  preview?: VideoRef;
  sizes: string;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [mountVideo, setMountVideo] = useState(false);

  // Capability detection runs after mount: the server has no media queries, so
  // deciding this during render would cause a hydration mismatch.
  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setEnabled(hoverQuery.matches && !motionQuery.matches);
    update();

    hoverQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      hoverQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  const activate = useCallback(() => {
    if (!enabled) return;
    setActive(true);
    if (preview) setMountVideo(true);
  }, [enabled, preview]);

  const deactivate = useCallback(() => {
    setActive(false);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      // Autoplay can still be refused (battery saver, platform policy). Swallow
      // the rejection and leave the still showing rather than throwing.
      void video.play().catch(() => undefined);
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [active, mountVideo]);

  const showingVideo = Boolean(preview) && mountVideo && active;

  return (
    <div
      className={cn("group relative overflow-hidden bg-surface", className)}
      onPointerEnter={activate}
      onPointerLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
    >
      <Image
        src={resolveImage(cover)}
        alt={cover.alt}
        width={cover.width}
        height={cover.height}
        sizes={sizes}
        priority={priority}
        className={cn(
          "h-full w-full object-cover transition-[transform,opacity] duration-700 ease-out",
          showingVideo && "opacity-0",
          // Without a clip to play, a slow scale still gives the tile life. This
          // is what runs today, since no video assets exist yet.
          !preview && active && "scale-105",
          preview && active && "scale-105",
        )}
      />

      {mountVideo && preview ? (
        <video
          ref={videoRef}
          // `poster` avoids a flash of empty box between mount and first frame.
          poster={resolveImage(cover)}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            showingVideo ? "opacity-100" : "opacity-0",
          )}
        >
          <source src={resolveVideo(preview)} />
        </video>
      ) : null}

      {children}
    </div>
  );
}
