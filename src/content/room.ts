/**
 * Hero room content: object metadata and camera presets.
 * Kept separate from the scene so copy or anchors can change without touching 3D code.
 * Phase 1 wires the four workspace objects; later phases add the objects still listed.
 */

export type RoomObjectId = "monitor" | "laptop" | "avatar" | "desk";

export type CameraPreset = {
  position: [number, number, number];
  lookAt: [number, number, number];
};

export type RoomObject = {
  id: RoomObjectId;
  label: string;
  blurb: string;
  href: string;
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
    blurb: "Where business processes become configurations, document flows, and reports.",
    href: "/#experience",
    camera: { position: [-0.55, 1.45, 2.55], lookAt: [-0.75, 1.28, -0.45] },
  },
  {
    id: "laptop",
    label: "Coding laptop",
    blurb: "Backend services, REST APIs, and the projects that came out of them.",
    href: "/#work",
    camera: { position: [0.62, 1.4, 2.6], lookAt: [0.35, 1.2, -0.35] },
  },
  {
    id: "avatar",
    label: "That's me",
    blurb: "Computer Science at BINUS University, now working as an ERP Consultant in Jakarta.",
    href: "/#about",
    camera: { position: [0.55, 1.55, 2.9], lookAt: [0.5, 1.35, -0.6] },
  },
  {
    id: "desk",
    label: "The desk",
    blurb: "The toolkit: C#, ASP.NET Core, Laravel, React, PostgreSQL, and a lot of reading.",
    href: "/#stack",
    camera: { position: [0, 1.75, 2.9], lookAt: [0, 1.05, -0.2] },
  },
];

export const defaultCamera: CameraPreset = {
  position: [0, 1.62, 3.5],
  lookAt: [0, 1.16, 0],
};

export const roomObjectMap = Object.fromEntries(
  roomObjects.map((object) => [object.id, object]),
) as Record<RoomObjectId, RoomObject>;

