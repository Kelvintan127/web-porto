import { describe, expect, it } from "vitest";
import { defaultCamera, heroCopy, roomObjectMap, roomObjects } from "./room";
import { navItems } from "./profile";

const isFiniteTriple = (value: number[]) =>
  value.length === 3 && value.every((n) => Number.isFinite(n));

describe("hero room content", () => {
  it("has unique object ids", () => {
    const ids = roomObjects.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("points every room object at a section that exists in the nav", () => {
    const sections = new Set(navItems.map((item) => item.href));
    for (const object of roomObjects) {
      expect(sections.has(object.href), `${object.id} -> ${object.href}`).toBe(true);
    }
  });

  it("keeps camera presets inside the room volume", () => {
    for (const preset of [defaultCamera, ...roomObjects.map((o) => o.camera)]) {
      expect(isFiniteTriple(preset.position)).toBe(true);
      expect(isFiniteTriple(preset.lookAt)).toBe(true);
      expect(preset.position[2]).toBeGreaterThan(-1.8);
      expect(preset.position[2]).toBeLessThan(4.5);
      expect(preset.position[1]).toBeGreaterThan(0.4);
    }
  });

  it("resolves objects by id for the scene and info cards", () => {
    expect(roomObjectMap.monitor.label).toBe("ERP monitor");
    expect(roomObjectMap.avatar.href).toBe("/#about");
    expect(Object.keys(roomObjectMap).sort()).toEqual(
      roomObjects.map((o) => o.id).sort(),
    );
  });

  it("uses the approved headline verbatim", () => {
    expect(`${heroCopy.headlineLead} — ${heroCopy.headlineAccent}`).toBe(
      "ERP, software, and curiosity — all in one journey.",
    );
  });
});
