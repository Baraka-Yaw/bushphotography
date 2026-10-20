"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

import { IMAGE_SIZES, resolveImage } from "@/lib/media";
import type { ImageRef } from "@/types/content";

/**
 * Full-screen image viewer.
 *
 * Native `<dialog>` + `showModal()` is doing the heavy lifting: focus trapping,
 * Esc-to-close, background inertness, top-layer stacking, and — the part usually
 * missed — returning focus to the thumbnail that opened it. Those are the spec's
 * "keyboard-navigable lightbox" requirement, and the platform implements them
 * more correctly than a hand-rolled version would.
 *
 * Added on top: arrow-key paging and touch swiping.
 */
export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: ImageRef[];
  /** `null` when closed. */
  index: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const open = index !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      // Wrap around so paging never dead-ends.
      onNavigate((index + delta + images.length) % images.length);
    },
    [index, images.length, onNavigate],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
    // Esc is handled natively by <dialog> and surfaces via onClose.
  };

  const current = index === null ? null : images[index];

  return (
    <dialog
      ref={dialogRef}
      aria-label="Image viewer"
      onClose={onClose}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        // Backdrop clicks land on the dialog element itself.
        if (event.target === dialogRef.current) onClose();
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        const end = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (start === null || end === undefined) return;
        const delta = end - start;
        if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
      }}
      // The viewer itself stays near-opaque — a photograph is the subject here,
      // and anything showing through would compete with it. The chrome bars are
      // where the panel lives.
      className="m-0 h-full max-h-none w-full max-w-none bg-bg/88 p-0 text-fg backdrop-blur-xl backdrop:bg-transparent"
    >
      {current ? (
        <div className="flex h-full flex-col">
          <div className="panel panel-sm m-3 flex items-center justify-between px-4 py-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {(index ?? 0) + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="chip pill flex h-11 w-11 items-center justify-center text-fg"
            >
              <span className="sr-only">Close viewer</span>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center p-4">
            <Image
              // Keying on src forces a real swap rather than a cross-fade of the
              // previous decode when paging quickly.
              key={current.src}
              src={resolveImage(current)}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes={IMAGE_SIZES.lightbox}
              priority
              className="max-h-full w-auto max-w-full object-contain"
            />
          </div>

          {images.length > 1 ? (
            <div className="panel panel-sm m-3 flex items-center justify-between gap-4 px-3 py-2">
              <button
                type="button"
                onClick={() => go(-1)}
                className="chip pill min-h-11 px-4 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
              >
                ← Previous
              </button>
              <p className="hidden truncate text-xs text-muted sm:block">{current.alt}</p>
              <button
                type="button"
                onClick={() => go(1)}
                className="chip pill min-h-11 px-4 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
              >
                Next →
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
