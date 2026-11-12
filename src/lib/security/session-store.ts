import { Redis } from "@upstash/redis";
import { redisConfigured, storeNamespace } from "@/features/matematica-do-amor/server/order-store";

/** Em Vercel, sessão Auth deve usar Redis compartilhado — memória por isolate quebra o binding. */
export function sessionStoreMode(env: NodeJS.ProcessEnv = process.env): "redis" | "memory" {
  if (redisConfigured(env)) return "redis";
  const onVercel = env.VERCEL === "1" || Boolean(env.VERCEL_ENV);
  if (onVercel) {
    throw new Error("MDA_SESSION_REDIS_REQUIRED");
  }
  return "memory";
}

export function sessionRedis(env: NodeJS.ProcessEnv = process.env): Redis {
  if (!redisConfigured(env)) {
    throw new Error("MDA_SESSION_REDIS_REQUIRED");
  }
  return Redis.fromEnv();
}

export function sessionAuthKey(tokenHash: string, env: NodeJS.ProcessEnv = process.env): string {
  return `${storeNamespace(env)}:auth:${tokenHash}`;
}
