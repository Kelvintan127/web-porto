import Image from "next/image";
import { playgroundProjects } from "@/content/projects";

export function Playground() {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {playgroundProjects.map((item, i) => (
        <article
          key={item.title}
          className="group relative flex flex-col overflow-hidden rounded-card border border-line/70 bg-ink-2/50 p-5 transition-colors hover:border-cyan/35"
          data-reveal
          style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
        >
          <div className="flex items-center justify-between">
            <span className="label-mono !text-[0.58rem]">{item.category}</span>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-cyan/60" />
          </div>
          <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-lg bg-ink">
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover opacity-70 transition-opacity group-hover:opacity-95"
            />
          </div>
          <h3 className="mt-4 font-display text-base font-medium text-fg">{item.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted">{item.description}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {item.technologies.map((t) => (
              <li key={t} className="rounded-full border border-line/60 px-2 py-0.5 font-mono text-[0.58rem] text-muted">
                {t}
              </li>
            ))}
          </ul>
          {item.links.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3 text-xs">
              {item.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-cyan/90 underline decoration-cyan/30 underline-offset-4 hover:text-cyan">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
