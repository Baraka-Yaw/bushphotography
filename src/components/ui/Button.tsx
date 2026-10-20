import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

/**
 * Per the spec's note on the palette, the accent stays small: it is a border and
 * a text colour here, not a large fill. Under the glass treatment that holds
 * even better — `primary` is a glass pill with an accent rim and accent text
 * that only fills on hover, so the gold never becomes a slab.
 *
 * `glass-interactive` supplies the specular sweep and the one-pixel lift; the
 * variants only set colour.
 */
const VARIANTS: Record<Variant, string> = {
  // Utilities outrank the `.glass` component rules (Tailwind orders the
  // `components` layer before `utilities`), so the accent border and tint win
  // over the neutral glass edge without needing `!important`.
  primary:
    "glass glass-interactive glass-pill border-accent/45 text-accent hover:border-accent hover:bg-accent/12 focus-visible:border-accent focus-visible:bg-accent/12",
  outline: "glass glass-interactive glass-pill text-fg",
  ghost: "glass-pill text-muted transition-colors hover:text-fg",
};

const BASE =
  "inline-flex items-center justify-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.18em] min-h-11";

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
