import { cn } from "@/lib/utils";

/**
 * Small meta label — genre tags, category chips on tiles.
 *
 * `glass-inset`, not `glass`: these are small and appear in runs of five or six,
 * and a per-chip backdrop blur is a full filter pass each. The tint and specular
 * edge carry the material at this size.
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
        "glass-inset glass-pill inline-block px-3 py-1 text-[10px] uppercase tracking-[0.16em]",
        tone === "accent" ? "border-accent/40 text-accent" : "text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
