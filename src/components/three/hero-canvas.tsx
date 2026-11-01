"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { defaultCamera, roomObjects, type RoomObjectId, type Vec3 } from "@/content/room";

type Pointer = { x: number; y: number };
type Focus = { position: Vec3; lookAt: Vec3 };

const COLORS = {
  ink: "#080d18",
  wall: "#101827",
  surface: "#172235",
  line: "#263247",
  cyan: "#64e9d0",
  blue: "#5b8def",
  warm: "#f5d9a8",
} as const;

function Box({
  position,
  scale,
  color = COLORS.surface,
  emissive,
  emissiveIntensity = 0,
  rotation,
}: {
  position: Vec3;
  scale: Vec3;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  rotation?: Vec3;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.72} metalness={0.15} />
    </mesh>
  );
}

function ScreenBars({ position, scale, color = COLORS.cyan }: { position: Vec3; scale: Vec3; color?: string }) {
  const bars = [0.78, 0.54, 0.68, 0.38];
  return (
    <group position={position} scale={scale}>
      {bars.map((width, index) => <Box key={index} position={[-0.12 + width * 0.22, 0.14 - index * 0.1, 0.02]} scale={[width, 0.035, 0.012]} color={color} emissive={color} emissiveIntensity={0.35} />)}
    </group>
  );
}

function Monitor() {
  return (
    <group position={[-0.62, 1.44, -0.48]}>
      <Box position={[0, 0, 0]} scale={[1.18, 0.7, 0.08]} color="#0c1525" />
      <Box position={[0, 0, 0.045]} scale={[1.02, 0.55, 0.012]} color="#102b3b" emissive={COLORS.cyan} emissiveIntensity={0.07} />
      <ScreenBars position={[0, 0, 0.055]} scale={[0.85, 0.8, 1]} />
      <Box position={[0, -0.52, 0]} scale={[0.08, 0.46, 0.08]} />
      <Box position={[0, -0.76, 0]} scale={[0.55, 0.05, 0.25]} color={COLORS.line} />
    </group>
  );
}

function Laptop() {
  return (
    <group position={[0.55, 0.98, -0.2]} rotation={[0, -0.1, 0]}>
      <Box position={[0, 0.035, 0]} scale={[0.9, 0.07, 0.58]} color={COLORS.line} />
      <Box position={[0, 0.38, -0.25]} scale={[0.86, 0.62, 0.055]} color="#0c1525" rotation={[-0.2, 0, 0]} />
      <Box position={[0, 0.38, -0.215]} scale={[0.73, 0.46, 0.012]} color="#102b3b" emissive={COLORS.blue} emissiveIntensity={0.08} rotation={[-0.2, 0, 0]} />
      <ScreenBars position={[0, 0.38, -0.18]} scale={[0.61, 0.64, 1]} color={COLORS.blue} />
    </group>
  );
}

function AutomationPanel() {
  return (
    <group position={[1, 2, -1.16]}>
      <Box position={[0, 0, 0]} scale={[0.82, 0.58, 0.09]} color="#0c1525" />
      {[[-0.23, 0.16], [0.23, 0.16], [-0.23, -0.14], [0.23, -0.14]].map(([x, y], index) => (
        <Box key={index} position={[x, y, 0.055]} scale={[0.22, 0.1, 0.012]} color={index % 2 ? COLORS.blue : COLORS.cyan} emissive={index % 2 ? COLORS.blue : COLORS.cyan} emissiveIntensity={0.35} />
      ))}
    </group>
  );
}

function ServerRack({ ledRef }: { ledRef: React.RefObject<THREE.Mesh | null> }) {
  return (
    <group position={[1.5, 0.58, -0.8]}>
      <Box position={[0, 0, 0]} scale={[0.52, 1.05, 0.48]} color="#0c1525" />
      {[0.3, 0, -0.3].map((y, index) => (
        <group key={index}>
          <Box position={[0, y, 0.25]} scale={[0.4, 0.18, 0.015]} color={COLORS.line} />
          <mesh ref={index === 0 ? ledRef : undefined} position={[0.12, y, 0.264]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function IoTDevice() {
  return (
    <group position={[-1.4, 2.1, -1.03]}>
      <Box position={[0, 0, 0]} scale={[0.38, 0.32, 0.28]} color="#193243" />
      <Box position={[0, 0.02, 0.15]} scale={[0.12, 0.06, 0.012]} color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={0.6} />
      <Box position={[0.14, 0.27, 0]} scale={[0.025, 0.5, 0.025]} color= {COLORS.line} rotation={[0, 0, -0.16]} />
    </group>
  );
}

function AvatarPlaceholder() {
  return (
    <group position={[0.56, 0.55, 0.22]} rotation={[0, -0.35, 0]}>
      <mesh position={[0, 0.65, 0]}><capsuleGeometry args={[0.19, 0.43, 6, 10]} /><meshStandardMaterial color="#334155" roughness={0.9} /></mesh>
      <mesh position={[0, 1.12, 0]}><icosahedronGeometry args={[0.19, 1]} /><meshStandardMaterial color="#64748b" roughness={0.9} /></mesh>
      <Box position={[-0.27, 0.66, -0.04]} scale={[0.08, 0.36, 0.08]} color="#334155" rotation={[0, 0, -0.25]} />
      <Box position={[0.27, 0.66, -0.04]} scale={[0.08, 0.36, 0.08]} color="#334155" rotation={[0, 0, 0.25]} />
      <Box position={[-0.12, 0.2, 0]} scale={[0.11, 0.38, 0.11]} color="#1e293b" />
      <Box position={[0.12, 0.2, 0]} scale={[0.11, 0.38, 0.11]} color="#1e293b" />
    </group>
  );
}

function HitTarget({
  id,
  position,
  scale,
  active,
  hovered,
  onSelect,
  onHover,
}: {
  id: RoomObjectId;
  position: Vec3;
  scale: Vec3;
  active: boolean;
  hovered: boolean;
  onSelect: (id: RoomObjectId) => void;
  onHover: (id: RoomObjectId | null) => void;
}) {
  return (
    <mesh
      position={position}
      scale={scale}
      onPointerDown={(event) => { event.stopPropagation(); onSelect(id); }}
      onPointerOver={(event) => { event.stopPropagation(); onHover(id); }}
      onPointerOut={(event) => { event.stopPropagation(); onHover(null); }}
      onPointerMissed={() => onHover(null)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial transparent opacity={0} />
      {(active || hovered) && <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} /><lineBasicMaterial color={COLORS.cyan} transparent opacity={active ? 0.7 : 0.45} /></lineSegments>}
    </mesh>
  );
}

function Room({
  pointer,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  pointer: React.RefObject<Pointer>;
  selected: RoomObjectId | null;
  hovered: RoomObjectId | null;
  onSelect: (id: RoomObjectId) => void;
  onHover: (id: RoomObjectId | null) => void;
}) {
  const room = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.Mesh>(null);
  const led = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const selectedObject = selected ? roomObjects.find((object) => object.id === selected) : null;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const focus: Focus = selectedObject?.camera ?? defaultCamera;
    if (room.current && !selected) {
      room.current.rotation.y += (pointer.current.x * 0.09 + Math.sin(t * 0.22) * 0.025 - room.current.rotation.y) * 0.025;
      room.current.rotation.x += (pointer.current.y * -0.035 - room.current.rotation.x) * 0.025;
      room.current.position.y = Math.sin(t * 0.45) * 0.018;
    } else if (room.current) {
      room.current.rotation.y += (pointer.current.x * 0.03 - room.current.rotation.y) * 0.03;
      room.current.rotation.x *= 0.96;
      room.current.position.y *= 0.95;
    }
    if (lamp.current) (lamp.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.45 + Math.sin(t * 2.2) * 0.04;
    if (led.current) (led.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.45 + (Math.sin(t * 3.5) + 1) * 0.15;
    target.set(...focus.position);
    camera.position.lerp(target, selected ? 0.07 : 0.025);
    lookAt.set(...focus.lookAt);
    camera.lookAt(lookAt);
  });

  return (
    <group ref={room}>
      <Box position={[0, -0.13, 0]} scale={[3.7, 0.12, 2.7]} color={COLORS.surface} />
      <Box position={[-1.82, 1.22, 0]} scale={[0.08, 2.8, 2.7]} color={COLORS.wall} />
      <Box position={[0, 1.22, -1.28]} scale={[3.7, 2.8, 0.08]} color={COLORS.wall} />
      <Box position={[0, 0.04, -0.5]} scale={[3.1, 0.08, 1.18]} color="#111c2f" />
      <Box position={[0, 0.82, -0.32]} scale={[2.25, 0.14, 0.9]} color={COLORS.line} />
      <Box position={[-0.86, 0.36, -0.32]} scale={[0.12, 0.85, 0.12]} color={COLORS.line} />
      <Box position={[0.86, 0.36, -0.32]} scale={[0.12, 0.85, 0.12]} color={COLORS.line} />
      <Box position={[0, 0.35, -0.32]} scale={[0.1, 0.8, 0.1]} color={COLORS.line} />
      <Monitor /><Laptop /><AutomationPanel /><ServerRack ledRef={led} /><IoTDevice /><AvatarPlaceholder />
      <Box position={[1.35, 1.55, -0.92]} scale={[0.07, 0.62, 0.07]} color={COLORS.line} />
      <mesh ref={lamp} position={[1.35, 1.88, -0.92]}><coneGeometry args={[0.23, 0.22, 8]} /><meshStandardMaterial color={COLORS.warm} emissive={COLORS.warm} emissiveIntensity={0.5} /></mesh>
      {roomObjects.map((object) => <HitTarget key={object.id} id={object.id} {...object.hit} active={selected === object.id} hovered={hovered === object.id} onSelect={onSelect} onHover={onHover} />)}
    </group>
  );
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
  return (
    <Canvas
      camera={{ position: defaultCamera.position, fov: 40 }}
      dpr={[1, 1.5]}
      frameloop={reducedMotion ? "demand" : "always"}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
      onPointerMissed={onReset}
      fallback={<div aria-hidden="true" className="h-full w-full" />}
      style={{ pointerEvents: "auto" }}
    >
      <color attach="background" args={[COLORS.ink]} />
      <fog attach="fog" args={[COLORS.ink, 5, 10]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[-3, 5, 3]} intensity={1.2} color="#dbeafe" />
      <pointLight position={[1.3, 1.9, -0.8]} intensity={3} distance={4} color={COLORS.warm} />
      <pointLight position={[-2, 2.5, 1]} intensity={4} distance={6} color={COLORS.blue} />
      <Room pointer={pointer} selected={selected} hovered={hovered} onSelect={onSelect} onHover={onHover} />
    </Canvas>
  );
}
