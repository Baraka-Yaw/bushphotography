"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The sticky wrapper around the glass header bar, which retracts on downward
 * scroll and returns on upward scroll.
 *
 * Split out from `Header` so the header itself can stay a Server Component —
 * only this wrapper needs the client, and it renders whatever it is handed.
 *
 * Three details that are the difference between this feeling calm and feeling
 * twitchy:
 *
 *  - Reads inside `requestAnimationFrame`. `scrollY` is a layout-forcing read,
 *    and doing it straight from a scroll handler means one forced reflow per
 *    event on a listener that fires far more often than the screen refreshes.
 *  - A small movement threshold, below which `lastY` is deliberately *not*
 *    updated. Trackpad and rubber-band scrolling emit constant sub-pixel jitter
 *    in both directions; without this the bar flickers. Holding `lastY` lets
 *    small moves accumulate until they add up to a real direction.
 *  - It never hides near the top of the page, so the first thing a visitor sees
 *    is not the navigation leaving.
 */

/** How far down the page before hiding is allowed at all. */
const HIDE_AFTER = 96;
/** Movement below this is jitter, not a direction. */
const DIRECTION_THRESHOLD = 6;

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const queued = useRef(false);

  useEffect(() => {
    // A bar that jumps in and out of view on every direction change is exactly
    // the kind of motion this setting is asking us not to make. Opt out
    // entirely rather than doing it instantly: the header simply stays put.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    lastY.current = window.scrollY;

    const measure = () => {
      queued.current = false;

      const y = window.scrollY;
      const delta = y - lastY.current;

      // Below the threshold, leave `lastY` alone so the movement accumulates.
      if (Math.abs(delta) < DIRECTION_THRESHOLD) return;

      lastY.current = y;
      setHidden(delta > 0 && y > HIDE_AFTER);
    };

    const onScroll = () => {
      if (queued.current) return;
      queued.current = true;
      requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      // A retracted header is still in the tab order, so bring it back when
      // focus lands inside it — otherwise tabbing out of the skip link puts the
      // keyboard on a link that is off-screen. `focus` bubbles here because
      // React maps onFocus to focusin.
      onFocus={() => setHidden(false)}
      className={cn(
        "sticky top-0 z-50 transition-transform duration-300 ease-out",
        // Slightly past its own height so the drop shadow clears the top of the
        // viewport too, rather than leaving a smudge along the edge.
        hidden && "-translate-y-[110%]",
      )}
    >
      {children}
    </header>
  );
}
