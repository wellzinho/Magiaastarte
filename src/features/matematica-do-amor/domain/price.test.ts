import { describe, expect, it } from "vitest";
import { MDA_CHARGE_AMOUNT, MDA_PRICE_CENTS, MDA_PRICE_LABEL, MDA_PRICE_VALUE } from "./price";
import { PRICE_LABEL, UNLOCK_LABEL } from "./payment";
import { MDA_PRODUCT } from "./meta-catalog";
import { CHARGE_AMOUNT, isExactPrice, pixChargeBody, REFERENCE_PREFIX } from "../server/mercadopago";

describe("preço oficial da Matemática do Amor", () => {
  it("mostra R$ 19,90 e cobra 19.90 na mesma constante", () => {
    expect(MDA_PRICE_CENTS).toBe(1990);
    expect(MDA_PRICE_LABEL).toBe("R$ 19,90");
    expect(PRICE_LABEL).toBe("R$ 19,90");
    expect(UNLOCK_LABEL).toContain("R$ 19,90");
    expect(MDA_CHARGE_AMOUNT).toBe("19.90");
    expect(CHARGE_AMOUNT).toBe("19.90");
    expect(MDA_PRICE_VALUE.toFixed(2)).toBe("19.90");
    expect(MDA_PRODUCT.value.toFixed(2)).toBe("19.90");
  });

  it("o Mercado Pago recebe 19.90 e recusa R$ 0,01", () => {
    const body = pixChargeBody({
      email: "pessoa@example.com",
      reference: `${REFERENCE_PREFIX}11111111-1111-4111-8111-111111111111`,
      mode: "production",
      buyerFirstName: "Ana",
    });
    expect(body.total_amount).toBe("19.90");
    expect(body.transactions.payments[0]?.amount).toBe("19.90");
    expect(body.items[0]?.unit_price).toBe("19.90");
    expect(body.payer.first_name).toBe("Ana");
    expect(isExactPrice("19.90")).toBe(true);
    expect(isExactPrice(19.9)).toBe(true);
    expect(isExactPrice("0.01")).toBe(false);
    expect(isExactPrice(0.01)).toBe(false);
  });
});
