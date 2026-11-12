import { beforeEach, describe, expect, it } from "vitest";
import { quizPlan } from "../content/steps";
import type { Answers } from "../domain/types";
import { buildDocument, buildPreview } from "./assemble";
import { checkoutAvailability } from "./gate";
import { parseReadingRequest } from "./input";
import {
  approveVerified,
  confirmSimulated,
  createPendingOrder,
  markFailed,
  PRICE_CENTS,
  readOrder,
  resetOrderStoreCache,
  resetOrders,
  snapshotHash,
} from "./orders";

const session = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";

function completeQuiz(): Answers {
  const answers: Answers = {};
  for (let turn = 0; turn < 20; turn += 1) {
    const pending = quizPlan(answers).find((step) => !answers[step.id]);
    if (!pending) return answers;
    const option = pending.options[0];
    if (!option) break;
    answers[pending.id] = option.id;
  }
  return answers;
}

async function orderFor(sessionId: string) {
  const answers = completeQuiz();
  const preview = buildPreview(answers, "Ana Silva", "Bruno Lima", { day: 14, month: 7, year: 1992 }, { day: 15, month: 3, year: 1991 }, "simulated");
  const formatId = preview && !("error" in preview) ? preview.deliveries[0]?.id ?? "" : "";
  const document = buildDocument(answers, "Ana Silva", "Bruno Lima", { day: 14, month: 7, year: 1992 }, { day: 15, month: 3, year: 1991 }, formatId);
  if ("error" in preview || "error" in document) throw new Error("pedido de teste");
  return createPendingOrder({
    sessionId,
    formatId,
    hash: snapshotHash({ answers, formatId }),
    document,
    preview,
  });
}

describe("pedido e confirmação", () => {
  beforeEach(async () => {
    process.env.ORDER_STORE_MODE = "memory";
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    if (process.env.MERCADO_PAGO_MODE === "production") process.env.MERCADO_PAGO_MODE = "test";
    resetOrderStoreCache();
    await resetOrders();
  });

  it("não aceita preço, sessão alheia, já paguei nem falha temporária como aprovação", async () => {
    const order = await orderFor(session);
    expect(order.amountCents).toBe(PRICE_CENTS);
    expect(order.amountCents).toBe(1990);
    expect(await readOrder(other, order.id)).toBeNull();
    expect(await confirmSimulated(other, order.id)).toBeNull();
    expect((await readOrder(session, order.id))?.status).toBe("pending");
    expect((await markFailed(session, order.id))?.status).toBe("failed");
    expect(await confirmSimulated(session, order.id)).toBeNull();
    expect((await readOrder(session, order.id))?.status).toBe("failed");
  });

  it("confirma a simulação uma vez e devolve o mesmo documento", async () => {
    const order = await orderFor(session);
    const first = await confirmSimulated(session, order.id);
    const second = await confirmSimulated(session, order.id);
    expect(first?.status).toBe("approved");
    expect(second?.document).toEqual(first?.document);
    expect(second?.providerPaymentId).toBe(first?.providerPaymentId);
  });

  it("mantém a cobrança desligada sem credencial e não aprova um status vindo de fora", async () => {
    expect(checkoutAvailability({ NODE_ENV: "production" }).mode).toBe("unavailable");
    expect(checkoutAvailability({ NODE_ENV: "development", MERCADO_PAGO_MODE: "test", MERCADO_PAGO_ACCESS_TOKEN: "configured" }).mode).toBe("mercadopago");
    expect(checkoutAvailability({ NODE_ENV: "production", MERCADO_PAGO_MODE: "production", MERCADO_PAGO_ACCESS_TOKEN: "" }).mode).toBe("unavailable");
    const order = await orderFor(session);
    expect(await approveVerified(session, order.id, { mpOrderId: "ORD01TESTE", externalReference: "astarte_matematica_amor_fora" })).toBeNull();
    expect((await readOrder(session, order.id))?.status).toBe("pending");
  });

  it("recusa data inválida e quiz incompleto antes de calcular", () => {
    const incomplete = parseReadingRequest({ sessionId: session, answers: { scenario: "R" }, yourName: "Ana", theirName: "Lia", yourDate: { day: 1, month: 1, year: 1990 }, theirDate: { day: 1, month: 1, year: 1991 } }, new Date(2026, 10, 10));
    expect("error" in incomplete).toBe(true);
    const future = parseReadingRequest({
      sessionId: session,
      answers: completeQuiz(),
      yourName: "Ana Silva",
      theirName: "Bruno Lima",
      yourDate: { day: 1, month: 1, year: 2090 },
      theirDate: { day: 1, month: 1, year: 1991 },
    }, new Date(2026, 10, 10));
    expect("error" in future).toBe(true);
  });

  it("não entrega documento antes de approved e status do cliente não aprova", async () => {
    const order = await orderFor(session);
    expect(order.status).toBe("pending");
    expect(order.document).toBeTruthy();
    const pending = await readOrder(session, order.id);
    expect(pending?.status).toBe("pending");
    expect(await approveVerified(session, order.id, { mpOrderId: "x", externalReference: "astarte_matematica_amor_x" })).toBeNull();
    expect((await readOrder(session, order.id))?.status).toBe("pending");
  });
});
