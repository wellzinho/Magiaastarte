import { Redis } from "@upstash/redis";
import {
  ORDER_TTL_SECONDS,
  assertRedisReady,
  orderKey,
  providerIndexKey,
  sessionIndexKey,
  storeNamespace,
  type OrderStore,
} from "./order-store";
import { openOrder, sealOrder } from "./order-crypto";
import type { Order } from "./order-types";

export function createRedisOrderStore(env: NodeJS.ProcessEnv = process.env): OrderStore {
  const namespace = storeNamespace(env);
  let redis: Redis | null = null;

  function db(): Redis {
    assertRedisReady(env);
    redis ??= Redis.fromEnv();
    return redis;
  }

  async function readOrder(orderId: string): Promise<Order | null> {
    const value = await db().get(orderKey(namespace, orderId));
    return openOrder(value, env);
  }

  return {
    kind: "redis",
    async get(orderId) {
      return readOrder(orderId);
    },
    async set(order) {
      const sealed = sealOrder(order, env);
      const key = orderKey(namespace, order.id);
      const sessionKey = sessionIndexKey(namespace, order.sessionId);
      await db().set(key, sealed, { ex: ORDER_TTL_SECONDS });
      await db().sadd(sessionKey, order.id);
      await db().expire(sessionKey, ORDER_TTL_SECONDS);
      if (order.providerOrderId) {
        const providerKey = providerIndexKey(namespace, order.providerOrderId);
        await db().set(providerKey, order.id, { ex: ORDER_TTL_SECONDS });
      }
    },
    async listBySession(sessionId) {
      const ids = await db().smembers(sessionIndexKey(namespace, sessionId));
      if (!ids.length) return [];
      const orders: Order[] = [];
      for (const id of ids) {
        const order = await readOrder(String(id));
        if (order && order.sessionId === sessionId) orders.push(order);
      }
      return orders;
    },
    async getByProviderOrderId(sessionId, providerOrderId) {
      const orderId = await db().get<string>(providerIndexKey(namespace, providerOrderId));
      if (!orderId) return null;
      const order = await readOrder(orderId);
      if (!order || order.sessionId !== sessionId) return null;
      return order;
    },
  };
}
