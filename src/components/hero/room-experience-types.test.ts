import { describe, expect, it } from "vitest";
import {
  activeId,
  backToRoomProgress,
  commandLogLine,
  cycleHealth,
  edgeHealth,
  healthSummary,
  idleState,
  initialHealth,
  isRunning,
  lampReadout,
  sceneProgress,
  statusLabel,
  type DemoState,
} from "./room-experience-types";
import { approach } from "./use-experience";
import { serviceEdges, serviceNodes, type ServiceHealth } from "@/content/room-experiences";

const states: DemoState[] = [
  idleState(),
  { phase: "stepping", step: "delivery" },
  { phase: "selected", id: "endpoint-1" },
  { phase: "running" },
  { phase: "toggling", id: "lamp", to: "on" },
  { phase: "greeting" },
];

describe("demo state", () => {
  it("narrows the step id for the phases that carry one", () => {
    expect(activeId({ phase: "stepping", step: "delivery" })).toBe("delivery");
    expect(activeId({ phase: "selected", id: "endpoint-1" })).toBe("endpoint-1");
    expect(activeId({ phase: "toggling", id: "lamp", to: "off" })).toBe("lamp");
    expect(activeId(idleState())).toBeNull();
    expect(activeId({ phase: "running" })).toBeNull();
    expect(activeId({ phase: "greeting" })).toBeNull();
  });

  it("treats only stepping, toggling, and running as work in progress", () => {
    expect(states.map(isRunning)).toEqual([false, true, false, true, true, false]);
  });

  it("reports a label for every phase", () => {
    expect(statusLabel({ phase: "stepping", step: "invoice" }, "running")).toBe("Step · invoice");
    expect(statusLabel({ phase: "running" }, "running")).toBe("Running");
    expect(statusLabel({ phase: "toggling", id: "lamp", to: "on" }, "running")).toBe("Turning on");
    expect(statusLabel({ phase: "greeting" }, "running")).toBe("Greeting");
    expect(statusLabel(idleState(), "complete")).toBe("Complete");
    expect(statusLabel(idleState(), "idle")).toBe("Idle");
  });
});

describe("scene progress passthrough", () => {
  it("never animates when reduced motion is set", () => {
    for (const state of states) {
      const progress = sceneProgress(state, true, true, true);
      // Demo progress is binary under reduced motion: no fraction is ever
      // published, so nothing downstream can animate a partial value.
      expect([0, 1]).toContain(progress.demo);
      expect([0, 1]).toContain(progress.flow);
      expect(progress.lamp).toBe(1);
    }
  });

  it("publishes a settled value, not a fraction, under reduced motion", () => {
    const idle = sceneProgress(idleState(), true, true, false);
    expect(idle.demo).toBe(0);
    expect(idle.flow).toBe(1);
    const running = sceneProgress({ phase: "running" }, true, true, false);
    expect(running.demo).toBe(1);
    // The lamp is also a state change, so it survives reduced motion.
    expect(sceneProgress({ phase: "selected", id: "on" }, true, true, true).lamp).toBe(1);
    expect(sceneProgress({ phase: "selected", id: "off" }, true, true, false).lamp).toBe(0.12);
  });

  it("leaves everything at rest when nothing is selected", () => {
    for (const state of states) {
      const progress = sceneProgress(state, false, false, false);
      expect(progress.flow).toBe(0);
      expect(progress.network).toBe(0);
      expect(progress.pulse).toBe(0);
      expect(progress.lamp).toBe(0.12);
    }
  });

  it("lights the network and pulse channels only while a demo is running", () => {
    const running = sceneProgress({ phase: "stepping", step: "delivery" }, false, true, false);
    expect(running.network).toBe(1);
    expect(running.pulse).toBe(1);
    const settled = sceneProgress({ phase: "stepping", step: "delivery" }, false, true, false);
    const paused = sceneProgress(idleState(), false, true, false);
    expect(settled.pulse).toBe(running.pulse);
    expect(paused.network).toBe(0);
    expect(backToRoomProgress.lamp).toBe(0.12);
    expect(backToRoomProgress.flow).toBe(0);
  });
});

describe("service health", () => {
  it("cycles healthy to degraded to offline and back", () => {
    const node = serviceNodes[0];
    let health: ServiceHealth = node.initial;
    const seen = [health];
    for (let step = 0; step < 3; step += 1) {
      health = cycleHealth(node, health);
      seen.push(health);
    }
    expect(seen).toEqual(["healthy", "degraded", "offline", "healthy"]);
  });

  it("starts every node healthy", () => {
    const health = initialHealth(serviceNodes);
    expect(Object.keys(health).sort()).toEqual(serviceNodes.map((node) => node.id).sort());
    for (const state of Object.values(health)) expect(state).toBe("healthy");
  });

  it("propagates the worse end of an edge onto the edge itself", () => {
    expect(edgeHealth({ a: "healthy", b: "healthy" }, "a", "b")).toBe("healthy");
    expect(edgeHealth({ a: "degraded", b: "healthy" }, "a", "b")).toBe("degraded");
    // Offline outranks degraded: a severed edge is not a slow edge.
    expect(edgeHealth({ a: "degraded", b: "offline" }, "a", "b")).toBe("offline");
  });

  it("says which services are affected, and says nothing is wrong when nothing is", () => {
    const healthy = initialHealth(serviceNodes);
    expect(healthSummary(healthy, serviceNodes)).toContain("All services healthy");
    const degraded = { ...healthy, [serviceNodes[0].id]: "degraded" as ServiceHealth };
    expect(healthSummary(degraded, serviceNodes)).toContain(`${serviceNodes[0].label} degraded`);
    const offline = { ...healthy, [serviceNodes[1].id]: "offline" as ServiceHealth };
    expect(healthSummary(offline, serviceNodes)).toContain("offline");
  });

  it("leaves no edge without a colour once a node drops out", () => {
    const health = { ...initialHealth(serviceNodes), [serviceNodes[0].id]: "offline" as ServiceHealth };
    for (const edge of serviceEdges) {
      expect(["healthy", "degraded", "offline"]).toContain(edgeHealth(health, edge.from, edge.to));
    }
  });
});

describe("lamp readout", () => {
  it("matches the levels the room lights from", () => {
    const on = lampReadout(true);
    const off = lampReadout(false);
    expect(on.level).toBe(1);
    expect(off.level).toBeCloseTo(0.12, 6);
    expect(on.state).toBe("on");
    expect(off.state).toBe("off");
    expect(on.note).not.toBe(off.note);
  });

  it("writes a command log line naming the command and the relay result", () => {
    const line = commandLogLine("on", true, Date.UTC(2026, 2, 2, 9, 14, 0));
    expect(line).toContain("ON");
    expect(line).toContain("relay -> closed");
    expect(line).toContain("09:14:00");
    expect(commandLogLine("off", false, 0)).toContain("relay -> open");
  });
});

describe("approach", () => {
  it("moves toward the target without overshooting", () => {
    let value = 0;
    for (let step = 0; step < 200; step += 1) value = approach(value, 1, 1 / 60, 8);
    expect(value).toBeGreaterThan(0.99);
    expect(value).toBeLessThanOrEqual(1);
    expect(approach(0.5, 0, 1 / 60, 8)).toBeGreaterThan(0);
    expect(approach(1, 1, 1 / 60, 8)).toBe(1);
  });
});
