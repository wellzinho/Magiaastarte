import { buildPreview } from "@/features/matematica-do-amor/server/assemble";
import { checkoutAvailability } from "@/features/matematica-do-amor/server/gate";
import { parseReadingRequest } from "@/features/matematica-do-amor/server/input";
import { assertBrowserOrigin } from "@/lib/security/origin";
import { enforceRateLimits, LIMITS } from "@/lib/security/rate-limit";
import { jsonNoStore, readJsonBody } from "@/lib/security/request";
import { assertSessionBinding } from "@/lib/security/session-cookie";

export async function POST(request: Request) {
  const originBlock = assertBrowserOrigin(request);
  if (originBlock) return originBlock;

  const body = await readJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = parseReadingRequest(body.value, new Date());
  if ("error" in parsed) return jsonNoStore({ error: parsed.error }, { status: 400 });

  const sessionBlock = await assertSessionBinding(request, parsed.sessionId);
  if (sessionBlock) return sessionBlock;

  const limited = await enforceRateLimits(request, {
    endpoint: "previa",
    sessionId: parsed.sessionId,
    limits: LIMITS.previa,
  });
  if (limited) return limited;

  const service = checkoutAvailability();
  const preview = buildPreview(
    parsed.answers,
    parsed.yourName,
    parsed.theirName,
    parsed.yourDate,
    parsed.theirDate,
    service.mode === "unavailable" ? "unavailable" : "simulated",
  );
  if ("error" in preview) return jsonNoStore({ error: preview.error }, { status: 400 });
  return jsonNoStore(preview);
}
