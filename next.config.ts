import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    No `images.remotePatterns`: every image is served from `public/`. If work is
    ever hotlinked from a CDN (Cloudinary, Behance…), allow that host here —
    `next/image` refuses unlisted hosts.
  */
};

export default nextConfig;
