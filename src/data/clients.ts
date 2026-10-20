/**
 * Social-proof logo strip. Empty until the client supplies logos for corporate
 * clients they have shot for — `<LogoStrip>` renders nothing for an empty list.
 *
 * Real logos go in `public/clients/`, never `public/placeholder/` (which
 * `npm run placeholders` deletes).
 */

import type { ClientLogo } from "@/types/content";

export const clientLogos: ClientLogo[] = [];
