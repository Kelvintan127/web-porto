import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";

const base = "https://klveen.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/projects"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date("2026-11-01"),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const projectRoutes = projects.map((project) => ({
    url: `${base}/projects/${project.slug}`,
    lastModified: new Date("2026-11-01"),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...projectRoutes];
}
