import { CategoryTiles } from "@/components/home/CategoryTiles";
import { ClosingCta } from "@/components/home/ClosingCta";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { Hero } from "@/components/home/Hero";
import { LogoStrip } from "@/components/home/LogoStrip";
import {
  getCategories,
  getClientLogos,
  getFeaturedProjects,
  getSiteSettings,
} from "@/lib/content";

export default async function HomePage() {
  // Independent reads — resolve together rather than in series.
  const [settings, featured, categories, logos] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(6),
    getCategories(),
    getClientLogos(),
  ]);

  return (
    <>
      <Hero settings={settings} />
      {/* Social proof directly under the hero, before the category tiles. */}
      <LogoStrip logos={logos} />
      <CategoryTiles tiles={categories} />
      <FeaturedWork projects={featured} />
      <ClosingCta />
    </>
  );
}
