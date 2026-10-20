import { cn } from "@/lib/utils";

/**
 * Small meta label — genre tags, category chips on tiles.
 *
 * `chip`, not `panel`: a hairline rule with no fill, which is all a label
 * this small needs.
 */
export function Tag({
  children,
  className,
  tone = "muted",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "muted" | "accent";
}) {
  return (
    <span
      className={cn(
        "chip pill inline-block px-3 py-1 text-[10px] uppercase tracking-[0.16em]",
        tone === "accent" ? "border-accent/40 text-accent" : "text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
