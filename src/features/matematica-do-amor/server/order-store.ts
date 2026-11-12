import type { Order } from "./order-types";

export const ORDER_TTL_SECONDS = 60 * 60 * 24;

export type OrderStore = {
  kind: "memory" | "redis";
  get(orderId: string): Promise<Order | null>;
  set(order: Order): Promise<void>;
  listBySession(sessionId: string): Promise<Order[]>;
  getByProviderOrderId(sessionId: string, providerOrderId: string): Promise<Order | null>;
  clear?(): Promise<void>;
};

export type StoreResolution = {
  mode: "memory" | "redis";
  onVercel: boolean;
  mercadoPagoMode: string | undefined;
};

export function readStoreResolution(env: NodeJS.ProcessEnv = process.env): StoreResolution {
  return {
    mode: env.ORDER_STORE_MODE === "redis" ? "redis" : env.ORDER_STORE_MODE === "memory" ? "memory" : defaultMode(env),
    onVercel: env.VERCEL === "1" || Boolean(env.VERCEL_ENV),
    mercadoPagoMode: typeof env.MERCADO_PAGO_MODE === "string" ? env.MERCADO_PAGO_MODE : undefined,
  };
}

function defaultMode(env: NodeJS.ProcessEnv): "memory" | "redis" {
  if (env.VERCEL === "1" || Boolean(env.VERCEL_ENV) || env.MERCADO_PAGO_MODE === "production") return "redis";
  return "memory";
}

export function assertMemoryAllowed(env: NodeJS.ProcessEnv = process.env): void {
  const resolution = readStoreResolution(env);
  if (resolution.onVercel) {
    throw new Error("ORDER_STORE_MODE=memory não é permitido na Vercel.");
  }
  if (resolution.mercadoPagoMode === "production") {
    throw new Error("ORDER_STORE_MODE=memory não é permitido com MERCADO_PAGO_MODE=production.");
  }
  if (env.ORDER_STORE_MODE && env.ORDER_STORE_MODE !== "memory" && env.ORDER_STORE_MODE !== "redis") {
    throw new Error("ORDER_STORE_MODE inválido.");
  }
}

export function redisConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.UPSTASH_REDIS_REST_URL?.trim() && env.UPSTASH_REDIS_REST_TOKEN?.trim());
}

export function assertRedisReady(env: NodeJS.ProcessEnv = process.env): void {
  if (!redisConfigured(env)) {
    throw new Error("Redis da Matemática do Amor não está configurado.");
  }
}

export function storeNamespace(env: NodeJS.ProcessEnv = process.env): string {
  const mode = env.MERCADO_PAGO_MODE === "production" ? "production" : env.MERCADO_PAGO_MODE === "test" ? "test" : "local";
  return `mda:${mode}`;
}

export function orderKey(namespace: string, orderId: string): string {
  return `${namespace}:order:${orderId}`;
}

export function sessionIndexKey(namespace: string, sessionId: string): string {
  return `${namespace}:session:${sessionId}:orders`;
}

export function providerIndexKey(namespace: string, providerOrderId: string): string {
  return `${namespace}:provider:${providerOrderId}`;
}
