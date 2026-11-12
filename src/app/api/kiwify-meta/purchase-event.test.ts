import { afterEach, describe, expect, it, vi } from "vitest";
import { buildCompraConcluida, isEligiblePurchase, type SaleWebhook } from "./purchase-event";

const base: SaleWebhook = {
  webhook_event_type: "order_approved",
  order_status: "paid",
  order_id: "kiwify-order-123",
  approved_date: "2026-11-12 15:00:00",
  Product: { product_id: "df7946b0-b2c3-11f1-a689-cd733c12bf87" },
  Customer: { email: "cliente@example.com" },
  Commissions: { charge_amount: 3790, currency: "BRL" },
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("CompraConcluida Kiwify", () => {
  it("mantém CompraConcluida, event_id e usa action_source website com URL raiz", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://magiaastarte.com.br");
    const built = buildCompraConcluida(base);
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.event.event_name).toBe("CompraConcluida");
    expect(built.event.event_id).toBe("kiwify-order-123");
    expect(built.event.action_source).toBe("website");
    expect(built.event.event_source_url).toBe("https://magiaastarte.com.br/");
    expect(built.event.custom_data.value).toBe(37.9);
    expect(built.event.custom_data.currency).toBe("BRL");
    expect(built.event.custom_data.content_name).toBe("21 Práticas de Pombagira");
    expect(built.event.custom_data.content_ids).toEqual(["21_praticas_pombagira"]);
    expect(built.event.custom_data.content_type).toBe("product");
    expect(JSON.stringify(built.event.custom_data)).not.toMatch(/cliente@example\.com/);
  });

  it("normaliza barra final de NEXT_PUBLIC_SITE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://magiaastarte.com.br/");
    const built = buildCompraConcluida(base);
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.event.event_source_url).toBe("https://magiaastarte.com.br/");
  });

  it("não classifica outro product_id como elegível", () => {
    expect(
      isEligiblePurchase({
        ...base,
        Product: { product_id: "outro-produto" },
      }),
    ).toBe(false);
  });
});
