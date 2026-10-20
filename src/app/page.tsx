import { CategoryTiles } from "@/components/home/CategoryTiles";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hero } from "@/components/home/Hero";
import { LogoStrip } from "@/components/home/LogoStrip";
import { PackagesTeaser } from "@/components/home/PackagesTeaser";
import { PhotoWall } from "@/components/home/PhotoWall";
import {
  getCategories,
  getClientLogos,
  getPackages,
  getPhotoWall,
  getSiteSettings,
} from "@/lib/content";

/**
 * Hero → the work as a wall of frames → browse by occasion → prices → book.
 * Prices sit on the homepage because, for this client, "how much?" is the
 * question most visitors arrive with.
 */
export default async function HomePage() {
  // Independent reads — resolve together rather than in series.
  const [settings, wall, categories, packages, logos] = await Promise.all([
    getSiteSettings(),
    getPhotoWall(16),
    getCategories(),
    getPackages(),
    getClientLogos(),
  ]);

  return (
    <>
      <Hero settings={settings} />
      <PhotoWall photos={wall} />
      <CategoryTiles tiles={categories} />
      <PackagesTeaser packages={packages} />
      <LogoStrip logos={logos} />
      <ClosingCta />
    </>
  );
}
