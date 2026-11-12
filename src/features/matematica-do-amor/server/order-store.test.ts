import { afterEach, describe, expect, it, vi } from "vitest";
import { assertMemoryAllowed, ORDER_TTL_SECONDS, readStoreResolution, redisConfigured } from "./order-store";
import { createMemoryOrderStore } from "./memory-order-store";
import { getOrderStore, resetOrderStoreCache } from "./orders";
import { createRedisOrderStore } from "./redis-order-store";
import type { Order } from "./order-types";
import { PRICE_CENTS } from "./order-types";

const baseEnv = { ...process.env };

afterEach(() => {
  process.env = { ...baseEnv };
  resetOrderStoreCache();
  vi.restoreAllMocks();
});

function sampleOrder(id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"): Order {
  return {
    id,
    sessionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    status: "pending",
    amountCents: PRICE_CENTS,
    currency: "BRL",
    providerPaymentId: null,
    providerOrderId: null,
    externalReference: null,
    pixCopyPaste: null,
    qrSvg: null,
    ticketUrl: null,
    buyerFirstName: "Ana",
    pixLock: false,
    chargeState: "open",
    testMode: false,
    contentVersion: "test",
    snapshotHash: "hash",
    formatId: "completa",
    document: null,
    preview: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("order store selection", () => {
  it("permite memory localmente", () => {
    const env = { ORDER_STORE_MODE: "memory", MERCADO_PAGO_MODE: "test" } as unknown as NodeJS.ProcessEnv;
    expect(() => assertMemoryAllowed(env)).not.toThrow();
    expect(createMemoryOrderStore(env).kind).toBe("memory");
    expect(ORDER_TTL_SECONDS).toBe(60 * 60 * 24);
  });

  it("bloqueia memory na Vercel e em production do Mercado Pago", () => {
    expect(() => assertMemoryAllowed({ ORDER_STORE_MODE: "memory", VERCEL: "1" } as unknown as NodeJS.ProcessEnv)).toThrow(/Vercel/);
    expect(() =>
      assertMemoryAllowed({ ORDER_STORE_MODE: "memory", MERCADO_PAGO_MODE: "production" } as unknown as NodeJS.ProcessEnv),
    ).toThrow(/production/);
  });

  it("falha fechado quando Redis é exigido e não está configurado", async () => {
    const env = {
      ORDER_STORE_MODE: "redis",
      MERCADO_PAGO_MODE: "production",
      VERCEL: "1",
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
    } as unknown as NodeJS.ProcessEnv;
    expect(redisConfigured(env)).toBe(false);
    expect(readStoreResolution(env).mode).toBe("redis");
    const store = createRedisOrderStore(env);
    await expect(store.get("missing")).rejects.toThrow(/Redis/);
  });

  it("getOrderStore usa memory em desenvolvimento e redis quando pedido", () => {
    process.env.ORDER_STORE_MODE = "memory";
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    process.env.MERCADO_PAGO_MODE = "test";
    resetOrderStoreCache();
    expect(getOrderStore().kind).toBe("memory");

    process.env.ORDER_STORE_MODE = "redis";
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    resetOrderStoreCache();
    expect(getOrderStore().kind).toBe("redis");
  });

  it("memory store grava e lê pedidos com sessão correta", async () => {
    const store = createMemoryOrderStore({ ORDER_STORE_MODE: "memory", MERCADO_PAGO_MODE: "test" } as unknown as NodeJS.ProcessEnv);
    const order = sampleOrder();
    await store.set(order);
    expect(await store.get(order.id)).toMatchObject({ id: order.id, sessionId: order.sessionId });
    expect(await store.listBySession(order.sessionId)).toHaveLength(1);
    expect(await store.getByProviderOrderId(order.sessionId, "nope")).toBeNull();
  });
});
