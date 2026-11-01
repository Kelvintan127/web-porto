"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { RoomObjectId } from "@/content/room";

type Pointer = { x: number; y: number };

function RoomSkeleton({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <div className="relative size-56 rounded-2xl border border-line/60 bg-surface/30">
        <div className="absolute inset-x-6 top-8 h-2 rounded-full bg-line/70" />
        <div className="absolute inset-x-10 top-14 h-2 rounded-full bg-line/50" />
        <div className="absolute inset-x-8 bottom-8 h-10 rounded-lg bg-line/40" />
        <div className="absolute inset-0 animate-pulse rounded-2xl bg-cyan/[0.04]" />
      </div>
      <span className="label-mono mt-6 !text-[0.55rem]">{label}</span>
    </div>
  );
}

const HeroCanvas = dynamic(() => import("@/components/three/hero-canvas"), {
  ssr: false,
  loading: () => <RoomSkeleton label="Warming up the room" />,
});

export function HeroVisual({
  pointer,
  selected,
  hovered,
  onSelect,
  onHover,
  onReset,
}: {
  pointer: React.RefObject<Pointer>;
  selected: RoomObjectId | null;
  hovered: RoomObjectId | null;
  onSelect: (id: RoomObjectId) => void;
  onHover: (id: RoomObjectId | null) => void;
  onReset: () => void;
}) {
  const [reduced, setReduced] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      const canvas = document.createElement("canvas");
      setWebgl(Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  if (webgl === false) {
    return (
      <div className="absolute inset-0 grid place-items-center" aria-label="Static digital room preview">
        <div className="w-[78%] rounded-card border border-line/70 bg-surface/30 p-4">
          <div className="h-2 w-1/3 rounded-full bg-cyan/40" />
          <div className="mt-3 space-y-2"><div className="h-2 w-2/3 rounded-full bg-line/70" /><div className="h-2 w-1/2 rounded-full bg-line/50" /></div>
          <div className="mt-5 grid grid-cols-3 gap-2"><div className="h-12 rounded-md bg-line/40" /><div className="h-12 rounded-md bg-cyan/20" /><div className="h-12 rounded-md bg-blue/20" /></div>
          <p className="label-mono mt-4 !text-[0.55rem]">Static room preview · WebGL off</p>
        </div>
      </div>
    );
  }

  if (webgl === null) return <RoomSkeleton label="Loading room" />;

  return (
    <div className="absolute inset-0" onPointerMove={(event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      pointer.current = { x: ((event.clientX - rect.left) / rect.width - 0.5) * 2, y: ((event.clientY - rect.top) / rect.height - 0.5) * 2 };
    }} onPointerLeave={() => { pointer.current = { x: 0, y: 0 }; }}>
      <HeroCanvas reducedMotion={reduced} pointer={pointer} selected={selected} hovered={hovered} onSelect={onSelect} onHover={onHover} onReset={onReset} />
    </div>
  );
}
