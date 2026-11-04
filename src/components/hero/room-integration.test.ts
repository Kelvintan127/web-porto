import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Static guards for the two things that are easy to break and hard to see:
 * frame-loop gating, and the HTML/scene split. Source is read as text because
 * asserting on rendered WebGL in a node environment would test nothing real.
 */

const SRC = resolve(__dirname, "..", "..");

const read = (relative: string) => readFileSync(join(SRC, relative), "utf8");

const filesUnder = (relative: string): string[] => {
  const root = join(SRC, relative);
  const out: string[] = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) out.push(...filesUnder(join(relative, entry)));
    else if (/\.tsx?$/.test(entry)) out.push(path);
  }
  return out;
};

describe("frame loop gating", () => {
  const canvas = read("components/three/hero-canvas.tsx");

  it("watches the viewport so an off-screen room costs nothing", () => {
    expect(canvas).toContain("IntersectionObserver");
    expect(canvas).toContain("liveMotion.current ? (visible.current");
  });

  it("runs continuously only while something is actually moving", () => {
    // Without this, a settled demo stops the loop and a later demo press has
    // nothing driving it: the panel advances while the room sits still.
    expect(canvas).toContain('? "always" : "demand"');
    expect(canvas).toContain('reducedMotion || selected === null || isRunning(demoState)');
    // Coming back to on-demand must still paint one frame.
    expect(canvas).toContain("invalidateRef.current()");
  });

  it("keeps per-object work behind an active check", () => {
    // Each animated object bails out of its frame callback when it is closed.
    const bails = canvas.match(/if \(!active\) return;/g) ?? [];
    expect(bails.length).toBeGreaterThanOrEqual(2);
  });

  it("mounts the blinking faceplate LED only while the rack is open", () => {
    expect(canvas).toMatch(/\{active && \(\s*<>\s*<mesh ref=\{rackLed\}[\s\S]{0,240}<RackBlink/);
  });
});

describe("scene and UI separation", () => {
  const canvas = read("components/three/hero-canvas.tsx");
  const panel = read("components/hero/experience-panel.tsx");
  const ui = read("components/room/room-ui.tsx");
  const hero = read("components/hero/room-hero.tsx");

  it("keeps demo text out of the scene", () => {
    // The scene draws state; paragraphs are HTML.
    expect(canvas).not.toMatch(/<p\b|<h[1-4]\b|<button\b/);
    expect(canvas).not.toContain("dangerouslySetInnerHTML");
  });

  it("keeps three.js out of the panels", () => {
    expect(panel).not.toMatch(/from "three"/);
    expect(panel).not.toMatch(/@react-three/);
    expect(panel).not.toContain("useFrame");
  });

  it("gives every experience real, labelled controls", () => {
    // Buttons, live regions, and aria-pressed state are what make this usable
    // without a pointer.
    expect(panel).toContain("aria-live");
    expect(ui).toContain("aria-pressed");
    expect(ui).toContain('role="group"');
    expect(panel).toContain("<svg");
    expect(panel).toContain('aria-label="Diagram of four demo services');
  });

  it("offers a way back to the room", () => {
    expect(hero).toContain("Back to room");
    expect(hero).toContain("ChevronLeft");
    // Reset must clear both the selection and every demo.
    expect(hero).toMatch(/setDemos\(\{\}\)/);
  });

  it("does not talk to a network from the experiences", () => {
    for (const file of [panel, hero]) {
      expect(file).not.toMatch(/\bfetch\(|XMLHttpRequest|EventSource|WebSocket/);
    }
  });

  it("reports the reduced-motion preference to the panels", () => {
    expect(hero).toContain("prefers-reduced-motion: reduce");
    expect(hero).toContain("reducedMotion={reducedMotion}");
    expect(panel).toContain("reducedMotion");
  });
});

describe("keyboard and mobile access", () => {
  const hero = read("components/hero/room-hero.tsx");
  const ui = read("components/room/room-ui.tsx");

  it("keeps Escape and focus return from the previous behaviour", () => {
    expect(hero).toContain('event.key === "Escape"');
    expect(hero).toContain("returnFocusRef");
    expect(hero).toContain("chipRefs");
  });

  it("keeps chip and control targets at touch size", () => {
    const minSized = ui.match(/min-h-11/g) ?? [];
    expect(minSized.length).toBeGreaterThanOrEqual(3);
    expect(hero).toContain("min-h-11");
  });

  it("does not let a panel control escape its group", () => {
    // Every interactive chip names itself for screen readers.
    expect(ui).toContain("aria-label");
    expect(ui).toContain("aria-pressed");
  });
});

describe("no stray dependencies", () => {
  it("adds no runtime package beyond what the project already had", () => {
    const pkg = JSON.parse(readFileSync(join(SRC, "..", "package.json"), "utf8")) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    // nodemailer is required by the contact form spec; nothing else may appear.
    const allowed = ["@react-three/fiber", "lucide-react", "next", "nodemailer", "react", "react-dom", "three"];
    expect(Object.keys(pkg.dependencies).sort()).toEqual([...allowed].sort());
    for (const version of Object.values({ ...pkg.dependencies, ...pkg.devDependencies })) {
      expect(version).not.toMatch(/^(\^|~|\*|latest)/);
    }
  });

  it("keeps every mail variable off the client bundle", () => {
    // Any NEXT_PUBLIC_ mail variable would be inlined into client JS by Next,
    // publishing the SMTP credential to every visitor.
    const envKeys = [
      "MAIL_HOST",
      "MAIL_PORT",
      "MAIL_USERNAME",
      "MAIL_PASSWORD",
      "MAIL_SCHEME",
      "MAIL_FROM_ADDRESS",
      "MAIL_FROM_NAME",
      "CONTACT_TO_EMAIL",
      "TURNSTILE_SECRET_KEY",
      "UPSTASH_REDIS_REST_TOKEN",
    ];
    const files = [
      "lib/mailer.ts",
      "lib/contact-schema.ts",
      "lib/rate-limit.ts",
      "app/api/contact/route.ts",
      "components/contact-form.tsx",
    ];
    for (const file of files) {
      const source = readFileSync(join(SRC, file), "utf8");
      for (const key of envKeys) {
        expect(source, `${file} must not reference NEXT_PUBLIC_${key}`).not.toContain(`NEXT_PUBLIC_${key}`);
      }
    }
  });

  it("keeps the mailer out of every client component", () => {
    // Node built-ins in a client bundle fail the build; catching the import
    // here names the culprit file instead of a webpack hash.
    const clientFiles = ["components/contact-form.tsx", "components/contact-panel.tsx"];
    for (const file of clientFiles) {
      const source = readFileSync(join(SRC, file), "utf8");
      expect(source, `${file} must not import the mailer`).not.toContain("lib/mailer");
      expect(source, `${file} must not import nodemailer`).not.toContain("nodemailer");
    }
  });
});
