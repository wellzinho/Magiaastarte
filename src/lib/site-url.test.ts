import { afterEach, describe, expect, it, vi } from "vitest";
import { siteOrigin, siteUrl } from "./site-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("siteUrl", () => {
  it("monta raiz e rota da Matemática do Amor sem barras duplicadas", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://magiaastarte.com.br/");
    expect(siteOrigin()).toBe("https://magiaastarte.com.br");
    expect(siteUrl("/")).toBe("https://magiaastarte.com.br/");
    expect(siteUrl("/matematica-do-amor")).toBe("https://magiaastarte.com.br/matematica-do-amor");
  });

  it("usa fallback quando NEXT_PUBLIC_SITE_URL está ausente", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteUrl("/")).toBe("https://magiaastarte.com.br/");
    expect(siteUrl("/matematica-do-amor")).toBe("https://magiaastarte.com.br/matematica-do-amor");
  });
});
