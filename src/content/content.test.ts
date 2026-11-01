import { describe, expect, it } from "vitest";
import { featuredProjects, projects } from "./projects";
import { experience, skillGroups } from "./career";

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
});
