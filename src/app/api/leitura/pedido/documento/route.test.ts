import { beforeEach, describe, expect, it } from "vitest";
import { quizPlan } from "@/features/matematica-do-amor/content/steps";
import type { Answers } from "@/features/matematica-do-amor/domain/types";
import { buildDocument, buildPreview } from "@/features/matematica-do-amor/server/assemble";
import {
  confirmSimulated,
  createPendingOrder,
  resetOrderStoreCache,
  resetOrders,
  snapshotHash,
} from "@/features/matematica-do-amor/server/orders";
import { authedJsonRequest, resetSecurityMemory } from "@/lib/security/test-helpers";
import { POST } from "./route";

const sessionA = "33333333-3333-4333-8333-333333333333";
const sessionB = "44444444-4444-4444-8444-444444444444";

function completeQuiz(): Answers {
  const answers: Answers = {};
  for (let turn = 0; turn < 20; turn += 1) {
    const pending = quizPlan(answers).find((step) => !answers[step.id]);
    if (!pending) return answers;
    answers[pending.id] = pending.options[0]?.id ?? "";
  }
  return answers;
}

async function pendingOrder(sessionId: string) {
  const answers = completeQuiz();
  const preview = buildPreview(
    answers,
    "Ana Silva",
    "Bruno Lima",
    { day: 14, month: 7, year: 1992 },
    { day: 15, month: 3, year: 1991 },
    "simulated",
  );
  const formatId = preview && !("error" in preview) ? preview.deliveries[0]?.id ?? "" : "";
  const document = buildDocument(
    answers,
    "Ana Silva",
    "Bruno Lima",
    { day: 14, month: 7, year: 1992 },
    { day: 15, month: 3, year: 1991 },
    formatId,
  );
  if ("error" in preview || "error" in document) throw new Error("pedido");
  return createPendingOrder({
    sessionId,
    formatId,
    hash: snapshotHash({ answers, formatId }),
    document,
    preview,
  });
}

describe("documento autorizado", () => {
  beforeEach(async () => {
    process.env.ORDER_STORE_MODE = "memory";
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    if (process.env.MERCADO_PAGO_MODE === "production") process.env.MERCADO_PAGO_MODE = "test";
    resetOrderStoreCache();
    await resetOrders();
    resetSecurityMemory();
  });

  it("não entrega a leitura antes de approved", async () => {
    const order = await pendingOrder(sessionA);
    const denied = await POST(
      await authedJsonRequest("http://localhost/api/leitura/pedido/documento", sessionA, {
        sessionId: sessionA,
        orderId: order.id,
      }),
    );
    expect(denied.status).toBe(403);

    await confirmSimulated(sessionA, order.id);
    const allowed = await POST(
      await authedJsonRequest("http://localhost/api/leitura/pedido/documento", sessionA, {
        sessionId: sessionA,
        orderId: order.id,
      }),
    );
    expect(allowed.status).toBe(200);
    const body = (await allowed.json()) as { blocks?: unknown[] };
    expect(Array.isArray(body.blocks)).toBe(true);
    expect((body.blocks?.length ?? 0) > 0).toBe(true);
  });

  it("bloqueia acesso cruzado entre clientes", async () => {
    const orderA = await pendingOrder(sessionA);
    await confirmSimulated(sessionA, orderA.id);

    const cross = await POST(
      await authedJsonRequest("http://localhost/api/leitura/pedido/documento", sessionB, {
        sessionId: sessionB,
        orderId: orderA.id,
      }),
    );
    expect(cross.status).toBe(403);

    const spoof = await POST(
      await authedJsonRequest("http://localhost/api/leitura/pedido/documento", sessionB, {
        sessionId: sessionA,
        orderId: orderA.id,
      }),
    );
    expect(spoof.status).toBe(401);

    const missing = await POST(
      await authedJsonRequest("http://localhost/api/leitura/pedido/documento", sessionA, {
        sessionId: sessionA,
        orderId: "99999999-9999-4999-8999-999999999999",
      }),
    );
    expect(missing.status).toBe(403);
    expect(await missing.json()).toEqual({ error: "Leitura indisponível." });
  });

  it("exige origem do site", async () => {
    const order = await pendingOrder(sessionA);
    await confirmSimulated(sessionA, order.id);
    const denied = await POST(
      await authedJsonRequest(
        "http://localhost/api/leitura/pedido/documento",
        sessionA,
        { sessionId: sessionA, orderId: order.id },
        { origin: "https://evil.example" },
      ),
    );
    expect(denied.status).toBe(403);
  });
});
