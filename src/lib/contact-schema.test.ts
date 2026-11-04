import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  buildMailContent,
  CONTACT_SUBJECT,
  escapeHtml,
  hasControlChars,
  isValidEmail,
  validateContact,
} from "@/lib/contact-schema";
import {
  clientIdentifier,
  consumeRateLimit,
  hasDurableStore,
  isDuplicateSubmission,
  rateLimitOptions,
  resetDuplicateSubmissions,
  resetRateLimits,
} from "@/lib/rate-limit";

const VALID = {
  name: "Kelvin Tan",
  email: "visitor@example.com",
  subject: "Project inquiry",
  message: "Hello, I would like to discuss an ERP integration project.",
};

describe("validateContact", () => {
  it("accepts a well-formed submission and trims it", () => {
    const result = validateContact({ ...VALID, name: "  Kelvin   Tan  " });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("Kelvin Tan");
    expect(result.data.email).toBe("visitor@example.com");
  });

  it("rejects every missing required field with a per-field message", () => {
    const result = validateContact({});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(["email", "message", "name", "subject"]);
    expect(result.errors.name).toBeTruthy();
  });

  it("rejects whitespace-only values as missing", () => {
    const result = validateContact({ ...VALID, subject: "   " });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.subject).toBeTruthy();
  });

  it("rejects malformed email addresses", () => {
    for (const email of ["nope", "a@b", "a b@example.com", "a@@example.com", "@example.com"]) {
      const result = validateContact({ ...VALID, email });
      expect(result.ok, `${email} should be rejected`).toBe(false);
    }
  });

  it("rejects control characters, which is what blocks header injection", () => {
    const injected = {
      ...VALID,
      name: "Attacker\r\nBcc: victim@example.com",
    };
    const result = validateContact(injected);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.name).toMatch(/control|line breaks/i);
  });

  it("rejects newlines in the subject specifically, but allows them in the message", () => {
    expect(validateContact({ ...VALID, subject: "Hi\nthere" }).ok).toBe(false);
    const multiline = validateContact({ ...VALID, message: "Line one\n\nLine two" });
    expect(multiline.ok).toBe(true);
    if (!multiline.ok) return;
    expect(multiline.data.message).toBe("Line one\n\nLine two");
  });

  it("enforces length limits per field", () => {
    for (const [field, limit] of Object.entries({ name: 100, email: 254, subject: 150, message: 5000 })) {
      const result = validateContact({ ...VALID, [field]: "x".repeat(limit + 1) });
      expect(result.ok, `${field} over ${limit}`).toBe(false);
    }
  });

  it("accepts a payload at exactly the limit", () => {
    const result = validateContact({ ...VALID, message: "x".repeat(5000) });
    expect(result.ok).toBe(true);
  });

  it("is not fooled by non-string field values", () => {
    for (const bad of [null, 42, true, {}, [], undefined]) {
      const result = validateContact({ ...VALID, name: bad });
      expect(result.ok, `name=${JSON.stringify(bad)}`).toBe(false);
    }
  });

  it("handles null and non-object input without throwing", () => {
    for (const input of [null, undefined, 42, "string", []]) {
      expect(() => validateContact(input)).not.toThrow();
    }
  });
});

describe("email validation", () => {
  it("accepts ordinary addresses, including plus-tags and subdomains", () => {
    for (const email of ["a@b.co", "first.last+tag@sub.example.co.uk", "x_y-z@example.io"]) {
      expect(isValidEmail(email), email).toBe(true);
    }
  });

  it("rejects addresses carrying header-injection characters", () => {
    for (const email of ["a@b.co\r\nBcc: x@y.co", "a@b.co>", "a@b co"]) {
      expect(isValidEmail(email), email).toBe(false);
    }
  });
});

describe("escapeHtml", () => {
  it("neutralises every HTML metacharacter", () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
    expect(escapeHtml("a & b 'c'")).toBe("a &amp; b &#39;c&#39;");
  });

  it("escapes the ampersand first, so entities are not double-decoded", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
});

describe("subject", () => {
  it("is a fixed line, so the visitor cannot reshape the header", () => {
    expect(CONTACT_SUBJECT).toBe("New Contact Message — KLVEEN Portfolio");
    // The visitor's own subject travels in the body instead.
    expect(buildMailContent({ ...VALID, subject: "Totally different" }).subject).toBe(CONTACT_SUBJECT);
  });
});

describe("buildMailContent", () => {
  const content = buildMailContent(VALID);

  it("produces both a text and an HTML alternative", () => {
    expect(content.text).toContain("visitor@example.com");
    expect(content.text).toContain(VALID.message);
    expect(content.html).toContain("<!doctype html>");
  });

  it("escapes visitor HTML in the HTML body", () => {
    const malicious = buildMailContent({ ...VALID, message: "<img src=x onerror=alert(1)>" });
    expect(malicious.html).not.toContain("<img src=x");
    expect(malicious.html).toContain("&lt;img src=x");
    // The text alternative carries it verbatim, which is correct for text.
    expect(malicious.text).toContain("<img src=x onerror=alert(1)>");
  });

  it("does not let the visitor influence the subject", () => {
    expect(content.subject).toBe(CONTACT_SUBJECT);
  });
});

describe("hasControlChars", () => {
  it("catches C0, C1, and unicode line separators", () => {
    for (const value of ["a\rb", "a\nb", "a\u0000b", "a\u0085b", "a\u2028b"]) {
      expect(hasControlChars(value), JSON.stringify(value)).toBe(true);
    }
    expect(hasControlChars("plain text — with punctuation.")).toBe(false);
  });
});

describe("rate limiting", () => {
  beforeEach(() => {
    resetRateLimits();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.CONTACT_RATE_LIMIT;
  });
  afterEach(() => resetRateLimits());

  it("allows up to the limit then blocks with a retry hint", async () => {
    for (let i = 0; i < 5; i++) {
      const verdict = await consumeRateLimit("1.2.3.4");
      expect(verdict.allowed, `attempt ${i + 1}`).toBe(true);
    }
    const blocked = await consumeRateLimit("1.2.3.4");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keeps separate buckets per identifier", async () => {
    for (let i = 0; i < 5; i++) await consumeRateLimit("1.1.1.1");
    expect((await consumeRateLimit("1.1.1.1")).allowed).toBe(false);
    expect((await consumeRateLimit("2.2.2.2")).allowed).toBe(true);
  });

  it("honours a configured limit", async () => {
    process.env.CONTACT_RATE_LIMIT = "1";
    expect(rateLimitOptions().limit).toBe(1);
    expect((await consumeRateLimit("9.9.9.9")).allowed).toBe(true);
    expect((await consumeRateLimit("9.9.9.9")).allowed).toBe(false);
  });

  it("reports no durable store when unconfigured", () => {
    expect(hasDurableStore()).toBe(false);
  });

  it("falls back to memory when the durable store is unreachable", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "http://127.0.0.1:1";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    expect(hasDurableStore()).toBe(true);
    const verdict = await consumeRateLimit("3.3.3.3");
    // Degrades to the in-memory layer rather than failing the request.
    expect(verdict.allowed).toBe(true);
    expect(verdict.source).toBe("memory");
  });
});

describe("duplicate submissions", () => {
  beforeEach(() => resetDuplicateSubmissions());

  it("flags an identical payload from the same client inside the window", () => {
    expect(isDuplicateSubmission("1.2.3.4", "digest-a")).toBe(false);
    expect(isDuplicateSubmission("1.2.3.4", "digest-a")).toBe(true);
  });

  it("does not flag a different client or a different payload", () => {
    isDuplicateSubmission("1.2.3.4", "digest-a");
    expect(isDuplicateSubmission("5.6.7.8", "digest-a")).toBe(false);
    expect(isDuplicateSubmission("1.2.3.4", "digest-b")).toBe(false);
  });
});

describe("clientIdentifier", () => {
  it("takes the left-most X-Forwarded-For entry", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" });
    expect(clientIdentifier(headers)).toBe("203.0.113.7");
  });

  it("prefers CF-Connecting-IP, then X-Real-IP", () => {
    expect(clientIdentifier(new Headers({ "cf-connecting-ip": "198.51.100.9" }))).toBe("198.51.100.9");
    expect(clientIdentifier(new Headers({ "x-real-ip": "198.51.100.10" }))).toBe("198.51.100.10");
  });

  it("falls back to a shared bucket when no header is present", () => {
    expect(clientIdentifier(new Headers())).toBe("unknown");
  });
});
