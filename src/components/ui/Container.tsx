import { cn } from "@/lib/utils";

/**
 * Standard page gutter. `wide` is for full-bleed-ish grids that should still
 * keep an edge margin on large screens.
 */
export function Container({
  children,
  className,
  wide = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
  as?: "div" | "section" | "header" | "footer" | "nav" | "main";
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-12",
        wide ? "max-w-[1800px]" : "max-w-[1400px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
