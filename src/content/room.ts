/**
 * Hero room content: object metadata and camera presets.
 * Kept separate from the scene so copy or anchors can change without touching 3D code.
 * Every href points at a section rendered on the home page (see navItems).
 *
 * Hit volumes are deliberately tight: an oversized invisible box sits nearer the
 * camera in raycast order and swallows clicks meant for the object behind it.
 * Bounds are projected to screen space at the default camera (fov 40, z 4.8) to
 * confirm the six volumes do not meaningfully overlap.
 */

export type RoomObjectId =
  | "monitor"
  | "laptop"
  | "automation"
  | "server"
  | "iot"
  | "avatar";

export type Vec3 = [number, number, number];

export type CameraPreset = {
  position: Vec3;
  lookAt: Vec3;
};

export type RoomObject = {
  id: RoomObjectId;
  label: string;
  /** Short chip caption. */
  short: string;
  blurb: string;
  href: string;
  /** Invisible raycast volume around the object; also the hover/selection outline. */
  hit: { position: Vec3; scale: Vec3 };
  camera: CameraPreset;
};

export const heroCopy = {
  eyebrow: "ERP Consultant · Software Developer · Tech Explorer",
  headlineLead: "ERP, software, and curiosity",
  headlineAccent: "all in one journey.",
  intro:
    "I'm Kelvin Tan. I spend my days connecting business processes to the systems that run them, and my evenings building things to understand how they work. This room is roughly what that looks like.",
} as const;

export const roomObjects: RoomObject[] = [
  {
    id: "monitor",
    label: "ERP monitor",
    short: "ERP",
    blurb: "Where business processes become configurations, document flows, and reports.",
    href: "/#experience",
    hit: { position: [-0.62, 1.44, -0.46], scale: [0.98, 0.78, 0.2] },
    camera: { position: [-0.62, 1.5, 2.15], lookAt: [-0.62, 1.42, -0.48] },
  },
  {
    id: "laptop",
    label: "Coding laptop",
    short: "Code",
    blurb: "Backend services, REST APIs, and the projects that came out of them.",
    href: "/#work",
    hit: { position: [0.42, 1.16, -0.32], scale: [0.34, 0.3, 0.52] },
    camera: { position: [0.45, 1.55, 2.15], lookAt: [0.45, 1.16, -0.32] },
  },
  {
    id: "automation",
    label: "Automation panel",
    short: "Automation",
    blurb: "Scheduled jobs, integrations, and small automations that remove repetitive work.",
    href: "/#playground",
    hit: { position: [1, 2, -1.16], scale: [0.82, 0.58, 0.12] },
    camera: { position: [1, 2.08, 1.05], lookAt: [1, 2, -1.16] },
  },
  {
    id: "server",
    label: "Server rack",
    short: "Infra",
    blurb: "Docker, Linux, and CI/CD — where experiments get somewhere reliable to run.",
    href: "/#stack",
    hit: { position: [1.5, 0.58, -0.8], scale: [0.52, 1.05, 0.48] },
    camera: { position: [1.42, 1.1, 1.45], lookAt: [1.5, 0.58, -0.8] },
  },
  {
    id: "iot",
    label: "IoT device",
    short: "IoT",
    blurb: "An ESP32 on a shelf: the lamp switch experiment, and other hardware tangents.",
    href: "/#playground",
    hit: { position: [-1.4, 2.1, -1.03], scale: [0.4, 0.44, 0.3] },
    camera: { position: [-1.1, 2.18, 0.45], lookAt: [-1.4, 2.1, -1.03] },
  },
  {
    id: "avatar",
    label: "That's me",
    short: "Me",
    blurb: "Computer Science at BINUS University, now working as an ERP Consultant in Jakarta.",
    href: "/#about",
    hit: { position: [0.72, 1.25, 0.22], scale: [0.44, 1.25, 0.44] },
    camera: { position: [0.62, 1.5, 2.55], lookAt: [0.56, 1.15, 0.15] },
  },
];

/** Far enough back that the whole room width (3.7 units) fits a square frame. */
export const defaultCamera: CameraPreset = {
  position: [0, 1.62, 4.8],
  lookAt: [0, 1.16, 0],
};

/**
 * Phones render the room in a ~348px square where the wide framing makes every
 * object too small to tap. Closer camera + lower eye line keeps the room and the
 * avatar legible; verified to keep all six hit volumes inside the frame.
 */
export const mobileCamera: CameraPreset = {
  position: [0, 1.5, 3.6],
  lookAt: [0, 1.1, 0],
};

export const roomObjectMap = Object.fromEntries(
  roomObjects.map((object) => [object.id, object]),
) as Record<RoomObjectId, RoomObject>;
