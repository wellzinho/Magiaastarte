import {
  decryptJson,
  encryptJson,
  encryptionKeyBytes,
  isEncryptedBlob,
  mustEncryptInProduction,
  type EncryptedBlob,
} from "@/lib/security/crypto";
import type { Order } from "./order-types";

export type StoredOrderEnvelope = EncryptedBlob | Order;

export function sealOrder(order: Order, env: NodeJS.ProcessEnv = process.env): StoredOrderEnvelope {
  if (mustEncryptInProduction(env) || encryptionKeyBytes(env)) {
    if (!encryptionKeyBytes(env) && mustEncryptInProduction(env)) {
      throw new Error("MDA_DATA_ENCRYPTION_KEY obrigatória em produção.");
    }
    if (encryptionKeyBytes(env)) return encryptJson(order, env);
  }
  return order;
}

export function openOrder(value: unknown, env: NodeJS.ProcessEnv = process.env): Order | null {
  if (!value) return null;
  if (isEncryptedBlob(value)) {
    try {
      return decryptJson<Order>(value, env);
    } catch {
      return null;
    }
  }
  if (mustEncryptInProduction(env)) {
    // Produção não aceita texto puro.
    return null;
  }
  if (typeof value === "object" && value !== null && "id" in value && "sessionId" in value) {
    return value as Order;
  }
  return null;
}
