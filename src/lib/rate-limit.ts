/**
 * Rate limiting for the contact endpoint.
 *
 * Two layers, always both: a per-instance in-memory window that stops a burst
 * without any network hop, and — when a durable store is configured — a shared
 * counter across instances. In-memory alone is a losing game on any platform
 * that runs more than one instance, because each instance keeps its own count,
 * so the durable layer is what actually enforces the limit. See
 * docs/contact-setup.md for what to configure in production.
 */

export type RateLimitVerdict = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  /** Which layer made the call. Useful in logs; never returned to visitors. */
  source: "memory" | "durable";
};

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_SECONDS = 600;

/** Bound on tracked keys, so spoofed identifiers cannot grow the map forever. */
const MAX_TRACKED_KEYS = 5000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function positiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function rateLimitOptions(): { limit: number; windowSeconds: number } {
  return {
    limit: positiveInt(process.env.CONTACT_RATE_LIMIT, DEFAULT_LIMIT),
    windowSeconds: positiveInt(process.env.CONTACT_RATE_WINDOW_SECONDS, DEFAULT_WINDOW_SECONDS),
  };
}

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // Still oversized after dropping expired entries: shed the oldest resets.
  if (buckets.size > MAX_TRACKED_KEYS) {
    const excess = buckets.size - MAX_TRACKED_KEYS;
    let dropped = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++dropped >= excess) break;
    }
  }
}

function consumeMemory(key: string, limit: number, windowSeconds: number): RateLimitVerdict {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      retryAfterSeconds: 0,
      source: "memory",
    };
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
  return {
    allowed: bucket.count <= limit,
    limit,
    remaining,
    retryAfterSeconds: remaining === 0 ? retryAfterSeconds : 0,
    source: "memory",
  };
}

type DurableConfig = { url: string; token: string };

/**
 * Upstash-compatible Redis over REST. Chosen over a client library because it
 * is a plain fetch — no dependency, and it works from any Node runtime.
 */
function durableConfig(): DurableConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function hasDurableStore(): boolean {
  return durableConfig() !== null;
}

async function consumeDurable(
  key: string,
  limit: number,
  windowSeconds: number,
  config: DurableConfig,
): Promise<RateLimitVerdict> {
  const namespaced = `contact:rl:${key}`;

  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", namespaced],
      ["EXPIRE", namespaced, String(windowSeconds), "NX"],
      ["TTL", namespaced],
    ]),
    // Never let a slow limiter hold the request open.
    signal: AbortSignal.timeout(3000),
  });

  if (!response.ok) throw new Error(`durable limiter responded ${response.status}`);

  const results = (await response.json()) as { result?: unknown }[];
  const count = Number(results[0]?.result ?? 0);
  const ttl = Number(results[2]?.result ?? windowSeconds);

  if (!Number.isFinite(count) || count <= 0) throw new Error("durable limiter returned no count");

  const remaining = Math.max(0, limit - count);
  return {
    allowed: count <= limit,
    limit,
    remaining,
    retryAfterSeconds: count > limit ? Math.max(1, Number.isFinite(ttl) ? ttl : windowSeconds) : 0,
    source: "durable",
  };
}

/**
 * Consume one slot for `identifier`. The durable layer is consulted first when
 * configured; if it is unreachable the in-memory verdict still stands, because
 * a limiter outage should degrade the protection, not take the form down.
 */
export async function consumeRateLimit(identifier: string): Promise<RateLimitVerdict> {
  const { limit, windowSeconds } = rateLimitOptions();
  const config = durableConfig();
  if (!config) return consumeMemory(identifier, limit, windowSeconds);

  try {
    return await consumeDurable(identifier, limit, windowSeconds, config);
  } catch {
    return consumeMemory(identifier, limit, windowSeconds);
  }
}

/** Test seam: the module holds process-wide state. */
export function resetRateLimits(): void {
  buckets.clear();
}

/**
 * Best-effort client identity. Behind a proxy the left-most X-Forwarded-For
 * entry is the client; everything after it is proxy chain. Absent any header
 * this collapses to one shared bucket, which is the safe direction to fail.
 */
export function clientIdentifier(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * Duplicate-submission guard: the same payload from the same client inside the
 * window is treated as a repeat of the first attempt rather than a new send.
 */
const recentSubmissions = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 120_000;

export function isDuplicateSubmission(identifier: string, digest: string): boolean {
  const now = Date.now();
  for (const [key, at] of recentSubmissions) {
    if (now - at > DUPLICATE_WINDOW_MS) recentSubmissions.delete(key);
  }
  const key = `${identifier}:${digest}`;
  if (recentSubmissions.has(key)) return true;
  recentSubmissions.set(key, now);
  return false;
}

export function resetDuplicateSubmissions(): void {
  recentSubmissions.clear();
}
