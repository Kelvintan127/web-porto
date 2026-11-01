"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * "Process graph": a central engineering core with connected nodes.
 * Five clusters map to the five things that actually meet in ERP work —
 * business process, integration, API, data, and delivery.
 * Geometry is primitives only (spheres + line segments) so it stays cheap.
 */

const NODES = [
  { p: [1.75, 0.55, 0.3], c: "#64e9d0", s: 0.13 },
  { p: [-1.5, 1.15, -0.85], c: "#5b8def", s: 0.11 },
  { p: [0.35, -1.65, 0.95], c: "#64e9d0", s: 0.1 },
  { p: [-1.85, -0.5, 0.75], c: "#5b8def", s: 0.09 },
  { p: [0.9, 1.65, -1.1], c: "#94a3b8", s: 0.085 },
  { p: [-0.4, 0.6, 2.0], c: "#64e9d0", s: 0.075 },
  { p: [2.05, -0.85, -1.2], c: "#5b8def", s: 0.08 },
  { p: [-2.1, 1.9, 0.2], c: "#94a3b8", s: 0.07 },
] as const;

const EDGES: [number, number][] = [
  [0, 1], [0, 4], [0, 6], [0, 5],
  [1, 3], [1, 7], [1, 5],
  [2, 3], [2, 6], [2, 5],
  [4, 7], [6, 3],
];

function Core() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = t * 0.12;
    mesh.current.rotation.x = Math.sin(t * 0.18) * 0.16;
  });
  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color="#0d1626"
          emissive="#64e9d0"
          emissiveIntensity={0.22}
          metalness={0.65}
          roughness={0.32}
          flatShading
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.9, 24, 24]} />
        <meshBasicMaterial color="#64e9d0" transparent opacity={0.045} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Network({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);

  const lineGeometry = useMemo(() => {
    const verts: number[] = [];
    for (const [a, b] of EDGES) {
      verts.push(...NODES[a].p, ...NODES[b].p);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    return geo;
  }, []);

  const spokes = useMemo(() => {
    const verts: number[] = [];
    for (const n of NODES) verts.push(0, 0, 0, ...n.p);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const px = pointer.current?.x ?? 0;
    const py = pointer.current?.y ?? 0;

    // slow idle drift + damped pointer parallax (no per-frame state updates)
    g.rotation.y += (t * 0.045 + px * 0.32 - g.rotation.y) * 0.012;
    g.rotation.x += (py * 0.22 - g.rotation.x) * 0.03;

    nodeRefs.current.forEach((m, i) => {
      if (!m) return;
      const n = NODES[i];
      m.position.y = n.p[1] + Math.sin(t * 0.85 + i * 1.7) * 0.055;
      const pulse = 0.94 + Math.sin(t * 1.6 + i) * 0.06;
      m.scale.setScalar(pulse);
    });
  });

  return (
    <group ref={group}>
      <Core />
      <lineSegments geometry={spokes}>
        <lineBasicMaterial color="#5b8def" transparent opacity={0.16} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#64e9d0" transparent opacity={0.34} depthWrite={false} />
      </lineSegments>
      {NODES.map((n, i) => (
        <mesh
          key={i}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          position={[n.p[0], n.p[1], n.p[2]]}
        >
          <sphereGeometry args={[n.s, 16, 16]} />
          <meshStandardMaterial
            color={n.c}
            emissive={n.c}
            emissiveIntensity={0.55}
            roughness={0.35}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function ParallaxRig({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();
  useFrame(() => {
    const px = pointer.current?.x ?? 0;
    const py = pointer.current?.y ?? 0;
    camera.position.x += (px * 0.55 - camera.position.x) * 0.045;
    camera.position.y += (0.25 + py * 0.4 - camera.position.y) * 0.045;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroCanvas({ reducedMotion }: { reducedMotion: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });

  return (
    <Canvas
      camera={{ position: [0, 0.25, 6.2], fov: 42 }}
      dpr={[1, 1.75]}
      frameloop={reducedMotion ? "demand" : "always"}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
      onPointerMove={(e) => {
        const w = e.currentTarget as HTMLElement;
        const rect = w.getBoundingClientRect();
        pointer.current = {
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
        };
      }}
      style={{ pointerEvents: "none" }}
    >
      <color attach="background" args={["#080d18"]} />
      <fog attach="fog" args={["#080d18", 7, 15]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[3.5, 3, 4]} intensity={38} color="#64e9d0" distance={16} decay={2} />
      <pointLight position={[-4, -2, 2]} intensity={26} color="#5b8def" distance={16} decay={2} />
      <Network pointer={pointer} />
      {!reducedMotion && <ParallaxRig pointer={pointer} />}
    </Canvas>
  );
}
