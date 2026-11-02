"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { projects, type Project } from "@/content/projects";

export function ProjectShowcase() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<Project | null>(null);

  function open(project: Project) {
    setActive(project);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    setActive(null);
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <article
            key={project.slug}
            className="group relative flex flex-col overflow-hidden rounded-card border border-line/70 bg-surface/30 transition-colors duration-300 hover:border-cyan/40"
            data-reveal
            style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-ink-2">
              <Image
                src={project.image}
                alt={`${project.title} preview`}
                fill
                priority={i === 0}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-85 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-90" />
              <span className="absolute left-4 top-4 rounded-full border border-line/70 bg-ink/70 px-2.5 py-1 font-mono text-[0.6rem] tracking-widest text-muted backdrop-blur-sm">
                {project.number}
              </span>
            </div>

            <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
              <p className="label-mono !text-[0.55rem]">{project.type}</p>
              <h3 className="mt-2 font-display text-xl font-medium leading-7 tracking-[-0.02em] text-fg">{project.title}</h3>
              <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted">{project.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 3).map((tech) => (
                  <li key={tech} className="rounded-full border border-line/60 px-2 py-0.5 font-mono text-[0.58rem] text-muted">{tech}</li>
                ))}
              </ul>
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => open(project)}
                  aria-haspopup="dialog"
                  className="inline-flex min-h-11 items-center gap-1.5 text-xs text-cyan/90 transition-colors hover:text-cyan"
                >
                  Quick view <ArrowUpRight size={13} />
                </button>
                <Link href={`/projects/${project.slug}`} className="inline-flex min-h-11 items-center text-xs text-muted transition-colors hover:text-fg">
                  Full page
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setActive(null)}
        onClick={(e) => { if (e.target === dialogRef.current) close(); }}
        aria-labelledby="showcase-title"
        className="w-[min(56rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] rounded-card border border-line/80 bg-ink p-0 text-fg backdrop:bg-ink/80 backdrop:backdrop-blur-sm open:grid"
      >
        {active && (
          <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-line/70 px-5 py-4">
              <div>
                <p className="label-mono !text-[0.55rem]">{active.type} · {active.year}</p>
                <h2 id="showcase-title" className="mt-1.5 font-display text-xl font-medium tracking-[-0.02em]">{active.title}</h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close project details"
                className="grid size-11 shrink-0 place-items-center rounded-full border border-line/70 text-muted transition-colors hover:border-cyan/50 hover:text-fg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain px-5 py-5">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-ink-2">
                <Image src={active.image} alt={`${active.title} visual`} fill sizes="(max-width: 896px) 100vw, 56rem" className="object-cover" />
              </div>
              <p className="mt-5 text-sm leading-7 text-muted">{active.summary}</p>

              <p className="label-mono mt-7 !text-[0.55rem]">My role</p>
              <p className="mt-2 text-sm leading-7 text-fg">{active.role}</p>

              <p className="label-mono mt-7 !text-[0.55rem]">Key features</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {active.features.map((feature) => (
                  <li key={feature} className="rounded-lg border border-line/60 px-3 py-2 text-xs leading-6 text-muted">{feature}</li>
                ))}
              </ul>

              <p className="label-mono mt-7 !text-[0.55rem]">Stack</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {active.technologies.map((tech) => (
                  <li key={tech} className="rounded-full border border-line/60 px-2.5 py-1 font-mono text-[0.6rem] text-muted">{tech}</li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line/70 pt-5">
                {active.links.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm text-cyan hover:text-fg">
                    {link.label} <ArrowUpRight size={14} />
                  </a>
                ))}
                <Link href={`/projects/${active.slug}`} onClick={close} className="inline-flex min-h-11 items-center text-sm text-muted hover:text-fg">
                  Open full page
                </Link>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
