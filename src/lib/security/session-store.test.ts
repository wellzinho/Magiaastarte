import { afterEach, describe, expect, it } from "vitest";
import { sessionStoreMode } from "./session-store";
import {
  assertSessionBinding,
  bindSessionToken,
  newSessionToken,
  resetSessionMemory,
  resolveSessionIdFromToken,
  SESSION_COOKIE_NAME,
} from "./session-cookie";

afterEach(() => {
  resetSessionMemory();
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.ORDER_STORE_MODE = "memory";
  process.env.MERCADO_PAGO_MODE = "test";
});

describe("sessão em produção", () => {
  it("exige Redis na Vercel em vez de memória por isolate", () => {
    const env = {
      VERCEL: "1",
      VERCEL_ENV: "production",
      MERCADO_PAGO_MODE: "production",
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
    } as unknown as NodeJS.ProcessEnv;
    expect(() => sessionStoreMode(env)).toThrow(/MDA_SESSION_REDIS_REQUIRED/);
  });

  it("prova que memória isolada não resolve binding entre 'instâncias'", async () => {
    const token = newSessionToken();
    const sessionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    await bindSessionToken(token, sessionId);
    expect(await resolveSessionIdFromToken(token)).toBe(sessionId);
    // Simula outro isolate serverless sem o Map compartilhado.
    resetSessionMemory();
    expect(await resolveSessionIdFromToken(token)).toBeNull();
  });

  it("aceita sessão válida local com memória", async () => {
    const token = newSessionToken();
    const sessionId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    await bindSessionToken(token, sessionId);
    const request = new Request("http://localhost/api/leitura/previa", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
      },
    });
    expect(await assertSessionBinding(request, sessionId)).toBeNull();
  });

  it("falha fechado na Vercel sem Redis ao validar binding", async () => {
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "production";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const request = new Request("http://localhost/api/leitura/previa", {
      method: "POST",
      headers: {
        origin: "https://magiaastarte.com.br",
        cookie: `${SESSION_COOKIE_NAME}=x`,
      },
    });
    const denied = await assertSessionBinding(request, "cccccccc-cccc-4ccc-8ccc-cccccccccccc");
    expect(denied?.status).toBe(503);
    const body = (await denied!.json()) as { code?: string; error?: string };
    expect(body.code).toBe("MDA_PREVIEW_REDIS_ERROR");
    expect(JSON.stringify(body)).not.toMatch(/@|Wellington|Roberto|\d{2}\/\d{2}\/\d{4}/);
  });
});
