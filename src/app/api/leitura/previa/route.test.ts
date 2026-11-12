import { beforeEach, describe, expect, it, vi } from "vitest";
import { quizPlan } from "@/features/matematica-do-amor/content/steps";
import type { Answers } from "@/features/matematica-do-amor/domain/types";
import { authedJsonRequest, resetSecurityMemory } from "@/lib/security/test-helpers";
import { POST } from "./route";

const sessionId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

function completeQuiz(): Answers {
  const answers: Answers = {};
  for (let turn = 0; turn < 20; turn += 1) {
    const pending = quizPlan(answers).find((step) => !answers[step.id]);
    if (!pending) return answers;
    answers[pending.id] = pending.options[0]?.id ?? "";
  }
  return answers;
}

function readingBody() {
  return {
    sessionId,
    answers: completeQuiz(),
    yourName: "Wellington Silveira Costa",
    theirName: "Roberto Almeida Souza",
    yourDate: { day: 12, month: 3, year: 1990 },
    theirDate: { day: 5, month: 8, year: 1988 },
  };
}

describe("POST /api/leitura/previa", () => {
  beforeEach(() => {
    resetSecurityMemory();
    process.env.ORDER_STORE_MODE = "memory";
    process.env.MERCADO_PAGO_MODE = "test";
    process.env.MERCADO_PAGO_ACCESS_TOKEN = "test-token";
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("gera a leitura gratuita após a segunda data com sessão válida", async () => {
    const response = await POST(await authedJsonRequest("http://localhost/api/leitura/previa", sessionId, readingBody()));
    expect(response.status).toBe(200);
    const body = (await response.json()) as { bubbles?: string[]; code?: string };
    expect(Array.isArray(body.bubbles)).toBe(true);
    expect((body.bubbles?.length ?? 0) > 0).toBe(true);
    expect(body.code).toBeUndefined();
    expect(JSON.stringify(body)).not.toMatch(/Silveira|Almeida|@/);
  });

  it("retorna código técnico sem PII quando a sessão falta", async () => {
    const response = await POST(
      new Request("http://localhost/api/leitura/previa", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost:3000" },
        body: JSON.stringify(readingBody()),
      }),
    );
    expect(response.status).toBe(401);
    const body = (await response.json()) as { code?: string; error?: string };
    expect(body.code).toBe("MDA_PREVIEW_SESSION_ERROR");
    expect(JSON.stringify(body)).not.toMatch(/Wellington|Roberto|Silveira|Almeida|1990|1988/);
  });

  it("falha segura na Vercel sem Redis", async () => {
    // Vincula em memória (local) e só depois simula Vercel sem Upstash.
    const request = await authedJsonRequest("http://localhost/api/leitura/previa", sessionId, readingBody(), {
      origin: "https://magiaastarte.com.br",
    });
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "production";
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await POST(request);
    expect(response.status).toBe(503);
    const body = (await response.json()) as { code?: string };
    expect(body.code).toBe("MDA_PREVIEW_REDIS_ERROR");
    expect(spy.mock.calls.flat().join(" ")).toContain("MDA_PREVIEW_REDIS_ERROR");
    expect(spy.mock.calls.flat().join(" ")).not.toMatch(/Wellington|Roberto|@/);
    spy.mockRestore();
  });
});

