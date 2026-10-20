"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  DEFAULT_THEME_CHOICE,
  isThemeChoice,
  THEME_STORAGE_KEY,
  type ThemeChoice,
} from "@/lib/theme";

/**
 * Light / dark / system switcher — a single button that cycles the three.
 *
 * All three icons are rendered; CSS shows the one matching
 * `html[data-theme-choice]` and hides the rest (see `.theme-icon` in
 * globals.css). That attribute is set by the inline script in the root layout
 * before first paint, so the correct icon is on screen in the very first frame
 * of a prerendered page. Picking the icon from React state instead would paint
 * the server's default and then swap it on hydration — a visible flash.
 *
 * It stays a three-way choice rather than a light/dark flip: *System* is the
 * option that lets the palette follow the OS, and the whole
 * `data-theme-choice` / `data-theme` split in lib/theme.ts exists to support it.
 *
 * React state here exists only to keep the button's `aria-label` truthful and to
 * know whether to listen for OS changes.
 */

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="2.75"
        y="4"
        width="18.5"
        height="12.5"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M8.5 20.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const OPTIONS: ReadonlyArray<{
  value: ThemeChoice;
  label: string;
  Icon: () => React.ReactElement;
}> = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: MonitorIcon },
];

/** Next choice in the cycle, wrapping at the end. */
function nextChoice(current: ThemeChoice): ThemeChoice {
  const index = OPTIONS.findIndex((o) => o.value === current);
  return OPTIONS[(index + 1) % OPTIONS.length].value;
}

/** Mirrors what the inline script does, for use after the page is interactive. */
function apply(choice: ThemeChoice) {
  const root = document.documentElement;
  root.setAttribute("data-theme-choice", choice);
  root.setAttribute(
    "data-theme",
    choice === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : choice,
  );
}

/**
 * The `data-theme-choice` attribute on <html> is the single source of truth —
 * the same one the stylesheet reads. Subscribing to it rather than mirroring it
 * into React state means the two can never disagree, and it keeps the server
 * snapshot trivially correct for a prerendered page.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme-choice"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): ThemeChoice {
  const value = document.documentElement.getAttribute("data-theme-choice");
  return isThemeChoice(value) ? value : DEFAULT_THEME_CHOICE;
}

function getServerSnapshot(): ThemeChoice {
  return DEFAULT_THEME_CHOICE;
}

export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Only while following the OS: react to it changing under us. This updates
  // `data-theme` (the resolved palette), not `data-theme-choice`, so it does
  // not need to re-render anything.
  useEffect(() => {
    if (choice !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => apply("system");
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [choice]);

  const select = useCallback((next: ThemeChoice) => {
    apply(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Preference just won't persist; the page still switches.
    }
  }, []);

  const current = OPTIONS.find((o) => o.value === choice) ?? OPTIONS[1];
  const upcoming = OPTIONS.find((o) => o.value === nextChoice(choice)) ?? OPTIONS[0];

  return (
    <button
      type="button"
      onClick={() => select(nextChoice(choice))}
      // A single action button, not a set of toggles, so it carries a label
      // rather than `aria-pressed`. This one comes from React state: it is never
      // painted, so it cannot flash, and it is the only thing that still needs
      // to know the choice.
      aria-label={`Colour theme: ${current.label}. Switch to ${upcoming.label}.`}
      title={`Theme: ${current.label}`}
      className="glass-inset glass-pill flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-fg"
    >
      {OPTIONS.map(({ value, Icon }) => (
        <span
          key={value}
          // Read by the CSS that decides which single icon is visible.
          data-theme-value={value}
          className="theme-icon items-center justify-center"
          aria-hidden="true"
        >
          <Icon />
        </span>
      ))}
    </button>
  );
}
