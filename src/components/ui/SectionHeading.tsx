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
        "flex flex-wrap items-end justify-between gap-4 border-b border-line/60 pb-5",
        className,
      )}
    >
      <div>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="font-display text-3xl leading-tight sm:text-4xl">{title}</h2>
      </div>

      {action ? (
        <Link
          href={action.href}
          className="glass-inset glass-pill px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
