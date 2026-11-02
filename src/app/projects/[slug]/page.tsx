import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, images: [project.image] },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const index = projects.findIndex((item) => item.slug === slug);
  const nextProject = projects[(index + 1) % projects.length];

  return (
    <article className="pb-24 pt-28 sm:pb-32 sm:pt-36">
      <div className="container-x">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
          <ArrowLeft size={15} /> All projects
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
          <div data-reveal>
            <p className="label-mono">{project.type} · {project.year}</p>
            <h1 className="mt-4 max-w-3xl font-display text-display font-medium tracking-[-0.04em] text-fg">{project.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{project.summary}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan px-5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  {link.label} <ArrowUpRight size={15} />
                </a>
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-5 border-t border-line pt-5 lg:mb-1 lg:border-t-0 lg:border-l lg:pl-7" data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
            <div>
              <dt className="label-mono !text-[0.58rem]">My role</dt>
              <dd className="mt-2 text-sm leading-6 text-fg">{project.role}</dd>
            </div>
            <div>
              <dt className="label-mono !text-[0.58rem]">Stack</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <span key={tech} className="rounded-full border border-line/70 px-2.5 py-1 font-mono text-[0.62rem] text-muted">{tech}</span>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative mt-14 aspect-[16/8] overflow-hidden rounded-card border border-line/80 bg-ink-2" data-reveal>
          <Image src={project.image} alt={`${project.title} main visual`} fill priority sizes="(max-width: 1024px) 100vw, 1200px" className="object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/55 via-transparent to-ink/20" />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <aside className="lg:sticky lg:top-28 lg:self-start" data-reveal>
            <p className="label-mono">Key features</p>
          </aside>
          <div className="max-w-2xl" data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {project.features.map((feature) => (
                <li key={feature} className="rounded-card border border-line/60 bg-surface/30 px-4 py-3.5 text-sm leading-6 text-muted">
                  {feature}
                </li>
              ))}
            </ul>
            {project.screenshots && project.screenshots.length > 0 && (
              <div className="mt-14">
                <p className="label-mono">Screenshots</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {project.screenshots.map((shot) => (
                    <div key={shot.src} className="relative aspect-[16/10] overflow-hidden rounded-card border border-line/70 bg-ink-2">
                      <Image src={shot.src} alt={shot.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20 flex items-center justify-between border-t border-line/70 pt-7">
          <Link href="/projects" className="text-sm text-muted hover:text-fg">Project archive</Link>
          <Link href={`/projects/${nextProject.slug}`} className="group inline-flex items-center gap-2 text-sm text-cyan hover:text-fg">
            Next project <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
          </Link>
        </div>

        <div className="mt-20">
          <p className="label-mono">More projects</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.filter((p) => p.slug !== project.slug).slice(0, 3).map((p, i) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
