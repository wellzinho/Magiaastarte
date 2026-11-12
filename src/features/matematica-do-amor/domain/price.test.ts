import { describe, expect, it } from "vitest";
import { MDA_CHARGE_AMOUNT, MDA_PRICE_CENTS, MDA_PRICE_LABEL, MDA_PRICE_VALUE } from "./price";
import { PRICE_LABEL, UNLOCK_LABEL } from "./payment";
import { MDA_PRODUCT } from "./meta-catalog";
import { CHARGE_AMOUNT, isExactPrice, pixChargeBody, REFERENCE_PREFIX } from "../server/mercadopago";

describe("preço temporário de um centavo", () => {
  it("mostra R$ 0,01 e cobra 0.01 na mesma constante", () => {
    expect(MDA_PRICE_CENTS).toBe(1);
    expect(MDA_PRICE_LABEL).toBe("R$ 0,01");
    expect(PRICE_LABEL).toBe("R$ 0,01");
    expect(UNLOCK_LABEL).toContain("R$ 0,01");
    expect(MDA_CHARGE_AMOUNT).toBe("0.01");
    expect(CHARGE_AMOUNT).toBe("0.01");
    expect(MDA_PRICE_VALUE).toBe(0.01);
    expect(MDA_PRODUCT.value).toBe(0.01);
  });

  it("o Mercado Pago recebe 0.01 e recusa outro valor", () => {
    const body = pixChargeBody({
      email: "pessoa@example.com",
      reference: `${REFERENCE_PREFIX}11111111-1111-4111-8111-111111111111`,
      mode: "production",
      buyerFirstName: "Ana",
    });
    expect(body.total_amount).toBe("0.01");
    expect(body.transactions.payments[0]?.amount).toBe("0.01");
    expect(body.items[0]?.unit_price).toBe("0.01");
    expect(body.payer.first_name).toBe("Ana");
    expect(isExactPrice("0.01")).toBe(true);
    expect(isExactPrice("19.90")).toBe(false);
    expect(isExactPrice(19.9)).toBe(false);
  });
});
