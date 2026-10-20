import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 border-b border-fg pb-4",
        className,
      )}
    >
      <div>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="font-display text-4xl sm:text-5xl">{title}</h2>
      </div>

      {action ? (
        <Link
          href={action.href}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-fg underline decoration-line underline-offset-[6px] transition-colors hover:text-accent hover:decoration-accent"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
