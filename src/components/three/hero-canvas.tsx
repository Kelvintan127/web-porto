"use client";

/**
 * Isometric room, orthographic camera.
 *
 * Geometry notes:
 * - Solids use RoundedBoxGeometry (bevelled edges) rather than raw boxes, so
 *   silhouettes catch light and read as built objects instead of scaled cubes.
 * - One key directional light casts real shadows. Orthographic projection has no
 *   perspective cue for depth, so contact shadows carry that job.
 * - Orthographic projection means screen size is independent of depth, so the hit
 *   volumes in room.ts map straight onto what the viewer sees.
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  defaultCamera,
  mobileCamera,
  roomObjects,
  type CameraPreset,
  type RoomObjectId,
  type Vec3,
} from "@/content/room";

type Pointer = { x: number; y: number };
type Focus = { position: Vec3; lookAt: Vec3; size: number };

const COLORS = {
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

/* ---------- primitives ---------- */

function Solid({
  position,
  scale,
  color = COLORS.surface,
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

function Rod({
  position,
  height,
  radius = 0.02,
  color = COLORS.line,
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

function Glow({
  position,
  radius = 0.03,
  color = COLORS.cyan,
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

/* ---------- room shell ---------- */

function RoomShell() {
  return (
    <group>
      {/* Floor: bevelled trim under a slightly inset slab, so the edge reads. */}
      <Solid position={[0, -0.16, 0]} scale={[4.6, 0.2, 3.6]} color={COLORS.floorEdge} radius={0.03} roughness={0.9} />
      <Solid position={[0, -0.05, 0]} scale={[4.44, 0.1, 3.44]} color={COLORS.floor} radius={0.02} roughness={0.95} />

      {/* Two back walls, inset to avoid z-fighting at the corner. */}
      <Solid position={[-2.18, 1.3, 0]} scale={[0.1, 2.8, 3.6]} color={COLORS.wall} radius={0.02} roughness={0.92} />
      <Solid position={[0, 1.3, -1.72]} scale={[4.6, 2.8, 0.1]} color={COLORS.wall} radius={0.02} roughness={0.92} />

      {/* Panel seams break up the flat planes. */}
      {[-1.2, -0.4, 0.4, 1.2].map((z) => (
        <Solid key={`seam-z${z}`} position={[-2.12, 1.3, z]} scale={[0.015, 2.6, 0.02]} color={COLORS.line} radius={0.005} shadow={false} />
      ))}
      {[-1.4, -0.6, 0.2, 1, 1.8].map((x) => (
        <Solid key={`seam-x${x}`} position={[x, 1.3, -1.66]} scale={[0.02, 2.6, 0.015]} color={COLORS.line} radius={0.005} shadow={false} />
      ))}

      {/* Rug. */}
      <Solid position={[0.35, 0.01, 0.45]} scale={[2.4, 0.02, 1.6]} color={COLORS.fabric} radius={0.01} roughness={1} />

      {/* Desk: bevelled top on four real legs, plus a cable tray. */}
      <Solid position={[0.2, 0.92, -0.35]} scale={[2.7, 0.07, 1.0]} color={COLORS.wood} radius={0.012} metalness={0.05} roughness={0.65} />
      {([
        [-0.92, 0.45, -0.73],
        [1.32, 0.45, -0.73],
        [-0.92, 0.45, 0.03],
        [1.32, 0.45, 0.03],
      ] as Vec3[]).map(([x, y, z]) => (
        <Rod key={`leg${x}${z}`} position={[x, y, z]} height={0.88} radius={0.028} color={COLORS.line} metalness={0.7} roughness={0.35} />
      ))}
      <Solid position={[0.2, 0.74, -0.73]} scale={[2.0, 0.04, 0.16]} color={COLORS.line} radius={0.008} />
    </group>
  );
}

/* ---------- objects ---------- */

function Monitor() {
  return (
    <group position={[-0.3, 1.6, -0.42]}>
      <Solid position={[0, 0, 0]} scale={[1.16, 0.72, 0.06]} color="#0a1220" radius={0.015} metalness={0.3} roughness={0.5} />
      <Solid
        position={[0, 0, 0.035]}
        scale={[1.08, 0.64, 0.012]}
        color={COLORS.glass}
        radius={0.006}
        emissive={COLORS.cyan}
        emissiveIntensity={0.06}
        roughness={0.25}
      />
      {/* Dashboard rows. */}
      {[0.2, 0.06, -0.08, -0.22].map((y, i) => (
        <Solid
          key={`row${y}`}
          position={[-0.16 + i * 0.02, y, 0.044]}
          scale={[0.62 - i * 0.1, 0.045, 0.006]}
          color={i % 2 ? COLORS.blue : COLORS.cyan}
          radius={0.004}
          emissive={i % 2 ? COLORS.blue : COLORS.cyan}
          emissiveIntensity={0.5}
          shadow={false}
        />
      ))}
      {/* Stand: neck, hinge, base. */}
      <Rod position={[0, -0.44, -0.02]} height={0.24} radius={0.035} color={COLORS.metal} metalness={0.8} roughness={0.28} />
      <Solid position={[0, -0.4, -0.02]} scale={[0.16, 0.09, 0.09]} color={COLORS.line} radius={0.01} metalness={0.6} />
      <Solid position={[0, -0.58, -0.06]} scale={[0.5, 0.025, 0.22]} color={COLORS.metal} radius={0.008} metalness={0.8} roughness={0.3} />
    </group>
  );
}

function Laptop() {
  return (
    <group position={[1.0, 1.06, -0.18]} rotation={[0, -0.3, 0]}>
      <Solid position={[0, 0, 0]} scale={[0.78, 0.035, 0.54]} color={COLORS.line} radius={0.01} metalness={0.55} roughness={0.42} />
      {/* Keycap grid: 4 x 9. */}
      {Array.from({ length: 4 }).flatMap((_, row) =>
        Array.from({ length: 9 }).map((__, col) => (
          <Solid
            key={`key${row}-${col}`}
            position={[-0.28 + col * 0.07, 0.023, -0.16 + row * 0.07]}
            scale={[0.052, 0.012, 0.052]}
            color="#2c3d55"
            radius={0.003}
            shadow={false}
          />
        )),
      )}
      <Solid position={[0, 0.022, 0.16]} scale={[0.22, 0.006, 0.14]} color="#22314a" radius={0.003} shadow={false} />
      {/* Lid, tilted back on its hinge. */}
      <Solid position={[0, 0.22, -0.26]} scale={[0.78, 0.44, 0.028]} color="#0a1220" radius={0.01} rotation={[-0.22, 0, 0]} metalness={0.4} roughness={0.45} />
      <Solid
        position={[0, 0.22, -0.244]}
        scale={[0.72, 0.38, 0.01]}
        color={COLORS.glass}
        radius={0.005}
        rotation={[-0.22, 0, 0]}
        emissive={COLORS.blue}
        emissiveIntensity={0.1}
        roughness={0.2}
      />
      {[0.1, 0.03, -0.04].map((y, i) => (
        <Solid
          key={`code${y}`}
          position={[-0.12 + i * 0.04, 0.22 + y, -0.236]}
          scale={[0.34 - i * 0.07, 0.025, 0.004]}
          color={COLORS.blue}
          radius={0.002}
          rotation={[-0.22, 0, 0]}
          emissive={COLORS.blue}
          emissiveIntensity={0.6}
          shadow={false}
        />
      ))}
    </group>
  );
}

function AutomationPanel() {
  return (
    <group position={[1.2, 1.9, -1.51]}>
      <Solid position={[0, 0, 0]} scale={[0.86, 0.78, 0.1]} color="#0a1220" radius={0.015} metalness={0.3} roughness={0.5} />
      <Solid
        position={[0, 0, 0.055]}
        scale={[0.78, 0.7, 0.012]}
        color={COLORS.glass}
        radius={0.006}
        emissive={COLORS.cyan}
        emissiveIntensity={0.05}
        roughness={0.25}
      />
      {/* Flow nodes: three source jobs feeding two results. */}
      {([
        [-0.18, 0.18],
        [-0.18, -0.02],
        [-0.18, -0.22],
        [0.18, 0.08],
        [0.18, -0.12],
      ] as [number, number][]).map(([x, y], i) => (
        <Solid
          key={`node${x}${y}`}
          position={[x, y, 0.064]}
          scale={[0.24, 0.13, 0.008]}
          color={i < 3 ? COLORS.cyan : COLORS.blue}
          radius={0.008}
          emissive={i < 3 ? COLORS.cyan : COLORS.blue}
          emissiveIntensity={0.45}
          shadow={false}
        />
      ))}
      <Solid position={[0, 0.08, 0.062]} scale={[0.1, 0.012, 0.006]} color={COLORS.cyan} radius={0.003} emissive={COLORS.cyan} emissiveIntensity={0.7} shadow={false} />
      {[-0.32, -0.26, -0.2].map((x, i) => (
        <Glow key={`st${x}`} position={[x, 0.36, 0.065]} radius={0.014} color={i === 0 ? COLORS.cyan : COLORS.line} intensity={i === 0 ? 1.6 : 0.2} />
      ))}
    </group>
  );
}

function ServerRack({ ledRef }: { ledRef: React.RefObject<THREE.Mesh | null> }) {
  return (
    <group position={[-1.78, 0.62, -0.7]}>
      <Solid position={[0, 0, 0]} scale={[0.62, 1.2, 0.62]} color="#0a1220" radius={0.015} metalness={0.55} roughness={0.42} />
      {/* Three rack units: faceplate, vent slots, status LED. */}
      {[0.34, 0, -0.34].map((y, index) => (
        <group key={`unit${y}`}>
          <Solid position={[0, y, 0.315]} scale={[0.54, 0.24, 0.02]} color="#16243a" radius={0.006} metalness={0.6} roughness={0.4} />
          {[-0.16, -0.1, -0.04].map((x) => (
            <Solid key={`vent${y}${x}`} position={[x, y, 0.327]} scale={[0.028, 0.17, 0.006]} color={COLORS.line} radius={0.003} shadow={false} />
          ))}
          <mesh ref={index === 0 ? ledRef : undefined} position={[0.19, y + 0.08, 0.33]}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
          <Glow position={[0.19, y - 0.02, 0.33]} radius={0.01} color={COLORS.blue} intensity={0.9} />
        </group>
      ))}
      {([
        [-0.22, -0.63, -0.22],
        [0.22, -0.63, -0.22],
        [-0.22, -0.63, 0.22],
        [0.22, -0.63, 0.22],
      ] as Vec3[]).map(([x, y, z]) => (
        <Rod key={`foot${x}${z}`} position={[x, y, z]} height={0.06} radius={0.026} color={COLORS.metal} metalness={0.85} roughness={0.3} />
      ))}
    </group>
  );
}

function IoTShelf() {
  return (
    <group position={[-1.3, 1.65, -1.49]}>
      <Solid position={[0, -0.18, 0]} scale={[0.6, 0.035, 0.4]} color={COLORS.wood} radius={0.008} metalness={0.05} roughness={0.7} />
      {/* ESP32 board, pin headers, chip, LED, servo on jumper wires. */}
      <Solid position={[0, -0.02, 0]} scale={[0.34, 0.026, 0.24]} color="#14432f" radius={0.006} roughness={0.6} />
      {[-0.1, -0.03, 0.04, 0.11].map((x) => (
        <Solid key={`pin${x}`} position={[x, 0.012, 0.06]} scale={[0.02, 0.02, 0.02]} color="#0b291d" radius={0.003} shadow={false} />
      ))}
      <Solid position={[0, 0.016, -0.04]} scale={[0.11, 0.014, 0.08]} color="#0f172a" radius={0.003} shadow={false} />
      <Glow position={[0.13, 0.02, 0.04]} radius={0.013} color={COLORS.cyan} intensity={1.8} />
      <Rod position={[0.16, 0.06, 0]} height={0.11} radius={0.007} color={COLORS.warm} rotation={[0, 0, -0.32]} />
      <Rod position={[0.22, 0.14, 0]} height={0.09} radius={0.007} color={COLORS.blue} rotation={[0, 0, -0.9]} />
      <Solid position={[0.26, 0.16, 0]} scale={[0.11, 0.1, 0.08]} color="#1c2c44" radius={0.008} metalness={0.4} roughness={0.5} />
      <Rod position={[0.26, 0.22, 0]} height={0.03} radius={0.02} color={COLORS.metal} metalness={0.8} roughness={0.3} />
    </group>
  );
}

function AvatarPlaceholder() {
  return (
    <group position={[1.1, 0.92, 1.05]} rotation={[0, -0.85, 0]}>
      {/* Office chair, so the figure reads as seated rather than floating. */}
      <Rod position={[0, -0.32, -0.18]} height={0.06} radius={0.24} color={COLORS.fabric} metalness={0.1} roughness={0.95} />
      <Rod position={[0, -0.14, -0.2]} height={0.3} radius={0.045} color={COLORS.metal} metalness={0.8} roughness={0.3} />
      <Solid position={[0, 0.02, -0.24]} scale={[0.44, 0.5, 0.08]} color={COLORS.fabric} radius={0.06} metalness={0.1} roughness={0.95} />
      <mesh position={[0, 0.3, -0.06]} castShadow receiveShadow>
        <capsuleGeometry args={[0.2, 0.42, 8, 16]} />
        <meshStandardMaterial color="#38506e" roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.76, -0.04]} castShadow receiveShadow>
        <icosahedronGeometry args={[0.19, 2]} />
        <meshStandardMaterial color="#7c8ea6" roughness={0.7} metalness={0.05} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`arm${side}`} position={[side * 0.22, 0.34, 0.1]} rotation={[0.5, 0, side * 0.18]} castShadow>
          <capsuleGeometry args={[0.055, 0.3, 6, 10]} />
          <meshStandardMaterial color="#2c3f58" roughness={0.85} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`shin${side}`} position={[side * 0.1, 0.02, 0.16]} rotation={[0.7, 0, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.34, 6, 10]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- interaction ---------- */

function HitTarget({
  id,
  position,
  scale,
  active,
  hovered,
  onSelect,
  onHover,
  onHoverCursor,
}: {
  id: RoomObjectId;
  position: Vec3;
  scale: Vec3;
  active: boolean;
  hovered: boolean;
  onSelect: (id: RoomObjectId) => void;
  onHover: (id: RoomObjectId | null) => void;
  onHoverCursor: (on: boolean) => void;
}) {
  const outlineEdges = useMemo(() => new THREE.EdgesGeometry(new RoundedBoxGeometry(1, 1, 1, 2, 0.03)), []);
  return (
    <mesh
      position={position}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(id);
        onHoverCursor(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        onHover(null);
        onHoverCursor(false);
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      {(active || hovered) && (
        <lineSegments>
          <primitive object={outlineEdges} attach="geometry" />
          <lineBasicMaterial color={COLORS.cyan} transparent opacity={active ? 0.85 : 0.42} toneMapped={false} />
        </lineSegments>
      )}
    </mesh>
  );
}

function Scene({
  pointer,
  reducedMotion,
  selected,
  hovered,
  onSelect,
  onHover,
  onHoverCursor,
}: {
  pointer: React.RefObject<Pointer>;
  reducedMotion: boolean;
  selected: RoomObjectId | null;
  hovered: RoomObjectId | null;
  onSelect: (id: RoomObjectId) => void;
  onHover: (id: RoomObjectId | null) => void;
  onHoverCursor: (on: boolean) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.Mesh>(null);
  const led = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const selectedObject = selected ? roomObjects.find((object) => object.id === selected) : null;
  const entrance = useRef(0);

  useEffect(() => {
    entrance.current = reducedMotion ? 1 : 0;
  }, [reducedMotion]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // Narrow canvases need the tighter mobile framing; read from the live size.
    const home: CameraPreset = size.width < 480 ? mobileCamera : defaultCamera;
    const focus: Focus = selectedObject?.camera ?? home;
    const still = reducedMotion || Boolean(selectedObject);

    if (group.current) {
      // Parallax leans the whole iso assembly toward the pointer. Five degrees at
      // most: an orthographic view loses its grid if it tilts far.
      const leanY = still ? 0 : pointer.current.x * 0.05 + Math.sin(t * 0.2) * 0.012;
      const leanX = still ? 0 : pointer.current.y * -0.02;
      group.current.rotation.y += (leanY - group.current.rotation.y) * 0.045;
      group.current.rotation.x += (leanX - group.current.rotation.x) * 0.045;

      entrance.current = reducedMotion ? 1 : Math.min(1, entrance.current + delta * 1.4);
      const eased = 0.6 + 0.4 * (1 - (1 - entrance.current) ** 3);
      group.current.scale.setScalar(eased);
      group.current.position.y = (1 - entrance.current) * -0.25;
    }

    if (!reducedMotion) {
      if (lamp.current) {
        const mat = lamp.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 1.1 + Math.sin(t * 1.8) * 0.08;
      }
      if (led.current) {
        const mat = led.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 1.1 + (Math.sin(t * 3.4) + 1) * 0.5;
      }
    }

    // Orthographic focus moves the camera laterally and resizes the frustum.
    // Reduced motion snaps both instantly instead of easing.
    const easing = reducedMotion ? 1 : selectedObject ? 0.11 : 0.05;
    target.set(...focus.position);
    camera.position.lerp(target, easing);
    lookAt.set(...focus.lookAt);
    camera.lookAt(lookAt);

    const ortho = camera as THREE.OrthographicCamera;
    if (ortho.isOrthographicCamera) {
      const next = ortho.top + (focus.size - ortho.top) * easing;
      ortho.top = next;
      ortho.bottom = -next;
      ortho.left = -next;
      ortho.right = next;
      ortho.updateProjectionMatrix();
    }
  });

  return (
    <group ref={group}>
      <RoomShell />
      <Monitor />
      <Laptop />
      <AutomationPanel />
      <ServerRack ledRef={led} />
      <IoTShelf />
      <AvatarPlaceholder />

      {/* Floor lamp: pole, weighted base, emissive shade. */}
      <Rod position={[1.95, 1.15, -1.45]} height={1.6} radius={0.022} color={COLORS.metal} metalness={0.85} roughness={0.3} />
      <Solid position={[1.95, 0.32, -1.45]} scale={[0.3, 0.03, 0.3]} color={COLORS.line} radius={0.01} metalness={0.7} />
      <mesh ref={lamp} position={[1.95, 1.98, -1.45]} castShadow>
        <coneGeometry args={[0.28, 0.3, 24, 1, true]} />
        <meshStandardMaterial color={COLORS.warm} emissive={COLORS.warm} emissiveIntensity={1.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Corner plant for silhouette variety. */}
      <Rod position={[-1.95, 0.14, -1.4]} height={0.26} radius={0.13} color="#3f2f26" metalness={0.05} roughness={0.9} />
      {(
        [
          [-1.88, 0.42, -1.42, 0.24],
          [-2.02, 0.5, -1.34, 0.19],
          [-1.9, 0.62, -1.48, 0.16],
        ] as [number, number, number, number][]
      ).map(([x, y, z, r]) => (
        <mesh key={`leaf${x}${y}`} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color="#274d3b" roughness={0.85} />
        </mesh>
      ))}

      {roomObjects.map((object) => (
        <HitTarget
          key={object.id}
          id={object.id}
          {...object.hit}
          active={selected === object.id}
          hovered={hovered === object.id}
          onSelect={onSelect}
          onHover={onHover}
          onHoverCursor={onHoverCursor}
        />
      ))}
    </group>
  );
}

/** RoomEnvironment gives standard materials something to reflect, at no asset cost. */
function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = texture;
    scene.environmentIntensity = 0.32;
    return () => {
      texture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

export default function HeroCanvas({
  reducedMotion,
  pointer,
  selected,
  hovered,
  onSelect,
  onHover,
  onReset,
}: {
  reducedMotion: boolean;
  pointer: React.RefObject<Pointer>;
  selected: RoomObjectId | null;
  hovered: RoomObjectId | null;
  onSelect: (id: RoomObjectId) => void;
  onHover: (id: RoomObjectId | null) => void;
  onReset: () => void;
}) {
  const setCursor = (on: boolean) => {
    document.body.style.cursor = on ? "pointer" : "";
  };
  useEffect(() => () => { document.body.style.cursor = ""; }, []);

  return (
    <Canvas
      orthographic
      camera={{
        position: defaultCamera.position,
        left: -defaultCamera.size,
        right: defaultCamera.size,
        top: defaultCamera.size,
        bottom: -defaultCamera.size,
        near: -50,
        far: 100,
      }}
      dpr={[1, 1.6]}
      // Reduced motion still needs frames so a selection can visibly reframe;
      // the scene zeroes its own idle motion in that mode.
      frameloop="always"
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearAlpha(0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      onPointerMissed={onReset}
      fallback={<div aria-hidden="true" className="h-full w-full" />}
      style={{ pointerEvents: "auto" }}
    >
      <color attach="background" args={[COLORS.ink]} />
      <Environment />

      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#9fc6e8", "#0a1220", 0.5]} />
      {/* Key light: the only shadow caster, angled to match the iso view. */}
      <directionalLight
        position={[6, 10, 7]}
        intensity={2.1}
        color="#dbeafe"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={28}
        shadow-bias={-0.0012}
        shadow-normalBias={0.02}
      />
      {/* Fill and rim, no shadows: cheap, keeps the dark faces readable. */}
      <directionalLight position={[-6, 4, 3]} intensity={0.55} color="#7ea6d8" />
      <pointLight position={[1.9, 2.0, -1.4]} intensity={6} distance={6} decay={2} color={COLORS.warm} />
      <pointLight position={[1.6, 1.6, 1.2]} intensity={4} distance={7} decay={2} color={COLORS.cyan} />

      <Scene
        pointer={pointer}
        reducedMotion={reducedMotion}
        selected={selected}
        hovered={hovered}
        onSelect={onSelect}
        onHover={onHover}
        onHoverCursor={setCursor}
      />
    </Canvas>
  );
}
