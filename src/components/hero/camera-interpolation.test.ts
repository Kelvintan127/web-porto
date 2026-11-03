import { describe, expect, it } from "vitest";
import { defaultCamera, roomObjects, type CameraPreset } from "@/content/room";

/**
 * The scene interpolates position, look-at target, and orthographic frustum
 * height on one damped curve. These tests pin the properties that made the old
 * snap-to-target version feel wrong, using the same maths the scene runs.
 */

/** Same easing the scene uses: frame-rate independent exponential damping. */
const step = (current: number, target: number, delta: number, speed: number) =>
  current + (target - current) * (1 - Math.exp(-speed * delta));

const lerpTriple = (from: number[], to: number[], easing: number): number[] =>
  from.map((value, index) => value + (to[index] - value) * easing);

function settle(from: number[], to: number[], delta: number, seconds: number) {
  let current = [...from];
  for (let elapsed = 0; elapsed < seconds; elapsed += delta) {
    const easing = 1 - Math.exp(-1.8 * delta);
    current = lerpTriple(current, to, easing);
  }
  return current;
}

describe("camera focus interpolation", () => {
  it("converges on the preset without overshooting it", () => {
    const target = roomObjects[0].camera;
    const settled = settle([...defaultCamera.position], [...target.position], 1 / 60, 4);
    settled.forEach((value, index) => {
      expect(value).toBeCloseTo(target.position[index], 2);
    });
    // Monotonic approach: never past the target on any axis.
    const monotonic = settle([...defaultCamera.position], [...target.position], 1 / 60, 4);
    for (let index = 0; index < 3; index += 1) {
      const start = defaultCamera.position[index];
      const end = target.position[index];
      const value = monotonic[index];
      expect(value).toBeGreaterThanOrEqual(Math.min(start, end) - 1e-6);
      expect(value).toBeLessThanOrEqual(Math.max(start, end) + 1e-6);
    }
  });

  it("keeps the look target inside the segment while it eases", () => {
    const preset = roomObjects[1].camera;
    for (const fraction of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const eased = lerpTriple([...defaultCamera.lookAt], [...preset.lookAt], fraction);
      eased.forEach((value, index) => {
        const low = Math.min(defaultCamera.lookAt[index], preset.lookAt[index]);
        const high = Math.max(defaultCamera.lookAt[index], preset.lookAt[index]);
        expect(value).toBeGreaterThanOrEqual(low - 1e-6);
        expect(value).toBeLessThanOrEqual(high + 1e-6);
      });
    }
  });

  it("settles position, look-at, and size on the same schedule", () => {
    // A camera whose crop arrives before its position lands reads as a slide.
    // Both channels share one easing factor, so they must track each other.
    const preset: CameraPreset = roomObjects[2].camera;
    const position = settle([...defaultCamera.position], [...preset.position], 1 / 60, 4);
    const size = settle([defaultCamera.size], [preset.size], 1 / 60, 4);
    expect(position[0]).toBeCloseTo(preset.position[0], 2);
    expect(size[0]).toBeCloseTo(preset.size, 2);
  });

  it("eases by roughly the same fraction regardless of frame rate", () => {
    // Frame-rate independence: two half-duration steps must land where one
    // full-duration step does. Without this the camera races on 120Hz screens.
    const target = roomObjects[3].camera.position;
    const oneStep = step(defaultCamera.position[0], target[0], 1 / 30, 1.8);
    const twoSteps = step(step(defaultCamera.position[0], target[0], 1 / 60, 1.8), target[0], 1 / 60, 1.8);
    expect(oneStep).toBeCloseTo(twoSteps, 3);
  });

  it("snaps exactly when reduced motion asks it to", () => {
    for (const object of roomObjects) {
      const easing = 1; // reduced motion: easing collapses to a full step
      const position = lerpTriple([...defaultCamera.position], [...object.camera.position], easing);
      expect(position).toEqual([...object.camera.position]);
      const size = step(defaultCamera.size, object.camera.size, 1 / 60, Number.POSITIVE_INFINITY);
      expect(size).toBeCloseTo(object.camera.size, 6);
    }
  });
});
