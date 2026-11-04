"use client";

/**
 * PersonalAvatar — stylized seated figure built from the written appearance
 * spec (docs/personal-avatar-spec.md). Procedural geometry, zero new deps.
 *
 * Spec mapping:
 *   HAIR  natural black, thick straight, voluminous top, side-swept fringe,
 *         part on the figure's left (viewer's right), rounded hairline,
 *         neatly tapered sides
 *   FACE  slightly elongated oval, moderately defined jaw with soft
 *         transitions, rounded slightly tapered chin, subtle cheekbones
 *   EYES  dark brown, almond, slightly hooded, neutral canthal tilt, medium
 *   BROWS medium-thick, mostly straight, subtle natural arch, black-brown
 *   EARS  medium, slightly protruding but close to the head
 *   SKIN  light to light-medium, warm-neutral undertone
 *   BUILD slim-to-average, moderately broad shoulders, upright relaxed posture
 *   WEAR  dark charcoal crew neck under a minimalist dark overshirt
 *   FACE  subtle natural smile, relaxed eyes and brows
 *
 * No photographic likeness was traced: this is the spec as geometry. When a
 * rigged GLB meeting the spec exists, it can replace this render while keeping
 * the exact same animation contract (pointer, active, hovered, greeting,
 * reducedMotion) — the call site will not change.
 *
 * Animation contract is identical to AvatarFigure: idle breathing, clamped
 * head tracking, greeting wave, lean toward the desk when selected. Reduced
 * motion poses statically with the arm held up during a greeting.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Rod, Solid, ROOM_COLORS } from "@/components/three/room-primitives";

type Pointer = { x: number; y: number };

/** Palette from the spec, tuned to sit inside the room's existing lighting. */
const SKIN = "#e8c4a2";
const SKIN_SHADE = "#d6ae8b";
const HAIR = "#171310";
const BROW = "#241a14";
const EYE_IRIS = "#3a2a1d";
const SCLERA = "#f4ede6";
const LIP = "#c9977b";
const TOP = "#242a33"; // charcoal crew neck
const JACKET = "#1b212b"; // minimalist dark overshirt
const TROUSERS = "#1a202b";
const SHOE = "#10141c";

/** Chair + figure, one JSX tree — a drop-in for AvatarFigure. */
export function PersonalAvatar({
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
  /** Panel pressed "Say hello": waves whether or not the pointer is over. */
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

    // Head tracks the pointer, clamped so it never turns unnaturally far.
    // While the panel is open the figure looks at the reader it addresses.
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

  return (
    <group position={[1.1, 0.92, 1.05]} rotation={[0, -0.85, 0]}>
      {/* Chair mat. */}
      <Solid position={[0, -0.905, 0.04]} scale={[0.74, 0.02, 0.74]} color="#16233a" radius={0.01} roughness={0.95} />

      {/* Five-star base with casters. */}
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

      {/* Gas cylinder, seat plate, cushion, backrest, armrests. */}
      <Rod position={[0, -0.75, 0]} height={0.24} radius={0.045} color="#8fa3bd" metalness={0.85} roughness={0.3} />
      <Rod position={[0, -0.63, 0]} height={0.06} radius={0.06} color="#1e293b" metalness={0.5} roughness={0.5} />
      <Solid position={[0, -0.57, 0]} scale={[0.44, 0.05, 0.42]} color="#233049" radius={0.012} metalness={0.4} roughness={0.5} />
      <Solid position={[0, -0.53, 0]} scale={[0.47, 0.09, 0.45]} color="#1e293b" radius={0.045} metalness={0.08} roughness={0.95} />
      <Solid position={[0, -0.16, -0.25]} scale={[0.43, 0.56, 0.09]} color="#1e293b" radius={0.05} rotation={[-0.08, 0, 0]} metalness={0.08} roughness={0.95} />
      <Solid position={[0, -0.3, -0.2]} scale={[0.3, 0.16, 0.06]} color="#26344d" radius={0.03} rotation={[-0.08, 0, 0]} metalness={0.08} roughness={0.95} />
      <Solid position={[0, 0.14, -0.27]} scale={[0.26, 0.1, 0.06]} color="#1e293b" radius={0.03} rotation={[-0.08, 0, 0]} metalness={0.08} roughness={0.95} />
      {[-1, 1].map((side) => (
        <group key={`armrest${side}`} position={[side * 0.27, -0.44, -0.04]}>
          <Solid position={[0, -0.06, 0]} scale={[0.035, 0.2, 0.035]} color="#8fa3bd" radius={0.01} metalness={0.8} roughness={0.3} />
          <Solid position={[0, 0.05, 0.04]} scale={[0.06, 0.035, 0.24]} color="#2a3a52" radius={0.015} metalness={0.4} roughness={0.6} />
        </group>
      ))}

      {/* Seated figure: legs stay put; torso and up move as one unit. */}
      {[-1, 1].map((side) => (
        <group key={`leg${side}`}>
          <mesh position={[side * 0.11, -0.45, 0.14]} rotation={[1.35, 0, 0]} castShadow>
            <capsuleGeometry args={[0.078, 0.24, 6, 14]} />
            <meshStandardMaterial color={TROUSERS} roughness={0.9} />
          </mesh>
          <mesh position={[side * 0.12, -0.72, 0.24]} rotation={[0.18, 0, 0]} castShadow>
            <capsuleGeometry args={[0.062, 0.24, 6, 14]} />
            <meshStandardMaterial color={TROUSERS} roughness={0.9} />
          </mesh>
          <Solid position={[side * 0.12, -0.885, 0.3]} scale={[0.12, 0.06, 0.22]} color={SHOE} radius={0.02} roughness={0.85} />
        </group>
      ))}

      <group ref={torso}>
        {/* Hips. */}
        <Solid position={[0, -0.47, 0.02]} scale={[0.32, 0.17, 0.28]} color={TROUSERS} radius={0.05} roughness={0.9} />

        {/* Torso: charcoal crew neck, moderately broad shoulders. */}
        <Solid position={[0, -0.26, -0.02]} scale={[0.34, 0.36, 0.22]} color={JACKET} radius={0.07} roughness={0.85} />
        <Solid position={[0, -0.1, -0.02]} scale={[0.42, 0.14, 0.22]} color={JACKET} radius={0.06} roughness={0.85} />
        {/* Crew-neck collar ring. */}
        <Rod position={[0, -0.03, 0.005]} height={0.02} radius={0.078} color={TOP} metalness={0.05} roughness={0.9} rotation={[0.18, 0, 0]} />
        {/* Overshirt lapel seams: two dark trims suggesting an open jacket. */}
        {[-1, 1].map((side) => (
          <Solid
            key={`lapel${side}`}
            position={[side * 0.06, -0.14, 0.095]}
            scale={[0.028, 0.3, 0.012]}
            rotation={[0, 0, side * -0.16]}
            color="#2c3542"
            radius={0.006}
            roughness={0.8}
            shadow={false}
          />
        ))}

        {/* Left arm resting on the armrest. */}
        <group position={[-0.2, -0.12, -0.02]} rotation={[0.15, 0, -0.12]}>
          <mesh position={[0, -0.09, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.16, 6, 12]} />
            <meshStandardMaterial color={JACKET} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.25, 0.06]} rotation={[0.7, 0, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.16, 6, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.32, 0.14]} castShadow>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
        </group>

        {/* Right arm: the group that waves when hovered or greeted. */}
        <group ref={waveArm} position={[0.2, -0.12, -0.02]} rotation={[0.15, 0, 0.12]}>
          <mesh position={[0, -0.09, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.16, 6, 12]} />
            <meshStandardMaterial color={JACKET} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.25, 0.06]} rotation={[0.7, 0, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.16, 6, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.32, 0.14]} castShadow>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
        </group>

        {/* Neck. */}
        <Rod position={[0, 0, -0.01]} height={0.09} radius={0.05} color={SKIN} metalness={0.02} roughness={0.75} />

        {/* Head. The head group is what turns toward the pointer. */}
        <group ref={head} position={[0, 0.05, -0.01]}>
          {/* Skull: slightly elongated oval (taller than wide). */}
          <mesh position={[0, 0.13, 0]} scale={[0.97, 1.06, 1.0]} castShadow receiveShadow>
            <sphereGeometry args={[0.155, 24, 20]} />
            <meshStandardMaterial color={SKIN} roughness={0.62} metalness={0.02} />
          </mesh>
          {/* Jaw/lower face: softer transition, slightly narrower. */}
          <mesh position={[0, 0.06, 0.014]} scale={[0.9, 0.6, 0.98]} castShadow>
            <sphereGeometry args={[0.13, 20, 16]} />
            <meshStandardMaterial color={SKIN} roughness={0.62} />
          </mesh>
          {/* Chin: rounded, slightly tapered, a touch forward. */}
          <mesh position={[0, -0.008, 0.042]} scale={[0.55, 0.42, 0.5]} castShadow>
            <sphereGeometry args={[0.055, 12, 10]} />
            <meshStandardMaterial color={SKIN_SHADE} roughness={0.62} />
          </mesh>

          {/* Ears: medium, slightly protruding but close to the head. */}
          {[-1, 1].map((side) => (
            <mesh key={`ear${side}`} position={[side * 0.148, 0.115, -0.006]} rotation={[0, 0, side * -0.16]} castShadow>
              <sphereGeometry args={[0.034, 10, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.72} />
            </mesh>
          ))}

          {/* Slight cheekbone shading: subtle, per spec. */}
          {[-1, 1].map((side) => (
            <mesh key={`cheek${side}`} position={[side * 0.078, 0.085, 0.089]} scale={[0.75, 0.5, 0.32]} castShadow={false}>
              <sphereGeometry args={[0.038, 10, 8]} />
              <meshStandardMaterial color={SKIN_SHADE} roughness={0.62} />
            </mesh>
          ))}

          {/* Eyes: almond (flattened sphere), dark brown iris, hooded by a
              soft brow ridge above. Neutral canthal tilt. */}
          {[-1, 1].map((side) => (
            <group key={`eye${side}`} position={[side * 0.056, 0.132, 0.112]}>
              <mesh scale={[1, 0.6, 0.5]}>
                <sphereGeometry args={[0.03, 14, 12]} />
                <meshStandardMaterial color={SCLERA} roughness={0.3} metalness={0.05} />
              </mesh>
              <mesh position={[0, 0, 0.012]} scale={[1, 1, 0.4]}>
                <sphereGeometry args={[0.013, 10, 10]} />
                <meshStandardMaterial color={EYE_IRIS} roughness={0.25} metalness={0.1} />
              </mesh>
              {/* Hood: skin fold resting just above the lid. */}
              <mesh position={[0, 0.013, 0.002]} scale={[1.35, 0.3, 0.6]}>
                <sphereGeometry args={[0.03, 12, 8]} />
                <meshStandardMaterial color={SKIN} roughness={0.62} />
              </mesh>
            </group>
          ))}

          {/* Brows: medium-thick, mostly straight with a subtle arch. */}
          {[-1, 1].map((side) => (
            <Solid
              key={`brow${side}`}
              position={[side * 0.056, 0.172, 0.108]}
              scale={[0.062, 0.013, 0.014]}
              rotation={[0, 0, side * -0.1]}
              color={BROW}
              radius={0.005}
              roughness={0.85}
              shadow={false}
            />
          ))}

          {/* Nose: soft bridge and a rounded tip, kept subtle. */}
          <mesh position={[0, 0.09, 0.128]} scale={[0.55, 1, 0.7]} castShadow={false}>
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshStandardMaterial color={SKIN_SHADE} roughness={0.62} />
          </mesh>
          <mesh position={[0, 0.068, 0.14]} castShadow={false}>
            <sphereGeometry args={[0.016, 10, 8]} />
            <meshStandardMaterial color={SKIN_SHADE} roughness={0.62} />
          </mesh>

          {/* Mouth: subtle natural smile — a shallow curved band. Two small
              corner lifts read as a smile without cartoon exaggeration. */}
          <mesh position={[0, 0.012, 0.126]} scale={[1.9, 0.5, 0.5]} castShadow={false}>
            <sphereGeometry args={[0.02, 12, 8]} />
            <meshStandardMaterial color={LIP} roughness={0.6} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={`smile${side}`} position={[side * 0.021, 0.016, 0.124]} scale={[0.5, 0.4, 0.5]} castShadow={false}>
              <sphereGeometry args={[0.009, 8, 6]} />
              <meshStandardMaterial color={SKIN_SHADE} roughness={0.62} />
            </mesh>
          ))}

          {/* HAIR: natural black, thick, straight, voluminous on top.
              Cap over the crown, swept to the figure's left (viewer's right),
              rounded hairline, tapered sides, sideburns. */}
          {/* Crown mass: scaled up and forward for top volume. */}
          <mesh position={[0.012, 0.196, -0.008]} scale={[1.0, 0.92, 1.04]} castShadow>
            <sphereGeometry args={[0.158, 20, 16]} />
            <meshStandardMaterial color={HAIR} roughness={0.85} />
          </mesh>
          {/* Front sweep: side-swept fringe riding over the forehead toward
              the figure's left. Slightly raised for texture. */}
          <mesh position={[0.02, 0.175, 0.078]} rotation={[0.28, 0.16, 0.1]} scale={[1.05, 0.55, 0.6]} castShadow>
            <sphereGeometry args={[0.15, 18, 14]} />
            <meshStandardMaterial color={HAIR} roughness={0.85} />
          </mesh>
          {/* Quiff volume on top: pushes mass up-left of centre. */}
          <mesh position={[-0.03, 0.225, 0.012]} rotation={[0.05, 0, -0.14]} scale={[0.82, 0.5, 0.94]} castShadow>
            <sphereGeometry args={[0.135, 16, 12]} />
            <meshStandardMaterial color={HAIR} roughness={0.85} />
          </mesh>
          {/* Back and nape coverage. */}
          <Solid position={[0, 0.085, -0.1]} scale={[0.235, 0.21, 0.1]} color={HAIR} radius={0.05} roughness={0.85} />
          {/* Tapered sides: slim blocks hugging the skull above the ears. */}
          {[-1, 1].map((side) => (
            <Solid
              key={`side${side}`}
              position={[side * 0.128, 0.155, -0.015]}
              scale={[0.035, 0.1, 0.15]}
              color={HAIR}
              radius={0.012}
              roughness={0.85}
            />
          ))}
          {/* Neat sideburns connecting the taper to the jaw. */}
          {[-1, 1].map((side) => (
            <Solid
              key={`burn${side}`}
              position={[side * 0.125, 0.1, 0.02]}
              scale={[0.024, 0.055, 0.05]}
              color={HAIR}
              radius={0.008}
              roughness={0.85}
            />
          ))}
        </group>
      </group>
    </group>
  );
}


/* -------------------------------------------------------------------------- *
 * Fallback.
 *
 * The previous procedural figure, kept verbatim from hero-canvas.tsx. If the
 * personalised spec ever needs to be rolled back — or a future GLB fails its
 * budget checks — hero-canvas can render this instead by importing it. It is
 * the exact figure the room shipped with before the personalisation, so the
 * room's look and camera framing are unaffected by the swap back.
 * -------------------------------------------------------------------------- */

export function ProceduralAvatarFallback({
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
