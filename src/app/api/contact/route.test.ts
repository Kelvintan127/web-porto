/**
 * Route handler tests. Nodemailer is mocked at the module boundary so no socket
 * is ever opened; everything else runs against the real handler code.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn();

vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail,
      verify: vi.fn().mockResolvedValue(true),
    }),
  },
}));

import { POST } from "@/app/api/contact/route";
import { resetDuplicateSubmissions, resetRateLimits } from "@/lib/rate-limit";

const VALID_BODY = {
  name: "Visitor Name",
  email: "visitor@example.com",
  subject: "Project inquiry",
  message: "A message that is long enough to be believable.",
};

function request(body: unknown, ip = "203.0.113.10") {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  sendMail.mockReset();
  resetRateLimits();
  resetDuplicateSubmissions();
  process.env.MAIL_HOST = "smtp.resend.com";
  process.env.MAIL_PORT = "465";
  process.env.MAIL_USERNAME = "resend";
  process.env.MAIL_PASSWORD = "re_test_key_not_real";
  process.env.MAIL_SCHEME = "smtps";
  process.env.MAIL_FROM_ADDRESS = "noreply@klveen.com";
  process.env.MAIL_FROM_NAME = "KLVEEN Contact";
  process.env.CONTACT_TO_EMAIL = "support@klveen.com";
  delete process.env.TURNSTILE_SECRET_KEY;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

afterEach(() => {
  resetRateLimits();
  resetDuplicateSubmissions();
});

describe("POST /api/contact — success path", () => {
  it("sends mail with fixed recipient, fixed sender, and visitor Reply-To", async () => {
    sendMail.mockResolvedValue({ messageId: "ok" });

    const response = await POST(request(VALID_BODY));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(sendMail).toHaveBeenCalledOnce();

    const mail = sendMail.mock.calls[0][0];
    expect(mail.to).toBe("support@klveen.com");
    expect(mail.from).toEqual({ name: "KLVEEN Contact", address: "noreply@klveen.com" });
    expect(mail.replyTo).toBe("visitor@example.com");
    expect(mail.subject).toBe("New Contact Message — KLVEEN Portfolio");
    // Envelope sender pinned to our own address, not the visitor's.
    expect(mail.envelope).toEqual({ from: "noreply@klveen.com", to: "support@klveen.com" });
    expect(mail.text).toContain("A message that is long enough to be believable.");
    expect(mail.html).toContain("<!doctype html>");
  });

  it("ignores attempts to override the recipient or sender through the payload", async () => {
    sendMail.mockResolvedValue({ messageId: "ok" });

    await POST(
      request({
        ...VALID_BODY,
        to: "attacker@evil.example",
        from: "spoofed@evil.example",
        replyTo: "attacker@evil.example",
      }),
    );

    const mail = sendMail.mock.calls[0][0];
    expect(mail.to).toBe("support@klveen.com");
    expect(mail.from.address).toBe("noreply@klveen.com");
    expect(mail.replyTo).toBe("visitor@example.com");
    expect(mail.envelope.from).toBe("noreply@klveen.com");
  });
});

describe("POST /api/contact — validation", () => {
  it("rejects an invalid email with 400 and never sends", async () => {
    const response = await POST(request({ ...VALID_BODY, email: "not-an-email" }));
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors.email).toBeTruthy();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects missing required fields", async () => {
    const response = await POST(request({ name: "Only Name" }));
    expect(response.status).toBe(400);
    const { fieldErrors } = await response.json();
    expect(Object.keys(fieldErrors).sort()).toEqual(["email", "message", "subject"]);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects over-length input", async () => {
    const response = await POST(request({ ...VALID_BODY, message: "x".repeat(5001) }));
    expect(response.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects a payload carrying header injection", async () => {
    const response = await POST(
      request({ ...VALID_BODY, subject: "Hi\r\nBcc: victim@example.com" }),
    );
    expect(response.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects a non-JSON content type", async () => {
    const response = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: JSON.stringify(VALID_BODY),
      }),
    );
    expect(response.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON without throwing", async () => {
    const response = await POST(request("{not json"));
    expect(response.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe("POST /api/contact — failure handling", () => {
  it("returns 503 and leaks no SMTP detail when the send fails", async () => {
    sendMail.mockRejectedValue(
      new Error("535 5.7.8 Authentication failed: invalid api_token for smtp.mx.cloudflare.net"),
    );

    const response = await POST(request(VALID_BODY));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.ok).toBe(false);
    const serialised = JSON.stringify(payload);
    expect(serialised).not.toContain("535");
    expect(serialised).not.toContain("api_token");
    expect(serialised).not.toContain("smtp.mx.cloudflare.net");
    expect(serialised).not.toContain("re_test_key_not_real");
  });

  it("returns 503 when SMTP is not configured at all", async () => {
    delete process.env.MAIL_HOST;
    delete process.env.MAIL_PASSWORD;

    const response = await POST(request(VALID_BODY));
    expect(response.status).toBe(503);
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe("POST /api/contact — abuse controls", () => {
  it("rate limits after the configured number of attempts", async () => {
    sendMail.mockResolvedValue({ messageId: "ok" });

    // Same client, distinct payloads: the limiter is what must trip, not
    // duplicate detection.
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      const response = await POST(
        request({ ...VALID_BODY, subject: `Inquiry ${i}` }, "198.51.100.1"),
      );
      statuses.push(response.status);
    }

    expect(sendMail).toHaveBeenCalledTimes(5);
    expect(statuses.slice(0, 5).every((s) => s === 200)).toBe(true);
    expect(statuses[5]).toBe(429);
    expect(statuses[6]).toBe(429);
  });

  it("suppresses a duplicate submission from the same client", async () => {
    sendMail.mockResolvedValue({ messageId: "ok" });

    const first = await POST(request(VALID_BODY, "192.0.2.5"));
    const second = await POST(request(VALID_BODY, "192.0.2.5"));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it("blocks when Turnstile is configured and the token is missing", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    sendMail.mockResolvedValue({ messageId: "ok" });

    const response = await POST(request(VALID_BODY));
    expect(response.status).toBe(403);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("does not log the SMTP password when a send fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMail.mockRejectedValue(new Error("auth failed"));

    await POST(request(VALID_BODY, "203.0.113.99"));

    const logged = errorSpy.mock.calls.flat().join(" ");
    expect(logged).not.toContain("re_test_key_not_real");
    expect(logged).not.toContain("visitor@example.com");
    errorSpy.mockRestore();
  });
});

describe("POST /api/contact — provider failure modes", () => {
  it("handles an unverified sender domain without leaking the provider message", async () => {
    sendMail.mockRejectedValue(
      new Error("550 5.7.1 Not authorized to send from domain klveen.com"),
    );
    const response = await POST(request(VALID_BODY, "203.0.113.201"));
    const payload = await response.json();
    expect(response.status).toBe(503);
    expect(JSON.stringify(payload)).not.toContain("550");
    expect(JSON.stringify(payload)).not.toContain("klveen.com\",");
  });

  it("handles an authentication failure without leaking the API key", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMail.mockRejectedValue(new Error("535 Authentication failed: invalid API key re_test_key_not_real"));

    const response = await POST(request(VALID_BODY, "203.0.113.202"));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("re_test_key_not_real");
    expect(errorSpy.mock.calls.flat().join(" ")).not.toContain("re_test_key_not_real");
    errorSpy.mockRestore();
  });

  it("logs a diagnostic label for each failure class", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const cases: [string, string][] = [
      ["550 5.7.1 Not authorized to send from domain klveen.com", "sender-or-domain-rejected"],
      ["535 5.7.8 Authentication failed", "authentication-failed"],
      ["connect ETIMEDOUT 1.2.3.4:465", "connection-failed"],
      ["554 5.7.1 Message rejected", "recipient-or-policy-rejected"],
    ];
    let ip = 10;
    for (const [message, label] of cases) {
      sendMail.mockRejectedValueOnce(new Error(message));
      await POST(request({ ...VALID_BODY, subject: `Class ${ip}` }, `203.0.114.${ip++}`));
      expect(errorSpy.mock.calls.flat().join(" "), message).toContain(label);
    }
    errorSpy.mockRestore();
  });

  it("never logs the visitor's message body", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMail.mockRejectedValue(new Error("550 rejected"));
    await POST(
      request({ ...VALID_BODY, message: "SECRET-BODY-MARKER" }, "203.0.113.203"),
    );
    expect(errorSpy.mock.calls.flat().join(" ")).not.toContain("SECRET-BODY-MARKER");
    errorSpy.mockRestore();
  });
});
