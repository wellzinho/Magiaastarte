import { pixView, publicOrder, readOrder } from "@/features/matematica-do-amor/server/orders";
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
    return jsonNoStore({ error: "Pedido indisponível." }, { status: 403 });
  }
  if (!isId(payload.sessionId) || !isId(payload.orderId)) {
    return jsonNoStore({ error: "Pedido indisponível." }, { status: 403 });
  }

  const sessionBlock = await assertSessionBinding(request, payload.sessionId);
  if (sessionBlock) return sessionBlock;

  const limited = await enforceRateLimits(request, {
    endpoint: "pedido-status",
    sessionId: payload.sessionId,
    orderId: payload.orderId,
    limits: LIMITS.orderStatus,
  });
  if (limited) return limited;

  const order = await readOrder(payload.sessionId, payload.orderId);
  if (!order) return jsonNoStore({ error: "Pedido indisponível." }, { status: 403 });
  return jsonNoStore({ ...publicOrder(order), preview: order.preview, pix: pixView(order) });
}

function isId(value: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(value);
}
