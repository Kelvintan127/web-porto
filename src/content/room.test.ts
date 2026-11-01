import { describe, expect, it } from "vitest";
import { defaultCamera, heroCopy, roomObjectMap, roomObjects } from "./room";
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
      expect(preset.position[2]).toBeLessThan(4.5);
      expect(preset.position[1]).toBeGreaterThan(0.4);
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
