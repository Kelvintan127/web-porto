"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/content/projects";

export function SkillExplorer({
  groups,
  projects,
}: {
  groups: readonly { readonly category: string; readonly skills: readonly string[]; readonly projectSlugs: readonly string[] }[];
  projects: Project[];
}) {
  const [active, setActive] = useState(0);
  const group = groups[active];
  const related = projects.filter((p) => group.projectSlugs.includes(p.slug));

  return (
    <div data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
      <div role="tablist" aria-label="Skill categories" className="flex flex-wrap gap-2">
        {groups.map((g, i) => (
          <button
            key={g.category}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
              i === active
                ? "border-cyan/60 bg-cyan/10 text-cyan"
                : "border-line text-muted hover:border-line/90 hover:text-fg"
            }`}
          >
            {g.category}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-7">
        <ul className="flex flex-wrap gap-2">
          {group.skills.map((skill) => (
            <li
              key={skill}
              className="rounded-lg border border-line/80 bg-ink-2/60 px-3 py-2 font-mono text-xs text-fg"
            >
              {skill}
            </li>
          ))}
        </ul>

        {related.length > 0 ? (
          <p className="mt-6 text-xs leading-5 text-muted">
            Applied in{" "}
            {related.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && ", "}
                <Link href={`/projects/${p.slug}`} className="text-cyan/90 underline decoration-cyan/30 underline-offset-4 hover:text-cyan">
                  {p.title}
                </Link>
              </span>
            ))}
            .
          </p>
        ) : (
          <p className="mt-6 text-xs leading-5 text-muted">
            Part of my current ERP consulting work. Specifics stay general because enterprise details are not public.
          </p>
        )}
      </div>
    </div>
  );
}
