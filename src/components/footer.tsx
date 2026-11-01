import Link from "next/link";
import { profile } from "@/content/profile";

export function Footer() {
  return (
    <footer className="border-t border-line/70">
      <div className="container-x flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-sm text-fg">
            {profile.name}
            <span className="text-cyan">.</span>
          </p>
          <p className="mt-1 text-[0.8125rem] text-muted">
            {profile.title} · {profile.location}
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8125rem] text-muted">
          <li>
            <a className="transition-colors hover:text-fg" href={`mailto:${profile.email}`}>
              Email
            </a>
          </li>
          <li>
            <a className="transition-colors hover:text-fg" href={profile.links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a className="transition-colors hover:text-fg" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <Link className="transition-colors hover:text-fg" href="/projects">
              All projects
            </Link>
          </li>
        </ul>
      </div>
      <div className="container-x pb-8">
        <p className="text-[0.6875rem] text-muted/70">
          © {new Date().getFullYear()} {profile.name}. Built with Next.js and Three.js.
        </p>
      </div>
    </footer>
  );
}
