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
      expect(project.role.length).toBeGreaterThan(0);
      expect(project.features.length).toBeGreaterThan(0);
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

  it("gives every project a showcase-ready feature list", () => {
    for (const project of projects) {
      expect(project.role.length).toBeGreaterThan(10);
      expect(project.features.length).toBeGreaterThanOrEqual(3);
      for (const feature of project.features) expect(feature.trim().length).toBeGreaterThan(8);
    }
  });

  it("keeps long-form case study fields out of the public data", () => {
    for (const project of projects) {
      expect(project).not.toHaveProperty("caseStudy");
      expect(project).not.toHaveProperty("description");
    }
  });

  it("labels every screenshot it does expose", () => {
    for (const project of projects) {
      for (const shot of project.screenshots ?? []) {
        expect(shot.src).toMatch(/^\/assets\//);
        expect(shot.alt.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("points every outbound link at a real public page", () => {
    const links = [
      ...projects.flatMap((project) => project.links),
      ...playgroundProjects.flatMap((item) => item.links),
    ];
    const repos = new Set([
      "https://github.com/kelvintan127/backend-bayarcepat",
      "https://github.com/kelvintan127/livechat",
    ]);
    for (const link of links) {
      if (link.href.includes("github.com")) expect(repos.has(link.href)).toBe(true);
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
    expect(playgroundProjects.length).toBeGreaterThanOrEqual(1);
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
      ...projects.flatMap((project) => [project.summary, project.role, ...project.features]),
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
