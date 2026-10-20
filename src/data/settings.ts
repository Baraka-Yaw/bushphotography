/**
 * Global site values and About page copy — the single record to hand the client
 * for review.
 *
 * ⚠️ PARTLY PLACEHOLDER. What is real comes from the client's Instagram
 * (@bushphotography_official): the name, the services and the Instagram link.
 * Everything marked TODO is waiting on the client and must be filled in before
 * launch:
 *   - `email` uses the reserved `.example` domain, so it can never deliver.
 *   - `phone` is a dummy number.
 *   - `whatsapp` is unset, so the contact form honestly reports it is not
 *     connected and package "Book" buttons fall back to /contact.
 *   - `location` is the country only.
 *   - the About bio is drafted from the Instagram bio, not written by him.
 *
 * No logo yet: the header sets `name` in the display face until one is
 * supplied. When it arrives, put it in `public/brand/` (never
 * `public/placeholder/`, which `npm run placeholders` deletes) and set `logo`.
 */

import type { AboutContent, SiteSettings } from "@/types/content";

export const siteSettings: SiteSettings = {
  name: "Bush Photography",
  tagline: "Weddings · Portraits · Events",
  heroHeadline: "Your day, kept beautifully.",
  heroMedia: {
    kind: "image",
    src: "/placeholder/placeholder-hero.jpg",
    alt: "Placeholder — the hero photograph is still to be supplied",
    width: 2400,
    height: 1350,
  },
  email: "bookings@bushphotography.example", // TODO: client's real address
  phone: "+233 (0) 000000000", // TODO: client's real number
  location: "Ghana", // TODO: city
  // TODO: wa.me form — country code, digits only, no "+", no trunk 0.
  // e.g. 0554462572 → "233554462572". Contact enquiries and package bookings
  // are delivered here once it is set.
  whatsapp: undefined,
  socials: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/bushphotography_official/",
    },
  ],
  seo: {
    title: "Bush Photography — Weddings, Portraits & Events",
    description:
      "Wedding, traditional marriage, graduation, portrait, corporate and party photography in Ghana — with editing and retouching included.",
  },
};

export const about: AboutContent = {
  heading: "Kofi Bush",
  portrait: {
    kind: "image",
    src: "/placeholder/placeholder-about-portrait.jpg",
    alt: "Placeholder — portrait of the photographer still to be supplied",
    width: 1200,
    height: 1500,
  },
  behindTheScenes: {
    kind: "image",
    src: "/placeholder/placeholder-about-bts.jpg",
    alt: "Placeholder — behind-the-scenes photograph still to be supplied",
    width: 1600,
    height: 1067,
  },
  // TODO: replace with the client's own words.
  bio: [
    "Bush Photography covers the days that matter — weddings, traditional marriages, graduations, corporate events and every kind of celebration.",
    "Every booking includes editing and retouching, so what you receive is finished work, ready to print and share.",
  ],
  specialties: [
    "Weddings",
    "Traditional marriage",
    "Graduation",
    "Portraits",
    "Corporate events",
    "Editing & retouching",
  ],
};
