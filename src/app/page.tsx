import Link from "next/link";
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import { RoomHero } from "@/components/hero/room-hero";
import { heroCopy } from "@/content/room";
import { profile, about } from "@/content/profile";
import { featuredProjects } from "@/content/projects";
import { experience, skillGroups } from "@/content/career";
import { ProjectCard } from "@/components/project-card";
import { ContactPanel } from "@/components/contact-panel";
import { SkillExplorer } from "@/components/skill-explorer";
import { Playground } from "@/components/playground";
import { SectionHeading } from "@/components/section-heading";

export default function HomePage() {
  return (
    <>
      <section id="home" className="relative isolate min-h-[min(860px,100svh)] overflow-hidden pt-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-48 top-12 size-[42rem] rounded-full bg-cyan/[0.035] blur-[110px]" />
          <div className="absolute left-[-18rem] top-1/3 size-[32rem] rounded-full bg-blue/[0.05] blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(#52647e_0.7px,transparent_0.7px)] [background-size:29px_29px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
        </div>

        <div className="container-x grid min-h-[calc(min(860px,100svh)-4rem)] items-center gap-8 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-9 flex items-center gap-3" data-reveal>
              <span className="size-2 rounded-full bg-cyan shadow-[0_0_16px_rgba(100,233,208,0.8)]" />
              <span className="label-mono">{heroCopy.eyebrow}</span>
            </div>
            <h1 className="max-w-[13ch] font-display text-hero font-medium leading-[0.96] tracking-[-0.055em] text-fg" data-reveal style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
              {heroCopy.headlineLead} <span className="bg-gradient-to-r from-cyan via-[#a0f3df] to-blue bg-clip-text text-transparent">{heroCopy.headlineAccent}</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8" data-reveal style={{ "--reveal-delay": "150ms" } as React.CSSProperties}>
              {heroCopy.intro}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3" data-reveal style={{ "--reveal-delay": "220ms" } as React.CSSProperties}>
              <Link href="#work" className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-cyan px-5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5">
                Explore my work <ArrowDownRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </Link>
              <Link href="#about" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium text-fg transition-colors hover:border-cyan/50">
                Get to know me <ArrowRight size={15} />
              </Link>
              <a href={profile.cvPath} download className="inline-flex min-h-12 items-center gap-2 px-3 text-sm text-muted transition-colors hover:text-fg">
                Download CV <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted" data-reveal style={{ "--reveal-delay": "280ms" } as React.CSSProperties}>
              <span className="inline-flex items-center gap-2"><MapPin size={14} className="text-cyan" />{profile.location}</span>
              <a className="inline-flex items-center gap-2 transition-colors hover:text-fg" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={14} />LinkedIn</a>
              <a className="inline-flex items-center gap-2 transition-colors hover:text-fg" href={profile.links.github} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={14} />GitHub</a>
            </div>
          </div>

          <RoomHero />
        </div>

        <div className="container-x absolute bottom-0 left-1/2 hidden -translate-x-1/2 items-center justify-between pb-7 text-[0.65rem] text-muted/70 sm:flex">
          <span className="label-mono !text-[0.58rem]">Portfolio · 2026</span>
          <a href="#about" className="group inline-flex items-center gap-2 label-mono !text-[0.58rem] hover:text-fg">
            Scroll to explore <ArrowDown size={13} className="transition-transform group-hover:translate-y-1" />
          </a>
        </div>
      </section>

      <div className="container-x"><div className="hairline" /></div>

      <section id="about" className="container-x scroll-mt-24 py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div data-reveal>
            <SectionHeading eyebrow="A little about me" title="Technology makes more sense when you understand the work." />
            <div className="mt-10 hidden max-w-xs rounded-card border border-line/70 bg-ink-2/50 p-5 sm:block">
              <Sparkles size={17} className="text-cyan" />
              <p className="mt-4 font-display text-lg leading-7 text-fg">Curious about the details. Interested in the bigger picture.</p>
              <p className="mt-2 text-sm leading-6 text-muted">That balance is what drew me from writing software toward ERP and business systems.</p>
            </div>
          </div>
          <div data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
            <p className="font-display text-xl font-medium leading-8 text-fg sm:text-2xl sm:leading-9">{about.lede}</p>
            <div className="mt-6 max-w-2xl space-y-4 text-[0.9375rem] leading-7 text-muted">
              {about.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
            <dl className="mt-10 grid grid-cols-1 gap-x-7 gap-y-5 border-t border-line/70 pt-6 sm:grid-cols-2">
              {about.facts.map((item) => (
                <div key={item.label}>
                  <dt className="label-mono !text-[0.6rem]">{item.label}</dt>
                  <dd className="mt-1.5 text-sm text-fg">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section id="work" className="scroll-mt-20 bg-ink-2/35 py-24 sm:py-32">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end" data-reveal>
            <SectionHeading eyebrow="Selected work" title="Projects that do something useful." />
            <Link href="/projects" className="group inline-flex items-center gap-2 pb-1 text-sm text-muted transition-colors hover:text-cyan">View all projects <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {featuredProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}
          </div>
          <p className="mt-5 text-xs leading-5 text-muted/75">Project descriptions reflect CV details and publicly available information; no unverified outcome claims.</p>
        </div>
      </section>

      <section id="experience" className="container-x scroll-mt-20 py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div data-reveal>
            <SectionHeading eyebrow="Where I have worked" title="Experience, in context." />
            <p className="mt-5 max-w-sm text-sm leading-6 text-muted">A path from building software to working with enterprise applications and business processes.</p>
          </div>
          <ol className="relative border-l border-line/80 pl-7 sm:pl-9">
            {experience.map((item, i) => (
              <li key={`${item.role}-${item.company}`} className="relative pb-10 last:pb-0" data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}>
                <span className={`absolute -left-[2.1rem] top-1.5 size-2.5 rounded-full border ${item.current ? "border-cyan bg-cyan shadow-[0_0_14px_rgba(100,233,208,0.5)]" : "border-muted/60 bg-ink"} sm:-left-[2.6rem]`} aria-hidden="true" />
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                  <h3 className="font-display text-lg font-medium text-fg">{item.role}</h3>
                  <span className="label-mono !text-[0.58rem]">{item.period}</span>
                </div>
                <p className="mt-1 text-sm text-cyan/90">{item.company}</p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{item.description}</p>
                {item.details.length > 0 && <ul className="mt-3 flex flex-wrap gap-2">{item.details.map((d) => <li key={d} className="rounded-full border border-line/70 px-2.5 py-1 text-[0.65rem] text-muted">{d}</li>)}</ul>}
              </li>
            ))}
            <li className="relative pt-10" data-reveal>
              <span className="absolute -left-[2.1rem] top-11 size-2.5 rounded-full border border-blue/60 bg-ink sm:-left-[2.6rem]" aria-hidden="true" />
              <h3 className="font-display text-lg font-medium text-fg">Bachelor of Computer Science</h3>
              <p className="mt-1 text-sm text-cyan/90">Bina Nusantara University</p>
              <p className="mt-2 text-xs text-muted">2025 · GPA 3.39</p>
            </li>
          </ol>
        </div>
      </section>

      <section id="stack" className="scroll-mt-20 border-y border-line/70 bg-ink-2/35 py-24 sm:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div data-reveal>
            <SectionHeading eyebrow="Tools and concepts" title="A practical toolkit, still growing." />
            <p className="mt-5 max-w-sm text-sm leading-6 text-muted">Grouped by the work they support. Select a skill category to see its related projects where that connection is documented.</p>
          </div>
          <SkillExplorer groups={skillGroups} projects={featuredProjects} />
        </div>
      </section>

      <section id="playground" className="container-x scroll-mt-20 py-24 sm:py-32">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end" data-reveal>
          <div>
            <SectionHeading eyebrow="Engineering playground" title="Things I build to learn." />
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted">Small projects and experiments across IoT, real-time apps, and web development. A place for curiosity, not claims.</p>
          </div>
          <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 pb-1 text-sm text-muted transition-colors hover:text-cyan">More on GitHub <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a>
        </div>
        <Playground />
      </section>

      <section id="contact" className="scroll-mt-20 border-t border-line/70 bg-[radial-gradient(ellipse_at_50%_100%,rgba(100,233,208,0.07),transparent_48%)] py-24 sm:py-32">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div data-reveal>
            <SectionHeading eyebrow="Get in touch" title="Let’s connect." />
            <p className="mt-5 max-w-md text-sm leading-7 text-muted">Whether it’s a project, a technical discussion, or just a conversation about technology, feel free to reach out.</p>
          </div>
          <div data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
            <ContactPanel />
          </div>
        </div>
      </section>
    </>
  );
}
