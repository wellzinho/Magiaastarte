import { isPayerEmail } from "@/features/matematica-do-amor/domain/payment";
import { createPixOrder, mercadoPagoMode, newExternalReference, qrMarkup } from "@/features/matematica-do-amor/server/mercadopago";
import { reportMdaCompraConcluida } from "@/features/matematica-do-amor/server/meta-compra";
import {
  approveVerified,
  attachPix,
  claimPixCreation,
  pixView,
  readOrder,
  releasePixLock,
} from "@/features/matematica-do-amor/server/orders";
import { assertBrowserOrigin } from "@/lib/security/origin";
import { enforceRateLimits, LIMITS } from "@/lib/security/rate-limit";
import { jsonNoStore, readJsonBody } from "@/lib/security/request";
import { assertSessionBinding } from "@/lib/security/session-cookie";

const UNAVAILABLE = "Não foi possível iniciar o pagamento agora. Tente novamente em alguns instantes.";
const PIX_ERROR = "Não consegui gerar o Pix agora. Tente novamente.";

export async function POST(request: Request) {
  const originBlock = assertBrowserOrigin(request);
  if (originBlock) return originBlock;

  const mode = mercadoPagoMode();
  if (!mode) {
    console.error("Cobrança indisponível: configuração ausente.");
    return jsonNoStore({ code: "unavailable", message: UNAVAILABLE }, { status: 503 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) return body.response;

  const payload = body.value as { payerEmail?: unknown; sessionId?: unknown; orderId?: unknown } | null;
  const payerEmail = typeof payload?.payerEmail === "string" ? payload.payerEmail.trim() : "";
  if (!isPayerEmail(payerEmail)) {
    return jsonNoStore({ code: "email", message: "Esse e-mail não parece válido. Confere e tenta de novo." }, { status: 400 });
  }
  if (!payload || !isId(payload.sessionId) || !isId(payload.orderId)) {
    return jsonNoStore({ code: "pix", message: PIX_ERROR }, { status: 400 });
  }
  const sessionId = payload.sessionId;
  const orderId = payload.orderId;

  const sessionBlock = await assertSessionBinding(request, sessionId);
  if (sessionBlock) return sessionBlock;

  const limited = await enforceRateLimits(request, {
    endpoint: "create-pix",
    sessionId,
    orderId,
    limits: LIMITS.createPix,
  });
  if (limited) return limited;

  const claim = await claimPixCreation(sessionId, orderId);
  if (claim === "missing") return jsonNoStore({ code: "pix", message: PIX_ERROR }, { status: 404 });
  if (claim === "busy") return jsonNoStore({ code: "pix", message: PIX_ERROR }, { status: 409 });
  if (claim === "approved") return jsonNoStore({ code: "approved", orderId }, { status: 200 });
  const order = await readOrder(sessionId, orderId);
  if (!order) return jsonNoStore({ code: "pix", message: PIX_ERROR }, { status: 404 });
  if (claim === "reuse") {
    const current = pixView(order);
    if (!current) return jsonNoStore({ code: "pix", message: PIX_ERROR }, { status: 409 });
    return jsonNoStore({ code: "pending", orderId: order.id, ...current, status: "pending" });
  }
  const reference = newExternalReference();
  const created = await createPixOrder({
    email: payerEmail,
    reference,
    mode,
    buyerFirstName: order.buyerFirstName,
    idempotencyKey: `mda-pix:${order.id}`,
  });
  if (!created.ok) {
    await releasePixLock(sessionId, orderId);
    const message = created.kind === "unavailable" ? UNAVAILABLE : PIX_ERROR;
    return jsonNoStore({ code: created.kind, message }, { status: created.kind === "unavailable" ? 503 : 502 });
  }
  const qrSvg = await qrMarkup(created.charge.copyPaste ?? "");
  if (!qrSvg || !created.charge.copyPaste) {
    await releasePixLock(sessionId, orderId);
    return jsonNoStore({ code: "pix", message: PIX_ERROR }, { status: 502 });
  }
  const saved = await attachPix(sessionId, orderId, {
    providerOrderId: created.charge.mpOrderId,
    externalReference: created.charge.externalReference,
    copyPaste: created.charge.copyPaste,
    qrSvg,
    ticketUrl: created.charge.ticketUrl,
    paymentId: created.charge.paymentId,
    testMode: mode === "test",
  });
  if (!saved) return jsonNoStore({ code: "pix", message: PIX_ERROR }, { status: 409 });
  const view = pixView(saved);
  if (!view) return jsonNoStore({ code: "pix", message: PIX_ERROR }, { status: 502 });

  let status = created.charge.status;
  if (status === "approved") {
    const approved = await approveVerified(sessionId, saved.id, {
      mpOrderId: created.charge.mpOrderId,
      externalReference: created.charge.externalReference,
    });
    if (approved) {
      void reportMdaCompraConcluida({
        mpOrderId: created.charge.mpOrderId,
        externalReference: created.charge.externalReference,
        amountCents: approved.amountCents,
        currency: approved.currency,
        testMode: approved.testMode,
      });
    } else {
      status = "pending";
    }
  }

  return jsonNoStore({
    code: status === "approved" ? "approved" : "pending",
    orderId: saved.id,
    ...view,
    status,
    eventId: status === "approved" ? created.charge.mpOrderId : undefined,
  });
}

function isId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
}
