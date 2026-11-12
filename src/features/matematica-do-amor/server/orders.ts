import { createHash, randomUUID } from "node:crypto";
import { CALC_VERSION } from "./calc";
import { REFERENCE_PREFIX } from "./mercadopago";
import type { PreviewPayload, ReadingDocument } from "./assemble";
import { createMemoryOrderStore, resetMemoryOrderStore } from "./memory-order-store";
import {
  assertMemoryAllowed,
  readStoreResolution,
  redisConfigured,
  type OrderStore,
} from "./order-store";
import { createRedisOrderStore } from "./redis-order-store";
import {
  PRICE_CENTS,
  type ChargeState,
  type Order,
  type OrderStatus,
} from "./order-types";

export { PRICE_CENTS };
export type { ChargeState, Order, OrderStatus };

let cachedStore: OrderStore | null = null;
let cachedSignature = "";

export function resetOrderStoreCache(): void {
  cachedStore = null;
  cachedSignature = "";
}

export function getOrderStore(env: NodeJS.ProcessEnv = process.env): OrderStore {
  const resolution = readStoreResolution(env);
  const signature = `${resolution.mode}:${resolution.onVercel}:${resolution.mercadoPagoMode}:${Boolean(env.UPSTASH_REDIS_REST_URL)}`;
  if (cachedStore && cachedSignature === signature) return cachedStore;

  if (resolution.mode === "memory") {
    assertMemoryAllowed(env);
    cachedStore = createMemoryOrderStore(env);
    cachedSignature = signature;
    return cachedStore;
  }

  // redis mode (explicit or required by vercel/production). Credentials checked on first use.
  if (resolution.mode === "redis" || resolution.onVercel || resolution.mercadoPagoMode === "production") {
    cachedStore = createRedisOrderStore(env);
    cachedSignature = signature;
    return cachedStore;
  }

  if (!redisConfigured(env)) {
    assertMemoryAllowed(env);
    cachedStore = createMemoryOrderStore(env);
    cachedSignature = signature;
    return cachedStore;
  }

  cachedStore = createRedisOrderStore(env);
  cachedSignature = signature;
  return cachedStore;
}

export async function resetOrders(): Promise<void> {
  resetMemoryOrderStore();
  resetOrderStoreCache();
}

export function snapshotHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export async function createPendingOrder(input: {
  sessionId: string;
  formatId: string;
  hash: string;
  document: ReadingDocument;
  preview: PreviewPayload;
  buyerFirstName?: string;
}): Promise<Order> {
  const store = getOrderStore();
  const now = new Date().toISOString();
  const existing = (await store.listBySession(input.sessionId)).find((order) => order.status === "pending");
  if (existing && existing.snapshotHash === input.hash && existing.formatId === input.formatId) {
    return normalizeOrder(existing);
  }
  if (existing) {
    await store.set({ ...existing, status: "canceled", updatedAt: now });
  }
  const approved = (await store.listBySession(input.sessionId)).find(
    (order) => order.status === "approved" && order.snapshotHash === input.hash && order.formatId === input.formatId,
  );
  if (approved) return normalizeOrder(approved);

  const order: Order = {
    id: randomUUID(),
    sessionId: input.sessionId,
    status: "pending",
    amountCents: PRICE_CENTS,
    currency: "BRL",
    providerPaymentId: null,
    providerOrderId: null,
    externalReference: null,
    pixCopyPaste: null,
    qrSvg: null,
    ticketUrl: null,
    buyerFirstName: input.buyerFirstName?.trim() ?? "",
    pixLock: false,
    chargeState: "open",
    testMode: false,
    contentVersion: CALC_VERSION,
    snapshotHash: input.hash,
    formatId: input.formatId,
    document: input.document,
    preview: input.preview,
    createdAt: now,
    updatedAt: now,
  };
  await store.set(order);
  return order;
}

export async function confirmSimulated(sessionId: string, orderId: string): Promise<Order | null> {
  const store = getOrderStore();
  const order = await store.get(orderId);
  if (!order || order.sessionId !== sessionId) return null;
  if (order.amountCents !== PRICE_CENTS || order.currency !== "BRL") return null;
  if (order.status === "approved") return normalizeOrder(order);
  if (order.status !== "pending") return null;
  const next = {
    ...order,
    status: "approved" as const,
    providerPaymentId: `sim-${order.id}`,
    updatedAt: new Date().toISOString(),
  };
  await store.set(next);
  return normalizeOrder(next);
}

export async function markFailed(sessionId: string, orderId: string): Promise<Order | null> {
  const store = getOrderStore();
  const order = await store.get(orderId);
  if (!order || order.sessionId !== sessionId || order.status === "approved") {
    return order?.sessionId === sessionId ? normalizeOrder(order) : null;
  }
  const next = { ...order, status: "failed" as const, updatedAt: new Date().toISOString() };
  await store.set(next);
  return normalizeOrder(next);
}

export async function readOrder(sessionId: string, orderId: string): Promise<Order | null> {
  const store = getOrderStore();
  const order = await store.get(orderId);
  if (!order || order.sessionId !== sessionId) return null;
  return normalizeOrder(order);
}

export async function readOrderByProvider(sessionId: string, mpOrderId: string): Promise<Order | null> {
  const store = getOrderStore();
  const found = await store.getByProviderOrderId(sessionId, mpOrderId);
  if (!found) return null;
  return readOrder(sessionId, found.id);
}

export type PixClaim = "missing" | "busy" | "approved" | "reuse" | "ready";

export async function claimPixCreation(sessionId: string, orderId: string): Promise<PixClaim> {
  const order = await readOrder(sessionId, orderId);
  if (!order || order.amountCents !== PRICE_CENTS || order.currency !== "BRL") return "missing";
  if (order.status === "approved") return "approved";
  if (order.status !== "pending") return "missing";
  if (order.pixLock) return "busy";
  if (order.chargeState === "open" && order.providerOrderId && order.pixCopyPaste && order.qrSvg) return "reuse";
  await getOrderStore().set({ ...order, pixLock: true, updatedAt: new Date().toISOString() });
  return "ready";
}

export async function releasePixLock(sessionId: string, orderId: string): Promise<void> {
  const order = await readOrder(sessionId, orderId);
  if (!order?.pixLock) return;
  await getOrderStore().set({ ...order, pixLock: false, updatedAt: new Date().toISOString() });
}

export async function attachPix(
  sessionId: string,
  orderId: string,
  pix: {
    providerOrderId: string;
    externalReference: string;
    copyPaste: string;
    qrSvg: string;
    ticketUrl: string | null;
    paymentId: string | null;
    testMode: boolean;
  },
): Promise<Order | null> {
  const order = await readOrder(sessionId, orderId);
  if (!order || order.status !== "pending" || order.amountCents !== PRICE_CENTS || order.currency !== "BRL") return null;
  if (!pix.externalReference.startsWith(REFERENCE_PREFIX)) return null;
  const next: Order = {
    ...order,
    providerOrderId: pix.providerOrderId,
    providerPaymentId: pix.paymentId,
    externalReference: pix.externalReference,
    pixCopyPaste: pix.copyPaste,
    qrSvg: pix.qrSvg,
    ticketUrl: pix.ticketUrl,
    testMode: pix.testMode,
    chargeState: "open",
    pixLock: false,
    updatedAt: new Date().toISOString(),
  };
  await getOrderStore().set(next);
  return normalizeOrder(next);
}

export async function noteCharge(
  sessionId: string,
  orderId: string,
  chargeState: Exclude<ChargeState, "open">,
): Promise<Order | null> {
  const order = await readOrder(sessionId, orderId);
  if (!order || order.status === "approved") return order ? normalizeOrder(order) : null;
  const next = { ...order, chargeState, pixLock: false, updatedAt: new Date().toISOString() };
  await getOrderStore().set(next);
  return normalizeOrder(next);
}

export async function approveVerified(
  sessionId: string,
  orderId: string,
  proof: { mpOrderId: string; externalReference: string },
): Promise<Order | null> {
  const order = await readOrder(sessionId, orderId);
  if (!order || order.amountCents !== PRICE_CENTS || order.currency !== "BRL") return null;
  if (!order.providerOrderId || order.providerOrderId !== proof.mpOrderId) return null;
  if (!order.externalReference || order.externalReference !== proof.externalReference) return null;
  if (!order.externalReference.startsWith(REFERENCE_PREFIX)) return null;
  if (order.status === "approved") return normalizeOrder(order);
  if (order.status !== "pending") return null;
  const next = {
    ...order,
    status: "approved" as const,
    pixLock: false,
    pixCopyPaste: null,
    qrSvg: null,
    updatedAt: new Date().toISOString(),
  };
  await getOrderStore().set(next);
  return normalizeOrder(next);
}

export function pixView(order: Order): {
  mpOrderId: string;
  copyPaste: string;
  qrSvg: string;
  ticketUrl: string | null;
  testMode: boolean;
  chargeState: ChargeState;
} | null {
  const current = normalizeOrder(order);
  if (!current.providerOrderId || !current.pixCopyPaste || !current.qrSvg) return null;
  return {
    mpOrderId: current.providerOrderId,
    copyPaste: current.pixCopyPaste,
    qrSvg: current.qrSvg,
    ticketUrl: current.ticketUrl,
    testMode: current.testMode,
    chargeState: current.chargeState,
  };
}

export function publicOrder(order: Order): {
  id: string;
  status: OrderStatus;
  amountCents: number;
  currency: "BRL";
  demo: false;
} {
  return { id: order.id, status: order.status, amountCents: order.amountCents, currency: order.currency, demo: false };
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    providerOrderId: order.providerOrderId ?? null,
    externalReference: order.externalReference ?? null,
    pixCopyPaste: order.pixCopyPaste ?? null,
    qrSvg: order.qrSvg ?? null,
    ticketUrl: order.ticketUrl ?? null,
    buyerFirstName: order.buyerFirstName ?? "",
    pixLock: order.pixLock ?? false,
    chargeState: order.chargeState ?? "open",
    testMode: order.testMode ?? false,
  };
}
