import { ImageResponse } from "next/og";

import { getSiteSettings } from "@/lib/content";

export const alt = "Bush Photography — weddings, portraits and events";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default share card. Generated rather than a static file so it stays in step
 * with the studio name and tagline in site settings.
 *
 * next/og runs in a constrained renderer: plain flexbox and inline styles only,
 * no Tailwind classes and no external assets.
 */
export default async function Image() {
  const settings = await getSiteSettings();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0A0A0A 0%, #151312 55%, #0A0A0A 100%)",
          padding: 72,
          color: "#F5F5F5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#8C8C8C" }}>
          {settings.tagline.toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 86, lineHeight: 1.05 }}>
            {settings.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 30,
              color: "#8C8C8C",
              maxWidth: 900,
            }}
          >
            {settings.heroHeadline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", width: 64, height: 3, background: "#C9A96A" }} />
          <div style={{ display: "flex", fontSize: 22, color: "#8C8C8C" }}>
            {settings.location}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
