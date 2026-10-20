import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

/**
 * Three weights of action:
 *  - `primary`  a solid green block — the one thing on a screen to press.
 *  - `outline`  an ink-ruled block for the secondary action beside it.
 *  - `ghost`    an underlined text link for tertiary actions.
 *
 * `interactive` supplies the hairline-to-ink border and the one-pixel lift;
 * the variants only set colour. Utilities outrank the `.panel` component rules
 * (the `components` layer comes before `utilities`), so the fills here win
 * without `!important`.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    "interactive pill border border-accent bg-accent text-on-accent hover:bg-fg hover:border-fg focus-visible:bg-fg focus-visible:border-fg",
  outline: "interactive pill border border-fg/70 text-fg hover:bg-fg hover:text-bg",
  ghost:
    "text-fg underline decoration-line underline-offset-[6px] transition-colors hover:decoration-accent hover:text-accent",
};

const BASE =
  "inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] min-h-11";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  /** Off-site link (e.g. wa.me): a plain anchor in a new tab, no referrer. */
  external?: boolean;
}) {
  const classes = cn(BASE, VARIANTS[variant], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], "disabled:opacity-50", className)}
      {...props}
    >
      {children}
    </button>
  );
}
