import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
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

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
          <div data-reveal>
            <p className="label-mono">Case study · {project.number}</p>
            <h1 className="mt-5 max-w-3xl font-display text-display font-medium tracking-[-0.04em] text-fg">{project.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{project.summary}</p>
          </div>
          <dl className="grid grid-cols-2 gap-5 border-t border-line pt-5 lg:mb-1 lg:border-t-0 lg:border-l lg:pl-7" data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
            <div>
              <dt className="label-mono !text-[0.58rem]">Type</dt>
              <dd className="mt-2 text-sm text-fg">{project.type}</dd>
            </div>
            <div>
              <dt className="label-mono !text-[0.58rem]">Timeline</dt>
              <dd className="mt-2 text-sm text-fg">{project.year}</dd>
            </div>
          </dl>
        </div>

        <div className="relative mt-14 aspect-[16/7] overflow-hidden rounded-card border border-line/80 bg-ink-2" data-reveal>
          <Image src={project.image} alt={`${project.title} project visual`} fill priority sizes="(max-width: 1024px) 100vw, 1200px" className="object-cover opacity-85" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/65 via-transparent to-ink/25" />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <aside className="lg:sticky lg:top-28 lg:self-start" data-reveal>
            <p className="label-mono">At a glance</p>
            <ul className="mt-5 flex flex-wrap gap-2 lg:block">
              {project.technologies.map((tech) => <li key={tech} className="mb-2 inline-block rounded-full border border-line/80 px-3 py-1.5 font-mono text-xs text-muted lg:block lg:w-fit">{tech}</li>)}
            </ul>
            {project.links.length > 0 && (
              <ul className="mt-7 space-y-3 border-t border-line/70 pt-5">
                {project.links.map((link) => <li key={link.href}><a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-cyan hover:text-fg">{link.label} <ArrowUpRight size={14} /></a></li>)}
              </ul>
            )}
          </aside>

          <div className="max-w-2xl" data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
            <section>
              <p className="label-mono">The problem</p>
              <p className="mt-5 text-lg leading-8 text-fg">{project.caseStudy.problem}</p>
            </section>
            <section className="mt-14 border-t border-line/70 pt-8">
              <p className="label-mono">My role</p>
              <p className="mt-5 text-base leading-8 text-muted">{project.caseStudy.role}</p>
            </section>
            <section className="mt-14 border-t border-line/70 pt-8">
              <p className="label-mono">How it was built</p>
              <p className="mt-5 text-base leading-8 text-muted">{project.caseStudy.implementation}</p>
            </section>
            {project.caseStudy.architecture && (
              <section className="mt-14 border-t border-line/70 pt-8">
                <p className="label-mono">Architecture</p>
                <p className="mt-4 text-xs text-muted/80">{project.caseStudy.architecture.label}</p>
                <ol className="mt-5 space-y-0">
                  {project.caseStudy.architecture.flow.map((node, i, all) => (
                    <li key={node} className="relative border-l border-line/80 pb-5 pl-6 last:pb-0">
                      <span aria-hidden="true" className="absolute -left-[4.5px] top-2 size-2 rounded-full border border-cyan/60 bg-ink" />
                      <span className="font-mono text-xs text-muted/70">{String(i + 1).padStart(2, "0")}</span>
                      <p className="mt-1 text-sm text-fg">{node}</p>
                      {i === all.length - 1 && <span className="sr-only">End of flow</span>}
                    </li>
                  ))}
                </ol>
              </section>
            )}
            <section className="mt-14 border-t border-line/70 pt-8">
              <p className="label-mono">My contributions</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {project.contributions.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted"><Check size={16} className="mt-1 shrink-0 text-cyan" />{item}</li>)}
              </ul>
            </section>
            {project.caseStudy.challenges && (
              <section className="mt-14 border-t border-line/70 pt-8">
                <p className="label-mono">What was hard</p>
                <ul className="mt-5 space-y-3">
                  {project.caseStudy.challenges.map((item) => <li key={item} className="flex gap-3 text-sm leading-7 text-muted"><span aria-hidden="true" className="mt-2.5 size-1 shrink-0 rounded-full bg-cyan/70" />{item}</li>)}
                </ul>
              </section>
            )}
            {project.caseStudy.lessons && (
              <section className="mt-14 border-t border-line/70 pt-8">
                <p className="label-mono">What I took from it</p>
                <ul className="mt-5 space-y-3">
                  {project.caseStudy.lessons.map((item) => <li key={item} className="flex gap-3 text-sm leading-7 text-muted"><span aria-hidden="true" className="mt-2.5 size-1 shrink-0 rounded-full bg-blue/70" />{item}</li>)}
                </ul>
              </section>
            )}
          </div>
        </div>

        <div className="mt-20 flex items-center justify-between border-t border-line/70 pt-7">
          <Link href="/projects" className="text-sm text-muted hover:text-fg">Project archive</Link>
          <Link href={`/projects/${nextProject.slug}`} className="group inline-flex items-center gap-2 text-sm text-cyan hover:text-fg">Next case study <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link>
        </div>
      </div>
    </article>
  );
}
