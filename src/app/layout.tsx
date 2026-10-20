import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSiteSettings } from "@/lib/content";
import { DEFAULT_THEME_CHOICE, THEME_INIT_SCRIPT } from "@/lib/theme";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

/**
 * Display face for headings, clean sans for body — spec Section 5.
 * Both are wired to CSS variables consumed by the `@theme` block in globals.css,
 * so switching to the client's brand fonts is a change to these two calls.
 */
const displayFace = Instrument_Serif({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const sansFace = Inter({
  variable: "--font-sans-face",
  subsets: ["latin"],
  display: "swap",
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
      {/* No `bg-bg` here: the page background lives on <html> so that the
          ambient wash `body::before` paints (see globals.css) is not covered by
          body's own background layer. */}
      <body className="flex min-h-full flex-col text-fg">
        <a href="#main" className="skip-link bg-accent px-4 py-2 text-sm text-bg">
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
