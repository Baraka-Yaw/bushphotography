/**
 * Content model — mirrors Section 4 of the project documentation.
 *
 * These types are the contract between the content source and the UI. Pages never
 * import from `src/data/` directly; they go through `src/lib/content.ts`. Swapping
 * the local data files for a CMS means reimplementing that module against these
 * same types, and nothing in `src/app` or `src/components` changes.
 */

export type Category = "photography" | "videography";

/** Genre tags — the services in the client's bio. A union rather than `string` so a typo fails the build. */
export type Tag =
  | "Wedding"
  | "Traditional"
  | "Graduation"
  | "Portrait"
  | "Corporate"
  | "Party";

export const CATEGORIES: readonly Category[] = ["photography", "videography"];

export const TAGS: readonly Tag[] = [
  "Wedding",
  "Traditional",
  "Graduation",
  "Portrait",
  "Corporate",
  "Party",
];

/**
 * Media is never a bare URL string.
 *
 * `alt` is required on every image, so the spec's "alt text on all images"
 * accessibility requirement is enforced by the compiler instead of by review.
 * Intrinsic `width`/`height` are required so `next/image` can reserve layout
 * space and never shift content while loading.
 */
export type ImageRef = {
  kind: "image";
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** A self-hosted or CDN-delivered video file. */
export type VideoRef = {
  kind: "video";
  src: string;
  poster: ImageRef;
  width: number;
  height: number;
};

/** A third-party player. Not used yet — the hosting decision is deferred. */
export type EmbedRef = {
  kind: "embed";
  provider: "vimeo" | "youtube";
  id: string;
  poster: ImageRef;
};

/** Anything `<ProjectVideo>` knows how to render. */
export type PlayableRef = VideoRef | EmbedRef;

export type MediaRef = ImageRef | PlayableRef;

export type Credit = {
  role: string;
  name: string;
};

export type Project = {
  title: string;
  slug: string;
  category: Category;
  tags: Tag[];
  /** Thumbnail / hero still. */
  cover: ImageRef;
  /**
   * Short muted loop shown on hover over a project tile. Optional: when absent,
   * `<HoverPreview>` falls back to a slow scale on the still image, so the grid
   * still feels alive before any video assets exist.
   */
  preview?: VideoRef;
  /** Photo projects. */
  gallery?: ImageRef[];
  /** Video projects. */
  video?: PlayableRef;
  client: string;
  /** ISO `YYYY-MM-DD`. Used for sorting and for the credits block. */
  date: string;
  description: string;
  /** Surfaced in the homepage highlights grid. */
  featured?: boolean;
  credits?: Credit[];
};

/**
 * The subset of a project a grid tile actually renders.
 *
 * The /work grid filters on the client, which means this data crosses the
 * server/client boundary as JSON. Narrowing to these fields keeps galleries,
 * credits and descriptions — the bulk of the content — out of that payload.
 */
export type ProjectSummary = Pick<
  Project,
  "title" | "slug" | "category" | "tags" | "cover" | "preview" | "date"
>;

/**
 * Homepage featured-category tile. Holds the *filter* rather than a URL so that
 * link building lives in one place (`buildWorkHref`) and can't drift.
 */
export type CategoryTile = {
  name: string;
  slug: string;
  cover: ImageRef;
  filter: WorkFilter;
};

export type ClientLogo = {
  name: string;
  logo: ImageRef;
  href?: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type SiteSettings = {
  /** Studio / client name used in the wordmark and metadata. */
  name: string;
  /**
   * Official logo, shown in the header in place of the text wordmark. Optional:
   * without one the header sets `name` in the display face.
   */
  logo?: ImageRef;
  tagline: string;
  heroHeadline: string;
  /** Image or video — the homepage hero renders whichever it is given. */
  heroMedia: ImageRef | VideoRef;
  email: string;
  phone: string;
  location: string;
  socials: SocialLink[];
  /**
   * WhatsApp number in wa.me format: country code, digits only, no `+`, no
   * spaces and no national trunk `0`. Optional — the contact form falls back to
   * email delivery when it is absent.
   */
  whatsapp?: string;
  seo: {
    title: string;
    description: string;
  };
};

export type AboutContent = {
  heading: string;
  portrait: ImageRef;
  behindTheScenes: ImageRef;
  /** Paragraphs of bio copy. */
  bio: string[];
  specialties: string[];
  /** Optional embedded showreel, per spec 3.4. */
  showreel?: PlayableRef;
};

/** The set of filters the /work grid understands. */
export type WorkFilter = {
  category?: Category;
  tag?: Tag;
};

/**
 * A fixed-price booking package. Rendered on /packages; "Book" opens WhatsApp
 * with the package named, so the enquiry arrives already knowing what was chosen.
 */
export type Package = {
  slug: string;
  name: string;
  /**
   * Whole cedis. Omit for "price on request" — never invent a figure the client
   * has not published.
   */
  priceGhs?: number;
  /** One line under the name, e.g. "Per graduate". */
  unit?: string;
  summary: string;
  includes: string[];
  /** Links the card to the matching /work filter. */
  tag?: Tag;
  /** Visually emphasised as the most popular option. */
  highlight?: boolean;
};
