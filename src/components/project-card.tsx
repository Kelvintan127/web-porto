import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-card border border-line/80 bg-surface/40 transition-colors hover:border-cyan/40"
      data-reveal
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-2">
        <Image
          src={project.image}
          alt={`${project.title} preview`}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-surface/90 via-ink/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-line/80 bg-ink/70 px-2.5 py-1 font-mono text-[0.6rem] tracking-widest text-muted backdrop-blur-sm">
          {project.number}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="label-mono !text-[0.58rem]">{project.type}</p>
        <h3 className="mt-2 font-display text-lg font-medium leading-6 text-fg">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted">{project.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <li key={tech} className="rounded-full border border-line/70 px-2 py-0.5 font-mono text-[0.6rem] text-muted">
              {tech}
            </li>
          ))}
        </ul>
        <span className="mt-5 inline-flex items-center gap-1.5 text-xs text-cyan">
          Read case study
          <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
