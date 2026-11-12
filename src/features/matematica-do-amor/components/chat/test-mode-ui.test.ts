import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { pixChargeBody } from "../../server/mercadopago";

describe("modo de teste do pagamento", () => {
  it("usa APRO somente em teste", () => {
    const test = pixChargeBody({
      email: "teste@example.com",
      reference: "astarte_matematica_amor_abc",
      mode: "test",
      buyerFirstName: "Ana",
    });
    const production = pixChargeBody({
      email: "teste@example.com",
      reference: "astarte_matematica_amor_abc",
      mode: "production",
      buyerFirstName: "Ana",
    });
    expect(test.payer.first_name).toBe("APRO");
    expect(JSON.stringify(production)).not.toContain("APRO");
    expect(production.payer.first_name).toBe("Ana");
  });

  it("botão de continuar teste só aparece no ramo test-ready do chat", () => {
    const source = readFileSync(new URL("./ChatExperience.tsx", import.meta.url), "utf8");
    expect(source).toContain("Continuar teste e liberar leitura");
    expect(source).toContain('mode === "test-ready"');
    expect(source).toContain("pix.testMode");
    expect(source).toContain("Ambiente de teste");
  });
});
