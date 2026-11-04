"use client";

/**
 * The three primitives the room is built from, split out so scene modules can
 * share them without importing each other. `hero-canvas.tsx` re-exports these as
 * its own, so nothing that already used them had to change.
 */

import { useMemo } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Vec3 } from "@/content/room";

export const ROOM_COLORS = {
  ink: "#080d18",
  wall: "#0d1729",
  floor: "#111d31",
  floorEdge: "#1b2b44",
  surface: "#172235",
  line: "#263247",
  cyan: "#64e9d0",
  blue: "#5b8def",
  warm: "#f5d9a8",
  metal: "#8fa3bd",
  wood: "#3a2b22",
  fabric: "#1e293b",
  glass: "#0f2735",
} as const;

/** A bevelled box: silhouettes catch light instead of reading as a scaled cube. */
export function Solid({
  position,
  scale,
  color = ROOM_COLORS.surface,
  emissive,
  emissiveIntensity = 0,
  rotation,
  radius = 0.02,
  metalness = 0.15,
  roughness = 0.72,
  shadow = true,
}: {
  position: Vec3;
  scale: Vec3;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  rotation?: Vec3;
  radius?: number;
  metalness?: number;
  roughness?: number;
  shadow?: boolean;
}) {
  // R3F ships no JSX typing for this example geometry, so build it once and attach
  // it via <primitive>; the memo keeps us from allocating per render.
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, radius), [radius]);
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow={shadow} receiveShadow={shadow}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissiveIntensity}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  );
}

export function Rod({
  position,
  height,
  radius = 0.02,
  color = ROOM_COLORS.line,
  rotation,
  metalness = 0.55,
  roughness = 0.45,
}: {
  position: Vec3;
  height: number;
  radius?: number;
  color?: string;
  rotation?: Vec3;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 16]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
}

export function Glow({
  position,
  radius = 0.03,
  color = ROOM_COLORS.cyan,
  intensity = 1.4,
}: {
  position: Vec3;
  radius?: number;
  color?: string;
  intensity?: number;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
    </mesh>
  );
}
