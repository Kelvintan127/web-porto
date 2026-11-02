import { describe, expect, it } from "vitest";
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

  it("keeps camera presets finite and inside room volume", () => {
    for (const preset of [defaultCamera, ...roomObjects.map((object) => object.camera)]) {
      expect(isFiniteTriple(preset.position)).toBe(true);
      expect(isFiniteTriple(preset.lookAt)).toBe(true);
      expect(preset.position[2]).toBeGreaterThan(-1.8);
      expect(preset.position[2]).toBeLessThan(5.5);
      expect(preset.position[1]).toBeGreaterThan(0.4);
    }
  });

  it("keeps every hit volume inside both the desktop and mobile frames", () => {
    // Vertical fov 40 with a square frame: half-width = tan(20deg) * depth.
    const tanHalfFov = Math.tan((40 * Math.PI) / 180 / 2);
    for (const camera of [defaultCamera, mobileCamera]) {
      const [camX, camY, camZ] = camera.position;
      for (const object of roomObjects) {
        const [x, y, z] = object.hit.position;
        const depth = camZ - z;
        expect(depth, `${object.id} behind camera`).toBeGreaterThan(0);
        const tolX = tanHalfFov * depth + object.hit.scale[0] / 2;
        const tolY = tanHalfFov * depth + object.hit.scale[1] / 2;
        expect(Math.abs(x - camX), `${object.id} x out of frame`).toBeLessThan(tolX);
        expect(Math.abs(y - camY), `${object.id} y out of frame`).toBeLessThan(tolY);
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
