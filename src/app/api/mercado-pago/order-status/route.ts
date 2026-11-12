import { readPixOrder } from "@/features/matematica-do-amor/server/mercadopago";
import { reportMdaCompraConcluida } from "@/features/matematica-do-amor/server/meta-compra";
import { approveVerified, noteCharge, readOrderByProvider } from "@/features/matematica-do-amor/server/orders";
import { assertBrowserOrigin } from "@/lib/security/origin";
import { enforceRateLimits, LIMITS } from "@/lib/security/rate-limit";
import { jsonNoStore, readJsonBody } from "@/lib/security/request";
import { assertSessionBinding } from "@/lib/security/session-cookie";

export async function POST(request: Request) {
  const originBlock = assertBrowserOrigin(request);
  if (originBlock) return originBlock;

  const body = await readJsonBody(request);
  if (!body.ok) return body.response;

  const payload = body.value as { sessionId?: unknown; orderId?: unknown } | null;
  if (!payload || typeof payload.sessionId !== "string" || typeof payload.orderId !== "string") {
    return jsonNoStore({ status: "error" }, { status: 400 });
  }
  if (!isSessionId(payload.sessionId) || !isMpOrderId(payload.orderId)) {
    return jsonNoStore({ status: "error" }, { status: 400 });
  }

  const sessionBlock = await assertSessionBinding(request, payload.sessionId);
  if (sessionBlock) return sessionBlock;

  const limited = await enforceRateLimits(request, {
    endpoint: "mp-order-status",
    sessionId: payload.sessionId,
    orderId: payload.orderId,
    limits: LIMITS.orderStatus,
  });
  if (limited) return limited;

  const local = await readOrderByProvider(payload.sessionId, payload.orderId);
  if (!local?.externalReference || local.amountCents !== 1990 || local.currency !== "BRL") {
    return jsonNoStore({ status: "error" }, { status: 404 });
  }
  const remote = await readPixOrder(payload.orderId, local.externalReference);
  if (!remote.ok) return jsonNoStore({ status: "error" });
  if (remote.charge.status === "approved") {
    const approved = await approveVerified(local.sessionId, local.id, {
      mpOrderId: remote.charge.mpOrderId,
      externalReference: remote.charge.externalReference,
    });
    if (approved) {
      void reportMdaCompraConcluida({
        mpOrderId: remote.charge.mpOrderId,
        externalReference: remote.charge.externalReference,
        amountCents: approved.amountCents,
        currency: approved.currency,
        testMode: approved.testMode,
      });
    }
    return jsonNoStore({
      status: approved ? "approved" : "error",
      eventId: approved ? remote.charge.mpOrderId : undefined,
      testMode: approved?.testMode ?? local.testMode,
    });
  }
  if (remote.charge.status === "rejected" || remote.charge.status === "cancelled" || remote.charge.status === "expired") {
    await noteCharge(local.sessionId, local.id, remote.charge.status);
  }
  return jsonNoStore({ status: remote.charge.status });
}

function isSessionId(value: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(value);
}

function isMpOrderId(value: string): boolean {
  return /^[A-Za-z0-9]{10,64}$/.test(value);
}
