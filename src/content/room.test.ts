import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { defaultCamera, heroCopy, mobileCamera, roomObjectMap, roomObjects } from "./room";
import { navItems } from "./profile";

const isFiniteTriple = (value: number[]) =>
  value.length === 3 && value.every((n) => Number.isFinite(n));

describe("hero room content", () => {
  it("has six unique selectable room objects", () => {
    const ids = roomObjects.map((object) => object.id);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("points every object to an existing home section", () => {
    const sections = new Set(navItems.map((item) => item.href));
    for (const object of roomObjects) {
      expect(sections.has(object.href), `${object.id} -> ${object.href}`).toBe(true);
    }
  });

  it("keeps camera presets finite and on a valid isometric elevation", () => {
    for (const preset of [defaultCamera, ...roomObjects.map((object) => object.camera)]) {
      expect(isFiniteTriple(preset.position)).toBe(true);
      expect(isFiniteTriple(preset.lookAt)).toBe(true);
      expect(preset.size).toBeGreaterThan(0.5);
      expect(preset.size).toBeLessThan(4);
      // 45° azimuth: x and z offsets from the target must match in magnitude.
      const dx = preset.position[0] - preset.lookAt[0];
      const dz = preset.position[2] - preset.lookAt[2];
      expect(Math.abs(Math.abs(dx) - Math.abs(dz)), "azimuth not 45 degrees").toBeLessThan(0.05);
      expect(preset.position[1], "camera must sit above the target").toBeGreaterThan(preset.lookAt[1]);
    }
  });

  it("frames every hit volume in both desktop and mobile orthographic views", () => {
    // Orthographic cameras do not scale with depth: a world point maps to a fixed
    // screen slot. Project each volume centre onto the camera's right/up axes and
    // require the whole box to sit inside the frustum half-extents.
    for (const camera of [defaultCamera, mobileCamera]) {
      const eye = new Vector3(...camera.position);
      const target = new Vector3(...camera.lookAt);
      const forward = target.clone().sub(eye).normalize();
      const worldUp = new Vector3(0, 1, 0);
      const right = new Vector3().crossVectors(forward, worldUp).normalize();
      const up = new Vector3().crossVectors(right, forward).normalize();
      const halfHeight = camera.size;
      const halfWidth = halfHeight; // square canvas

      for (const object of roomObjects) {
        const centre = new Vector3(...object.hit.position).sub(target);
        const [sx, sy, sz] = object.hit.scale;
        // Half-extent of the box projected onto each screen axis.
        const extentX = Math.abs(right.x) * sx / 2 + Math.abs(right.y) * sy / 2 + Math.abs(right.z) * sz / 2;
        const extentY = Math.abs(up.x) * sx / 2 + Math.abs(up.y) * sy / 2 + Math.abs(up.z) * sz / 2;
        expect(Math.abs(centre.dot(right)) + extentX, `${object.id} x out of frame`).toBeLessThan(halfWidth);
        expect(Math.abs(centre.dot(up)) + extentY, `${object.id} y out of frame`).toBeLessThan(halfHeight);
      }
    }
  });

  it("keeps hit volumes separated enough for direct pointer selection", () => {
    const centers = roomObjects.map(({ hit }) => hit.position);
    for (let i = 0; i < roomObjects.length; i += 1) {
      for (let j = i + 1; j < roomObjects.length; j += 1) {
        const a = roomObjects[i].hit;
        const b = roomObjects[j].hit;
        const overlapX = Math.abs(centers[i][0] - centers[j][0]) < (a.scale[0] + b.scale[0]) / 2;
        const overlapY = Math.abs(centers[i][1] - centers[j][1]) < (a.scale[1] + b.scale[1]) / 2;
        const overlapZ = Math.abs(centers[i][2] - centers[j][2]) < (a.scale[2] + b.scale[2]) / 2;
        expect(overlapX && overlapY && overlapZ).toBe(false);
      }
    }
  });

  it("keeps every hit volume inside the room shell", () => {
    // Mirrors the RoomShell geometry in hero-canvas.tsx: floor top at y=0,
    // back wall inner face z=-1.67, left wall inner face x=-2.13. A volume that
    // crosses a boundary reads as an object floating through a wall.
    for (const object of roomObjects) {
      const [x, y, z] = object.hit.position;
      const [sx, sy, sz] = object.hit.scale;
      expect(y - sy / 2, `${object.id} sinks through the floor`).toBeGreaterThan(0);
      expect(z - sz / 2, `${object.id} pierces the back wall`).toBeGreaterThan(-1.67);
      expect(x - sx / 2, `${object.id} pierces the left wall`).toBeGreaterThan(-2.13);
    }
  });

  it("separates hit volumes on screen, not just in world space", () => {
    // Two volumes can be disjoint in 3D and still overlap on screen, which makes
    // the wrong object win the raycast. Project onto the default camera's axes.
    const eye = new Vector3(...defaultCamera.position);
    const target = new Vector3(...defaultCamera.lookAt);
    const forward = target.clone().sub(eye).normalize();
    const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();
    const up = new Vector3().crossVectors(right, forward).normalize();
    const half = defaultCamera.size;
    for (let i = 0; i < roomObjects.length; i += 1) {
      for (let j = i + 1; j < roomObjects.length; j += 1) {
        const a = roomObjects[i].hit;
        const b = roomObjects[j].hit;
        const ca = new Vector3(...a.position).sub(target);
        const cb = new Vector3(...b.position).sub(target);
        const ax = ca.dot(right); const ay = ca.dot(up);
        const bx = cb.dot(right); const by = cb.dot(up);
        const eax = Math.abs(right.x) * a.scale[0] / 2 + Math.abs(right.y) * a.scale[1] / 2 + Math.abs(right.z) * a.scale[2] / 2;
        const eay = Math.abs(up.x) * a.scale[0] / 2 + Math.abs(up.y) * a.scale[1] / 2 + Math.abs(up.z) * a.scale[2] / 2;
        const ebx = Math.abs(right.x) * b.scale[0] / 2 + Math.abs(right.y) * b.scale[1] / 2 + Math.abs(right.z) * b.scale[2] / 2;
        const eby = Math.abs(up.x) * b.scale[0] / 2 + Math.abs(up.y) * b.scale[1] / 2 + Math.abs(up.z) * b.scale[2] / 2;
        const gapX = Math.abs(ax - bx) - (eax + ebx);
        const gapY = Math.abs(ay - by) - (eay + eby);
        // At least one screen axis must have a clear gap.
        expect(gapX > 0 || gapY > 0, `${roomObjects[i].id} and ${roomObjects[j].id} overlap on screen`).toBe(true);
        expect(half).toBeGreaterThan(0);
      }
    }
  });
  it("gives every object a positive-size hit volume", () => {
    for (const object of roomObjects) {
      expect(isFiniteTriple(object.hit.position)).toBe(true);
      for (const dimension of object.hit.scale) {
        expect(dimension).toBeGreaterThan(0.1);
      }
    }
  });

  it("resolves every object id to card metadata", () => {
    expect(roomObjectMap.monitor.label).toBe("ERP monitor");
    expect(roomObjectMap.laptop.href).toBe("/#work");
    expect(roomObjectMap.automation.href).toBe("/#playground");
    expect(roomObjectMap.server.href).toBe("/#stack");
    expect(roomObjectMap.iot.href).toBe("/#playground");
    expect(roomObjectMap.avatar.href).toBe("/#about");
    expect(Object.keys(roomObjectMap).sort()).toEqual(
      roomObjects.map((object) => object.id).sort(),
    );
  });

  it("uses the approved headline verbatim", () => {
    expect(`${heroCopy.headlineLead} — ${heroCopy.headlineAccent}`).toBe(
      "ERP, software, and curiosity — all in one journey.",
    );
  });
});
