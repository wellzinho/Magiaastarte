import { describe, expect, it } from "vitest";
import { isPayerEmail } from "../domain/payment";
import {
  assessMercadoPagoOrder,
  CHARGE_AMOUNT,
  isExactPrice,
  newExternalReference,
  normalizeStatus,
  pixChargeBody,
  REFERENCE_PREFIX,
  safeQrMarkup,
} from "./mercadopago";

const reference = `${REFERENCE_PREFIX}11111111-1111-4111-8111-111111111111`;

function payload(overrides: Record<string, unknown> = {}) {
  return {
    id: "ORD01JP84C939T20S0P1DN382FQ6K",
    status: "action_required",
    status_detail: "waiting_transfer",
    external_reference: reference,
    total_amount: CHARGE_AMOUNT,
    transactions: {
      payments: [
        {
          id: "PAY01JP84C939T20S0P1DN6FCMWQC",
          amount: CHARGE_AMOUNT,
          status: "action_required",
          status_detail: "waiting_transfer",
          payment_method: {
            id: "pix",
            type: "bank_transfer",
            qr_code: "00020126580014br.gov.bcb.pix",
            ticket_url: "https://www.mercadopago.com.br/sandbox/payments/1/ticket",
          },
        },
      ],
    },
    ...overrides,
  };
}

describe("cobrança Pix", () => {
  it("fixa o valor no servidor e usa APRO só no teste", () => {
    const test = pixChargeBody({ email: "pessoa@example.com", reference, mode: "test", buyerFirstName: "Ana" });
    const production = pixChargeBody({ email: "pessoa@example.com", reference, mode: "production", buyerFirstName: "Ana" });
    expect(test.total_amount).toBe(CHARGE_AMOUNT);
    expect(test.transactions.payments[0]?.amount).toBe(CHARGE_AMOUNT);
    expect(test.transactions.payments[0]?.amount).toBe("19.90");
    expect(test.total_amount).toBe("19.90");
    expect(test.items[0]?.title).toBe("Orientação Completa - Matemática do Amor");
    expect(test.payer.first_name).toBe("APRO");
    expect(production.payer.first_name).toBe("Ana");
    expect(JSON.stringify(production)).not.toContain("APRO");
    expect(newExternalReference().startsWith(REFERENCE_PREFIX)).toBe(true);
  });

  it("só trata como aprovado um Pix de R$ 19,90 desta referência", () => {
    expect(assessMercadoPagoOrder(payload(), reference)?.status).toBe("pending");
    expect(normalizeStatus("processing", "waiting", "processing", "waiting")).toBe("pending");
    const approved = assessMercadoPagoOrder(payload({ status: "processed", status_detail: "accredited" }), reference);
    expect(approved?.status).toBe("approved");
    expect(assessMercadoPagoOrder(payload({ status: "processed", status_detail: "waiting_transfer" }), reference)?.status).not.toBe("approved");
    expect(assessMercadoPagoOrder(payload({ total_amount: "0.01" }), reference)).toBeNull();
    expect(isExactPrice("19.90")).toBe(true);
    expect(isExactPrice("0.01")).toBe(false);
    expect(isExactPrice(19.9)).toBe(true);
    expect(assessMercadoPagoOrder(payload({ external_reference: "outra-loja" }), reference)).toBeNull();
    expect(assessMercadoPagoOrder(payload(), `${REFERENCE_PREFIX}outra`)).toBeNull();
    const card = payload();
    const payments = (card.transactions as { payments: { payment_method: { id: string; type: string } }[] }).payments;
    payments[0]!.payment_method = { id: "visa", type: "credit_card" };
    expect(assessMercadoPagoOrder(card, reference)).toBeNull();
    expect(isExactPrice("19.90")).toBe(true);
    expect(isExactPrice("19.91")).toBe(false);
    expect(isExactPrice(19.9)).toBe(true);
  });

  it("valida o e-mail e recusa marcação insegura no QR", () => {
    expect(isPayerEmail("pessoa@example.com")).toBe(true);
    expect(isPayerEmail("sem-arroba")).toBe(false);
    expect(safeQrMarkup("<svg><script>alert(1)</script></svg>")).toBeNull();
    expect(safeQrMarkup('<svg viewBox="0 0 1 1"></svg>')).toContain("<svg");
  });
});
