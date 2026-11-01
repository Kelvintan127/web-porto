"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroCanvas = dynamic(() => import("@/components/three/hero-canvas"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="h-full w-full" />,
});

export function HeroVisual() {
  const [reduced, setReduced] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      const canvas = document.createElement("canvas");
      setWebgl(Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  if (!webgl) {
    return (
      <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
        <div className="relative size-48 rounded-full border border-cyan/20 bg-cyan/5 shadow-[0_0_90px_rgba(100,233,208,0.12)]">
          <div className="absolute inset-8 rounded-full border border-blue/30" />
          <div className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan shadow-[0_0_30px_#64e9d0]" />
        </div>
      </div>
    );
  }

  return <HeroCanvas reducedMotion={reduced} />;
}
