import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected software development projects by Kelvin Tan.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <div className="container-x min-h-[70vh] pb-24 pt-32 sm:pb-32">
      <Link href="/#work" className="mb-10 inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft size={15} /> Back home
      </Link>
      <div data-reveal>
        <SectionHeading eyebrow="Project archive" title="Selected projects and experiments." />
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
          A mix of backend, full-stack, and web work: what each project does, my role, the stack, and where to find it.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => <ProjectCard key={p.slug} project={p} />)}
      </div>
    </div>
  );
}
