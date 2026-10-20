import { ImageResponse } from "next/og";

import { getAllProjects, getProjectBySlug } from "@/lib/content";
import { categoryLabel, formatYear } from "@/lib/utils";

export const alt = "Project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Prerender a card per project alongside the pages themselves. */
export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function Image(props: PageProps<"/work/[slug]">) {
  // In Next.js 16 the image function receives `params` as a Promise.
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return new ImageResponse(<div style={{ display: "flex" }} />, size);
  }

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
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#C9A96A" }}>
          {categoryLabel(project.category).toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.05, maxWidth: 1000 }}>
            {project.title}
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 28, color: "#8C8C8C" }}>
            {project.tags.join("  ·  ")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #2A2A2A",
            paddingTop: 24,
            fontSize: 22,
            color: "#8C8C8C",
          }}
        >
          <div style={{ display: "flex" }}>{project.client}</div>
          <div style={{ display: "flex" }}>{formatYear(project.date)}</div>
        </div>
      </div>
    ),
    size,
  );
}
