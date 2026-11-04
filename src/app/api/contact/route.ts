import { NextResponse } from "next/server";

import { buildMailContent, validateContact } from "@/lib/contact-schema";
import {
  clientIdentifier,
  consumeRateLimit,
  isDuplicateSubmission,
} from "@/lib/rate-limit";
import { classifySmtpError, getTransporter, mailConfigFromEnv, redactSecrets } from "@/lib/mailer";

/**
 * POST /api/contact
 *
 * Node runtime (nodemailer needs TCP sockets), never edge. No caching: this
 * handler mutates rate-limit state and must never be served from a stale copy.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

/** Generic failure. SMTP internals never leak to the visitor. */
function serviceUnavailable() {
  return NextResponse.json(
    { ok: false, error: "The form could not be sent right now. Please email support@klveen.com directly." },
    { status: 503 },
  );
}

async function readJsonBody(request: Request): Promise<unknown | null> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return null;
  const declared = Number.parseInt(request.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return null;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return null;
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Not configured is not an error state: the form stays up and relies on rate
  // limiting. docs/contact-setup.md documents the hardening step.
  if (!secret) return true;
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    // Verifier unreachable: fail open or closed? Closed. A broken verifier
    // should not silently admit unverified traffic.
    return false;
  }
}

export async function POST(request: Request) {
  const identifier = clientIdentifier(request.headers);

  const limit = await consumeRateLimit(identifier);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.max(1, limit.retryAfterSeconds)) },
      },
    );
  }

  const body = await readJsonBody(request);
  if (body === null || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }
  const turnstileToken = (body as Record<string, unknown>).turnstileToken;

  const validation = validateContact(body);
  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", fieldErrors: validation.errors },
      { status: 400 },
    );
  }

  const config = mailConfigFromEnv();
  if (!config) {
    return serviceUnavailable();
  }

  // Turnstile after rate limit and validation: cheap checks first, no network
  // call for requests that were never going to pass validation anyway.
  if (!(await verifyTurnstile(turnstileToken, identifier))) {
    return NextResponse.json(
      { ok: false, error: "Human verification failed. Please retry." },
      { status: 403 },
    );
  }

  if (isDuplicateSubmission(identifier, digest(validation.data))) {
    return NextResponse.json(
      { ok: true, message: "Message already received." },
      { status: 200 },
    );
  }

  const content = buildMailContent(validation.data);

  try {
    const transporter = getTransporter(config);
    await transporter.sendMail({
      from: { name: config.from.name, address: config.from.address },
      // Envelope sender pinned to the configured address, so a provider cannot
      // substitute the visitor's address as the bounce path.
      envelope: { from: config.envelopeFrom, to: config.to },
      to: config.to,
      replyTo: validation.data.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
  } catch (error) {
    // Diagnostic label and the provider's message head only. Never credentials,
    // never the visitor's message body.
    const head = error instanceof Error ? error.message.split("\n")[0].slice(0, 200) : "unknown";
    console.error(`[contact] send failed: ${classifySmtpError(error)} — ${redactSecrets(head)}`);
    return serviceUnavailable();
  }

  return NextResponse.json({ ok: true, message: "Message sent." });
}

/** Stable digest of the payload for duplicate detection. */
function digest(data: { name: string; email: string; subject: string; message: string }): string {
  const raw = `${data.name}\n${data.email}\n${data.subject}\n${data.message}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}
