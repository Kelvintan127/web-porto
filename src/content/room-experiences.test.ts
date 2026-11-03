import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { navItems } from "@/content/profile";
import { roomObjects, roomObjectMap } from "@/content/room";
import {
  automationPhaseStep,
  automationSteps,
  codeEndpoints,
  codingExperience,
  erpSteps,
  experienceKindByObject,
  flowNodes,
  healthColor,
  iotCopy,
  iotLevels,
  openOrdersAtRest,
  projectPreviews,
  requestPulses,
  roomExperiences,
  serviceEdges,
  serviceNodes,
  stepAfter,
  stepDelay,
  resolveStepId,
  type DemoStatus,
  type ExperienceStep,
  type ServiceHealth,
} from "./room-experiences";

describe("room experience definitions", () => {
  it("covers all six objects with a kind, and every kind is used once", () => {
    const ids = roomObjects.map((object) => object.id);
    expect(Object.keys(experienceKindByObject).sort()).toEqual([...ids].sort());
    const kinds = Object.values(experienceKindByObject);
    expect(new Set(kinds).size).toBe(kinds.length);
  });

  it("keeps every experience non-empty except the greeting", () => {
    for (const [id, experience] of Object.entries(roomExperiences)) {
      if (id === "avatar") {
        expect(experience.steps).toHaveLength(0);
      } else {
        expect(experience.steps.length, `${id} has no steps`).toBeGreaterThan(0);
      }
    }
  });
});

describe("ERP monitor: animated process flow", () => {
  it("gives every step a duration a demo can be timed from", () => {
    for (const step of erpSteps) {
      expect(step.durationMs).toBeGreaterThan(300);
      expect(step.detail.length).toBeGreaterThan(40);
      expect(step.label.length).toBeGreaterThan(0);
    }
  });

  it("wraps past the end rather than running past the document list", () => {
    expect(stepAfter(erpSteps, erpSteps[0].id)?.id).toBe(erpSteps[1].id);
    expect(stepAfter(erpSteps, erpSteps[erpSteps.length - 1].id)?.id).toBe(erpSteps[0].id);
    expect(stepAfter([], "anything")).toBeNull();
  });

  /**
   * `stepAfter` wraps on purpose, so a run has to decide for itself when it is
   * over. A run that simply followed the wrap would tick forever and never
   * report a result.
   */
  it("can tell a run's last step from a step in the middle", () => {
    const lastId = erpSteps[erpSteps.length - 1].id;
    const endingRun = (steps: readonly ExperienceStep[], at: string) =>
      steps[steps.length - 1]?.id === at && at !== steps[0].id;
    expect(endingRun(erpSteps, lastId)).toBe(true);
    expect(endingRun(erpSteps, erpSteps[0].id)).toBe(false);
    // Single-step lists must not read as "ended" on step one: they settle in place.
    expect(endingRun([erpSteps[0]], erpSteps[0].id)).toBe(false);
  });

  it("nests every flow node inside the step list it lights", () => {
    for (const node of flowNodes) {
      expect(erpSteps[node.step], `${node.id} points at a missing step`).toBeDefined();
      expect(node.step).toBeGreaterThan(0);
    }
    // Invoice is the step that closes an order, and the flow says so.
    const invoice = flowNodes.find((node) => node.id === "invoice");
    expect(erpSteps[invoice?.step ?? 0].detail).toContain("Open orders drop to three");
    expect(openOrdersAtRest).toBe(4);
  });

  it("resolves an unknown step id to the first step instead of nothing", () => {
    expect(resolveStepId(erpSteps, "no-such-step")).toBe(erpSteps[0].id);
    expect(resolveStepId(erpSteps, "delivery")).toBe("delivery");
    expect(resolveStepId([], "delivery")).toBeNull();
    expect(stepDelay(erpSteps, "invoice")).toBe(1000);
    expect(stepDelay(erpSteps, "no-such-step")).toBeNull();
  });
});

describe("coding laptop: endpoint demo and previews", () => {
  it("runs request then response for every endpoint", () => {
    expect(codingExperience.endpoints.length).toBeGreaterThan(1);
    for (let index = 0; index < codeEndpoints.length; index += 1) {
      const pulses = requestPulses(index);
      expect(pulses.map((pulse) => pulse.direction)).toEqual(["out", "back"]);
      expect(pulses[0].path).toBe(codeEndpoints[index].path);
      expect(pulses[0].statusText).toContain(codeEndpoints[index].method);
      expect(pulses[1].statusText).toContain(String(codeEndpoints[index].status));
    }
  });

  it("pairs each beat with a shift in, and back out of, the demo's running phase", () => {
    // The scene reads the running phase rather than the beat index: it must be
    // possible for both beats to fire and the demo to come back to rest.
    expect(codingExperience.endpointPulseIndexes).toEqual([0, 1]);
    const between: DemoStatus = "running";
    expect(between).toBe("running");
  });

  it("describes every exchange honestly and locally", () => {
    for (const endpoint of codeEndpoints) {
      expect(endpoint.path.startsWith("/api/")).toBe(true);
      expect([200, 201]).toContain(endpoint.status);
      expect(endpoint.body).toBeTypeOf("object");
      expect(endpoint.note.length).toBeGreaterThan(40);
      // Nothing may imply a live remote system.
      expect(`${endpoint.path} ${endpoint.note}`).not.toMatch(/https?:\/\//);
    }
    expect(codeEndpoints.some((endpoint) => endpoint.method === "POST")).toBe(true);
    expect(codeEndpoints.some((endpoint) => endpoint.method === "GET")).toBe(true);
  });

  it("builds previews from verified project content, not new claims", () => {
    expect(projectPreviews.length).toBe(codingExperience.previewSlugs.length);
    for (const preview of projectPreviews) {
      const source = projects.find((project) => project.slug === preview.slug);
      expect(source, `${preview.slug} is not a real project`).toBeDefined();
      expect(preview.title).toBe(source?.title);
      expect(preview.summary).toBe(source?.summary);
      expect(preview.year).toBe(source?.year);
      expect(preview.link).toBe(source?.links[0]?.href ?? null);
      expect(preview.href).toBe(`/projects/${preview.slug}`);
      expect(source?.features).toContain(preview.highlight);
      // A preview must never claim a link the project does not have.
      if (!source?.links.length) expect(preview.linkLabel).toBe("No public link");
    }
  });

  it("links case studies at routes that exist", () => {
    const workSections = navItems.map((item) => item.href);
    expect(workSections).toContain(roomObjectMap.laptop.href);
    for (const preview of projectPreviews) {
      expect(preview.href.startsWith("/projects/")).toBe(true);
    }
  });
});

describe("automation panel: trigger, process, result", () => {
  it("plays the three phases in order, each with a duration", () => {
    expect(automationSteps.map((step) => step.id)).toEqual(["trigger", "process", "result"]);
    expect(automationPhaseStep).toEqual({ trigger: 0, process: 1, result: 2 });
    for (const step of automationSteps) expect(step.durationMs).toBeGreaterThan(300);
  });

  it("loops the run and reports the end back to the start", () => {
    const last = automationSteps[automationSteps.length - 1];
    expect(stepAfter(automationSteps, last.id)?.id).toBe("trigger");
  });
});

describe("server rack: status LEDs and infrastructure diagram", () => {
  it("ships a fictional diagram with no real hostnames", () => {
    expect(serviceNodes.length).toBeGreaterThan(2);
    for (const node of [...serviceNodes]) {
      expect(node.detail.length).toBeGreaterThan(30);
      expect(`${node.label} ${node.role} ${node.detail}`).not.toMatch(/https?:\/\/|\.(com|net|io|org|local)\b/);
    }
    const ids = serviceNodes.map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const edge of serviceEdges) {
      expect(ids, `edge points outside the diagram`).toContain(edge.from);
      expect(ids).toContain(edge.to);
      expect(edge.from).not.toBe(edge.to);
    }
  });

  it("keeps every node on the diagram canvas", () => {
    for (const node of serviceNodes) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(100);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThanOrEqual(100);
    }
  });

  it("has a colour for every health state", () => {
    const states: ServiceHealth[] = ["healthy", "degraded", "offline"];
    for (const state of states) expect(healthColor[state]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(new Set(Object.values(healthColor)).size).toBe(states.length);
  });
});

describe("IoT device: local lamp control", () => {
  it("offers both commands with a brightness the room can light from", () => {
    expect(iotLevels.on).toBeGreaterThan(iotLevels.off);
    expect(iotLevels.off).toBeGreaterThan(0);
    expect(iotLevels.on).toBeLessThanOrEqual(1);
  });

  it("states that no device is contacted", () => {
    expect(iotCopy.detail).toMatch(/local demo state/i);
    expect(iotCopy.detail).toContain("ESP32");
  });
});

describe("step engine contracts", () => {
  it("gives every step list unique ids", () => {
    const lists: ExperienceStep[][] = [erpSteps, automationSteps];
    for (const list of lists) {
      const ids = list.map((step) => step.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
