import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/projects";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-card border border-line/70 bg-surface/30 transition-colors duration-300 hover:border-cyan/40 focus-visible:border-cyan/60"
      data-reveal
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-2">
        <Image
          src={project.image}
          alt={`${project.title} preview`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover opacity-85 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-90" />
        <span className="absolute left-4 top-4 rounded-full border border-line/70 bg-ink/70 px-2.5 py-1 font-mono text-[0.6rem] tracking-widest text-muted backdrop-blur-sm">
          {project.number}
        </span>
        <span
          aria-hidden="true"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-line/70 bg-ink/70 text-cyan opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        >
          <ArrowUpRight size={14} />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="label-mono !text-[0.55rem]">{project.type}</p>
        <h3 className="mt-2 font-display text-xl font-medium leading-7 tracking-[-0.02em] text-fg">{project.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted">{project.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 3).map((tech) => (
            <li key={tech} className="rounded-full border border-line/60 px-2 py-0.5 font-mono text-[0.58rem] text-muted">
              {tech}
            </li>
          ))}
          {project.technologies.length > 3 && (
            <li className="px-1 py-0.5 font-mono text-[0.58rem] text-muted/60">+{project.technologies.length - 3}</li>
          )}
        </ul>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-cyan/90 transition-colors group-hover:text-cyan">
          View project
          <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" />
        </span>
      </div>
    </Link>
  );
}
