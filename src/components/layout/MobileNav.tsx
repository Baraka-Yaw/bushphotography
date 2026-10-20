"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { NAV_LINKS } from "@/components/layout/nav";
import { cn } from "@/lib/utils";

/**
 * Mobile navigation panel.
 *
 * Built on the native `<dialog>` element deliberately: `showModal()` gives focus
 * trapping, Esc-to-close, background inertness and a top-layer stacking context
 * for free. Hand-rolling those is where accessible menus usually go wrong.
 */
export function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Drive the dialog imperatively — `showModal()` has no declarative equivalent.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Prevent the page behind from scrolling while the panel is up.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="chip pill flex h-11 w-11 items-center justify-center text-fg md:hidden"
      >
        <span className="sr-only">Open menu</span>
        <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
          <path d="M0 1h22M0 7h22M0 13h22" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Site navigation"
        // `close` also fires on Esc and on the backdrop-click handler below.
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // Clicking the backdrop registers on the dialog itself, not its children.
          if (event.target === dialogRef.current) setOpen(false);
        }}
        className={cn(
          // A panel sheet inset from the viewport edge rather than an opaque
          // full-screen panel — the page stays visible, and blurred, around it.
          "panel panel-strong m-3 h-[calc(100%-1.5rem)] max-h-none w-[calc(100%-1.5rem)] max-w-none p-0 text-fg",
          "overflow-hidden",
          // The backdrop blurs the page behind the sheet, so the two layers of
          // panel read as depth rather than as one flat overlay.
          "backdrop:bg-bg/40 backdrop:backdrop-blur-md",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line/60 px-5 py-4">
            <span className="eyebrow">Menu</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="chip pill flex h-11 w-11 items-center justify-center"
            >
              <span className="sr-only">Close menu</span>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col px-5 py-8">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  // Close on navigation. Doing this here rather than in an effect
                  // keyed on the pathname avoids a cascading render on every route
                  // change, including the ones where the panel was never open.
                  onClick={() => setOpen(false)}
                  className={cn(
                    "border-b border-line/60 py-5 font-display text-4xl transition-colors",
                    active ? "text-accent" : "text-fg hover:text-accent",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </dialog>
    </>
  );
}
