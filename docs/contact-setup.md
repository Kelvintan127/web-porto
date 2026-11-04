# Contact form setup

The contact form posts to `POST /api/contact`, which sends through **Resend
SMTP** (`smtp.resend.com`) via Nodemailer. Everything below is server-side
only. Inbound mail is untouched: Cloudflare Email Routing → Gmail keeps
forwarding `support@klveen.com` as before; only outbound sending moved.

> History: outbound previously used Cloudflare's SMTP relay
> (`smtp.mx.cloudflare.net`), which rejected sends with
> `550 5.7.1 Not authorized to send from domain klveen.com` — general outbound
> delivery requires a paid Cloudflare plan. Migration to Resend Free keeps the
> same Nodemailer transport; only the environment values changed.

## Environment variables

Set these in Coolify's Environment Variables panel (or your host's equivalent).
Never in the repository. `.env*` is gitignored; `.env.example` is the
committed template.

| Variable | Required | Value |
| --- | --- | --- |
| `MAIL_HOST` | yes | `smtp.resend.com` |
| `MAIL_PORT` | yes | `465` |
| `MAIL_SCHEME` | yes | `smtps` (implicit TLS on 465) |
| `MAIL_USERNAME` | yes | `resend` (literal) |
| `MAIL_PASSWORD` | yes | Resend API key (`re_...`) |
| `MAIL_FROM_ADDRESS` | yes | `noreply@klveen.com` |
| `MAIL_FROM_NAME` | no | `KLVEEN Contact` |
| `CONTACT_TO_EMAIL` | no | `support@klveen.com` (also the hard-coded default) |
| `MAIL_ENVELOPE_FROM` | no | defaults to `MAIL_FROM_ADDRESS` |
| `CONTACT_RATE_LIMIT` | no | submissions per window, default `5` |
| `CONTACT_RATE_WINDOW_SECONDS` | no | window length, default `600` |
| `UPSTASH_REDIS_REST_URL` | recommended | durable rate-limit store (see below) |
| `UPSTASH_REDIS_REST_TOKEN` | recommended | durable rate-limit store |
| `TURNSTILE_SECRET_KEY` | optional | enables Turnstile verification |

If any of `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`, or `MAIL_FROM_ADDRESS`
is missing, the route returns `503` and logs nothing sensitive. The form shows
a generic failure and points the visitor at `support@klveen.com`.

Errors are logged as a classified label plus the provider message head
(`sender-or-domain-rejected (550)`, `authentication-failed (535)`,
`connection-failed`, …), with credential-shaped strings redacted before
logging. Visitors only ever see the generic message.

## Resend Dashboard setup

1. Create a free account at resend.com.
2. **Domains → Add Domain** → `klveen.com`. Resend shows the exact DNS records
   to create — copy them verbatim, do not improvise values. Typically:
   - **DKIM**: `resend._domainkey.klveen.com` TXT (public key from Resend)
   - **SPF**: `send.klveen.com` TXT `v=spf1 include:amazonses.com ~all`
   - **Return-path**: `send.klveen.com` MX → Resend-provided value, plus the
     matching `send.klveen.com` TXT if Resend lists one
3. Wait for the domain to show **Verified** in the dashboard.
4. **API Keys → Create API Key**, sending permission only. That key is
   `MAIL_PASSWORD` in Coolify.

## Cloudflare DNS configuration

Do these in the Cloudflare dashboard for the `klveen.com` zone, DNS tab. Add
the records Resend showed, subject to these constraints:

1. **Do not touch the root MX records.** They belong to Cloudflare Email
   Routing and keep `support@klveen.com` → Gmail working. Resend must only ever
   ask for records on `send.klveen.com` or a subdomain of it. If a Resend
   record targets the root MX, stop and re-check — that would break inbound mail.
2. **One SPF policy per hostname.** If `send.klveen.com` already has a TXT,
   merge the `include:` into it rather than adding a second `v=spf1` record.
   The root `klveen.com` SPF, if present, is a different hostname and is not
   affected by Resend's `send.` records.
3. **DKIM on `resend._domainkey.klveen.com`**: if that exact name already
   exists (from an old integration), replace its value rather than creating a
   duplicate.
4. **DMARC** (`_dmarc.klveen.com`): optional but recommended. If a DMARC record
   already exists, leave it unless it demonstrably conflicts.
5. Record values from Resend's dashboard are authoritative — this file
   deliberately does not duplicate them, since Resend generates them per
   account.

## Coolify environment variables

Paste the block from `.env.example` into the application's Environment
Variables in Coolify, filling `MAIL_PASSWORD` with the real `re_...` key.
Notes:

- All variables are read server-side only (Node runtime route handler). No
  `NEXT_PUBLIC_` variable is involved — a test asserts this.
- The Docker build is unaffected: no new dependencies, no Dockerfile change.
  The only runtime change is environment values.
- Redeploy after changing variables so the container picks them up.
- Missing credentials produce a sanitized `503` — the site keeps working; only
  the form's send fails.

## Rate limiting — read this before going live

The in-memory limiter is **per process**. On any platform running more than one
instance, each instance keeps its own counter, so the effective limit is
`limit × instances`. It blocks a burst from a single instance; it does not
enforce a global limit.

For real enforcement configure `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` (or any Upstash-compatible REST endpoint). The
durable counter is then consulted first and the in-memory bucket becomes a
fallback when that store is unreachable — an outage degrades the protection
rather than taking the form down.

## Turnstile (optional)

Not currently configured. The route verifies `turnstileToken` whenever
`TURNSTILE_SECRET_KEY` is set and fails **closed** if the verifier is
unreachable. To enable:

1. Create a Turnstile widget in the Cloudflare dashboard for `klveen.com`.
2. Set `TURNSTILE_SECRET_KEY` in the server environment.
3. Add the widget to `src/components/contact-form.tsx` and include the token as
   `turnstileToken` in the JSON body.

## Verifying delivery

Automated tests mock Nodemailer and prove nothing about the network. After
Resend DNS is verified and Coolify has the real key:

1. Submit the deployed form once.
2. Confirm arrival at `support@klveen.com` (via Gmail, through Cloudflare
   Email Routing).
3. Check the `Reply-To` on the received mail is the address you typed.
4. Check Resend dashboard → Emails shows the send with status `Delivered`.

Only claim working delivery after that.
