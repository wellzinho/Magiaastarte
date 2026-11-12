import { Redis } from "@upstash/redis";
import {
  ORDER_TTL_SECONDS,
  assertRedisReady,
  readStoreResolution,
  redisConfigured,
  storeNamespace,
} from "./order-store";

export type MetaSendState = "pending" | "sending" | "sent" | "failed";

export type ClaimResult = "proceed" | "skip";

function capiKey(namespace: string, mpOrderId: string): string {
  return `${namespace}:capi:compra:${mpOrderId}`;
}

function memoryBucket(): Map<string, MetaSendState> {
  const globalStore = globalThis as { __mdaMetaCapi?: Map<string, MetaSendState> };
  globalStore.__mdaMetaCapi ??= new Map();
  return globalStore.__mdaMetaCapi;
}

export function resetMetaCapiDedup(): void {
  memoryBucket().clear();
}

function shouldUseRedis(env: NodeJS.ProcessEnv): boolean {
  const resolution = readStoreResolution(env);
  return resolution.mode === "redis" || resolution.onVercel || resolution.mercadoPagoMode === "production";
}

/**
 * Claim atômico: só uma instância envia. `sent` e `sending` pulam.
 * `failed` pode tentar de novo.
 */
export async function claimMetaPurchaseSend(
  mpOrderId: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<ClaimResult> {
  if (!/^[A-Za-z0-9]{10,64}$/.test(mpOrderId)) return "skip";

  if (shouldUseRedis(env) && redisConfigured(env)) {
    assertRedisReady(env);
    const redis = Redis.fromEnv();
    const key = capiKey(storeNamespace(env), mpOrderId);
    const claimed = await redis.set(key, "sending", { nx: true, ex: ORDER_TTL_SECONDS });
    if (claimed === "OK") return "proceed";
    const current = await redis.get<string>(key);
    if (current === "sent" || current === "sending") return "skip";
    if (current === "failed") {
      await redis.set(key, "sending", { ex: ORDER_TTL_SECONDS });
      return "proceed";
    }
    return "skip";
  }

  const map = memoryBucket();
  const current = map.get(mpOrderId) ?? "pending";
  if (current === "sent" || current === "sending") return "skip";
  map.set(mpOrderId, "sending");
  return "proceed";
}

export async function markMetaPurchaseSent(
  mpOrderId: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  if (shouldUseRedis(env) && redisConfigured(env)) {
    const redis = Redis.fromEnv();
    await redis.set(capiKey(storeNamespace(env), mpOrderId), "sent", { ex: ORDER_TTL_SECONDS });
    return;
  }
  memoryBucket().set(mpOrderId, "sent");
}

export async function markMetaPurchaseFailed(
  mpOrderId: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  if (shouldUseRedis(env) && redisConfigured(env)) {
    const redis = Redis.fromEnv();
    await redis.set(capiKey(storeNamespace(env), mpOrderId), "failed", { ex: ORDER_TTL_SECONDS });
    return;
  }
  memoryBucket().set(mpOrderId, "failed");
}

export async function readMetaPurchaseSendState(
  mpOrderId: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<MetaSendState> {
  if (shouldUseRedis(env) && redisConfigured(env)) {
    const redis = Redis.fromEnv();
    const value = await redis.get<string>(capiKey(storeNamespace(env), mpOrderId));
    if (value === "sending" || value === "sent" || value === "failed") return value;
    return "pending";
  }
  return memoryBucket().get(mpOrderId) ?? "pending";
}
