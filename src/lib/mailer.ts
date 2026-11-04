/**
 * SMTP transport, assembled from server environment variables.
 *
 * Provider-agnostic by design: switching providers is an environment change,
 * not a code change. Currently configured for Resend SMTP (smtp.resend.com);
 * credentials live only here. The route handler imports this module — nothing
 * SMTP-related is ever exported to client code, and no value below reaches the
 * browser or a log line.
 */

import nodemailer, { type Transporter } from "nodemailer";

export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
  from: { name: string; address: string };
  /** Envelope sender, pinned so the provider cannot rewrite it. */
  envelopeFrom: string;
  to: string;
};

/**
 * Fixed addresses. The recipient is deliberately NOT configurable through the
 * request — the form's destination is a property of the site, not user input.
 */
export const SUPPORT_TO_EMAIL = "support@klveen.com";

export function mailConfigFromEnv(env: Partial<Record<string, string | undefined>> = process.env): MailConfig | null {
  const required = ["MAIL_HOST", "MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_FROM_ADDRESS"] as const;
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) return null;

  const port = Number.parseInt(env.MAIL_PORT ?? "", 10);
  const scheme = (env.MAIL_SCHEME ?? "").toLowerCase();

  return {
    host: env.MAIL_HOST!,
    port: Number.isFinite(port) && port > 0 ? port : 465,
    secure: scheme ? scheme !== "tls" : true, // default 465/SSL, "tls" means STARTTLS
    auth: { user: env.MAIL_USERNAME!, pass: env.MAIL_PASSWORD! },
    from: {
      name: env.MAIL_FROM_NAME || "KLVEEN Contact",
      address: env.MAIL_FROM_ADDRESS!,
    },
    envelopeFrom: env.MAIL_ENVELOPE_FROM || env.MAIL_FROM_ADDRESS!,
    to: env.CONTACT_TO_EMAIL || SUPPORT_TO_EMAIL,
  };
}

/**
 * Strip anything credential-shaped from a provider message before it is logged.
 * Providers do sometimes echo the submitted key back in a rejection, so the
 * configured secret is redacted explicitly in addition to generic patterns.
 */
export function redactSecrets(text: string, env: Partial<Record<string, string | undefined>> = process.env): string {
  let clean = text;
  for (const secret of [env.MAIL_PASSWORD, env.RESEND_API_KEY]) {
    // Short values are skipped: replacing them would mangle ordinary prose.
    if (secret && secret.length >= 8) clean = clean.split(secret).join("[redacted]");
  }
  return clean
    .replace(/\b(re|sk|gho|ghp|xox[baprs])_[A-Za-z0-9_-]{8,}/gi, "[redacted]")
    .replace(/[A-Za-z0-9+/]{40,}={0,2}/g, "[redacted]");
}

/**
 * Map an SMTP failure to a short diagnostic label for the log. The label and
 * the redacted message head are all that is logged — never credentials, and
 * never the visitor's message body.
 */
export function classifySmtpError(error: unknown): string {
  if (!(error instanceof Error)) return "unknown";
  const message = error.message;

  // Read the enhanced status code first: the prose around it is ambiguous
  // ("Not authorized to send from domain" is a sender-authorisation failure,
  // not a credential failure) but the code is not.
  const code = message.match(/\b(5\d{2})\b/)?.[1];
  if (code) {
    if (code === "535") return `authentication-failed (${code})`;
    if (code === "550" || code === "551") return `sender-or-domain-rejected (${code})`;
    if (code === "553" || code === "554") return `recipient-or-policy-rejected (${code})`;
    return `provider-rejected (${code})`;
  }

  // No code to go on: fall back to the text.
  if (/\bauthentication\b|\bcredentials\b|invalid login|api key/i.test(message)) {
    return "authentication-failed";
  }
  if (/timeout|etimedout|econn|refused|unreachable/i.test(message)) return "connection-failed";
  return "send-failed";
}

/** Cached per-process transporter. Creating a pool is expensive. */
let transporter: Transporter | null = null;

export function getTransporter(config: MailConfig): Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.auth.user, pass: config.auth.pass },
    // The route reads a short deadline; a stuck SMTP dial must not outlive it.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    pool: false,
    // Refuse sockets that present a certificate not valid for this host.
    tls: { rejectUnauthorized: true },
    logger: false,
    debug: false,
  });
  return transporter;
}

/** Test seam. */
export function setTransporterForTesting(t: Transporter | null): void {
  transporter = t;
}