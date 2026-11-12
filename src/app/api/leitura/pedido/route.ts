import { firstName } from "@/features/matematica-do-amor/domain/names";
import { buildDocument, buildPreview } from "@/features/matematica-do-amor/server/assemble";
import { checkoutAvailability } from "@/features/matematica-do-amor/server/gate";
import { parseReadingRequest } from "@/features/matematica-do-amor/server/input";
import { createPendingOrder, publicOrder, snapshotHash } from "@/features/matematica-do-amor/server/orders";
import { assertBrowserOrigin } from "@/lib/security/origin";
import { enforceRateLimits, LIMITS } from "@/lib/security/rate-limit";
import { jsonNoStore, readJsonBody } from "@/lib/security/request";
import { assertSessionBinding } from "@/lib/security/session-cookie";

export async function POST(request: Request) {
  const originBlock = assertBrowserOrigin(request);
  if (originBlock) return originBlock;

  const gate = checkoutAvailability();
  if (gate.mode === "unavailable") return jsonNoStore({ error: gate.reason }, { status: 503 });

  const body = await readJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = parseReadingRequest(body.value, new Date());
  if ("error" in parsed || !parsed.formatId) {
    return jsonNoStore({ error: "error" in parsed ? parsed.error : "Falta a entrega." }, { status: 400 });
  }

  const sessionBlock = await assertSessionBinding(request, parsed.sessionId);
  if (sessionBlock) return sessionBlock;

  const limited = await enforceRateLimits(request, {
    endpoint: "pedido",
    sessionId: parsed.sessionId,
    limits: LIMITS.pedido,
  });
  if (limited) return limited;

  const document = buildDocument(
    parsed.answers,
    parsed.yourName,
    parsed.theirName,
    parsed.yourDate,
    parsed.theirDate,
    parsed.formatId,
  );
  if ("error" in document) return jsonNoStore({ error: document.error }, { status: 400 });
  const preview = buildPreview(
    parsed.answers,
    parsed.yourName,
    parsed.theirName,
    parsed.yourDate,
    parsed.theirDate,
    "simulated",
  );
  if ("error" in preview) return jsonNoStore({ error: preview.error }, { status: 400 });
  const order = await createPendingOrder({
    sessionId: parsed.sessionId,
    formatId: parsed.formatId,
    hash: snapshotHash({ answers: parsed.answers, numbers: document.numbers, formatId: parsed.formatId }),
    document,
    preview,
    buyerFirstName: firstName(parsed.yourName),
  });
  return jsonNoStore(publicOrder(order));
}
