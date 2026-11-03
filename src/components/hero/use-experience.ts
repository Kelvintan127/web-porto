"use client";

/**
 * Step engine for one room object's demo.
 *
 * Every demo in the room is the same shape: a list of typed steps, a status,
 * and a timer that advances to the next step until the list wraps and the demo
 * reports back to idle. Two behaviours are deliberately monotonic so the 3D
 * scene can drive an animation from them without owning any state:
 *
 * - `runToken` only changes when a run starts, so a scene can restart a one-shot
 *   animation when it changes.
 * - `phase` is what the renderer switches on; the scene never reads step ids.
 *
 * There is one `useEffect` and it only ever schedules a single timeout. When the
 * object is not selected nothing is scheduled and nothing re-renders.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { DemoStatus, ExperienceStep } from "@/content/room-experiences";
import { resolveStepId, stepAfter, stepDelay } from "@/content/room-experiences";

export type StepRun = {
  status: DemoStatus;
  currentStepId: string | null;
  /** The step being played, in full, for the panel to render. */
  currentStep: ExperienceStep | null;
  /** True when the reader paused the run by picking a step by hand. */
  paused: boolean;
  /** 1-based position of the current step, 0 at rest. */
  stepNumber: number;
  stepCount: number;
  /** Increments on every run start so one-shot scene animations can restart. */
  runToken: number;
  selectStep: (id: string) => void;
  run: () => void;
  reset: () => void;
};

export function useStepRun({
  steps,
  active,
  reducedMotion,
  resetKey,
}: {
  steps: readonly ExperienceStep[];
  /** False when the room object is closed: pauses the demo without losing its position. */
  active: boolean;
  reducedMotion: boolean;
  /** Change this to hard-reset (used by the Back to room control). */
  resetKey: unknown;
}): StepRun {
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [runToken, setRunToken] = useState(0);
  // Read inside callbacks so `run` never needs `status` in its dependency list.
  const statusRef = useRef<DemoStatus>("idle");

  const commit = useCallback((next: DemoStatus, id: string | null) => {
    statusRef.current = next;
    setStatus(next);
    setCurrentStepId(id);
  }, []);

  const pausedStepId = useRef<string | null>(null);

  // Hard reset when the room closes, or when the step list gained or lost rows.
  useEffect(() => {
    commit("idle", resolveStepId(steps, null));
  }, [commit, resetKey, steps]);

  useEffect(() => {
    if (!active || status !== "running" || !currentStepId) return;
    const delay = stepDelay(steps, currentStepId);
    if (delay === null) return;
    // Reduced motion still plays every step: it is content, not decoration.
    const timer = setTimeout(() => {
      // A run the reader started stops on the last step; a step picked by hand
      // keeps advancing so it is possible to read through the process.
      const last = steps[steps.length - 1]?.id === currentStepId;
      if (last && pausedStepId.current !== currentStepId) {
        commit("complete", currentStepId);
        return;
      }
      const next = stepAfter(steps, currentStepId);
      if (next && next.id !== currentStepId) {
        commit("running", next.id);
      } else {
        // Single-step demos settle instead of flickering in place.
        commit("complete", currentStepId);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [active, commit, currentStepId, status, steps]);

  const selectStep = useCallback(
    (id: string) => {
      // Pausing is tracked separately from `status`, because `status` only knows
      // idle / running / complete and a paused run must not look finished.
      pausedStepId.current = id;
      commit("running", id);
    },
    [commit],
  );

  const run = useCallback(() => {
    if (steps.length === 0) return;
    pausedStepId.current = null;
    commit("running", steps[0].id);
    setRunToken((token) => token + 1);
  }, [commit, steps]);

  const reset = useCallback(() => {
    pausedStepId.current = null;
    commit("idle", resolveStepId(steps, null));
  }, [commit, steps]);

  const index = currentStepId ? steps.findIndex((step) => step.id === currentStepId) : -1;
  return {
    status,
    currentStepId,
    currentStep: index >= 0 ? steps[index] : null,
    paused: pausedStepId.current === currentStepId,
    stepNumber: status === "idle" ? 0 : index + 1,
    stepCount: steps.length,
    runToken,
    selectStep,
    run,
    reset,
  };
}

/**
 * Eases a number toward a target without a per-frame animation library. The
 * scene uses it for the lamp and LED fades; the panel uses it for nothing.
 */
export function approach(current: number, target: number, delta: number, rate = 8): number {
  return current + (target - current) * Math.min(1, delta * rate);
}
