"use client";

/**
 * Shared presentation pieces for the room experience panels.
 *
 * Everything interactive in the room is plain React HTML: real buttons, real
 * lists, real live regions. The 3D scene only renders. That split is what keeps
 * keyboard and screen-reader access working even when WebGL is unavailable.
 */

import { Loader2, Play, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

export function PanelSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mt-4 first:mt-0 ${className}`}>
      <h4 className="label-mono !text-[0.55rem]">{title}</h4>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function StatusChip({ tone, children }: { tone: "idle" | "running" | "done"; children: ReactNode }) {
  const tones = {
    idle: "border-line/80 text-muted",
    running: "border-cyan/60 bg-cyan/10 text-cyan",
    done: "border-blue/50 bg-blue/10 text-blue",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] ${tones[tone]}`}>
      {tone === "running" && <Loader2 size={11} className="animate-spin" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = "ghost",
  disabled,
  ...rest
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-cyan text-ink hover:-translate-y-0.5"
      : "border border-line text-fg hover:border-cyan/50";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-[transform,border-color,color] disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function RunControls({
  running,
  onRun,
  onReset,
  runLabel,
  resetKey,
}: {
  running: boolean;
  onRun: () => void;
  onReset: () => void;
  runLabel: string;
  /** Changing this remounts the buttons, cancelling any in-flight focus/animation state. */
  resetKey?: string | number;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <ActionButton key={`run-${resetKey}`} variant="primary" onClick={onRun} aria-label={`${runLabel}. Runs the demo again if it is already playing.`}>
        <Play size={14} aria-hidden="true" /> {running ? `Restart ${runLabel.toLowerCase()}` : runLabel}
      </ActionButton>
      <ActionButton onClick={onReset} aria-label={`Reset ${runLabel.toLowerCase()} to its starting state`}>
        <RotateCcw size={14} aria-hidden="true" /> Reset
      </ActionButton>
    </div>
  );
}

/** Step list. Buttons so every step is reachable by keyboard, not just by click. */
export function StepList({
  steps,
  currentStepId,
  title = "Steps",
  onSelect,
}: {
  steps: readonly { id: string; label: string; detail: string }[];
  currentStepId: string | null;
  title?: string;
  onSelect: (id: string) => void;
}) {
  if (steps.length === 0) return null;
  return (
    <PanelSection title={title}>
      <ul className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const current = step.id === currentStepId;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                aria-pressed={current}
                aria-label={`Step ${index + 1} of ${steps.length}: ${step.label}. ${step.detail}`}
                className={`min-h-11 rounded-full border px-3.5 text-xs transition-colors ${
                  current ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line text-muted hover:border-line/90 hover:text-fg"
                }`}
              >
                <span className="font-mono text-[0.55rem] tabular-nums opacity-70">{String(index + 1).padStart(2, "0")}</span>{" "}
                {step.label}
              </button>
            </li>
          );
        })}
      </ul>
      <StepDetail step={steps.find((step) => step.id === currentStepId) ?? null} />
    </PanelSection>
  );
}

export function StepDetail({ step }: { step: { label: string; detail: string } | null }) {
  if (!step) return null;
  return (
    <div className="mt-3 rounded-lg border border-line/70 bg-ink/40 p-3" aria-live="polite">
      <p className="font-display text-xs font-medium text-fg">{step.label}</p>
      <p className="mt-1 text-[0.8125rem] leading-6 text-muted">{step.detail}</p>
    </div>
  );
}

export function CodeBlock({ label, children }: { label: string; children: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line/70 bg-ink/60">
      <p className="label-mono border-b border-line/70 px-3 py-2 !text-[0.52rem]">{label}</p>
      <pre className="max-h-56 overflow-auto p-3 font-mono text-[0.6875rem] leading-5 text-fg/90">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line/50 py-1.5 last:border-b-0">
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">{label}</span>
      <span className="text-[0.8125rem] text-fg">{value}</span>
    </div>
  );
}

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={`min-h-11 rounded-full border px-3.5 text-xs transition-colors ${
              active ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line text-muted hover:border-line/90 hover:text-fg"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
