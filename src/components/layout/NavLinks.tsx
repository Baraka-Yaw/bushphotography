"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS } from "@/components/layout/nav";
import { cn } from "@/lib/utils";

/**
 * Desktop nav. Client-side only because it needs `usePathname` to mark the
 * current section — the surrounding header stays a Server Component.
 */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-8">
      {NAV_LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative py-2 text-xs uppercase tracking-[0.18em] transition-colors",
                active ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {link.label}
              {/* The spec reserves the accent for exactly this kind of small
                  active-state cue rather than large fills. */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-accent transition-transform duration-300",
                  active ? "scale-x-100" : "scale-x-0",
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
