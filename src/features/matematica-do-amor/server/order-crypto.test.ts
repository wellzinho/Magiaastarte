import { afterEach, describe, expect, it } from "vitest";
import { openOrder, sealOrder } from "./order-crypto";
import type { Order } from "./order-types";
import { PRICE_CENTS } from "./order-types";

const KEY_HEX = "b".repeat(64);

function sample(): Order {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    sessionId: "22222222-2222-4222-8222-222222222222",
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
    testMode: true,
    contentVersion: "1",
    snapshotHash: "abc",
    formatId: "fmt",
    document: null,
    preview: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

afterEach(() => {
  delete process.env.MDA_DATA_ENCRYPTION_KEY;
  delete process.env.VERCEL_ENV;
  delete process.env.MERCADO_PAGO_MODE;
});

describe("order crypto", () => {
  it("não grava PII em texto puro quando a chave existe", () => {
    process.env.MDA_DATA_ENCRYPTION_KEY = KEY_HEX;
    const sealed = sealOrder(sample());
    expect(JSON.stringify(sealed)).not.toContain("Ana");
    expect(openOrder(sealed)?.buyerFirstName).toBe("Ana");
  });

  it("falha fechado em produção sem chave ao selar", () => {
    process.env.MERCADO_PAGO_MODE = "production";
    delete process.env.MDA_DATA_ENCRYPTION_KEY;
    expect(() => sealOrder(sample())).toThrow(/MDA_DATA_ENCRYPTION_KEY/);
  });

  it("recusa texto puro em produção", () => {
    process.env.VERCEL_ENV = "production";
    process.env.MDA_DATA_ENCRYPTION_KEY = KEY_HEX;
    expect(openOrder(sample())).toBeNull();
  });
});
