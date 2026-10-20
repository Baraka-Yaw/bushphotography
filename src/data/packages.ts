/**
 * Booking packages, rendered on /packages.
 *
 * REAL: the two packages the client advertises on Instagram — ₵500 graduation
 * with 8 edited pictures, and ₵4,500 for a group of ten with 10 pictures each.
 *
 * TODO: every other package has no `priceGhs` and shows "Price on request" —
 * confirm figures and inclusions with the client rather than guessing.
 */

import type { Package } from "@/types/content";

export const packages: Package[] = [
  {
    slug: "graduation",
    name: "Graduation",
    priceGhs: 500,
    unit: "Per graduate",
    summary: "Solo graduation portraits on the day or in the studio.",
    includes: ["8 edited pictures", "Retouching included"],
    tag: "Graduation",
  },
  {
    slug: "graduation-group-10",
    name: "Graduation · Group of 10",
    priceGhs: 4500,
    unit: "For ten graduates",
    summary: "Group and individual portraits for ten friends graduating together.",
    includes: ["10 pictures for each graduate", "Group photographs", "Retouching included"],
    tag: "Graduation",
    highlight: true,
  },
  {
    slug: "wedding",
    name: "Wedding",
    summary: "Ceremony, couple portraits and reception, edited and retouched.",
    includes: ["Full-day coverage", "Edited & retouched gallery"], // TODO: confirm
    tag: "Wedding",
  },
  {
    slug: "traditional-marriage",
    name: "Traditional Marriage",
    summary: "The families, the rites and the celebration.",
    includes: ["Ceremony coverage", "Family portraits", "Edited & retouched gallery"], // TODO: confirm
    tag: "Traditional",
  },
  {
    slug: "corporate-event",
    name: "Corporate Event",
    summary: "Conferences, launches, dinners and awards nights.",
    includes: ["Event coverage", "Fast turnaround for press and social"], // TODO: confirm
    tag: "Corporate",
  },
  {
    slug: "party",
    name: "Party & Celebration",
    summary: "Birthdays, anniversaries and every other reason to celebrate.",
    includes: ["Candid and posed coverage", "Edited gallery"], // TODO: confirm
    tag: "Party",
  },
];
