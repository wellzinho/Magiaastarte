import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { redisConfigured, storeNamespace } from "@/features/matematica-do-amor/server/order-store";

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

type Bucket = Map<string, { count: number; resetAt: number }>;

function memory(): Bucket {
  const g = globalThis as { __mdaRateLimit?: Bucket };
  g.__mdaRateLimit ??= new Map();
  return g.__mdaRateLimit;
}

export function resetRateLimitMemory(): void {
  memory().clear();
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return "unknown";
}

function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

async function hit(
  key: string,
  limit: number,
  windowSec: number,
  env: NodeJS.ProcessEnv = process.env,
): Promise<RateLimitResult> {
  const namespaced = `${storeNamespace(env)}:rl:${key}`;
  if (redisConfigured(env)) {
    const redis = Redis.fromEnv();
    const count = await redis.incr(namespaced);
    if (count === 1) await redis.expire(namespaced, windowSec);
    if (count > limit) {
      const ttl = await redis.ttl(namespaced);
      return { ok: false, retryAfterSec: Math.max(1, ttl > 0 ? ttl : windowSec) };
    }
    return { ok: true };
  }

  const now = Date.now();
  const bucket = memory();
  const current = bucket.get(namespaced);
  if (!current || current.resetAt <= now) {
    bucket.set(namespaced, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true };
  }
  current.count += 1;
  if (current.count > limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  return { ok: true };
}

export async function enforceRateLimits(
  request: Request,
  opts: { endpoint: string; sessionId?: string; orderId?: string; limits: Array<{ key: "ip" | "session" | "order"; limit: number; windowSec: number }> },
): Promise<Response | null> {
  const ip = hashKey(clientIp(request));
  for (const rule of opts.limits) {
    let material = "";
    if (rule.key === "ip") material = `ip:${opts.endpoint}:${ip}`;
    if (rule.key === "session") {
      if (!opts.sessionId) continue;
      material = `session:${opts.endpoint}:${hashKey(opts.sessionId)}`;
    }
    if (rule.key === "order") {
      if (!opts.orderId) continue;
      material = `order:${opts.endpoint}:${hashKey(opts.orderId)}`;
    }
    const result = await hit(material, rule.limit, rule.windowSec);
    if (!result.ok) {
      return new Response(JSON.stringify({ error: "Muitas tentativas. Aguarde e tente de novo." }), {
        status: 429,
        headers: {
          "content-type": "application/json",
          "Retry-After": String(result.retryAfterSec),
          "Cache-Control": "no-store",
        },
      });
    }
  }
  return null;
}

export const LIMITS = {
  createPix: [
    { key: "ip" as const, limit: 5, windowSec: 15 * 60 },
    { key: "session" as const, limit: 3, windowSec: 15 * 60 },
  ],
  orderStatus: [
    { key: "session" as const, limit: 100, windowSec: 5 * 60 },
    { key: "ip" as const, limit: 200, windowSec: 5 * 60 },
  ],
  previa: [{ key: "session" as const, limit: 30, windowSec: 10 * 60 }],
  pedido: [{ key: "session" as const, limit: 20, windowSec: 10 * 60 }],
  documento: [
    { key: "session" as const, limit: 20, windowSec: 10 * 60 },
    { key: "order" as const, limit: 30, windowSec: 10 * 60 },
  ],
  kiwify: [{ key: "ip" as const, limit: 300, windowSec: 60 }],
};
