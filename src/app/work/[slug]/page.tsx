import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Gallery } from "@/components/media/Gallery";
import { ProjectVideo } from "@/components/media/ProjectVideo";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { RelatedProjects } from "@/components/work/RelatedProjects";
import { getAllProjects, getProjectBySlug, getRelatedProjects } from "@/lib/content";
import { IMAGE_SIZES, resolveImage } from "@/lib/media";
import { categoryLabel, formatDate } from "@/lib/utils";

/** Prerenders every project at build time — no request-time work for a detail page. */
export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.description,
      url: `/work/${project.slug}`,
    },
  };
}

export default async function ProjectPage(props: PageProps<"/work/[slug]">) {
  // `params` is a Promise in Next.js 16 — synchronous access was removed.
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const related = await getRelatedProjects(project, 3);

  return (
    <article className="pb-8 pt-12 sm:pt-16">
      <Container wide>
        <Link
          href="/work"
          className="glass-inset glass-pill inline-block px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
        >
          ← All work
        </Link>

        <header className="glass glass-soft mt-8 grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">{categoryLabel(project.category)}</p>
            <h1 className="mt-3 font-display text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.05]">
              {project.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>

          <p className="text-base leading-relaxed text-muted lg:pt-14">
            {project.description}
          </p>
        </header>
      </Container>

      {/* Lead media: the finished film for video projects, the cover frame
          otherwise. Video projects fall back to the still until footage is wired
          up, rather than rendering an empty player. */}
      <Container wide className="mt-10">
        {project.video ? (
          <div className="glass-media">
            <ProjectVideo media={project.video} priority className="w-full" />
          </div>
        ) : (
          <Image
            src={resolveImage(project.cover)}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            sizes={IMAGE_SIZES.full}
            priority
            className="glass-media h-auto w-full object-cover"
          />
        )}
      </Container>

      {project.gallery && project.gallery.length > 0 ? (
        <Container wide className="mt-12 sm:mt-16">
          <h2 className="eyebrow mb-6">
            {project.category === "photography" ? "Gallery" : "Stills"}
          </h2>
          <Gallery images={project.gallery} />
        </Container>
      ) : null}

      <Container wide className="mt-16">
        <div className="glass glass-soft px-6 py-8 sm:px-9 sm:py-10">
          <h2 className="eyebrow border-b border-line/60 pb-4">Credits</h2>
          <dl className="mt-6 grid gap-x-12 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Client</dt>
              <dd className="mt-1.5">{project.client}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Date</dt>
              <dd className="mt-1.5">
                <time dateTime={project.date}>{formatDate(project.date)}</time>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Category</dt>
              <dd className="mt-1.5">{categoryLabel(project.category)}</dd>
            </div>

            {project.credits?.map((credit) => (
              <div key={`${credit.role}-${credit.name}`}>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                  {credit.role}
                </dt>
                <dd className="mt-1.5">{credit.name}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      <RelatedProjects projects={related} />
    </article>
  );
}
