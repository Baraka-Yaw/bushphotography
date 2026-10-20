/**
 * Global site values and About page copy — the single record to hand the client
 * for review.
 *
 * ⚠️ PARTLY PLACEHOLDER. What is real comes from the client's Instagram
 * (@bushphotography_official): the name, the services and the Instagram link.
 * The phone numbers are the two printed on his package promos (0502450192 and
 * 0530824543); the first is used for WhatsApp — confirm with Kofi that it is
 * the WhatsApp line. Everything marked TODO is waiting on the client and must
 * be filled in before launch:
 *   - `email` uses the reserved `.example` domain, so it can never deliver.
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
  // Real photograph, shared with the First Kiss project rather than copied.
  heroMedia: {
    kind: "image",
    src: "/work/first-kiss/first-kiss-01.jpg",
    alt: "Bride in a strapless white dress holding a bouquet of white roses, kissing the groom in a white tuxedo jacket among garden greenery",
    width: 1440,
    height: 1800,
  },
  email: "bookings@bushphotography.example", // TODO: client's real address
  // Display string; `telHref()` drops the "(0)" trunk prefix to dial.
  phone: "+233 (0) 50 245 0192",
  location: "Ghana", // TODO: city
  // 0502450192 in wa.me form: trunk 0 dropped, Ghana's 233 prefixed, no "+".
  // Contact enquiries and package bookings are delivered here.
  whatsapp: "233502450192",
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
