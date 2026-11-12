import { beforeEach, describe, expect, it } from "vitest";
import { quizPlan } from "@/features/matematica-do-amor/content/steps";
import type { Answers } from "@/features/matematica-do-amor/domain/types";
import { buildDocument, buildPreview } from "@/features/matematica-do-amor/server/assemble";
import {
  attachPix,
  confirmSimulated,
  createPendingOrder,
  resetOrderStoreCache,
  resetOrders,
  snapshotHash,
} from "@/features/matematica-do-amor/server/orders";
import { REFERENCE_PREFIX } from "@/features/matematica-do-amor/server/mercadopago";
import { authedJsonRequest, resetSecurityMemory } from "@/lib/security/test-helpers";
import { POST as documento } from "./pedido/documento/route";
import { POST as status } from "./pedido/status/route";
import { POST as simular } from "./pedido/simular/route";
import { POST as previa } from "./previa/route";

const sessionA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const sessionB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function completeQuiz(): Answers {
  const answers: Answers = {};
  for (let turn = 0; turn < 20; turn += 1) {
    const pending = quizPlan(answers).find((step) => !answers[step.id]);
    if (!pending) return answers;
    answers[pending.id] = pending.options[0]?.id ?? "";
  }
  return answers;
}

async function makeOrder(sessionId: string) {
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
    hash: snapshotHash({ answers, formatId, sessionId }),
    document,
    preview,
  });
}

describe("controle de acesso da leitura", () => {
  beforeEach(async () => {
    process.env.ORDER_STORE_MODE = "memory";
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    process.env.MERCADO_PAGO_MODE = "test";
    resetOrderStoreCache();
    await resetOrders();
    resetSecurityMemory();
  });

  it("simular permanece 403", async () => {
    const response = await simular(
      new Request("http://localhost/api/leitura/pedido/simular", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
      }),
    );
    expect(response.status).toBe(403);
  });

  it("pedido pendente não libera documento; sessão inexistente também não", async () => {
    const order = await makeOrder(sessionA);
    const pending = await documento(
      await authedJsonRequest("http://localhost/api/leitura/pedido/documento", sessionA, {
        sessionId: sessionA,
        orderId: order.id,
      }),
    );
    expect(pending.status).toBe(403);

    const noSession = await documento(
      new Request("http://localhost/api/leitura/pedido/documento", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost:3000" },
        body: JSON.stringify({ sessionId: sessionA, orderId: order.id }),
      }),
    );
    expect(noSession.status).toBe(401);
  });

  it("status não revela existência para outra sessão", async () => {
    const order = await makeOrder(sessionA);
    const denied = await status(
      await authedJsonRequest("http://localhost/api/leitura/pedido/status", sessionB, {
        sessionId: sessionB,
        orderId: order.id,
      }),
    );
    expect(denied.status).toBe(403);
    expect(await denied.json()).toEqual({ error: "Pedido indisponível." });
  });

  it("pagamento aprovado de outra sessão não libera conteúdo", async () => {
    const orderA = await makeOrder(sessionA);
    await attachPix(sessionA, orderA.id, {
      providerOrderId: "ORD01APPROVEDOTHERSESSIONXX",
      externalReference: `${REFERENCE_PREFIX}${orderA.id}`,
      copyPaste: "00020126",
      qrSvg: "<svg></svg>",
      ticketUrl: null,
      paymentId: "pay1",
      testMode: true,
    });
    await confirmSimulated(sessionA, orderA.id);

    const cross = await documento(
      await authedJsonRequest("http://localhost/api/leitura/pedido/documento", sessionB, {
        sessionId: sessionB,
        orderId: orderA.id,
      }),
    );
    expect(cross.status).toBe(403);
  });

  it("rejeita content-type inválido e payload excessivo na prévia", async () => {
    const badType = await previa(
      new Request("http://localhost/api/leitura/previa", {
        method: "POST",
        headers: { origin: "http://localhost:3000", "content-type": "text/plain" },
        body: "{}",
      }),
    );
    expect(badType.status).toBe(415);

    const huge = "x".repeat(60_000);
    const oversized = await previa(
      new Request("http://localhost/api/leitura/previa", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          "content-type": "application/json",
          "content-length": String(huge.length + 2),
        },
        body: JSON.stringify({ x: huge }),
      }),
    );
    expect(oversized.status).toBe(413);
  });
});
