"use client";

/**
 * The six room experiences, rendered as accessible HTML.
 *
 * Each id gets its own component and its own local demo state. Nothing here
 * talks to a network: the endpoints, job runs, and service health are all
 * authored demo content from `room-experiences.ts`.
 *
 * Layout contract: every panel is a column of sections with the primary control
 * group first, written as normal block flow so it stays usable on a 320px phone
 * and in a wide two-column grid.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Lightbulb, LightbulbOff, Waves } from "lucide-react";
import {
  automationPhaseStep,
  automationStats,
  automationSteps,
  avatarCopy,
  avatarGreeting,
  codeEndpoints,
  erpSteps,
  flowNodes,
  iotCommands,
  iotCopy,
  iotLevels,
  openOrdersAtRest,
  projectPreviews,
  requestPulses,
  serviceEdges,
  serviceNodes,
  type DemoStatus,
  type IotCommandId,
  type ServiceHealth,
} from "@/content/room-experiences";
import {
  commandLogLine,
  cycleHealth,
  edgeHealth,
  healthHex,
  healthSummary,
  initialHealth,
  lampReadout,
  type DemoState,
} from "@/components/hero/room-experience-types";
import { useStepRun } from "@/components/hero/use-experience";
import {
  CodeBlock,
  KeyValue,
  PanelSection,
  RunControls,
  StatusChip,
  StepList,
  ToggleGroup,
} from "@/components/room/room-ui";

export type ExperienceProps = {
  /** The object is open in the room, so its demo may animate. */
  active: boolean;
  reducedMotion: boolean;
  /** Bumped whenever the room resets, so a re-opened panel starts clean. */
  resetKey: number;
  /** Pushed to the 3D scene; the scene never reads step ids. */
  onState: (state: DemoState) => void;
};

const json = (value: unknown) => JSON.stringify(value, null, 2);

/* ------------------------------------------------------------------ monitor */

function ErpFlowExperience({ active, reducedMotion, resetKey, onState }: ExperienceProps) {
  const run = useStepRun({ steps: erpSteps, active, reducedMotion, resetKey });
  const { status, currentStepId, stepNumber, stepCount, runToken, paused, selectStep } = run;

  // Only the invoice step closes the order, and it stays closed once it has run.
  const invoiced = currentStepId === "invoice";
  const openOrders = invoiced ? openOrdersAtRest - 1 : openOrdersAtRest;

  useEffect(() => {
    onState({ phase: "stepping", step: currentStepId ?? "" });
  }, [currentStepId, onState]);

  return (
    <>
      <PanelSection title="Demo status">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone={status === "running" ? "running" : status === "complete" ? "done" : "idle"}>
            {status === "complete"
              ? `Complete · ${stepCount}/${stepCount}`
              : status !== "running"
                ? "At rest"
                : paused
                  ? `Paused · step ${stepNumber}/${stepCount}`
                  : `Step ${stepNumber}/${stepCount}`}
          </StatusChip>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
            Open orders {openOrders}
          </span>
        </div>
      </PanelSection>

      <RunControls running={status === "running"} onRun={run.run} onReset={run.reset} runLabel="Run flow" resetKey={`${runToken}-${resetKey}`} />

      <PanelSection title="Process flow">
        <ol className="grid gap-2 sm:grid-cols-1">
          {flowNodes.map((node) => {
            const step = erpSteps[node.step];
            const current = step.id === currentStepId;
            return (
              <li key={node.id} className="flex items-start gap-2">
                <ChevronRight
                  size={14}
                  aria-hidden="true"
                  className={`mt-0.5 shrink-0 ${current ? "text-cyan" : "text-line"}`}
                />
                <div>
                  <p className={`text-xs font-medium ${current ? "text-cyan" : "text-fg"}`}>{node.label}</p>
                  <p className="text-[0.75rem] leading-5 text-muted">{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </PanelSection>

      <StepList steps={erpSteps} currentStepId={currentStepId} title="Step detail" onSelect={selectStep} />
    </>
  );
}

/* ------------------------------------------------------------------- laptop */

function ApiExperience({ active, reducedMotion, resetKey, onState }: ExperienceProps) {
  const endpoints = codeEndpoints;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pulseIndex, setPulseIndex] = useState(0);
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [runs, setRuns] = useState(0);

  const selected = endpoints[selectedIndex];
  const pulses = useMemo(() => requestPulses(selectedIndex), [selectedIndex]);
  const pulse = pulses[pulseIndex] ?? pulses[0];

  useEffect(() => {
    onState(pulseIndex === 1 ? { phase: "running" } : { phase: "selected", id: `endpoint-${selectedIndex}` });
  }, [onState, pulseIndex, selectedIndex]);

  // One timer at a time: request beat, then response beat, then complete.
  useEffect(() => {
    if (!active || status !== "running") return;
    const timer = setTimeout(() => {
      if (pulseIndex === 0) {
        setPulseIndex(1);
      } else {
        setStatus("complete");
      }
    }, reducedMotion ? 700 : 850);
    return () => clearTimeout(timer);
  }, [active, pulseIndex, reducedMotion, status]);

  useEffect(() => {
    setStatus("idle");
    setPulseIndex(0);
  }, [resetKey]);

  const send = () => {
    setStatus("running");
    setPulseIndex(0);
    setRuns((count) => count + 1);
  };

  const reset = () => {
    setStatus("idle");
    setPulseIndex(0);
    setSelectedIndex(0);
  };

  return (
    <>
      <PanelSection title="Demo status">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone={status === "running" ? "running" : status === "complete" ? "done" : "idle"}>
            {status === "running" ? `In flight · ${pulse.direction === "out" ? "request" : "response"}` : "Idle"}
          </StatusChip>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
            Local mock · {runs} run{runs === 1 ? "" : "s"}
          </span>
        </div>
      </PanelSection>

      <RunControls running={status === "running"} onRun={send} onReset={reset} runLabel="Send request" resetKey={`${runs}-${resetKey}`} />

      <PanelSection title="Endpoints">
        <ul className="grid gap-2">
          {endpoints.map((endpoint, index) => {
            const current = index === selectedIndex;
            return (
              <li key={endpoint.path}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIndex(index);
                    setStatus("idle");
                    setPulseIndex(0);
                  }}
                  aria-pressed={current}
                  className={`flex min-h-11 w-full flex-wrap items-center gap-2 rounded-lg border px-3 text-left transition-colors ${
                    current ? "border-cyan/60 bg-cyan/10" : "border-line/70 hover:border-line"
                  }`}
                >
                  <span className={`font-mono text-[0.58rem] ${endpoint.method === "GET" ? "text-blue" : "text-cyan"}`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-[0.6875rem] text-fg/90">{endpoint.path}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </PanelSection>

      <PanelSection title="Exchange">
        <div aria-live="polite" className="grid gap-2">
          <CodeBlock label={selected.request ? `Request · ${selected.method}` : `Response · ${selected.method}`}>
            {selected.request ? json(selected.request) : json(selected.body)}
          </CodeBlock>
          {selected.request && (
            <CodeBlock label={`Response · ${selected.status} ${selected.statusText}`}>{json(selected.body)}</CodeBlock>
          )}
        </div>
        <p className="mt-2 text-[0.8125rem] leading-6 text-muted">{selected.note}</p>
      </PanelSection>

      <PanelSection title="Verified projects">
        <ul className="grid gap-2">
          {projectPreviews.map((preview) => (
            <li key={preview.slug} className="rounded-lg border border-line/70 bg-ink/40 p-3">
              <p className="font-display text-xs font-medium text-fg">{preview.title}</p>
              <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-muted">
                {preview.type} · {preview.year}
              </p>
              <p className="mt-1.5 text-[0.8125rem] leading-6 text-muted">{preview.summary}</p>
              <p className="mt-1.5 text-[0.75rem] leading-5 text-fg/80">{preview.highlight}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[0.6875rem]">
                <Link href={preview.href} className="text-cyan/90 underline decoration-cyan/30 underline-offset-4 hover:text-cyan">
                  Read case study
                </Link>
                {preview.link && (
                  <a
                    href={preview.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted underline decoration-line underline-offset-4 hover:text-fg"
                  >
                    {preview.linkLabel}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </PanelSection>
    </>
  );
}

/* --------------------------------------------------------------- automation */

function AutomationExperience({ active, reducedMotion, resetKey, onState }: ExperienceProps) {
  const run = useStepRun({ steps: automationSteps, active, reducedMotion, resetKey });
  const { status, currentStepId, stepNumber, stepCount, runToken, paused, selectStep } = run;
  const phase = (Object.keys(automationPhaseStep) as (keyof typeof automationPhaseStep)[]).find(
    (key) => automationSteps[automationPhaseStep[key]].id === currentStepId,
  );

  useEffect(() => {
    onState({ phase: "stepping", step: currentStepId ?? "" });
  }, [currentStepId, onState]);

  return (
    <>
      <PanelSection title="Demo status">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone={status === "running" ? "running" : status === "complete" ? "done" : "idle"}>
            {status === "complete"
              ? `Complete · ${stepCount}/${stepCount}`
              : status !== "running"
                ? "Idle"
                : `${paused ? "Paused · " : ""}Phase ${stepNumber}/${stepCount}${phase ? ` · ${phase}` : ""}`}
          </StatusChip>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
            Trigger → Process → Result
          </span>
        </div>
      </PanelSection>

      <RunControls
        running={status === "running"}
        onRun={run.run}
        onReset={run.reset}
        runLabel="Run demo"
        resetKey={`${runToken}-${resetKey}`}
      />

      <PanelSection title="Run log">
        <ol className="grid gap-1.5" aria-live="polite">
          {automationSteps.map((step, index) => {
            const reached = status !== "idle" && index <= (stepNumber === 0 ? -1 : stepNumber - 1);
            return (
              <li key={step.id} className="flex items-baseline gap-2 font-mono text-[0.6875rem]">
                <span className={reached ? "text-cyan" : "text-line"}>{reached ? "●" : "○"}</span>
                <span className={reached ? "text-fg/90" : "text-muted"}>
                  {String(index + 1).padStart(2, "0")} {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </PanelSection>

      <StepList steps={automationSteps} currentStepId={currentStepId} title="Phase detail" onSelect={selectStep} />

      <PanelSection title="Demo totals">
        <KeyValue label="Runs today" value={String(automationStats.runsToday)} />
        <KeyValue label="Rows processed" value={automationStats.rowsProcessed.toLocaleString("en-US")} />
        <KeyValue label="Manual minutes saved" value={`${automationStats.minutesSaved}`} />
      </PanelSection>
    </>
  );
}

/* -------------------------------------------------------------- server rack */

function ServiceStatusExperience({ active, resetKey, onState }: ExperienceProps) {
  // Demo-only local state. Replaced with live probes only if that ever exists.
  const [health, setHealth] = useState<Record<string, ServiceHealth>>(() => initialHealth(serviceNodes));
  const [selectedId, setSelectedId] = useState(serviceNodes[0].id);
  const [restarts, setRestarts] = useState(0);

  useEffect(() => {
    setHealth(initialHealth(serviceNodes));
    setSelectedId(serviceNodes[0].id);
    setRestarts(0);
  }, [resetKey]);

  useEffect(() => {
    if (!active) return;
    onState({ phase: "selected", id: selectedId });
  }, [active, onState, selectedId]);

  const node = serviceNodes.find((candidate) => candidate.id === selectedId) ?? serviceNodes[0];
  const counts = serviceNodes.reduce<Record<ServiceHealth, number>>(
    (accumulator, current) => ({ ...accumulator, [health[current.id]]: accumulator[health[current.id]] + 1 }),
    { healthy: 0, degraded: 0, offline: 0 },
  );

  const toggle = (id: string) => {
    setHealth((current) => {
      const nodeForId = serviceNodes.find((candidate) => candidate.id === id);
      if (!nodeForId) return current;
      return { ...current, [id]: cycleHealth(nodeForId, current[id]) };
    });
    setSelectedId(id);
    setRestarts((count) => count + 1);
  };

  return (
    <>
      <PanelSection title="Service status">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
          {(["healthy", "degraded", "offline"] as ServiceHealth[]).map((state) => (
            <span key={state} className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: healthHex(state) }} aria-hidden="true" />
              {state} {counts[state]}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[0.8125rem] leading-6 text-muted" aria-live="polite">
          {healthSummary(health, serviceNodes)}
        </p>
      </PanelSection>

      <div className="mt-4 flex flex-wrap gap-2">
        <RunControls
          running={false}
          onRun={() => {
            setHealth(initialHealth(serviceNodes));
            setRestarts((count) => count + 1);
          }}
          onReset={() => {
            setHealth(initialHealth(serviceNodes));
            setSelectedId(serviceNodes[0].id);
            setRestarts((count) => count + 1);
          }}
          runLabel="Reset all to healthy"
          resetKey={`${restarts}-${resetKey}`}
        />
      </div>

      <PanelSection title="Status controls">
        <ul className="grid gap-2">
          {serviceNodes.map((candidate) => (
            <li key={candidate.id}>
              <button
                type="button"
                onClick={() => toggle(candidate.id)}
                aria-pressed={candidate.id === selectedId}
                aria-label={`${candidate.label}: currently ${health[candidate.id]}. Cycle to the next status.`}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 text-left transition-colors ${
                  candidate.id === selectedId ? "border-cyan/60 bg-cyan/10" : "border-line/70 hover:border-line"
                }`}
              >
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: healthHex(health[candidate.id]) }} aria-hidden="true" />
                <span className="text-xs text-fg">{candidate.label}</span>
                <span className="ml-auto font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
                  {health[candidate.id]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </PanelSection>

      <PanelSection title={node.label}>
        <p className="text-[0.8125rem] leading-6 text-muted">{node.detail}</p>
        <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
          {node.role} · {health[node.id]}
        </p>
      </PanelSection>

      <PanelSection title="Diagram">
        {/* Static, fictional, inline SVG: no external assets, no real hostnames. */}
        <div className="overflow-hidden rounded-lg border border-line/70 bg-ink/60 p-3">
          <svg viewBox="0 0 100 100" role="img" aria-label="Diagram of four demo services: reverse proxy, file sync, job runner, and database" className="h-48 w-full">
            {serviceEdges.map((edge) => {
              const from = serviceNodes.find((candidate) => candidate.id === edge.from);
              const to = serviceNodes.find((candidate) => candidate.id === edge.to);
              if (!from || !to) return null;
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={healthHex(edgeHealth(health, edge.from, edge.to))}
                  strokeWidth={0.8}
                  strokeDasharray={edgeHealth(health, edge.from, edge.to) === "healthy" ? undefined : "3 2"}
                />
              );
            })}
            {serviceNodes.map((candidate) => (
              <g key={candidate.id}>
                <rect
                  x={candidate.x - 14}
                  y={candidate.y - 6}
                  width={28}
                  height={12}
                  rx={2}
                  fill="#111d31"
                  stroke={healthHex(health[candidate.id])}
                  strokeWidth={candidate.id === selectedId ? 1.2 : 0.6}
                />
                <circle cx={candidate.x - 10.5} cy={candidate.y} r={1.4} fill={healthHex(health[candidate.id])} />
                <text x={candidate.x - 6} y={candidate.y + 1.4} fill="#94a3b8" fontSize={3.4} fontFamily="monospace">
                  {candidate.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-muted">
          Fictional services · no live infrastructure is contacted
        </p>
      </PanelSection>
    </>
  );
}

/* -------------------------------------------------------------- IoT device */

function DeviceExperience({ active, reducedMotion, resetKey, onState }: ExperienceProps) {
  const [on, setOn] = useState(false);
  const [command, setCommand] = useState<IotCommandId | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const readout = lampReadout(on);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    setOn(false);
    setCommand(null);
    setLog([]);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [resetKey]);

  useEffect(() => {
    if (!active) return;
    onState(on ? { phase: "selected", id: "on" } : { phase: "selected", id: "off" });
  }, [active, on, onState]);

  const send = (id: IotCommandId) => {
    const next = id === "on";
    setCommand(id);
    setOn(next);
    const at = Date.now();
    setLog((entries) => [commandLogLine(id, next, at), ...entries].slice(0, 4));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCommand(null), reducedMotion ? 200 : 900);
  };

  return (
    <>
      <PanelSection title="Device">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone={command ? "running" : on ? "done" : "idle"}>{readout.label}</StatusChip>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
            {iotCopy.board} · {iotCopy.firmware}
          </span>
        </div>
        <p className="mt-2 text-[0.8125rem] leading-6 text-muted">
          {on ? iotCopy.lastCommandOn : iotCopy.lastCommandOff} · brightness {Math.round(iotLevels[on ? "on" : "off"] * 100)}%
        </p>
      </PanelSection>

      <PanelSection title="Lamp control">
        <ToggleGroup
          label={`Virtual lamp control for ${iotCopy.device}`}
          options={iotCommands.map((entry) => ({ id: entry.id, label: entry.label }))}
          value={on ? "on" : "off"}
          onChange={(id) => send(id)}
        />
        <p className="mt-2 text-[0.8125rem] leading-6 text-muted">
          {on ? (
            <span className="inline-flex items-center gap-2 text-cyan">
              <Lightbulb size={14} aria-hidden="true" /> The shelf lamp in the room is lit.
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <LightbulbOff size={14} aria-hidden="true" /> The shelf lamp in the room is dark.
            </span>
          )}
        </p>
      </PanelSection>

      <PanelSection title="Command log">
        <ul className="grid gap-1 font-mono text-[0.6875rem] text-muted" aria-live="polite">
          {log.length === 0 ? <li>No commands sent this session.</li> : log.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </PanelSection>

      <PanelSection title="How this works">
        <p className="text-[0.8125rem] leading-6 text-muted">{iotCopy.detail}</p>
        <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-muted">
          Local state only · no device has been contacted
        </p>
      </PanelSection>
    </>
  );
}

/* ------------------------------------------------------------------- avatar */

function GreetingExperience({ active, reducedMotion, resetKey, onState }: ExperienceProps) {
  const [greeting, setGreeting] = useState(false);

  useEffect(() => {
    setGreeting(false);
  }, [resetKey]);

  useEffect(() => {
    if (!active) setGreeting(false);
  }, [active]);

  useEffect(() => {
    onState(greeting ? { phase: "greeting" } : { phase: "idle" });
  }, [greeting, onState]);

  const greet = () => {
    setGreeting(true);
    if (reducedMotion) return;
    const timer = setTimeout(() => setGreeting(false), 2600);
    return () => clearTimeout(timer);
  };

  return (
    <>
      <PanelSection title="Status">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone={greeting ? "running" : "idle"}>{greeting ? "Waving" : "Standing by"}</StatusChip>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">{avatarCopy.location}</span>
        </div>
      </PanelSection>

      <div className="mt-4">
        <RunControls
          running={greeting}
          onRun={greet}
          onReset={() => setGreeting(false)}
          runLabel="Say hello"
          resetKey={`${greeting}-${resetKey}`}
        />
      </div>

      <PanelSection title="Introduction">
        <p className="font-display text-sm font-medium text-fg">{avatarCopy.role}</p>
        <p className="mt-2 text-[0.8125rem] leading-6 text-muted">{avatarCopy.intro}</p>
        <p className="mt-3 inline-flex items-center gap-2 text-[0.8125rem] text-cyan">
          <Waves size={14} aria-hidden="true" /> {avatarGreeting}
        </p>
      </PanelSection>

      <PanelSection title="Facts">
        {avatarCopy.facts.map((fact) => (
          <KeyValue key={fact.label} label={fact.label} value={fact.value} />
        ))}
      </PanelSection>

      <PanelSection title="About the model">
        <p className="text-[0.8125rem] leading-6 text-muted">{avatarCopy.note}</p>
      </PanelSection>
    </>
  );
}

/* ------------------------------------------------------------------ dispatcher */

export function RoomExperience({ objectId, ...props }: ExperienceProps & { objectId: string }) {
  switch (objectId) {
    case "monitor":
      return <ErpFlowExperience {...props} />;
    case "laptop":
      return <ApiExperience {...props} />;
    case "automation":
      return <AutomationExperience {...props} />;
    case "server":
      return <ServiceStatusExperience {...props} />;
    case "iot":
      return <DeviceExperience {...props} />;
    case "avatar":
      return <GreetingExperience {...props} />;
    default:
      return null;
  }
}
