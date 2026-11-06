import type { Metadata } from "next";
import localFont from "next/font/local";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSiteSettings } from "@/lib/content";
import { DEFAULT_THEME_CHOICE, THEME_INIT_SCRIPT } from "@/lib/theme";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

/**
 * A condensed grotesque in capitals for display, a warm geometric sans for
 * body. Both are wired to CSS variables consumed by the `@theme` block in
 * globals.css, so switching faces is a change to these two calls.
 *
 * Self-hosted from ./fonts (latin subsets, OFL) rather than `next/font/google`:
 * Vercel's Turbopack build fails to resolve the Google loader's font URLs, and
 * local files also keep the build off the network.
 */
const displayFace = localFont({
  variable: "--font-display-face",
  src: [
    { path: "./fonts/oswald-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/oswald-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  fallback: ["Arial Narrow", "sans-serif"],
});

const sansFace = localFont({
  variable: "--font-sans-face",
  src: "./fonts/dm-sans-latin-wght-normal.woff2",
  weight: "100 1000",
  style: "normal",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    // Required for OG and canonical URLs to resolve absolutely.
    metadataBase: new URL(siteUrl()),
    title: {
      default: settings.seo.title,
      // Per-page titles get the studio name appended automatically.
      template: `%s — ${settings.name}`,
    },
    description: settings.seo.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: settings.name,
      title: settings.seo.title,
      description: settings.seo.description,
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seo.title,
      description: settings.seo.description,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${displayFace.variable} ${sansFace.variable} h-full`}
      // The default choice; the inline script below rewrites both attributes
      // from localStorage before the first paint.
      data-theme-choice={DEFAULT_THEME_CHOICE}
      // The script mutates <html> before React hydrates, which React would
      // otherwise report as a mismatch.
      suppressHydrationWarning
    >
      <head>
        {/* Must stay inline and synchronous: it has to run while the HTML is
            being parsed, before anything is painted. An external script or a
            useEffect would both land after the first paint and flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      {/* The page background lives on <html> (globals.css), so overscroll and
          the area behind the header match the page. */}
      <body className="flex min-h-full flex-col text-fg">
        <a href="#main" className="skip-link bg-accent px-4 py-2 text-sm text-on-accent">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
