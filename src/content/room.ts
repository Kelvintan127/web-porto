/**
 * Hero room content: object metadata and camera presets.
 * Kept separate from the scene so copy or anchors can change without touching 3D code.
 * Every href points at a section rendered on the home page (see navItems).
 *
 * The scene is an orthographic isometric room. An orthographic camera has no
 * perspective divide, so an object's on-screen size does not depend on its depth.
 * Hit volumes are therefore authored directly in world units and never need the
 * old tan(fov/2) * depth projection: two volumes overlap on screen if and only if
 * they overlap in world space. `size` values are the orthographic half-height.
 */

export type RoomObjectId =
  | "monitor"
  | "laptop"
  | "automation"
  | "server"
  | "iot"
  | "avatar";

export type Vec3 = [number, number, number];

/**
 * World-space y of the desk's top face. The desk group in `hero-canvas.tsx`
 * builds its top from this, and every object standing on the desk is offset
 * from it, so a change here moves the furniture together instead of leaving
 * the monitor or laptop hovering.
 */
export const DESK_SURFACE_Y = 0.955;

/** World-space centre for something of half-height `halfHeight` sitting on the desk. */
export const onDesk = (halfHeight: number) => DESK_SURFACE_Y + halfHeight;

export type CameraPreset = {
  position: Vec3;
  lookAt: Vec3;
  /** Orthographic half-height in world units. Smaller crops in tighter. */
  size: number;
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
    hit: { position: [-0.3, 1.548, -0.42], scale: [0.92, 0.62, 0.22] },
    camera: { position: [6.628, 8.476, 6.508], lookAt: [-0.3, 1.548, -0.42], size: 1.15 },
  },
  {
    id: "laptop",
    label: "Coding laptop",
    short: "Code",
    blurb: "Backend services, REST APIs, and the projects that came out of them.",
    href: "/#work",
    hit: { position: [1.0, 1.085, -0.18], scale: [0.6, 0.46, 0.5] },
    camera: { position: [7.928, 8.013, 6.748], lookAt: [1.0, 1.085, -0.18], size: 0.95 },
  },
  {
    id: "automation",
    label: "Automation panel",
    short: "Automation",
    blurb: "Scheduled jobs, integrations, and small automations that remove repetitive work.",
    href: "/#playground",
    hit: { position: [1.2, 1.9, -1.51], scale: [0.86, 0.74, 0.3] },
    camera: { position: [8.128, 8.828, 5.418], lookAt: [1.2, 1.9, -1.51], size: 1.05 },
  },
  {
    id: "server",
    label: "Server rack",
    short: "Infra",
    blurb: "Docker, Linux, and CI/CD — where experiments get somewhere reliable to run.",
    href: "/#stack",
    hit: { position: [-1.78, 0.62, -0.7], scale: [0.62, 1.14, 0.62] },
    camera: { position: [5.148, 7.548, 6.228], lookAt: [-1.78, 0.62, -0.7], size: 1.35 },
  },
  {
    id: "iot",
    label: "IoT device",
    short: "IoT",
    blurb: "An ESP32 on a shelf: the lamp switch experiment, and other hardware tangents.",
    href: "/#playground",
    hit: { position: [-1.3, 1.65, -1.49], scale: [0.48, 0.34, 0.34] },
    camera: { position: [5.628, 8.578, 5.438], lookAt: [-1.3, 1.65, -1.49], size: 0.85 },
  },
  {
    id: "avatar",
    label: "That's me",
    short: "Me",
    blurb: "Computer Science at BINUS University, now working as an ERP Consultant in Jakarta.",
    href: "/#about",
    hit: { position: [1.1, 0.92, 1.05], scale: [0.56, 1.44, 0.56] },
    camera: { position: [8.028, 7.848, 7.978], lookAt: [1.1, 0.92, 1.05], size: 1.45 },
  },
];

/**
 * True isometric framing: 45° azimuth with atan(1/sqrt(2)) elevation, viewed
 * orthographically. Every preset shares this exact direction vector so focus
 * moves the crop without ever introducing a dutch angle.
 */
export const defaultCamera: CameraPreset = {
  position: [6.928, 8.078, 6.728],
  lookAt: [0, 1.15, -0.2],
  size: 2.5,
};

/**
 * Phones render the room in a ~348px square where the wide framing makes every
 * object too small to tap. Shifting the look target back keeps all six volumes
 * in frame at the same size, so a tap target never leaves the canvas.
 */
export const mobileCamera: CameraPreset = {
  position: [6.928, 8.028, 7.028],
  lookAt: [0, 1.1, 0.1],
  size: 2.5,
};

export const roomObjectMap = Object.fromEntries(
  roomObjects.map((object) => [object.id, object]),
) as Record<RoomObjectId, RoomObject>;
