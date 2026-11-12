import { assertMemoryAllowed, type OrderStore } from "./order-store";
import type { Order } from "./order-types";

type Bucket = {
  orders: Map<string, Order>;
};

function bucket(): Bucket {
  const globalStore = globalThis as { __mdaMemoryOrders?: Bucket };
  globalStore.__mdaMemoryOrders ??= { orders: new Map() };
  return globalStore.__mdaMemoryOrders;
}

export function createMemoryOrderStore(env: NodeJS.ProcessEnv = process.env): OrderStore {
  assertMemoryAllowed(env);
  return {
    kind: "memory",
    async get(orderId) {
      return bucket().orders.get(orderId) ?? null;
    },
    async set(order) {
      bucket().orders.set(order.id, order);
    },
    async listBySession(sessionId) {
      return [...bucket().orders.values()].filter((order) => order.sessionId === sessionId);
    },
    async getByProviderOrderId(sessionId, providerOrderId) {
      return (
        [...bucket().orders.values()].find(
          (order) => order.sessionId === sessionId && order.providerOrderId === providerOrderId,
        ) ?? null
      );
    },
    async clear() {
      bucket().orders.clear();
    },
  };
}

export function resetMemoryOrderStore(): void {
  bucket().orders.clear();
}
