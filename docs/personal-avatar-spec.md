# Personalized 3D Avatar — Asset Specification & Integration Plan

Status: **blocked on assets**. No reference photo and no GLB exist in the working
environment, and no 3D authoring tooling is installed. The procedural
`AvatarFigure` remains the live avatar and is untouched.

## 1. What was verified

| Check | Result |
|---|---|
| `IMG_9794.jpeg` anywhere on the filesystem | **Not found** (whole-`/` search, excluding `/proc`) |
| Any `.glb` / `.gltf` / `.vrm` / `.fbx` in the repo | **None** |
| `public/assets/` contents | Site art only (logos, screenshots, CV). No avatar model |
| `Kelvin Tan Image.png` in `public/assets/` | Exists (200 KB), but it is an existing site asset, **not** the named reference, and it has not been approved for likeness derivation |
| Blender / Meshroom / `trimesh` / `bpy` | **None installed** — no photogrammetry, no rigging, no retopology path |
| Vision capability in this session | **Unavailable.** `vision_analyze` returns `model has no vision support`, so even with the photo supplied I cannot read facial geometry from it |

Consequence: producing a likeness is not possible here, and inventing one is
explicitly out of scope. Nothing below has been implemented.

## 2. Reference photo requirements

For a *recognizable* stylized likeness, one front photo is not enough — jaw
depth, ear shape, and skull profile are unobservable from a single angle. Supply:

- **Minimum:** one 3/4 view, face ≥ 1000 px tall, even lighting, neutral
  expression, no glasses/hat/hand occlusion
- **Preferred:** front + both 3/4 views + profile, shot > 1.5 m away at ~50 mm
  equivalent (avoids the nose-enlargement of a close selfie)
- Plus an explicit written note of what may be stylized vs. what must stay
  faithful (e.g. "hair volume may be exaggerated; face shape may not")

Appearance details already stated in the brief, which are usable as authoring
input without a photo: short thick black hair with volume on top, side-swept;
oval face, slightly defined jawline; dark eyebrows; dark brown eyes;
clean-shaven; friendly, subtle smile; dark smart-casual clothing.

## 3. Model specification

Target roughly 8–14 k triangles — enough for a stylized likeness, cheap enough
to sit inside a scene that already renders a full room every frame.

- **Format** `glb` (single file, embedded textures). No `gltf` + sidecar files.
- **Scale / origin** 1 unit = 1 metre, origin at floor between the feet,
  +Z forward, matching `three` conventions.
- **Mesh** single skinned mesh; no morph targets. Separate material slots for
  skin, hair, eyes, and clothing — nothing per-pixel that can be a flat colour.
- **Textures** at most two 1024×1024 maps (base colour + roughness/AO packed).
  No normal map unless it is doing real work at this poly count. Prefer the
  existing `#d9ac90` skin and `#201814` hair values from `AvatarFigure` so the
  figure sits in the room's palette without re-lighting.
- **Seated pose is required.** The avatar occupies a chair at
  `[1.1, 0.92, 1.05]` rotated `-0.85` rad; a standing rig would need both the
  chair and the camera preset re-authored.
- **Rig** standard humanoid, ≤ 40 bones. Clip names below are the contract.
- **Animation** three clips, all authored *without* root motion:
  - `Idle` — looping, ~4 s, breathing amplitude ≤ 1.2 % of torso height
  - `Wave` — one-shot, ~1.4 s, returns to the `Idle` rest pose on its last frame
  - `LookAt` — optional additive head/torso turn; the existing code drives head
    rotation in `useFrame`, so a clip here is only worth authoring if it reads
    better than the procedural version
- **Budget** total asset ≤ 1.5 MB compressed; ≤ 2 MB hard ceiling.

## 4. Integration plan

### New component

`src/components/three/personal-avatar.tsx` — a thin wrapper, not a rewrite:

```
PersonalAvatar({ pointer, reducedMotion, active, hovered, greeting, modelUrl? })
```

Behaviour:

- `modelUrl` absent, or the model fails to load → render the existing
  `AvatarFigure` unchanged. This is the default path today.
- Load with `useGLTF` (`@react-three/drei`) — already a transitive dependency via
  `@react-three/fiber`; confirm before adding anything to `package.json`.
- Clone with `useGraph` so the scene graph is never mutated in place, and dispose
  cloned materials on unmount.
- Drive `skeleton`/`AnimationMixer` from the existing `useFrame` contract. The
  mixer is advanced with the `delta` already passed in — do **not** add a second
  render loop.
- Clip selection mirrors the current logic exactly:
  - `greeting || hovered` → `Wave` (one-shot, `LoopOnce`, `clampWhenFinished`)
  - `active` → `Idle` plus the existing lean
  - otherwise → `Idle`
- `reducedMotion` → no mixer playback at all; pose the skeleton at the rest frame
  and hold the arm up during a greeting, matching what `AvatarFigure` does today.

### Preserved contracts — do not touch

- Hit target: `room.ts` → `avatar.hit` = `position [1.1, 0.92, 1.05]`,
  `scale [0.56, 1.44, 0.56]`
- Camera preset: `avatar.camera` = `position [8.028, 7.848, 7.978]`,
  `lookAt [1.1, 0.92, 1.05]`, `size 1.45`
- `DemoState` phase `"greeting"` and the `DemoParts` contract
  (`demo, active, reducedMotion, resetKey`)
- The room's existing lights and `Environment`; the model ships no lights

### Performance

- Lazy-load the model only when the avatar is first selected or hovered, so the
  initial hero paint is unaffected. Keep the procedural figure as the
  placeholder during load — no layout shift, no empty chair.
- `dpr` is already capped at `[1, 1.6]`; nothing to change.
- The loop already stops when the room is off-screen or settled. A GLB must not
  reintroduce permanent animation — an `Idle` clip that plays forever will keep
  the loop awake. Gate playback on `active` and on `greeting`, exactly as the
  procedural version does, and stop the mixer when neither holds.

### Validation before merge

1. `npx tsc --noEmit`, `npx vitest run`, `npx next build` clean
2. All six room experiences still open; avatar still focuses the same camera
3. 390 px mobile — model loads, no horizontal overflow, controls ≥ 44 px
4. WebGL unavailable → the existing non-canvas chip list still selects the avatar
5. Reduced motion → static pose, greeting still legible
6. Asset budget checked against the sizes in §3
7. Confirm no new network calls at runtime beyond the model fetch itself

## 5. To unblock

Any one of these:

1. Put `IMG_9794.jpeg` (plus the extra angles from §2) somewhere in the working
   directory and re-run — note that a photo still needs an authoring step to
   become a rigged model, and this environment has no tooling to perform it.
2. Supply a finished `.glb` meeting §3; integration is then a small, contained
   diff and can be done here.
3. Have the model authored externally against §3 and drop the file in
   `public/models/`.
