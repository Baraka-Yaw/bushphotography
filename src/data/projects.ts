/**
 * REAL CONTENT — the client's own work, taken from his public Instagram
 * (@bushphotography_official) on 2026-10-20 with the developer's go-ahead.
 *
 * These are Instagram renditions (1440px wide, recompressed by Instagram), not
 * originals. They are good enough for the web, but when Kofi supplies the
 * full-resolution files, drop them in at the same paths, update `width`/`height`
 * and run `npm run check:media`.
 *
 * Titles, dates and descriptions are written from the posts themselves; each
 * project notes its source post. People are described, not named — none of the
 * posts tag their subjects.
 *
 * Graduation, Traditional and Party have no real work here yet, so there are no
 * projects for them: their homepage tiles and "See examples" links hide
 * themselves rather than lead to placeholders.
 *
 * `preview` (hover-loop clip) is omitted: `<HoverPreview>` falls back to a slow
 * scale on the still.
 */

import type { ImageRef, Project } from "@/types/content";

function img(src: string, alt: string, width: number, height: number): ImageRef {
  return { kind: "image", src, alt, width, height };
}

const KP = "/work/katon-praise/katon-praise";

const katonPraise: ImageRef[] = [
  img(`${KP}-01.jpg`, "Wide view of the Katon Praise stage glowing red and orange, a performer small at its centre before the crowd", 1440, 1440),
  img(`${KP}-02.jpg`, "Singer in a canary-yellow suit, eyes closed mid-song with a microphone, against a deep blue stage backdrop", 1439, 1799),
  img(`${KP}-03.jpg`, "Singer in a cream suit pressing a microphone close, mid-phrase under warm stage light", 1440, 1800),
  img(`${KP}-04.jpg`, "Performer in a sleeveless navy top and white cap reaching skyward with the microphone held out", 1440, 1440),
  img(`${KP}-05.jpg`, "Singer in yellow with arms open in front of a blazing orange screen, a saxophonist behind her", 1440, 1800),
  img(`${KP}-06.jpg`, "Close side profile of a singer in a cream suit, head tilted back into the microphone", 1440, 1800),
  img(`${KP}-07.jpg`, "Black-and-white frame of a singer performing beside her own image on the giant screen", 1440, 1800),
  img(`${KP}-08.jpg`, "Performer in a cap bending low over the microphone in front of red stage lights", 1440, 1440),
  img(`${KP}-09.jpg`, "Singer in yellow reaching out to the crowd with one hand, stained-glass light behind her", 1439, 1799),
  img(`${KP}-10.jpg`, "Singer in a cream suit with one foot raised on a stage monitor, the KATON sign behind him", 1440, 1800),
  img(`${KP}-11.jpg`, "Two performers sharing the stage between tall blue and red light columns", 1440, 1800),
  img(`${KP}-12.jpg`, "The full stage from the crowd: band, flame graphics and the Katon Praise logo under green lights", 1439, 1799),
  img(`${KP}-13.jpg`, "Singer in a yellow suit with one hand raised, green light bars glowing behind her", 1439, 1799),
  img(`${KP}-14.jpg`, "Singer in yellow smiling mid-song through drifting stage haze", 1439, 1799),
  img(`${KP}-15.jpg`, "Wide shot of the singer in yellow on stage before towering flame graphics", 1439, 1799),
  img(`${KP}-16.jpg`, "Singer in yellow and a performer in a red jacket sharing the stage beneath the Katon Praise logo", 1440, 1800),
  img(`${KP}-17.jpg`, "The singer in yellow seen from behind, walking towards a performer in red", 1440, 1800),
  img(`${KP}-18.jpg`, "Singer in a cream suit crouched low, singing into the microphone under blue light", 1440, 1800),
  img(`${KP}-19.jpg`, "Singer in a cream suit pointing out to the crowd beside a lit sign", 1440, 1800),
  img(`${KP}-20.jpg`, "Performer in a cap with one arm outstretched in front of the Katon Praise screen", 1440, 1440),
  img(`${KP}-21.jpg`, "The band on stage: keyboard player and guitarist behind the performer in a cap", 1440, 1440),
  img(`${KP}-22.jpg`, "Two performers embracing on stage between blue and red light columns", 1440, 1800),
  img(`${KP}-23.jpg`, "Performer in a cap seen from behind, facing a wall of blue stage lights", 1440, 1440),
];

const IW = "/work/in-white/in-white";
const SP = "/work/studio-portraits/studio-portraits";

export const projects: Project[] = [
  {
    // instagram.com/p/DeYA5x4KkI7
    title: "First Kiss",
    slug: "first-kiss",
    category: "photography",
    tags: ["Wedding"],
    cover: img("/work/first-kiss/first-kiss-01.jpg", "Bride in a strapless white dress holding a bouquet of white roses, kissing the groom in a white tuxedo jacket among garden greenery", 1440, 1800),
    gallery: [
      img("/work/first-kiss/first-kiss-01.jpg", "Bride in a strapless white dress holding a bouquet of white roses, kissing the groom in a white tuxedo jacket among garden greenery", 1440, 1800),
    ],
    client: "Private client",
    date: "2026-10-11",
    description: "A white wedding — the bride, the groom and a quiet moment in the garden.",
    featured: true,
  },
  {
    // instagram.com/p/DeSgw9ajX7O
    title: "Studio Portraits",
    slug: "studio-portraits",
    category: "photography",
    tags: ["Portrait"],
    cover: img(`${SP}-04.jpg`, "Woman seated cross-legged on a white studio floor in an oversized white shirt and hand-painted jeans, smiling with her head resting on one hand", 1440, 1863),
    gallery: [
      img(`${SP}-01.jpg`, "Woman standing in an oversized white shirt and painted jeans, one hand in her hair, against a plain white backdrop", 1440, 1863),
      img(`${SP}-02.jpg`, "Full-length studio portrait of a woman in a white shirt and jeans painted with yellow florals, barefoot", 1440, 1863),
      img(`${SP}-03.jpg`, "Black-and-white portrait of a woman seated cross-legged, chin resting on her hand", 1440, 1864),
      img(`${SP}-04.jpg`, "Woman seated cross-legged on a white studio floor in an oversized white shirt and hand-painted jeans, smiling with her head resting on one hand", 1440, 1863),
    ],
    client: "Private client",
    date: "2026-10-09",
    description:
      "A clean, simply lit studio session on a white backdrop — standing, seated and one in black and white.",
    featured: true,
  },
  {
    // instagram.com/p/DeIoWiIClIV
    title: "In White",
    slug: "in-white",
    category: "photography",
    tags: ["Wedding"],
    cover: img(`${IW}-02.jpg`, "Bride in a white lace dress with sheer bell sleeves and a feathered fascinator, standing on a lawn", 1440, 1639),
    gallery: [
      img(`${IW}-01.jpg`, "Black-and-white frame of a couple in white walking hand in hand across a garden", 1440, 1639),
      img(`${IW}-02.jpg`, "Bride in a white lace dress with sheer bell sleeves and a feathered fascinator, standing on a lawn", 1440, 1639),
      img(`${IW}-03.jpg`, "Couple dressed in white standing together on a lawn beside palms and a white wall", 1440, 1639),
      img(`${IW}-04.jpg`, "Smiling bride leaning forward in her white lace dress, sleeves flared out on either side", 1440, 1639),
    ],
    client: "Private client",
    date: "2026-10-05",
    description: "A couple in white, photographed outdoors among the palms.",
    featured: true,
  },
  {
    // instagram.com/p/DZ1RRGWqt0H
    title: "Executive Portrait",
    slug: "corporate-portrait",
    category: "photography",
    tags: ["Corporate", "Portrait"],
    cover: img("/work/corporate-portrait/corporate-portrait-01.jpg", "Smiling man in a blue shirt photographed against a softly blurred office background", 1440, 1920),
    gallery: [
      img("/work/corporate-portrait/corporate-portrait-01.jpg", "Smiling man in a blue shirt photographed against a softly blurred office background", 1440, 1920),
    ],
    client: "Corporate client",
    date: "2026-06-20",
    description: "A warm, natural headshot for professional profiles and press.",
    featured: true,
  },
  {
    // instagram.com/p/DYAGQCnjetF, DYAMBp5Df8O, DYAMd3oDY9j, DYCGfqCjXg3, DYCHuh2DTNy
    title: "Katon Praise",
    slug: "katon-praise",
    category: "photography",
    tags: ["Concert"],
    cover: katonPraise[1],
    gallery: katonPraise,
    client: "Katon Praise",
    date: "2026-05-07",
    description:
      "Live coverage of the Katon Praise concert — the performers, the band and the stage, shot from the pit.",
    featured: true,
  },
];
