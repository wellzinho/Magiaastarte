import { afterEach, describe, expect, it, vi } from "vitest";
import { mdaEventSourceUrl } from "../domain/meta-catalog";
import { resetMetaCapiDedup } from "./meta-capi-dedup";
import { reportMdaCompraConcluida } from "./meta-compra";

afterEach(() => {
  resetMetaCapiDedup();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("reportMdaCompraConcluida", () => {
  it("não envia compra em modo de teste", async () => {
    vi.stubEnv("MERCADO_PAGO_MODE", "test");
    vi.stubEnv("MERCADO_PAGO_ACCESS_TOKEN", "token");
    vi.stubEnv("ORDER_STORE_MODE", "memory");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await reportMdaCompraConcluida({
      mpOrderId: "ORD01ABCDEFGH",
      externalReference: "astarte_matematica_amor_abc",
      amountCents: 1990,
      currency: "BRL",
      testMode: true,
    });
    expect(result).toEqual({ sent: false, reason: "test_mode" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("não envia quando MERCADO_PAGO_MODE não é production", async () => {
    vi.stubEnv("MERCADO_PAGO_MODE", "test");
    vi.stubEnv("ORDER_STORE_MODE", "memory");
    const result = await reportMdaCompraConcluida({
      mpOrderId: "ORD01ABCDEFGH",
      externalReference: "astarte_matematica_amor_abc",
      amountCents: 1990,
      currency: "BRL",
      testMode: false,
    });
    expect(result.sent).toBe(false);
    expect(result.reason).toBe("not_production");
  });

  it("em production envia CompraConcluida com action_source website e URL da rota", async () => {
    vi.stubEnv("MERCADO_PAGO_MODE", "production");
    vi.stubEnv("MERCADO_PAGO_ACCESS_TOKEN", "token");
    vi.stubEnv("META_CAPI_ACCESS_TOKEN", "meta-token");
    vi.stubEnv("ORDER_STORE_MODE", "memory");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://magiaastarte.com.br");
    expect(mdaEventSourceUrl()).toBe("https://magiaastarte.com.br/matematica-do-amor");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ events_received: 1 }), { status: 200 }),
    );

    const result = await reportMdaCompraConcluida({
      mpOrderId: "ORD01ABCDEFGH",
      externalReference: "astarte_matematica_amor_abc",
      amountCents: 1990,
      currency: "BRL",
      testMode: false,
    });

    expect(result.sent).toBe(true);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(init.body)) as {
      data: Array<{
        event_name: string;
        event_id: string;
        action_source: string;
        event_source_url: string;
        custom_data: Record<string, unknown>;
      }>;
    };
    const event = payload.data[0];
    expect(event.event_name).toBe("CompraConcluida");
    expect(event.event_id).toBe("ORD01ABCDEFGH");
    expect(event.action_source).toBe("website");
    expect(event.event_source_url).toBe("https://magiaastarte.com.br/matematica-do-amor");
    expect(event.custom_data.content_ids).toEqual(["matematica_do_amor"]);
    expect(JSON.stringify(event)).not.toMatch(/@|nascimento|email/i);
  });
});
