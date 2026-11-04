# Contact form setup

The contact form posts to `POST /api/contact`, which sends through Cloudflare's
SMTP relay via Nodemailer. Everything below is server-side only.

## Environment variables

Set these in the hosting platform's environment, never in the repository.
`.env*` is already gitignored; `.env.example` below is the committed template.

| Variable | Required | Value |
| --- | --- | --- |
| `MAIL_HOST` | yes | `smtp.mx.cloudflare.net` |
| `MAIL_PORT` | yes | `465` |
| `MAIL_SCHEME` | no | `ssl` (port 465). Use `tls` only for a STARTTLS port. |
| `MAIL_USERNAME` | yes | `api_token` |
| `MAIL_PASSWORD` | yes | Cloudflare Email Routing API token |
| `MAIL_FROM_ADDRESS` | yes | `noreply@klveen.com` (must be a verified sender on the domain) |
| `MAIL_FROM_NAME` | no | `KLVEEN` |
| `CONTACT_TO_EMAIL` | no | `support@klveen.com` (this is also the hard-coded default) |
| `CONTACT_RATE_LIMIT` | no | submissions per window, default `5` |
| `CONTACT_RATE_WINDOW_SECONDS` | no | window length, default `600` |
| `UPSTASH_REDIS_REST_URL` | recommended | durable rate-limit store (see below) |
| `UPSTASH_REDIS_REST_TOKEN` | recommended | durable rate-limit store |
| `TURNSTILE_SECRET_KEY` | optional | enables Turnstile verification |

If any of `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`, or `MAIL_FROM_ADDRESS`
is missing, the route returns `503` and logs nothing sensitive. The form shows a
generic failure and points the visitor at `support@klveen.com`.

## Rate limiting — read this before going live

The in-memory limiter is **per process**. On any platform running more than one
instance (or serverless, where instances come and go), each instance keeps its
own counter, so the effective limit is `limit × instances`. It blocks a burst
from a single instance; it does not enforce a global limit.

For real enforcement, configure `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` (or point those at any Upstash-compatible REST
endpoint). The durable counter is then consulted first and the in-memory bucket
becomes a fallback for when that store is unreachable — an outage degrades the
protection rather than taking the form down.

## Turnstile (optional)

Not currently configured. The form works without it, relying on rate limiting
plus the honeypot-free design. To enable:

1. Create a Turnstile widget in the Cloudflare dashboard for `klveen.com`.
2. Set `TURNSTILE_SECRET_KEY` in the server environment.
3. Add the widget to `src/components/contact-form.tsx` and include the token as
   `turnstileToken` in the JSON body.

The route already verifies `turnstileToken` whenever `TURNSTILE_SECRET_KEY` is
set, and fails **closed** if the verifier is unreachable.

## Rotating the SMTP token

The token that appeared in an earlier chat must be treated as compromised.
Rotate it before deploying:

1. Cloudflare dashboard → My Profile → API Tokens, or Email Routing → Email
   Workers as applicable.
2. Roll the token used for `smtp.mx.cloudflare.net`.
3. Store the new value **only** in the deployment platform's environment
   settings. Never in a file that is committed, and never in `NEXT_PUBLIC_*`.

## Verifying delivery

Automated tests mock Nodemailer and therefore prove nothing about the network.
To confirm real delivery, send one submission from the deployed form and check
that it arrives at `support@klveen.com` with the visitor's address in Reply-To.
Only claim working delivery after that.
