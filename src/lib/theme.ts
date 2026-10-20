/**
 * Theme preference: light, dark, or follow the OS.
 *
 * Two attributes are kept on <html>, and the distinction matters:
 *
 *   data-theme-choice  what the user picked — "light" | "dark" | "system"
 *   data-theme         what that resolves to right now — "light" | "dark"
 *
 * The stylesheet keys its palette off `data-theme`, and the switcher keys its
 * active-option highlight off `data-theme-choice`, so "System" stays visibly
 * selected while the palette follows the OS underneath it.
 */
export type ThemeChoice = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";

/**
 * Dark, not "system" — the site is dark by design (spec Section 5), so a
 * first-time visitor on a light OS still gets the intended look. Light and
 * system are opt-ins from the switcher.
 *
 * This is also the palette a visitor with JavaScript disabled sees, because the
 * stylesheet's base palette is dark and nothing rewrites `data-theme` for them.
 */
export const DEFAULT_THEME_CHOICE: ThemeChoice = "dark";

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Runs synchronously in <head>, before the browser paints.
 *
 * Every route here is prerendered, so the server cannot know the visitor's
 * preference — without this the page would paint in the default palette and
 * then jump. `useEffect` is too late (it runs after paint) and reading a cookie
 * would opt the whole site into per-request rendering.
 *
 * Kept as a string rather than a real function so it can be inlined verbatim;
 * it must not reference anything outside itself. The try/catch covers
 * localStorage being unavailable in private modes and locked-down browsers.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var c=localStorage.getItem("${THEME_STORAGE_KEY}");if(c!=="light"&&c!=="dark"&&c!=="system")c="${DEFAULT_THEME_CHOICE}";var d=document.documentElement;d.setAttribute("data-theme-choice",c);d.setAttribute("data-theme",c==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):c)}catch(e){}})()`;
