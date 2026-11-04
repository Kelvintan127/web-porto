/**
 * Cloudflare SMTP transport, assembled from server environment variables.
 *
 * Credentials live only here. The route handler imports this module — nothing
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
  to: string;
};

/**
 * Fixed addresses. The recipient is deliberately NOT configurable through the
 * request — the form's destination is a property of the site, not user input.
 */
export const SUPPORT_TO_EMAIL = "support@klveen.com";

export function mailConfigFromEnv(env: NodeJS.ProcessEnv = process.env): MailConfig | null {
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
      name: env.MAIL_FROM_NAME || "KLVEEN",
      address: env.MAIL_FROM_ADDRESS!,
    },
    to: env.CONTACT_TO_EMAIL || SUPPORT_TO_EMAIL,
  };
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