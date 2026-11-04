/**
 * Contact form contract, shared by the client form and the route handler.
 *
 * Pure and dependency-free so it runs under plain node in tests and on both
 * sides of the network without dragging React or next into either.
 */

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
} as const;

export type ContactField = keyof typeof CONTACT_LIMITS;
export type ContactPayload = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export type ValidationResult =
  | { ok: true; data: ContactPayload }
  | { ok: false; errors: ContactErrors };

export const CONTACT_FIELDS = Object.keys(CONTACT_LIMITS) as ContactField[];

/**
 * Deliberately permissive: a plain address, one @, a dotted domain, no spaces.
 * Rejecting exotic-but-valid RFC 5322 addresses costs real visitors while
 * stopping nothing a spammer cares about.
 *
 * The local and domain parts are restricted to address-safe characters
 * (letters, digits, and common punctuation) so header metacharacters like `>`
 * or `"` cannot ride through.
 */
const EMAIL = /^[\w!#$%&'*+/=?^`{|}~.-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

/**
 * Header injection, NUL bytes, and lone surrogates alike: any C0/C1 control
 * character is refused outright rather than stripped, so a crafted name can
 * never smuggle a Bcc into the message we build downstream.
 */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;
/** Message bodies may keep paragraph breaks; every other control char is still refused. */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_NO_NEWLINES = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u2028\u2029]/;

/**
 * Header fields (name, email, subject) must contain no control characters at
 * all — a CRLF there is header injection.
 */
export function hasControlChars(value: string): boolean {
  return CONTROL_CHARS.test(value);
}

/**
 * Message bodies allow LF and CR (a visitor typing paragraphs is not an
 * attacker) but nothing else in the control range. React escapes this on
 * render and nodemailer writes the body, never a header, from it.
 */
export function hasForbiddenMessageChars(value: string): boolean {
  return CONTROL_CHARS_NO_NEWLINES.test(value);
}

/** Trim, then collapse runs of whitespace. Keeps single newlines out of headers. */
function normalize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

/** Message body keeps its paragraph breaks; only the ends are trimmed. */
function normalizeMessage(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/g, "\n").trim();
}

export function isValidEmail(value: string): boolean {
  return value.length <= CONTACT_LIMITS.email && EMAIL.test(value);
}

/**
 * Validate a submitted form. `raw` is untrusted in full — every field is
 * case-checked for type before use.
 *
 * Control characters are checked on the RAW value, before whitespace
 * normalisation collapses them: a `\r\n` smuggled into name or subject is
 * injection, not spacing, and must be refused rather than tidied.
 */
export function validateContact(raw: unknown): ValidationResult {
  const input = (raw ?? {}) as Record<string, unknown>;
  const errors: ContactErrors = {};

  // Header fields: no control characters at all. The message body allows
  // paragraph breaks but nothing else in the control range.
  for (const field of CONTACT_FIELDS) {
    const value = input[field];
    if (typeof value !== "string") continue;
    const forbidden = field === "message" ? hasForbiddenMessageChars(value) : hasControlChars(value);
    if (forbidden) errors[field] = "Remove line breaks and control characters.";
  }

  const data: ContactPayload = {
    name: normalize(input.name),
    email: normalize(input.email),
    subject: normalize(input.subject),
    message: normalizeMessage(input.message),
  };

  for (const field of CONTACT_FIELDS) {
    if (errors[field]) continue;
    if (!data[field]) {
      errors[field] = REQUIRED_MESSAGE[field];
    } else if (data[field].length > CONTACT_LIMITS[field]) {
      errors[field] = `${LABELS[field]} must be ${CONTACT_LIMITS[field]} characters or fewer.`;
    }
  }

  if (!errors.email && !isValidEmail(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data };
}

export const LABELS: Record<ContactField, string> = {
  name: "Name",
  email: "Email",
  subject: "Subject",
  message: "Message",
};

export const REQUIRED_MESSAGE: Record<ContactField, string> = {
  name: "Please enter your name.",
  email: "Please enter your email address.",
  subject: "Please add a subject.",
  message: "Please write a message.",
};

/** Escape for interpolation into the HTML alternative of the email. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const SUBJECT_PREFIX = "[KLVEEN Portfolio]";

/** Header-safe subject. Input is already control-char-free; this is belt and braces. */
export function buildSubject(subject: string): string {
  return `${SUBJECT_PREFIX} ${subject.replace(/[\r\n]+/g, " ").slice(0, CONTACT_LIMITS.subject)}`;
}

export type MailContent = { subject: string; text: string; html: string };

/**
 * Render both alternatives from validated data. Recipient and sender are fixed
 * by the caller, never taken from the payload, so this cannot redirect mail.
 */
export function buildMailContent(data: ContactPayload): MailContent {
  const { name, email, subject, message } = data;

  const text = [
    "New message from the klveen.com contact form.",
    "",
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Subject: ${subject}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#64748b;font:600 12px/1.6 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em;vertical-align:top">${escapeHtml(
      label,
    )}</td><td style="padding:4px 0;color:#0f172a;font:14px/1.6 system-ui,sans-serif">${escapeHtml(
      value,
    )}</td></tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f1f5f9">
  <table role="presentation" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px">
    <tr><td style="padding:24px">
      <p style="margin:0 0 4px;color:#0f172a;font:600 16px/1.5 system-ui,sans-serif">New contact form submission</p>
      <p style="margin:0 0 20px;color:#64748b;font:13px/1.5 system-ui,sans-serif">klveen.com</p>
      <table role="presentation">${row("Name", name)}${row("Email", email)}${row("Subject", subject)}</table>
      <hr style="margin:20px 0;border:0;border-top:1px solid #e2e8f0">
      <div style="color:#0f172a;font:14px/1.7 system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(message)}</div>
    </td></tr>
  </table>
</body></html>`;

  return { subject: buildSubject(subject), text, html };
}
