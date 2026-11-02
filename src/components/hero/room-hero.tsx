"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { roomObjects, roomObjectMap, type RoomObjectId } from "@/content/room";
import { HeroVisual } from "@/components/three/hero-visual";

export function RoomHero() {
  const pointer = useRef({ x: 0, y: 0 });
  const [selected, setSelected] = useState<RoomObjectId | null>(null);
  const [hovered, setHovered] = useState<RoomObjectId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef(new Map<RoomObjectId, HTMLButtonElement>());
  // Where focus should go back to when a card closes; null means the card had no opener.
  const returnFocusRef = useRef<RoomObjectId | null>(null);

  const reset = useCallback(() => {
    setSelected(null);
    setHovered(null);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        reset();
      }
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, reset]);

  useEffect(() => {
    if (selected) return;
    // Only move focus back if it is still inside the hero, so we never steal it from the page.
    const opener = returnFocusRef.current;
    returnFocusRef.current = null;
    if (opener) chipRefs.current.get(opener)?.focus();
  }, [selected]);

  const open = useCallback((id: RoomObjectId) => {
    // Canvas objects have no native focus target. Return to matching chip after close.
    returnFocusRef.current = id;
    setSelected(id);
  }, []);

  const active = selected ? roomObjectMap[selected] : null;

  return (
    <div className="relative">
      <div className="relative mx-auto aspect-square w-full max-w-[34rem] overflow-hidden rounded-card border border-line/60 bg-ink-2/40 lg:-mr-10">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-ink to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center" aria-hidden="true">
          <span className="flex items-center gap-2 rounded-full border border-line/80 bg-ink/70 px-3 py-1.5 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-cyan" />
            <span className="label-mono !text-[0.55rem] !tracking-[0.15em]">Kelvin&apos;s digital room</span>
          </span>
        </div>
        <HeroVisual
          pointer={pointer}
          selected={selected}
          hovered={hovered}
          onSelect={open}
          onHover={setHovered}
          onReset={reset}
        />
      </div>

      {/* Alternative selection: works with touch, keyboard, and no-WebGL. */}
      <ul className="mt-4 flex flex-wrap justify-center gap-2 lg:-mr-10" aria-label="Room objects">
        {roomObjects.map((object) => {
          const isActive = selected === object.id;
          return (
            <li key={object.id}>
              <button
                ref={(element) => {
                  if (element) chipRefs.current.set(object.id, element);
                  else chipRefs.current.delete(object.id);
                }}
                type="button"
                onClick={() => (isActive ? reset() : open(object.id))}
                aria-pressed={isActive}
                aria-label={`${object.label}: ${object.blurb}`}
                className={`min-h-11 rounded-full border px-3.5 text-xs transition-colors ${
                  isActive
                    ? "border-cyan/60 bg-cyan/10 text-cyan"
                    : "border-line text-muted hover:border-line/90 hover:text-fg"
                }`}
              >
                {object.short}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="lg:-mr-10">
        {active && (
          <div
            ref={panelRef}
            tabIndex={-1}
            role="region"
            aria-label={`${active.label} details`}
            className="mt-4 rounded-card border border-line/80 bg-surface/60 p-5 outline-none backdrop-blur-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-mono !text-[0.58rem]">{active.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{active.blurb}</p>
              </div>
              <button
                type="button"
                onClick={reset}
                aria-label="Close details and reset camera"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-cyan/50 hover:text-fg"
              >
                <X size={15} />
              </button>
            </div>
            <Link
              href={active.href}
              onClick={reset}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan px-4 text-xs font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Go to section <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
