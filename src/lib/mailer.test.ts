/**
 * Mailer configuration and error-handling unit tests. No transport is
 * constructed here — these exercise the pure parts of the module.
 */

import { describe, expect, it } from "vitest";

import {
  classifySmtpError,
  mailConfigFromEnv,
  redactSecrets,
  SUPPORT_TO_EMAIL,
} from "@/lib/mailer";

const RESEND_ENV = {
  MAIL_HOST: "smtp.resend.com",
  MAIL_PORT: "465",
  MAIL_SCHEME: "smtps",
  MAIL_USERNAME: "resend",
  MAIL_PASSWORD: "re_abcdef1234567890",
  MAIL_FROM_ADDRESS: "noreply@klveen.com",
  MAIL_FROM_NAME: "KLVEEN Contact",
  CONTACT_TO_EMAIL: "support@klveen.com",
};

describe("mailConfigFromEnv", () => {
  it("reads a complete Resend configuration", () => {
    const config = mailConfigFromEnv(RESEND_ENV);
    expect(config).not.toBeNull();
    expect(config!.host).toBe("smtp.resend.com");
    expect(config!.port).toBe(465);
    expect(config!.auth).toEqual({ user: "resend", pass: "re_abcdef1234567890" });
    expect(config!.from).toEqual({ name: "KLVEEN Contact", address: "noreply@klveen.com" });
    expect(config!.to).toBe("support@klveen.com");
  });

  it("uses implicit TLS on port 465", () => {
    expect(mailConfigFromEnv({ ...RESEND_ENV, MAIL_SCHEME: "smtps" })!.secure).toBe(true);
    // "tls" means STARTTLS, which is not the 465 profile.
    expect(mailConfigFromEnv({ ...RESEND_ENV, MAIL_SCHEME: "tls" })!.secure).toBe(false);
    // Absent scheme defaults to the secure 465 profile.
    expect(mailConfigFromEnv({ ...RESEND_ENV, MAIL_SCHEME: undefined })!.secure).toBe(true);
  });

  it("pins the envelope sender to our own address, never a visitor's", () => {
    expect(mailConfigFromEnv(RESEND_ENV)!.envelopeFrom).toBe("noreply@klveen.com");
  });

  it("falls back to the fixed support address when the recipient is unset", () => {
    const config = mailConfigFromEnv({ ...RESEND_ENV, CONTACT_TO_EMAIL: undefined });
    expect(config!.to).toBe(SUPPORT_TO_EMAIL);
    expect(SUPPORT_TO_EMAIL).toBe("support@klveen.com");
  });

  it("returns null rather than a half-built config when a credential is missing", () => {
    for (const key of ["MAIL_HOST", "MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_FROM_ADDRESS"] as const) {
      const partial = { ...RESEND_ENV, [key]: undefined };
      expect(mailConfigFromEnv(partial), `without ${key}`).toBeNull();
    }
  });

  it("defaults the port when MAIL_PORT is absent or nonsense", () => {
    expect(mailConfigFromEnv({ ...RESEND_ENV, MAIL_PORT: undefined })!.port).toBe(465);
    expect(mailConfigFromEnv({ ...RESEND_ENV, MAIL_PORT: "abc" })!.port).toBe(465);
  });
});

describe("classifySmtpError", () => {
  it("labels the unverified-domain rejection that prompted this migration", () => {
    const error = new Error("550 5.7.1 Not authorized to send from domain klveen.com");
    expect(classifySmtpError(error)).toBe("sender-or-domain-rejected (550)");
  });

  it("labels each provider failure class distinctly", () => {
    expect(classifySmtpError(new Error("535 5.7.8 Authentication failed"))).toBe("authentication-failed (535)");
    expect(classifySmtpError(new Error("554 5.7.1 Message rejected"))).toBe("recipient-or-policy-rejected (554)");
    expect(classifySmtpError(new Error("connect ETIMEDOUT 1.2.3.4:465"))).toBe("connection-failed");
    expect(classifySmtpError(new Error("Invalid login"))).toBe("authentication-failed");
  });

  it("never returns credentials or the message body, only a label", () => {
    const error = new Error("535 Authentication failed: invalid API key re_abcdef1234567890");
    const label = classifySmtpError(error);
    expect(label).toBe("authentication-failed (535)");
    expect(label).not.toContain("re_abcdef");
  });

  it("survives a non-Error rejection", () => {
    for (const value of [undefined, null, "boom", 42, {}]) {
      expect(() => classifySmtpError(value)).not.toThrow();
      expect(classifySmtpError(value)).toBe("unknown");
    }
  });
});

describe("redactSecrets", () => {
  it("redacts the configured transport password even when echoed verbatim", () => {
    const out = redactSecrets("auth failed for re_abcdef1234567890", RESEND_ENV);
    expect(out).not.toContain("re_abcdef1234567890");
    expect(out).toContain("[redacted]");
  });

  it("redacts provider-shaped keys it was never told about", () => {
    for (const key of ["re_ABCDEFGH12345678", "sk_live_abcdefghijklmnop", "ghp_abcdefghijklmnopqrst"]) {
      expect(redactSecrets(`rejected ${key}`, {})).not.toContain(key);
    }
  });

  it("leaves ordinary diagnostic prose readable", () => {
    const message = "550 5.7.1 Not authorized to send from domain klveen.com";
    expect(redactSecrets(message, RESEND_ENV)).toBe(message);
  });

  it("survives being given an empty environment", () => {
    expect(redactSecrets("plain text", {})).toBe("plain text");
  });
});
