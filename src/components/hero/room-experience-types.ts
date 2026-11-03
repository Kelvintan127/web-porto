/**
 * Types and helpers for the interactive room objects.
 *
 * Kept free of React and three.js so the state machines can be unit tested in a
 * plain node environment. The scene only draws the state it is handed; no rule
 * about how a demo advances lives in `hero-canvas.tsx`.
 */

import type { DemoStatus } from "@/content/room-experiences";
import { healthColor, type ServiceHealth } from "@/content/room-experiences";
import type { ServiceNode } from "@/content/room-experiences";

/** Explicit phase of every demo, so the renderer has one value to switch on. */
export type DemoState =
  | { phase: "idle" }
  | { phase: "stepping"; step: string }
  | { phase: "selected"; id: string }
  | { phase: "running" }
  | { phase: "toggling"; id: string; to: "on" | "off" }
  | { phase: "greeting" };

/** Idle state per object kind; the single place "what nothing looks like" is defined. */
export const idleState = (): DemoState => ({ phase: "idle" });

/** Narrows a demo state to the step id currently in flight, if any. */
export function activeId(state: DemoState): string | null {
  if (state.phase === "selected" || state.phase === "toggling") return state.id;
  if (state.phase === "stepping") return state.step;
  return null;
}

export function isRunning(state: DemoState): boolean {
  return state.phase === "running" || state.phase === "stepping" || state.phase === "toggling";
}

/**
 * Progress passed into the 3D scene. Everything is 0..1 and reduced motion gets
 * a settled 1, so a renderer never needs to know about the preference.
 */
export type SceneProgress = {
  /** True while the object's demo is executing something. */
  demo: number;
  /** Advance along the ERP flow, 0 at rest to 1 after the last step. */
  flow: number;
  /** Laptop network LED. */
  network: number;
  /** Automation panel pulse: the trigger -> process -> result sweep. */
  pulse: number;
  /** Lamp brightness. */
  lamp: number;
};

export const backToRoomProgress: SceneProgress = { demo: 0, flow: 0, network: 0, pulse: 0, lamp: 0.12 };

/**
 * Progress for a given prefer-reduced-motion setting. Reduced motion never
 * animates: the demo reads as finished so the outcome stays visible.
 */
export function sceneProgress(
  state: DemoState,
  reducedMotion: boolean,
  active: boolean,
  lit: boolean,
): SceneProgress {
  const moving = active && isRunning(state);
  const demo = moving || state.phase === "selected" || state.phase === "greeting" ? 1 : 0;
  return {
    demo: reducedMotion ? (demo > 0 ? 1 : 0) : demo,
    flow: active ? 1 : 0,
    network: active ? (moving ? 1 : 0) : 0,
    pulse: active && moving ? 1 : 0,
    lamp: lit ? 1 : 0.12,
  };
}

/** Plain-text state label for the panel's status readout. */
export function statusLabel(state: DemoState, status: DemoStatus): string {
  if (state.phase === "stepping") return `Step · ${state.step}`;
  if (state.phase === "selected") return `Selected · ${state.id}`;
  if (state.phase === "running") return "Running";
  if (state.phase === "toggling") return state.to === "on" ? "Turning on" : "Turning off";
  if (state.phase === "greeting") return "Greeting";
  return status === "complete" ? "Complete" : "Idle";
}

/** Next health state in the node's cycle: healthy -> degraded -> offline -> healthy. */
export function cycleHealth(node: ServiceNode, current: ServiceHealth): ServiceHealth {
  const index = node.cycle.indexOf(current);
  return node.cycle[(index + 1) % node.cycle.length];
}

export const initialHealth = (nodes: readonly ServiceNode[]): Record<string, ServiceHealth> =>
  Object.fromEntries(nodes.map((node) => [node.id, node.initial]));

/**
 * Offline storage is not degraded storage: a node that is offline loses its
 * edges, and that loss is what colour-codes the edge. Redrawing the diagram on
 * a status change is the whole point of the interaction.
 */
export function edgeHealth(
  health: Record<string, ServiceHealth>,
  from: string,
  to: string,
): ServiceHealth {
  const ends = [health[from], health[to]];
  if (ends.includes("offline")) return "offline";
  if (ends.includes("degraded")) return "degraded";
  return "healthy";
}

export const healthHex = (health: ServiceHealth): string => healthColor[health];

/** Sentence for the panel's live summary, so the effect of each toggle is stated. */
export function healthSummary(health: Record<string, ServiceHealth>, nodes: readonly ServiceNode[]): string {
  const offline = nodes.filter((node) => health[node.id] === "offline");
  const degraded = nodes.filter((node) => health[node.id] === "degraded");
  if (offline.length > 0) {
    return `${offline.map((node) => node.label).join(", ")} offline. Impact spreads along every attached edge.`;
  }
  if (degraded.length > 0) {
    return `${degraded.map((node) => node.label).join(", ")} degraded. Partially available, not down.`;
  }
  return "All services healthy. Nothing is routing around a failure.";
}

/** Readout shared by the HTML panel and the shelf lamp's in-room light. */
export function lampReadout(on: boolean) {
  return {
    state: on ? ("on" as const) : ("off" as const),
    label: on ? "On" : "Off",
    level: on ? 1 : 0.12,
    note: on ? "Lamp lit, relay closed" : "Relay open, lamp dark",
  };
}

/** Formats a command as the line the panel shows in its log. */
export function commandLogLine(id: string, on: boolean, at: number): string {
  const stamp = new Date(at).toISOString().slice(11, 19);
  return `${stamp}  ${id.toUpperCase()}  relay -> ${on ? "closed" : "open"}  ack`;
}
