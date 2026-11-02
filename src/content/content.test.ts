import { describe, expect, it } from "vitest";
import { featuredProjects, playgroundProjects, projects } from "./projects";
import { experience, journey, skillGroups } from "./career";
import { about } from "./profile";

describe("portfolio content integrity", () => {
  it("has unique project slugs and documented contributions", () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const project of projects) {
      expect(project.slug).toMatch(/^[a-z0-9-]+$/);
      expect(project.contributions.length).toBeGreaterThan(0);
    }
  });

  it("keeps featured priority aligned with confirmed CV projects", () => {
    expect(featuredProjects.map((project) => project.slug)).toEqual([
      "ykk-scholarship-management",
      "longevitology-attendance",
      "bayar-cepat",
    ]);
  });

  it("links skills only to projects that exist", () => {
    const slugs = new Set(projects.map((project) => project.slug));
    for (const group of skillGroups) {
      for (const slug of group.projectSlugs) expect(slugs.has(slug)).toBe(true);
    }
  });

  it("keeps chronology newest first and current role at top", () => {
    expect(experience[0].current).toBe(true);
    expect(experience[0].role).toBe("ERP Consultant");
    expect(experience.at(-1)?.company).toBe("BINUS University");
  });

  it("gives every project a case study with problem, role, and implementation", () => {
    for (const project of projects) {
      expect(project.caseStudy.problem.length).toBeGreaterThan(40);
      expect(project.caseStudy.role.length).toBeGreaterThan(20);
      expect(project.caseStudy.implementation.length).toBeGreaterThan(40);
    }
  });

  it("draws architecture flows only from the project's own stack", () => {
    for (const project of projects) {
      const flow = project.caseStudy.architecture?.flow;
      if (!flow) continue;
      expect(flow.length).toBeGreaterThanOrEqual(3);
      for (const node of flow) expect(node.trim()).not.toBe("");
      const stack = project.technologies.join(" ").toLowerCase();
      const named = flow.filter((node) =>
        project.technologies.some((tech) => node.toLowerCase().includes(tech.split(".")[0].toLowerCase())),
      );
      expect(named.length).toBeGreaterThan(0);
      expect(stack).toContain(project.technologies[0].split(".")[0].toLowerCase());
    }
  });

  it("never sends readers to a bare GitHub profile as project evidence", () => {
    const links = [
      ...projects.flatMap((project) => project.links),
      ...playgroundProjects.flatMap((item) => item.links),
    ];
    for (const link of links) {
      expect(link.href).toMatch(/^https:\/\//);
      expect(link.href.replace(/\/$/, "")).not.toBe("https://github.com/kelvintan127");
      expect(link.href.replace(/\/$/, "")).not.toBe("https://github.com/Kelvintan127");
    }
  });

  it("lists only playground experiments with a real subject", () => {
    expect(playgroundProjects.length).toBeGreaterThanOrEqual(3);
    const titles = playgroundProjects.map((item) => item.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const item of playgroundProjects) {
      expect(item.description.length).toBeGreaterThan(40);
      expect(item.technologies.length).toBeGreaterThan(0);
      expect(item.title).not.toMatch(/small systems|useful experiments|placeholder/i);
    }
  });

  it("keeps public copy free of defensive verification notes", () => {
    const banned = /verified|unverified|no unverified|not claims|placeholder|scope note/i;
    const publicCopy = [
      ...projects.flatMap((project) => [project.summary, project.description, project.caseStudy.problem, project.caseStudy.role, project.caseStudy.implementation, ...(project.caseStudy.challenges ?? []), ...(project.caseStudy.lessons ?? [])]),
      ...playgroundProjects.flatMap((item) => [item.description]),
      about.lede,
      ...about.paragraphs,
    ];
    for (const text of publicCopy) expect(text).not.toMatch(banned);
  });

  it("tells the software-to-ERP journey in order", () => {
    expect(journey.stages.length).toBeGreaterThanOrEqual(3);
    expect(journey.stages[0].title).toMatch(/software/i);
    expect(journey.stages.at(-1)?.title).toMatch(/ERP/i);
  });
});
