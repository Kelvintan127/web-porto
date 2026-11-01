"use client";

import { useState } from "react";
import { Check, Copy, Download, Mail, MoveUpRight } from "lucide-react";
import { profile } from "@/content/profile";

export function ContactPanel() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  }

  return (
    <div className="rounded-card border border-line/80 bg-ink-2/55 p-5 sm:p-7">
      <p className="label-mono">Start with a note</p>
      <a
        href={`mailto:${profile.email}`}
        className="mt-3 block break-all font-display text-xl font-medium tracking-tight text-fg transition-colors hover:text-cyan sm:text-2xl"
      >
        {profile.email}
      </a>
      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan px-4 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
        >
          <Mail size={15} /> Email me
        </a>
        <button
          type="button"
          onClick={copyEmail}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-fg transition-colors hover:border-cyan/50"
          aria-live="polite"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy email"}
        </button>
        <a
          href={profile.cvPath}
          download
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-fg transition-colors hover:border-cyan/50"
        >
          <Download size={15} /> CV
        </a>
      </div>
      <div className="mt-7 border-t border-line/70 pt-5">
        <p className="label-mono !text-[0.58rem]">Elsewhere</p>
        <ul className="mt-3 flex flex-wrap gap-5 text-sm text-muted">
          <li>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-fg">
              <MoveUpRight size={15} /> LinkedIn
            </a>
          </li>
          <li>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-fg">
              <MoveUpRight size={15} /> GitHub
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
