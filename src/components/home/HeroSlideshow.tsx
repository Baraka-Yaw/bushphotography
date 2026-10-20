"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { IMAGE_SIZES, resolveImage } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { ImageRef } from "@/types/content";

const INTERVAL_MS = 6000;

/**
 * Crossfading banner background. Every slide is stacked in place and only
 * opacity changes, so nothing reflows and the first frame is the server-rendered
 * LCP image — the rotation starts only after hydration.
 *
 * Auto-advance stops while the pointer or keyboard focus is on the banner
 * (WCAG 2.2.2: moving content needs a way to pause), and never starts under
 * `prefers-reduced-motion`. The dots let anyone change slide by hand.
 */
export function HeroSlideshow({
  slides,
  className,
}: {
  slides: ImageRef[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  // Decided after mount: the server has no media queries, so reading this
  // during render would cause a hydration mismatch.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAutoplay(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!autoplay || paused) return;
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      INTERVAL_MS,
    );
    return () => window.clearTimeout(id);
  }, [autoplay, paused, index, slides.length]);

  return (
    <div
      className={cn("absolute inset-0", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <Image
            key={slide.src}
            src={resolveImage(slide)}
            alt={slide.alt}
            fill
            sizes={IMAGE_SIZES.full}
            // Only the first frame is the LCP candidate; the rest load right
            // after it so the first fade never shows a blank.
            priority={i === 0}
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? undefined : "eager"}
            aria-hidden={!active}
            className={cn(
              // Biased upward: the client's work is portrait-format, and a
              // centred crop to a wide banner cuts through faces.
              "object-cover object-[50%_28%] transition-[opacity,transform] ease-out",
              // Slow zoom-out while a slide is showing; the fade is quicker.
              active
                ? "scale-100 opacity-100 duration-[1200ms,7000ms]"
                : "scale-[1.06] opacity-0 duration-[1200ms,0ms]",
            )}
          />
        );
      })}

      {/* Above the scrims (later in the stack) so the dots stay clickable. */}
      <div className="absolute right-4 top-4 z-10 flex gap-2 sm:right-8 sm:top-6">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show photo ${i + 1} of ${slides.length}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => setIndex(i)}
            className="flex h-11 w-8 items-center justify-center"
          >
            <span
              className={cn(
                "block h-0.5 w-full transition-colors duration-300",
                i === index ? "bg-[#f1ece2]" : "bg-[#f1ece2]/40",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
