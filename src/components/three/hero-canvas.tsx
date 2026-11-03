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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  defaultCamera,
  DESK_SURFACE_Y,
  mobileCamera,
  onDesk,
  roomObjects,
  type CameraPreset,
  type RoomObjectId,
  type Vec3,
} from "@/content/room";
import {
  automationPhaseStep,
  automationSteps,
  erpSteps,
  flowNodes,
  healthColor,
  iotLevels,
  serviceEdges,
  serviceNodes,
  type ServiceHealth,
} from "@/content/room-experiences";
import {
  activeId,
  cycleHealth,
  edgeHealth,
  initialHealth,
  isRunning,
  type DemoState,
} from "@/components/hero/room-experience-types";
import { approach } from "@/components/hero/use-experience";

type Pointer = { x: number; y: number };
type Focus = { position: Vec3; lookAt: Vec3; size: number };

/**
 * What every interactive object in the room receives. The scene never reads a
 * step id or computes a schedule: it is handed the current demo state and a
 * clock, and draws one frame of it.
 */
type DemoParts = {
  demo: DemoState;
  /** The object is open. This is what gates animation, not React re-renders. */
  active: boolean;
  reducedMotion: boolean;
  /** Changed by Reset, so one-shot animations restart from a clean slate. */
  resetKey: number;
};

/** Interactive objects receive `DemoParts`; the static ones take nothing. */
const restDemo: DemoState = { phase: "idle" };

/**
 * Props for one room object. Only the open object gets the live demo state, so
 * a demo tick re-renders one subtree instead of the whole room.
 */
const demoParts = (
  demo: DemoState,
  active: boolean,
  reducedMotion: boolean,
  resetKey: number,
): DemoParts => ({ demo, active, reducedMotion, resetKey });

/** Blinks the rack's faceplate LED. Mounted only while the rack is open. */
function RackBlink({ led }: { led: React.RefObject<THREE.Mesh | null> }) {
  useFrame((state) => {
    const material = led.current?.material as THREE.MeshStandardMaterial | undefined;
    if (material) material.emissiveIntensity = 1.1 + (Math.sin(state.clock.elapsedTime * 3.4) + 1) * 0.5;
  });
  return null;
}

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

      {/* Desk: an executive pedestal desk. Overhanging bevelled top, recessed
          apron, two drawer pedestals standing on toe plinths, a modesty panel
          across the back, and a cable channel with runs escaping behind.
          Local origin sits at the desk centre; +z faces the chair. */}
      <group position={[0.2, 0, -0.35]}>
        <Solid position={[0, DESK_SURFACE_Y - 0.0225, 0]} scale={[2.78, 0.045, 1.04]} color={COLORS.wood} radius={0.014} metalness={0.06} roughness={0.55} />
        {/* Apron, set back so the top's overhang casts a line. */}
        <Solid position={[0, 0.865, 0]} scale={[2.56, 0.09, 0.92]} color="#2f2219" radius={0.012} metalness={0.05} roughness={0.7} />
        {/* Modesty panel bridging the two pedestals at the back. */}
        <Solid position={[0, 0.505, -0.44]} scale={[1.88, 0.63, 0.03]} color="#2f2219" radius={0.008} metalness={0.05} roughness={0.72} />

        {[-1, 1].map((side) => (
          <group key={`pedestal${side}`} position={[side * 1.13, 0, 0]}>
            <Solid position={[0, 0.505, 0]} scale={[0.38, 0.63, 0.92]} color="#33251c" radius={0.012} metalness={0.05} roughness={0.62} />
            {/* Recessed toe plinth: the pedestal stands, it is not sunk into the floor. */}
            <Solid position={[0, 0.095, -0.03]} scale={[0.34, 0.19, 0.86]} color="#241a13" radius={0.01} roughness={0.8} />
            {/* Three drawer faces with bar pulls. */}
            {[0.735, 0.505, 0.275].map((y) => (
              <group key={`drawer${y}`}>
                <Solid position={[0, y, 0.468]} scale={[0.32, 0.185, 0.022]} color="#3a2b22" radius={0.008} metalness={0.05} roughness={0.58} />
                <Solid position={[0, y, 0.484]} scale={[0.2, 0.016, 0.02]} color={COLORS.metal} radius={0.006} metalness={0.85} roughness={0.25} />
              </group>
            ))}
          </group>
        ))}

        {/* Cable channel under the apron, with runs dropping out of sight. */}
        <Solid position={[0, 0.775, -0.3]} scale={[1.8, 0.07, 0.16]} color="#241a13" radius={0.01} roughness={0.75} />
        {([[-0.5, 0.19], [-0.14, 0.23], [0.24, 0.27]] as [number, number][]).map(([x, height]) => (
          <Rod key={`cable${x}`} position={[x, 0.74 - height / 2, -0.34]} height={height} radius={0.011} color="#1b2536" metalness={0.2} roughness={0.6} />
        ))}
      </group>
    </group>
  );
}

/* ---------- objects ---------- */

function Monitor({ demo, active, reducedMotion, resetKey }: DemoParts) {
  // Which flow step the screen is lighting. `activeId` is "" while idle.
  const id = active ? activeId(demo) : null;
  const live = active && isRunning(demo);
  const activeStep = flowNodes.find((node) => erpSteps[node.step].id === id)?.step ?? -1;
  // Reduced motion: show the completed flow rather than marching through it.
  const settled = active && reducedMotion;
  const litStep = settled ? flowNodes.length - 1 : activeStep;
  const flow = useRef(0);

  useFrame((state, delta) => {
    // One run of the flow takes about 3.4s of march; the screen only redraws
    // while something is actually moving.
    const target = live && !reducedMotion ? Math.min(1, flow.current + delta / 3.4) : settled ? 1 : 0;
    if (live && !reducedMotion) flow.current = target;
    else flow.current = approach(flow.current, target, delta, 6);
  });

  return (
    // 0.5925 = the stand base's half-thickness plus its offset; the group origin
    // is the screen centre, so this sits the base flat on the desk.
    <group position={[-0.3, onDesk(0.5925), -0.42]}>
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
      {/* Screen: the authored dashboard rows at rest, replaced by the live flow
          readout once this object is open. The rows are what the screen shows
          when nothing in the room is selected. */}
      {!active && [0.2, 0.06, -0.08, -0.22].map((y, i) => (
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
      {active && (
        <group position={[0, 0, 0.045]}>
          {/* Order path: three left nodes, then delivery and invoice on the right. */}
          {flowNodes.map((node) => {
            const lit = node.step <= litStep || (live && !reducedMotion);
            const colour = lit ? COLORS.cyan : COLORS.line;
            return (
              <Solid
                key={node.id}
                position={[-0.4 + (node.x / 100) * 0.46 + 0.02, 0.28 - (node.y / 100) * 0.56, 0]}
                scale={[0.3, 0.035, 0.006]}
                color={colour}
                radius={0.003}
                emissive={colour}
                emissiveIntensity={lit ? 0.7 : 0.1}
                shadow={false}
              />
            );
          })}
          {/* Progress bar: the whole run, readable at a glance. */}
          <Solid
            position={[-0.28 + (reducedMotion || !live ? 0.3 : 0.3 * flow.current), -0.26, 0]}
            scale={[Math.max(0.02, (reducedMotion || !live ? 1 : flow.current) * 0.56), 0.02, 0.005]}
            color={COLORS.blue}
            radius={0.002}
            emissive={COLORS.blue}
            emissiveIntensity={0.8}
            shadow={false}
          />
        </group>
      )}
      {/* Status LED: the same demo state the HTML panel prints. */}
      <mesh position={[0.5, 0.3, 0.05]}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshStandardMaterial
          color={live && !reducedMotion ? COLORS.cyan : COLORS.line}
          emissive={live && !reducedMotion ? COLORS.cyan : COLORS.line}
          emissiveIntensity={live && !reducedMotion ? 1.6 : 0.3}
          toneMapped={false}
        />
      </mesh>
      {/* Stand: neck, hinge, base. */}
      <Rod position={[0, -0.44, -0.02]} height={0.24} radius={0.035} color={COLORS.metal} metalness={0.8} roughness={0.28} />
      <Solid position={[0, -0.4, -0.02]} scale={[0.16, 0.09, 0.09]} color={COLORS.line} radius={0.01} metalness={0.6} />
      <Solid position={[0, -0.58, -0.06]} scale={[0.5, 0.025, 0.22]} color={COLORS.metal} radius={0.008} metalness={0.8} roughness={0.3} />
    </group>
  );
}

function Laptop({ demo, active, reducedMotion }: DemoParts) {
  const live = active && isRunning(demo);
  const isResponse = live && demo.phase === "running";
  const id = active ? activeId(demo) : null;
  const endpointIndex = id && id.startsWith("endpoint-") ? Number(id.split("-")[1]) : 0;
  const led = useRef(0);

  useFrame((_, delta) => {
    // Network LED: lit while a request or response beat is playing.
    led.current = approach(led.current, isResponse ? 1 : live ? 0.55 : 0.08, delta, 7);
  });

  return (
    // Deck underside (0.0175 half-thickness) rests on the desk surface.
    <group position={[1.0, onDesk(0.0175), -0.18]} rotation={[0, -0.3, 0]}>
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
      {/* Screen lines: at rest they are the authored code block; once the laptop
          is open they become the endpoint readout, brighter on the response beat. */}
      {[0.1, 0.03, -0.04].map((y, i) => {
        const width = active ? 0.3 - i * 0.05 : 0.34 - i * 0.07;
        const intensity = !active ? 0.6 : live ? (isResponse ? 1.3 : 1) : 0.35;
        return (
          <Solid
            key={`code${y}`}
            position={[-0.12 + i * 0.04, 0.22 + y, -0.236]}
            scale={[width, 0.025, 0.004]}
            color={COLORS.blue}
            radius={0.002}
            rotation={[-0.22, 0, 0]}
            emissive={COLORS.blue}
            emissiveIntensity={intensity}
            shadow={false}
          />
        );
      })}
      {/* Response line, drawn only while the demo is answering. */}
      {active && (
        <Solid
          position={[-0.12 + ((endpointIndex + 1) % 3) * 0.04, 0.1 - endpointIndex * 0.02, -0.236]}
          scale={[0.06 + led.current * 0.24, 0.02, 0.004]}
          color={COLORS.cyan}
          radius={0.002}
          rotation={[-0.22, 0, 0]}
          emissive={COLORS.cyan}
          emissiveIntensity={0.4 + led.current * 1.1}
          shadow={false}
        />
      )}
      {/* Network LED on the deck edge. */}
      <mesh position={[0.34, 0.03, 0.14]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#16324a" emissive={COLORS.cyan} emissiveIntensity={0.2 + led.current * 1.8} toneMapped={false} />
      </mesh>
      {!reducedMotion && led.current > 0.02 && (
        <pointLight position={[0.34, 0.12, 0.14]} intensity={led.current * 1.1} distance={0.9} decay={2} color={COLORS.cyan} />
      )}
    </group>
  );
}

function AutomationPanel({ demo, active, reducedMotion }: DemoParts) {
  const id = active ? activeId(demo) : null;
  const live = active && isRunning(demo);
  const phaseIndex = automationSteps.findIndex((step) => step.id === id);
  // Reduced motion shows the finished run instead of animating into it.
  const reached = reducedMotion ? (active ? automationSteps.length : 0) : phaseIndex + 1;
  const sweep = useRef(0);

  useFrame((_, delta) => {
    if (live && !reducedMotion) sweep.current = Math.min(1, sweep.current + delta / 1.6);
    else sweep.current = approach(sweep.current, active && !reducedMotion ? 0 : 0, delta, 4);
  });

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
      {/* Flow nodes: three source jobs feeding two results. While the automation
          demo runs they step up one phase at a time. */}
      {([[-0.18, 0.18], [-0.18, -0.02], [-0.18, -0.22], [0.18, 0.08], [0.18, -0.12]] as [number, number][]).map(([x, y], i) => {
        // Three triggers, then two results: a node lights in phase 1, 2 or 3.
        const nodePhase = i < 3 ? 1 : 2;
        const lit = !active ? i < 3 : reached > nodePhase || reached === -1;
        const dim = active && reached > 0 && !lit;
        const colour = lit ? (i < 3 ? COLORS.cyan : COLORS.blue) : COLORS.line;
        return (
          <Solid
            key={`node${x}${y}`}
            position={[x, y, 0.064]}
            scale={[0.24, 0.13, 0.008]}
            color={colour}
            radius={0.008}
            emissive={colour}
            emissiveIntensity={lit ? (live ? 0.9 : 0.5) : dim ? 0.06 : 0.12}
            shadow={false}
          />
        );
      })}
      {/* Connector between the trigger column and the result column. */}
      <Solid
        position={[0, 0.08, 0.062]}
        scale={[0.1 + (live ? sweep.current * 0.12 : 0), 0.012, 0.006]}
        color={live ? COLORS.cyan : COLORS.line}
        radius={0.003}
        emissive={live ? COLORS.cyan : COLORS.line}
        emissiveIntensity={live ? 1.1 : 0.2}
        shadow={false}
      />
      {[-0.32, -0.26, -0.2].map((x, i) => {
        // Three status lamps, matching the three phrases of the run.
        const lit = !active ? i === 0 : reached > i;
        return <Glow key={`st${x}`} position={[x, 0.36, 0.065]} radius={0.014} color={lit ? COLORS.cyan : COLORS.line} intensity={lit ? (live ? 1.9 : 1.3) : 0.2} />;
      })}
    </group>
  );
}

function ServiceDiagram({ health }: { health: Record<string, ServiceHealth> }) {
  return (
    <group position={[0, 0.02, 0.34]} scale={0.0042}>
      {serviceEdges.map((edge) => {
        const from = serviceNodes.find((node) => node.id === edge.from);
        const to = serviceNodes.find((node) => node.id === edge.to);
        if (!from || !to) return null;
        const state = edgeHealth(health, edge.from, edge.to);
        const x = (from.x + to.x) / 2 - 50;
        const y = 50 - (from.y + to.y) / 2;
        const length = Math.hypot(to.x - from.x, to.y - from.y);
        const angle = Math.atan2(-(to.y - from.y), to.x - from.x);
        return (
          <mesh key={`${edge.from}-${edge.to}`} position={[x, y, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[length, 1.4, 0.6]} />
            <meshStandardMaterial
              color={healthColor[state]}
              emissive={healthColor[state]}
              emissiveIntensity={state === "healthy" ? 0.35 : 0.85}
              toneMapped={false}
            />
          </mesh>
        );
      })}
      {serviceNodes.map((node) => (
        <group key={node.id} position={[node.x - 50, 50 - node.y, 1]}>
          <mesh>
            <boxGeometry args={[28, 11, 0.8]} />
            <meshStandardMaterial
              color="#101c30"
              emissive={healthColor[health[node.id]]}
              emissiveIntensity={health[node.id] === "healthy" ? 0.12 : 0.4}
              metalness={0.4}
              roughness={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ServerRack({
  demo,
  active,
  reducedMotion,
  resetKey,
  setCursorOn,
}: DemoParts & { setCursorOn: (on: boolean) => void }) {
  const [health, setHealth] = useState<Record<string, ServiceHealth>>(() => initialHealth(serviceNodes));
  const [diagram, setDiagram] = useState(false);
  const nodeFaces = useRef(new Map<string, THREE.MeshStandardMaterial>());
  const rackPanel = useRef<THREE.Group>(null);
  const rackLed = useRef<THREE.Mesh>(null);
  const nodeId = active ? activeId(demo) : null;

  // Reset returns every node to healthy, matching the panel's own reset.
  useEffect(() => {
    setHealth(initialHealth(serviceNodes));
    setDiagram(false);
  }, [resetKey]);

  /**
   * One group `useFrame`: it ticks only while this rack is open and either the
   * diagram is deployed or a node has drifted off healthy. Closing the object
   * leaves the loop with nothing to do instead of animating invisibly.
   */
  useFrame((state, delta) => {
    if (!active) return;
    const off = serviceNodes.some((node) => health[node.id] !== "healthy");
    if (!diagram && !off) return;
    const t = state.clock.elapsedTime;
    for (const node of serviceNodes) {
      const faceplate = nodeFaces.current.get(node.id);
      if (!faceplate) continue;
      const currentHealth = health[node.id];
      const base = currentHealth === "healthy" ? 1.5 : currentHealth === "degraded" ? 0.55 : 0.12;
      // Degraded pulses; offline holds flat and dim.
      const target = currentHealth === "degraded" ? base + (Math.sin(t * 4.2) + 1) * 0.35 : base;
      faceplate.emissiveIntensity += (target - faceplate.emissiveIntensity) * Math.min(1, delta * 6);
    }
    if (rackPanel.current) rackPanel.current.visible = diagram;
  });

  const cycle = (id: string) => {
    setHealth((current) => {
      const node = serviceNodes.find((candidate) => candidate.id === id);
      if (!node) return current;
      return { ...current, [id]: cycleHealth(node, current[id]) };
    });
  };

  useEffect(() => {
    if (!active) setDiagram(false);
  }, [active]);

  return (
    <group position={[-1.78, 0.62, -0.7]}>
      <Solid position={[0, 0, 0]} scale={[0.62, 1.2, 0.62]} color="#0a1220" radius={0.015} metalness={0.55} roughness={0.42} />
      {/* Three rack units: faceplate, vent slots, status LED. */}
      {[0.34, 0, -0.34].map((y, index) => {
        const node = serviceNodes[index];
        const state_ = health[node.id];
        const isSelected = active && nodeId === node.id;
        const pulse = !reducedMotion && state_ === "degraded";
        return (
          <group key={`unit${y}`}>
            <Solid position={[0, y, 0.315]} scale={[0.54, 0.24, 0.02]} color="#16243a" radius={0.006} metalness={0.6} roughness={0.4} />
            {[-0.16, -0.1, -0.04].map((x) => (
              <Solid key={`vent${y}${x}`} position={[x, y, 0.327]} scale={[0.028, 0.17, 0.006]} color={COLORS.line} radius={0.003} shadow={false} />
            ))}
            <mesh
              onClick={(event) => {
                if (!active) return;
                event.stopPropagation();
                cycle(node.id);
              }}
              onPointerOver={(event) => {
                if (!active) return;
                event.stopPropagation();
                setCursorOn(true);
              }}
              onPointerOut={() => {
                if (!active) return;
                setCursorOn(false);
              }}
            >
              <sphereGeometry args={[pulse ? 0.023 : 0.018, 10, 10]} />
              <meshStandardMaterial
                ref={(material: THREE.MeshStandardMaterial | null) => {
                  if (material) nodeFaces.current.set(node.id, material);
                }}
                color={healthColor[state_]}
                emissive={healthColor[state_]}
                emissiveIntensity={state_ === "healthy" ? 1.5 : 0.6}
                toneMapped={false}
              />
            </mesh>
            <Glow position={[0.19, y - 0.02, 0.33]} radius={0.01} color={healthColor[state_]} intensity={state_ === "offline" ? 0.1 : 0.9} />
            {isSelected && <Glow position={[-0.2, y + 0.08, 0.33]} radius={0.012} color={COLORS.cyan} intensity={1.4} />}
          </group>
        );
      })}
      {/* Faceplate LED blink, only while the rack is open. */}
      {active && (
        <>
          <mesh ref={rackLed} position={[0.19, 0.42, 0.33]}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
          <RackBlink led={rackLed} />
        </>
      )}
      {/* Approved diagram, deployed onto the rack face on request. */}
      <group ref={rackPanel} visible={false} position={[0, 0, 0.34]}>
        <Solid position={[0, 0, 0]} scale={[0.56, 0.62, 0.012]} color="#0d1729" radius={0.006} metalness={0.2} roughness={0.6} />
        <ServiceDiagram health={health} />
      </group>
      {([[-0.22, -0.63, -0.22], [0.22, -0.63, -0.22], [-0.22, -0.63, 0.22], [0.22, -0.63, 0.22]] as Vec3[]).map(([x, y, z]) => (
        <Rod key={`foot${x}${z}`} position={[x, y, z]} height={0.06} radius={0.026} color={COLORS.metal} metalness={0.85} roughness={0.3} />
      ))}
    </group>
  );
}

function IoTShelf({ demo, active, reducedMotion }: DemoParts) {
  const on = active ? demo.phase === "selected" && demo.id === "on" : false;
  const busy = active && isRunning(demo);
  const level = useRef<number>(iotLevels.off);
  const bulb = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    const target = on ? iotLevels.on : iotLevels.off;
    // Reduced motion jumps to the commanded level: the lamp still responds,
    // it just does not fade.
    level.current = reducedMotion ? target : approach(level.current, target, delta, 5);
    if (bulb.current) {
      const material = bulb.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.15 + level.current * 2.6;
    }
    if (halo.current) halo.current.intensity = level.current * 4.2;
  });

  return (
    <group position={[-1.3, 1.65, -1.49]}>
      <Solid position={[0, -0.18, 0]} scale={[0.6, 0.035, 0.4]} color={COLORS.wood} radius={0.008} metalness={0.05} roughness={0.7} />
      {/* ESP32 board, pin headers, chip, LED, servo on jumper wires. */}
      <Solid position={[0, -0.02, 0]} scale={[0.34, 0.026, 0.24]} color="#14432f" radius={0.006} roughness={0.6} />
      {[-0.1, -0.03, 0.04, 0.11].map((x) => (
        <Solid key={`pin${x}`} position={[x, 0.012, 0.06]} scale={[0.02, 0.02, 0.02]} color="#0b291d" radius={0.003} shadow={false} />
      ))}
      <Solid position={[0, 0.016, -0.04]} scale={[0.11, 0.014, 0.08]} color="#0f172a" radius={0.003} shadow={false} />
      {/* Onboard LED now reports the command path rather than blinking forever. */}
      <Glow
        position={[0.13, 0.02, 0.04]}
        radius={0.013}
        color={busy || on ? COLORS.cyan : COLORS.line}
        intensity={busy ? 2.1 : on ? 1.4 : 0.2}
      />
      <Rod position={[0.16, 0.06, 0]} height={0.11} radius={0.007} color={COLORS.warm} rotation={[0, 0, -0.32]} />
      <Rod position={[0.22, 0.14, 0]} height={0.09} radius={0.007} color={COLORS.blue} rotation={[0, 0, -0.9]} />
      <Solid position={[0.26, 0.16, 0]} scale={[0.11, 0.1, 0.08]} color="#1c2c44" radius={0.008} metalness={0.4} roughness={0.5} />
      <Rod position={[0.26, 0.22, 0]} height={0.03} radius={0.02} color={COLORS.metal} metalness={0.8} roughness={0.3} />
      {/* The lamp the panel controls: shade, bulb, and the light it casts. */}
      <group position={[0, 0.12, 0.04]}>
        <Rod position={[0, -0.06, 0]} height={0.08} radius={0.012} color={COLORS.metal} metalness={0.8} roughness={0.3} />
        <mesh ref={bulb} position={[0, 0.03, 0]}>
          <sphereGeometry args={[0.045, 14, 12]} />
          <meshStandardMaterial color={COLORS.warm} emissive={COLORS.warm} emissiveIntensity={0.4} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.08, 0]} castShadow>
          <coneGeometry args={[0.11, 0.1, 20, 1, true]} />
          <meshStandardMaterial color="#1c2c44" metalness={0.4} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <pointLight ref={halo} position={[0, 0.02, 0]} intensity={0.5} distance={2.4} decay={2} color={COLORS.warm} />
      </group>
    </group>
  );
}

/**
 * The "Me" object. A stylised seated figure on a real office chair: five-star
 * base with casters, gas cylinder, cushion, armrests, and an articulated body.
 * Colours come from the reference photo (skin, dark hair, light shirt) but no
 * facial features are modelled.
 *
 * Interactive: the head tracks the pointer, the chest breathes, and hovering
 * raises the arm into a wave. All of it stops under reduced motion.
 */
function AvatarFigure({
  pointer,
  reducedMotion,
  active,
  hovered,
  greeting,
}: {
  pointer: React.RefObject<Pointer>;
  reducedMotion: boolean;
  active: boolean;
  hovered: boolean;
  /** Panel pressed "Say hello": waves whether or not the pointer is over the figure. */
  greeting: boolean;
}) {

  const head = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const waveArm = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (reducedMotion) {
      head.current?.rotation.set(0, 0, 0);
      torso.current?.rotation.set(active ? 0.1 : 0, 0, 0);
      torso.current?.scale.set(1, 1, 1);
      // A greeting still reads without motion: the arm goes up and stays there.
      waveArm.current?.rotation.set(0, 0, greeting || hovered ? -1.25 : 0);
      return;
    }

    // Head tracks the pointer, clamped so it never turns unnaturally far. While
    // the panel is open the figure also looks at the reader it is addressing.
    const yaw = Math.max(-0.42, Math.min(0.42, active ? 0.1 : pointer.current.x * 0.5));
    const pitch = Math.max(-0.16, Math.min(0.14, active ? -0.04 : -pointer.current.y * 0.22));
    if (head.current) {
      head.current.rotation.y += (yaw - head.current.rotation.y) * Math.min(1, delta * 6);
      head.current.rotation.x += (pitch - head.current.rotation.x) * Math.min(1, delta * 6);
    }

    // Breathing, plus a small lean toward the desk when this object is selected.
    const lean = active ? 0.12 : 0;
    if (torso.current) {
      torso.current.rotation.x += (lean - torso.current.rotation.x) * Math.min(1, delta * 5);
      const breath = 1 + Math.sin(t * 1.6) * 0.012;
      torso.current.scale.set(1, breath, 1);
    }

    // Hover, or an explicit greeting, lifts the arm and waves it.
    const wave = greeting || hovered ? -1.25 + Math.sin(t * 6.5) * 0.18 : 0;
    if (waveArm.current) {
      waveArm.current.rotation.z += (wave - waveArm.current.rotation.z) * Math.min(1, delta * 7);
    }
  });

  const skin = "#d9ac90";
  const hair = "#201814";

  return (
    <group position={[1.1, 0.92, 1.05]} rotation={[0, -0.85, 0]}>
      {/* Chair mat under the whole thing. */}
      <Solid position={[0, -0.905, 0.04]} scale={[0.74, 0.02, 0.74]} color="#16233a" radius={0.01} roughness={0.95} />

      {/* Five-star base: legs radiating from the hub, each ending in a caster. */}
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <group key={`star${deg}`}>
            <Solid
              position={[Math.sin(rad) * 0.13, -0.87, Math.cos(rad) * 0.13]}
              scale={[0.26, 0.032, 0.05]}
              rotation={[0, -rad, 0]}
              color="#2a3a52"
              radius={0.01}
              metalness={0.6}
              roughness={0.4}
            />
            <mesh position={[Math.sin(rad) * 0.25, -0.885, Math.cos(rad) * 0.25]} castShadow>
              <sphereGeometry args={[0.033, 12, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Gas cylinder, seat plate, cushion. */}
      <Rod position={[0, -0.75, 0]} height={0.24} radius={0.045} color="#8fa3bd" metalness={0.85} roughness={0.3} />
      <Rod position={[0, -0.63, 0]} height={0.06} radius={0.06} color="#1e293b" metalness={0.5} roughness={0.5} />
      <Solid position={[0, -0.57, 0]} scale={[0.44, 0.05, 0.42]} color="#233049" radius={0.012} metalness={0.4} roughness={0.5} />
      <Solid position={[0, -0.53, 0]} scale={[0.47, 0.09, 0.45]} color="#1e293b" radius={0.045} metalness={0.08} roughness={0.95} />

      {/* Backrest, lumbar pad and headrest. */}
      <Solid position={[0, -0.16, -0.25]} scale={[0.43, 0.56, 0.09]} color="#1e293b" radius={0.05} rotation={[-0.08, 0, 0]} metalness={0.08} roughness={0.95} />
      <Solid position={[0, -0.3, -0.2]} scale={[0.3, 0.16, 0.06]} color="#26344d" radius={0.03} rotation={[-0.08, 0, 0]} metalness={0.08} roughness={0.95} />
      <Solid position={[0, 0.14, -0.27]} scale={[0.26, 0.1, 0.06]} color="#1e293b" radius={0.03} rotation={[-0.08, 0, 0]} metalness={0.08} roughness={0.95} />

      {/* Armrests: post plus pad, bent forward at the elbow rest. */}
      {[-1, 1].map((side) => (
        <group key={`armrest${side}`} position={[side * 0.27, -0.44, -0.04]}>
          <Solid position={[0, -0.06, 0]} scale={[0.035, 0.2, 0.035]} color="#8fa3bd" radius={0.01} metalness={0.8} roughness={0.3} />
          <Solid position={[0, 0.05, 0.04]} scale={[0.06, 0.035, 0.24]} color="#2a3a52" radius={0.015} metalness={0.4} roughness={0.6} />
        </group>
      ))}

      {/* Seated figure. Legs stay put; torso and up lean as one unit. */}
      {[-1, 1].map((side) => (
        <group key={`leg${side}`}>
          {/* Thigh, angled forward off the seat. */}
          <mesh position={[side * 0.11, -0.45, 0.14]} rotation={[1.35, 0, 0]} castShadow>
            <capsuleGeometry args={[0.078, 0.24, 6, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          {/* Shin down to the floor. */}
          <mesh position={[side * 0.12, -0.72, 0.24]} rotation={[0.18, 0, 0]} castShadow>
            <capsuleGeometry args={[0.062, 0.24, 6, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          {/* Shoe. */}
          <Solid position={[side * 0.12, -0.885, 0.3]} scale={[0.12, 0.06, 0.22]} color="#0f172a" radius={0.02} roughness={0.85} />
        </group>
      ))}

      <group ref={torso}>
        {/* Hips. */}
        <Solid position={[0, -0.47, 0.02]} scale={[0.32, 0.17, 0.28]} color="#1e293b" radius={0.05} roughness={0.9} />

        {/* Torso: chest block plus a shoulder yoke, in the light shirt colour. */}
        <Solid position={[0, -0.26, -0.02]} scale={[0.34, 0.36, 0.22]} color="#9aa3ad" radius={0.07} roughness={0.85} />
        <Solid position={[0, -0.1, -0.02]} scale={[0.4, 0.14, 0.22]} color="#9aa3ad" radius={0.06} roughness={0.85} />
        {/* Collar and placket. */}
        <Solid position={[0, -0.03, 0.08]} scale={[0.16, 0.08, 0.04]} color="#dbe2e8" radius={0.012} roughness={0.9} />
        <Solid position={[0, -0.24, 0.1]} scale={[0.02, 0.28, 0.01]} color="#808a95" radius={0.004} shadow={false} />
        {/* Lanyard and badge. */}
        <Rod position={[-0.05, -0.16, 0.104]} height={0.14} radius={0.005} color="#64e9d0" rotation={[0, 0, 0.22]} metalness={0.2} />
        <Rod position={[0.05, -0.16, 0.104]} height={0.14} radius={0.005} color="#64e9d0" rotation={[0, 0, -0.22]} metalness={0.2} />
        <Solid position={[0, -0.25, 0.108]} scale={[0.09, 0.07, 0.008]} color="#f8fafc" radius={0.006} roughness={0.5} />

        {/* Left arm, resting on the armrest. */}
        <group position={[-0.2, -0.12, -0.02]} rotation={[0.15, 0, -0.12]}>
          <mesh position={[0, -0.09, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.16, 6, 12]} />
            <meshStandardMaterial color="#9aa3ad" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.25, 0.06]} rotation={[0.7, 0, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.16, 6, 12]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.32, 0.14]} castShadow>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
        </group>

        {/* Right arm: the group that waves when hovered. */}
        <group ref={waveArm} position={[0.2, -0.12, -0.02]} rotation={[0.15, 0, 0.12]}>
          <mesh position={[0, -0.09, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.16, 6, 12]} />
            <meshStandardMaterial color="#9aa3ad" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.25, 0.06]} rotation={[0.7, 0, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.16, 6, 12]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.32, 0.14]} castShadow>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
        </group>

        {/* Neck and head. The head group is what turns toward the pointer. */}
        <Rod position={[0, 0, -0.01]} height={0.09} radius={0.05} color={skin} metalness={0.02} roughness={0.75} />
        <group ref={head} position={[0, 0.05, -0.01]}>
          <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.155, 24, 20]} />
            <meshStandardMaterial color={skin} roughness={0.7} metalness={0.02} />
          </mesh>
          {/* Ears. */}
          {[-1, 1].map((side) => (
            <mesh key={`ear${side}`} position={[side * 0.152, 0.12, 0]} castShadow>
              <sphereGeometry args={[0.038, 10, 10]} />
              <meshStandardMaterial color={skin} roughness={0.75} />
            </mesh>
          ))}
          {/* Hair: cap over the crown plus a shorter block at the back. */}
          <mesh position={[0, 0.185, -0.012]} scale={[1.03, 0.86, 1.03]} castShadow>
            <sphereGeometry args={[0.158, 20, 16]} />
            <meshStandardMaterial color={hair} roughness={0.85} />
          </mesh>
          <Solid position={[0, 0.09, -0.1]} scale={[0.24, 0.2, 0.1]} color={hair} radius={0.05} roughness={0.85} />
          {/* Tidy sideburns so the hair block does not look like a floating band. */}
          {[-1, 1].map((side) => (
            <Solid key={`side${side}`} position={[side * 0.13, 0.16, -0.02]} scale={[0.035, 0.11, 0.14]} color={hair} radius={0.012} roughness={0.85} />
          ))}
        </group>
      </group>
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
  setCursorOn,
}: {
  id: RoomObjectId;
  position: Vec3;
  scale: Vec3;
  active: boolean;
  hovered: boolean;
  onSelect: (id: RoomObjectId) => void;
  onHover: (id: RoomObjectId | null) => void;
  setCursorOn: (on: boolean) => void;
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
        setCursorOn(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        onHover(null);
        setCursorOn(false);
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
  demoState,
  resetKey,
  onSelect,
  onHover,
  setCursorOn,
}: {
  pointer: React.RefObject<Pointer>;
  reducedMotion: boolean;
  selected: RoomObjectId | null;
  hovered: RoomObjectId | null;
  demoState: DemoState;
  resetKey: number;
  onSelect: (id: RoomObjectId) => void;
  onHover: (id: RoomObjectId | null) => void;
  setCursorOn: (on: boolean) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const desiredLookAt = useMemo(() => new THREE.Vector3(), []);
  const selectedObject = selected ? roomObjects.find((object) => object.id === selected) : null;
  const entrance = useRef(0);
  // Last values written into the camera, so a settled frame can skip the write.
  const lastSize = useRef(-1);

  useEffect(() => {
    entrance.current = reducedMotion ? 1 : 0;
  }, [reducedMotion]);

  const greeting = selected === "avatar" && demoState.phase === "greeting";
  const erpParts = demoParts(demoState, selected === "monitor", reducedMotion, resetKey);
  const codeParts = demoParts(demoState, selected === "laptop", reducedMotion, resetKey);
  const automationParts = demoParts(demoState, selected === "automation", reducedMotion, resetKey);
  const serverParts = { ...demoParts(demoState, selected === "server", reducedMotion, resetKey), setCursorOn };
  const iotParts = demoParts(demoState, selected === "iot", reducedMotion, resetKey);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // Narrow canvases need the tighter mobile framing; read from the live size.
    const home: CameraPreset = size.width < 480 ? mobileCamera : defaultCamera;
    const focus: Focus = selectedObject?.camera ?? home;
    // Reduced motion settles instantly. Selecting an object keeps the room quiet
    // so the object's own animation reads as the only thing moving.
    const still = reducedMotion || Boolean(selectedObject);
    const speed = reducedMotion ? 1 : selectedObject ? 1.8 : 3.2;
    const easing = 1 - Math.exp(-speed * delta);

    if (group.current) {
      // Parallax leans the whole iso assembly toward the pointer. Five degrees at
      // most: an orthographic view loses its grid if it tilts far.
      const leanY = still ? 0 : pointer.current.x * 0.05 + Math.sin(t * 0.2) * 0.012;
      const leanX = still ? 0 : pointer.current.y * -0.02;
      group.current.rotation.y += (leanY - group.current.rotation.y) * Math.min(1, delta * 2.7);
      group.current.rotation.x += (leanX - group.current.rotation.x) * Math.min(1, delta * 2.7);

      entrance.current = reducedMotion ? 1 : Math.min(1, entrance.current + delta * 1.4);
      const eased = 0.6 + 0.4 * (1 - (1 - entrance.current) ** 3);
      group.current.scale.setScalar(eased);
      group.current.position.y = (1 - entrance.current) * -0.25;
    }

    // Orthographic focus interpolates position, look-at target, and frustum
    // height on the same easing curve, so an object never drifts off centre
    // while the crop is still moving.
    target.set(...focus.position);
    camera.position.lerp(target, easing);
    desiredLookAt.set(...focus.lookAt);
    if (lastSize.current < 0) {
      // First frame: adopt the preset exactly rather than easing in from the origin.
      camera.position.copy(target);
      lookAt.copy(desiredLookAt);
      lastSize.current = focus.size;
    } else {
      lookAt.lerp(desiredLookAt, easing);
    }
    camera.lookAt(lookAt);

    const ortho = camera as THREE.OrthographicCamera;
    if (ortho.isOrthographicCamera) {
      const next = lastSize.current < 0 ? focus.size : ortho.top + (focus.size - ortho.top) * easing;
      if (Math.abs(next - ortho.top) > 1e-4 || lastSize.current !== focus.size) {
        ortho.top = next;
        ortho.bottom = -next;
        ortho.left = -next;
        ortho.right = next;
        ortho.updateProjectionMatrix();
        lastSize.current = focus.size;
      }
    }
  });

  return (
    <group ref={group}>
      <RoomShell />
      <Monitor {...erpParts} />
      <Laptop {...codeParts} />
      <AutomationPanel {...automationParts} />
      <ServerRack {...serverParts} />
      <IoTShelf {...iotParts} />
      <AvatarFigure
        pointer={pointer}
        reducedMotion={reducedMotion}
        active={selected === "avatar"}
        hovered={hovered === "avatar"}
        greeting={greeting}
      />

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
          setCursorOn={setCursorOn}
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
  pointer,
  selected,
  hovered,
  demoState,
  resetKey,
  onSelect,
  onHover,
  onReset,
}: {
  pointer: React.RefObject<Pointer>;
  selected: RoomObjectId | null;
  hovered: RoomObjectId | null;
  demoState: DemoState;
  resetKey: number;
  onSelect: (id: RoomObjectId) => void;
  onHover: (id: RoomObjectId | null) => void;
  onReset: () => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  /**
   * Whether the room is on screen and whether the loop is allowed to run. Both
   * are plain booleans in refs, and the `frameloop` below is derived from the
   * same expression, so the renderer can never disagree with the gate below.
   */
  const visible = useRef(true);
  const liveMotion = useRef(false);
  /** Signature of the gate; changing it is the only thing that re-renders it. */
  const [gate, setGate] = useState("");
  /** Set from inside the Canvas (only R3F knows the renderer). */
  const invalidateRef = useRef<() => void>(() => {});

  const loopWanted = reducedMotion || selected === null || isRunning(demoState) || demoState.phase === "greeting";
  const gateKey = `${loopWanted ? "run" : "stop"}:${visible.current ? "on" : "off"}`;

  useEffect(() => {
    liveMotion.current = loopWanted;
    invalidateRef.current();
    setGate((current) => (current === gateKey ? current : gateKey));
  }, [gateKey, loopWanted]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    const element = wrapper.current;
    if (!element) return;
    const existing = observer.current;
    if (existing) existing.disconnect();
    const next = new IntersectionObserver(
      (entries) => {
        const onScreen = entries[0]?.isIntersecting ?? true;
        if (onScreen === visible.current) return;
        visible.current = onScreen;
        setGate(`${liveMotion.current ? "run" : "stop"}:${onScreen ? "on" : "off"}`);
      },
      { rootMargin: "120px" },
    );
    next.observe(element);
    observer.current = next;
    return () => {
      next.disconnect();
      if (observer.current === next) observer.current = null;
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /** Hover cursor is handled here so no descendant reads the DOM itself. */
  const setCursor = (on: boolean) => {
    document.body.style.cursor = on ? "pointer" : "";
  };
  useEffect(() => () => { document.body.style.cursor = ""; }, []);

  /**
   * On demand, the loop owes exactly one frame to whatever just changed: the
   * camera's new place, a demo's next state, or the gate itself. These effects
   * only run when the value actually changes — an effect that re-fired per
   * render would keep requesting frames forever and the loop would never drain.
   */
  useEffect(() => {
    if (!liveMotion.current) invalidateRef.current();
  }, [gate, selected, reducedMotion]);

  // Settled frames self-invalidate: while live, the scene paints every frame.
  const frameloop = liveMotion.current ? (visible.current ? "always" : "demand") : "demand";

  return (
    <div ref={wrapper} className="absolute inset-0">
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
        frameloop={frameloop}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        onCreated={({ gl, invalidate }) => {
          invalidateRef.current = invalidate;
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
          demoState={demoState}
          resetKey={resetKey}
          onSelect={onSelect}
          onHover={onHover}
          setCursorOn={setCursor}
        />
      </Canvas>
    </div>
  );
}
