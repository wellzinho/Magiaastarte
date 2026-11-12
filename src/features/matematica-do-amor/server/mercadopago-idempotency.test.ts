import { describe, expect, it } from "vitest";
import { pixIdempotencyKey } from "./mercadopago";

describe("idempotência Pix", () => {
  it("deriva chave estável do orderId sem PII", () => {
    const orderId = "55555555-5555-4555-8555-555555555555";
    const a = pixIdempotencyKey(orderId);
    const b = pixIdempotencyKey(orderId);
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
    expect(a).not.toContain("@");
    expect(a).not.toContain(orderId);
  });
});
