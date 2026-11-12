import { describe, expect, it } from "vitest";
import { assertBrowserOrigin, isAllowedOrigin } from "./origin";

describe("origem CSRF", () => {
  it("aceita origem completa do site e rejeita endsWith falso", () => {
    const env = {
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://magiaastarte.com.br",
    } as unknown as NodeJS.ProcessEnv;
    expect(isAllowedOrigin("https://magiaastarte.com.br", env)).toBe(true);
    expect(isAllowedOrigin("https://www.magiaastarte.com.br", env)).toBe(true);
    expect(isAllowedOrigin("https://evilmagiaastarte.com.br", env)).toBe(false);
    expect(isAllowedOrigin("http://localhost:3010", env)).toBe(false);
    expect(isAllowedOrigin("null", env)).toBe(false);
    expect(isAllowedOrigin(null, env)).toBe(false);
  });

  it("permite localhost fora da Vercel para smoke local", () => {
    const env = { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://magiaastarte.com.br" } as unknown as NodeJS.ProcessEnv;
    expect(isAllowedOrigin("http://localhost:3010", env)).toBe(true);
    expect(isAllowedOrigin("http://127.0.0.1:3010", env)).toBe(true);
  });

  it("bloqueia Origin ausente sem Referer válido", () => {
    const denied = assertBrowserOrigin(
      new Request("http://localhost:3000/api/x", { method: "POST" }),
      { NODE_ENV: "development" } as unknown as NodeJS.ProcessEnv,
    );
    expect(denied?.status).toBe(403);
  });

  it("aceita Referer quando Origin falta", () => {
    const ok = assertBrowserOrigin(
      new Request("http://localhost:3000/api/x", {
        method: "POST",
        headers: { referer: "http://localhost:3000/matematica-do-amor" },
      }),
      { NODE_ENV: "development" } as unknown as NodeJS.ProcessEnv,
    );
    expect(ok).toBeNull();
  });
});
