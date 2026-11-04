"use client";

import { useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

import {
  CONTACT_LIMITS,
  LABELS,
  REQUIRED_MESSAGE,
  isValidEmail,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact-schema";

type Status = "idle" | "submitting" | "success" | "error";

const FIELDS: { name: ContactField; label: string; type: string; autoComplete?: string }[] = [
  { name: "name", label: LABELS.name, type: "text", autoComplete: "name" },
  { name: "email", label: LABELS.email, type: "email", autoComplete: "email" },
  { name: "subject", label: LABELS.subject, type: "text" },
];

const EMPTY: Record<ContactField, string> = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState("");
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const submitting = status === "submitting";

  function update(field: ContactField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as the visitor edits it; re-validated on submit.
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validateLocal(): ContactErrors {
    const next: ContactErrors = {};
    for (const { name, label } of [...FIELDS, { name: "message" as const, label: LABELS.message }]) {
      const value = values[name].trim();
      if (!value) next[name] = REQUIRED_MESSAGE[name];
      else if (value.length > CONTACT_LIMITS[name])
        next[name] = `${label} must be ${CONTACT_LIMITS[name]} characters or fewer.`;
    }
    if (!next.email && !isValidEmail(values.email.trim()))
      next.email = "Enter a valid email address.";
    if (!next.subject && /[\r\n]/.test(values.subject))
      next.subject = "Remove line breaks from the subject.";
    return next;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const local = validateLocal();
    if (Object.keys(local).length > 0) {
      setErrors(local);
      setStatus("idle");
      setNotice("Please check the highlighted fields.");
      focusFirstError(local);
      return;
    }

    setErrors({});
    setStatus("submitting");
    setNotice("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: ContactErrors;
      };

      if (!response.ok || !payload.ok) {
        setStatus("error");
        setErrors(payload.fieldErrors ?? {});
        setNotice(
          payload.error ??
            "The message could not be sent. Please email support@klveen.com directly.",
        );
        if (payload.fieldErrors) focusFirstError(payload.fieldErrors);
        return;
      }

      setValues(EMPTY);
      setStatus("success");
      setNotice("Thanks — your message is on its way. I'll reply to the address you provided.");
    } catch {
      setStatus("error");
      setNotice("Network error. Please email support@klveen.com directly.");
    }
  }

  function focusFirstError(fieldErrors: ContactErrors) {
    const first = (Object.keys(fieldErrors) as ContactField[])[0];
    if (!first) return;
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  const fieldProps = (name: ContactField) => ({
    id: `${formId}-${name}`,
    name,
    value: values[name],
    disabled: submitting,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${formId}-${name}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update(name, e.target.value),
  });

  const inputClass = (name: ContactField) =>
    `w-full rounded-xl border bg-ink-2/60 px-3.5 py-3 text-sm text-fg placeholder:text-muted/60 transition-colors duration-200 disabled:opacity-60 ${
      errors[name] ? "border-red-400/70" : "border-line hover:border-line/80 focus:border-cyan/60"
    }`;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-busy={submitting}
      className="rounded-card border border-line/80 bg-ink-2/55 p-5 sm:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ name, label, type, autoComplete }) => (
          <div key={name} className={name === "subject" ? "sm:col-span-2" : undefined}>
            <label htmlFor={`${formId}-${name}`} className="mb-2 block text-xs font-medium text-fg/90">
              {label} <span className="text-cyan/80" aria-hidden="true">*</span>
            </label>
            <input
              {...fieldProps(name)}
              type={type}
              autoComplete={autoComplete}
              maxLength={CONTACT_LIMITS[name]}
              placeholder={name === "email" ? "you@example.com" : undefined}
              className={inputClass(name)}
            />
            {errors[name] && (
              <p id={`${formId}-${name}-error`} className="mt-1.5 flex items-start gap-1.5 text-xs text-red-300">
                <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                {errors[name]}
              </p>
            )}
          </div>
        ))}

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-message`} className="mb-2 block text-xs font-medium text-fg/90">
            {LABELS.message} <span className="text-cyan/80" aria-hidden="true">*</span>
          </label>
          <textarea
            {...fieldProps("message")}
            rows={5}
            maxLength={CONTACT_LIMITS.message}
            className={`${inputClass("message")} resize-y`}
          />
          {errors.message && (
            <p id={`${formId}-message-error`} className="mt-1.5 flex items-start gap-1.5 text-xs text-red-300">
              <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              {errors.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-cyan px-5 text-sm font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send size={15} aria-hidden="true" />
              Send Message
            </>
          )}
        </button>
        <p className="text-xs text-muted">
          Required fields are marked <span className="text-cyan/80">*</span>
        </p>
      </div>

      {/* One live region for all submission feedback, so screen readers hear a
          single announcement rather than a burst per field. */}
      <div
        role="status"
        aria-live="polite"
        className={notice ? `mt-4 flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${
          status === "success"
            ? "border-cyan/40 bg-cyan/[0.07] text-fg"
            : status === "error"
              ? "border-red-400/40 bg-red-400/[0.07] text-red-100"
              : "border-line/70 bg-ink-2/60 text-muted"
        }` : "sr-only"}
      >
        {status === "success" && <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan" aria-hidden="true" />}
        {status === "error" && <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
        <span>{notice}</span>
      </div>
    </form>
  );
}
