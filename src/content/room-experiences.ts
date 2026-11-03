/**
 * Hero room experiences: what each object does when it is opened.
 *
 * Everything here is local demo data — no network calls, no live systems. The
 * interactive copy lives in this file (and renders as real HTML in
 * `experience-panel.tsx`) so the 3D scene only has to draw state it is handed.
 *
 * Step playback is deliberately data-first: each experience is an ordered list
 * of steps with a duration, and `useExperience` / `progressFor` walk that list.
 * The 3D objects read the same progress values, so the scene and the text panel
 * can never disagree about which step is running.
 */

import { projects } from "@/content/projects";
import type { RoomObjectId } from "@/content/room";

/** Local-only status vocabulary. Deliberately not an HTTP-ish enum. */
export type DemoStatus = "idle" | "running" | "complete";

export type ExperienceStep = {
  id: string;
  /** Short node label drawn in the scene. */
  label: string;
  /** Paragraph shown in the HTML panel for the selected step. */
  detail: string;
  /** Milliseconds this step occupies while the demo runs. */
  durationMs: number;
};

export type ServiceHealth = "healthy" | "degraded" | "offline";

export const healthColor: Record<ServiceHealth, string> = {
  healthy: "#64e9d0",
  degraded: "#f5d9a8",
  offline: "#5b6b85",
};

export type ServiceNode = {
  id: string;
  label: string;
  /** Fictional, deliberately generic role. No real hostnames or vendors. */
  role: string;
  detail: string;
  initial: ServiceHealth;
  /** Deterministic toggle order: healthy -> degraded -> offline -> healthy. */
  cycle: ServiceHealth[];
  /** Offsets within the diagram box, per cent. */
  x: number;
  y: number;
};

export type DemoEndpoint = {
  method: "GET" | "POST";
  path: string;
  /** Request body shown as local demo JSON. */
  request?: Record<string, unknown>;
  status: number;
  /** Response status text, e.g. "201 Created". */
  statusText: string;
  body: unknown;
  note: string;
};

export type FlowNode = {
  id: string;
  label: string;
  /** Per-cent offsets inside the panel face. */
  x: number;
  y: number;
  /** Which step index this node lights up for. */
  step: number;
};

export const flowNodes: readonly FlowNode[] = [
  { id: "order", label: "Sales order", x: 22, y: 24, step: 1 },
  { id: "credit", label: "Credit check", x: 22, y: 50, step: 2 },
  { id: "stock", label: "Stock check", x: 22, y: 76, step: 2 },
  { id: "ship", label: "Delivery", x: 72, y: 36, step: 3 },
  { id: "invoice", label: "Invoice", x: 72, y: 64, step: 4 },
];

/**
 * Open orders in the demo. Kept in the ERP content (not the 3D scene) because
 * the monitor also renders its own screen from this number.
 */
export const openOrdersAtRest = 4;

export const erpSteps: ExperienceStep[] = [
  {
    id: "idle",
    label: "Idle",
    detail:
      "The order desk with nothing in flight. Four open documents are waiting to be processed.",
    durationMs: 700,
  },
  {
    id: "order",
    label: "Sales order",
    detail:
      "A customer order is captured against a sold-to party, a plant, and a requested delivery date. Nothing has been committed yet.",
    durationMs: 900,
  },
  {
    id: "checks",
    label: "Credit + stock",
    detail:
      "The order is checked before anything moves: available credit for the sold-to party, and available quantity in the delivering plant.",
    durationMs: 1100,
  },
  {
    id: "delivery",
    label: "Delivery",
    detail:
      "A delivery document is created and the goods issue posts. Stock leaves the plant's valuated inventory here, not at invoicing.",
    durationMs: 1000,
  },
  {
    id: "invoice",
    label: "Invoice + post",
    detail:
      "Billing is raised against the delivery, the accounting document posts, and the open-item list for the customer updates. Open orders drop to three.",
    durationMs: 1000,
  },
];

export type RequestDirection = "out" | "back";

export type RequestPulse = {
  key: string;
  direction: RequestDirection;
  path: string;
  statusText: string;
};

export type CodingExperience = {
  endpointIds: string[];
  endpoints: DemoEndpoint[];
  /** Extra beats: position 0 is the pulse index each beat fires on. */
  endpointPulseIndexes: number[];
  previewSlugs: string[];
};

export const codeEndpoints: DemoEndpoint[] = [
  {
    method: "POST",
    path: "/api/scholarships/applications",
    request: { programme: "2026-intake", applicantId: "demo-0142" },
    status: 201,
    statusText: "Created",
    body: { id: "app_0142", status: "submitted", submittedAt: "2026-03-02T09:14:00Z" },
    note: "Writes an application record, then hands off to the scheduled job that re-checks document completeness.",
  },
  {
    method: "GET",
    path: "/api/scholarships/applications/app_0142",
    status: 200,
    statusText: "OK",
    body: { id: "app_0142", status: "under_review", reviewer: "panel-a" },
    note: "Reads one record behind a scoped token. The reviewer field is only populated once the document check passes.",
  },
  {
    method: "POST",
    path: "/api/auth/token",
    request: { subject: "demo.user", scope: "applications:read" },
    status: 200,
    statusText: "OK",
    body: { token: "demo.jwt.scoped", expiresIn: 3600, scope: "applications:read" },
    note: "Issues a scoped token. Every request above carries it; the scope decides which records are reachable.",
  },
];

const codePulseKey = (index: number, direction: RequestDirection) => `req-${index}-${direction}`;

export const codingExperience: CodingExperience = {
  endpointIds: codeEndpoints.map((_, index) => `endpoint-${index}`),
  endpoints: codeEndpoints,
  // Request at 0, response at 1: the laptop blinks its network LED on both.
  endpointPulseIndexes: [0, 1],
  previewSlugs: ["ykk-scholarship-management", "bayar-cepat", "jastipfully"],
};

/** Request pulses for one endpoint, named so the scene can match them by id. */
export const requestPulses = (index: number): RequestPulse[] => [
  { key: codePulseKey(index, "out"), direction: "out", path: codeEndpoints[index].path, statusText: `→ ${codeEndpoints[index].method}` },
  { key: codePulseKey(index, "back"), direction: "back", path: codeEndpoints[index].path, statusText: `← ${codeEndpoints[index].status}` },
];

export const automationSteps: ExperienceStep[] = [
  {
    id: "trigger",
    label: "Trigger",
    detail:
      "A schedule fires at 06:00 and picks up the new spreadsheet drop from the shared folder.",
    durationMs: 1000,
  },
  {
    id: "process",
    label: "Process",
    detail:
      "Rows are normalised, duplicates are dropped, and the daily total is recalculated against last week's figures.",
    durationMs: 1400,
  },
  {
    id: "result",
    label: "Result",
    detail:
      "A summary is written back to the folder and the shift lead gets one notification. No rows are touched by hand.",
    durationMs: 1200,
  },
];

/** Step index of each automation phase in `automationSteps`. */
export const automationPhaseStep: Record<"trigger" | "process" | "result", number> = {
  trigger: 0,
  process: 1,
  result: 2,
};

export const automationStats = {
  runsToday: 3,
  rowsProcessed: 1284,
  minutesSaved: 46,
} as const;

export const serviceNodes: ServiceNode[] = [
  {
    id: "proxy",
    label: "Reverse proxy",
    role: "TLS terminator",
    detail: "Terminates TLS and routes by hostname. The only node exposed to the internet in this diagram.",
    initial: "healthy",
    cycle: ["healthy", "degraded", "offline"],
    x: 14,
    y: 50,
  },
  {
    id: "files",
    label: "File sync",
    role: "Storage",
    detail: "Holds the shared files. Degraded means sync is lagging behind; offline means new uploads queue up.",
    initial: "healthy",
    cycle: ["healthy", "degraded", "offline"],
    x: 44,
    y: 22,
  },
  {
    id: "jobs",
    label: "Job runner",
    role: "Scheduled work",
    detail: "Runs the scheduled automations. This is the node the automation panel's trigger would land on.",
    initial: "healthy",
    cycle: ["healthy", "degraded", "offline"],
    x: 44,
    y: 78,
  },
  {
    id: "db",
    label: "Database",
    role: "Persistence",
    detail: "Stores application data. Marking it offline is the fastest way to see how the diagram propagates impact.",
    initial: "healthy",
    cycle: ["healthy", "degraded", "offline"],
    x: 76,
    y: 50,
  },
];

/** Edges drawn as SVG lines. Order is stable so the scene can key off it. */
export const serviceEdges: readonly { from: string; to: string }[] = [
  { from: "proxy", to: "files" },
  { from: "proxy", to: "jobs" },
  { from: "files", to: "db" },
  { from: "jobs", to: "db" },
];

export const iotCommands = [
  { id: "on", label: "Turn on" },
  { id: "off", label: "Turn off" },
] as const;

export type IotCommandId = (typeof iotCommands)[number]["id"];

/** Brightness used by both the HTML readout and the room's light. */
export const iotLevels = { on: 1, off: 0.12 } as const;

export const iotCopy = {
  device: "Shelf lamp controller",
  board: "Demo board",
  firmware: "demo-firmware 0.3",
  detail:
    "The board is a real ESP32 wired to a relay and a 5V lamp. This control is the same command path, wired to local demo state instead of the device.",
  lastCommandOn: "Cold white, full brightness",
  lastCommandOff: "Standby brightness",
} as const;

export const avatarGreeting = "Halo — I'm Kelvin. Welcome to the room.";

export const avatarCopy = {
  role: "ERP Consultant · Software Developer",
  location: "Jakarta, Indonesia",
  /** Deliberately the same line the About section leads with. */
  intro: "Hi, I'm Kelvin — a Computer Science graduate from BINUS University, currently working as an ERP Consultant.",
  facts: [
    { label: "Focus", value: "ERP consulting and backend development" },
    { label: "Education", value: "B.Sc. Computer Science, BINUS University (2025)" },
    { label: "Currently", value: "ERP Consultant, Jakarta" },
  ],
  note:
    "The figure in the room is a stand-in model. Controls, focus behaviour, and this panel stay as they are when the custom asset lands.",
} as const;

export type ExperienceKind =
  | "erp-flow"
  | "api-demo"
  | "automation-run"
  | "service-status"
  | "device-toggle"
  | "greeting";

/** Which experience each room object opens. Total, so a new object cannot be forgotten. */
export const experienceKindByObject: Record<RoomObjectId, ExperienceKind> = {
  monitor: "erp-flow",
  laptop: "api-demo",
  automation: "automation-run",
  server: "service-status",
  iot: "device-toggle",
  avatar: "greeting",
};

export type ProjectPreview = {
  slug: string;
  title: string;
  type: string;
  year: string;
  summary: string;
  stack: string;
  /** The single verified thing worth naming about this build. */
  highlight: string;
  /** Absolute link from projects.ts, or null when the project has none. */
  link: string | null;
  linkLabel: string;
  href: string;
};

/**
 * Builds previews from `projects.ts` so the hero cannot drift from the Work
 * section. The only authored part is `highlight`, which restates a feature
 * already listed on the project.
 */
const highlights: Record<string, string> = {
  "ykk-scholarship-management": "JWT authentication with role-based access control",
  "bayar-cepat": "Multi-merchant architecture with per-merchant data isolation",
  jastipfully: "Section components for ordering steps, shipping rates, and testimonials",
};

export const projectPreviews: ProjectPreview[] = codingExperience.previewSlugs.map((slug) => {
  const project = projects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Room preview references an unknown project: ${slug}`);
  const [first] = project.links;
  return {
    slug: project.slug,
    title: project.title,
    type: project.type,
    year: project.year,
    summary: project.summary,
    stack: project.technologies.slice(0, 3).join(" · "),
    highlight: highlights[slug] ?? project.features[0],
    link: first ? first.href : null,
    linkLabel: first ? first.label : "No public link",
    href: `/projects/${project.slug}`,
  };
});

export const roomExperiences = {
  monitor: { steps: erpSteps },
  laptop: { steps: codingExperience.endpointIds.map((id, index) => ({ id, ...codeEndpoints[index] }) as unknown as ExperienceStep) },
  automation: { steps: automationSteps },
  server: { steps: serviceNodes.map((node) => ({ id: node.id, label: node.label, detail: node.detail, durationMs: 0 })) },
  iot: { steps: iotCommands.map((command) => ({ id: command.id, label: command.label, detail: iotCopy.detail, durationMs: 0 })) },
  avatar: { steps: [] as ExperienceStep[] },
} as const;

export type StepLike = Pick<ExperienceStep, "id" | "label" | "detail">;

/**
 * Wraps past the end back to the first step, so a demo loops until it is reset.
 * Empty step lists return null rather than throwing: the avatar experience has
 * no steps and still needs to render.
 */
export function stepAfter<T extends { id: string }>(steps: readonly T[], currentId: string | null): T | null {
  if (steps.length === 0) return null;
  const index = steps.findIndex((step) => step.id === currentId);
  return steps[(index + 1) % steps.length];
}

/** Keeps a step id valid against a (possibly changed) step list. */
export function resolveStepId<T extends { id: string }>(steps: readonly T[], id: string | null): string | null {
  if (steps.length === 0) return null;
  return steps.some((step) => step.id === id) ? id : steps[0].id;
}

/** Wait in milliseconds for one step of a stepping demo. */
export function stepDelay(steps: readonly ExperienceStep[], id: string | null): number | null {
  const step = steps.find((candidate) => candidate.id === id);
  return step ? step.durationMs : null;
}
