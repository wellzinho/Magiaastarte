import { buildPreview } from "@/features/matematica-do-amor/server/assemble";
import { checkoutAvailability } from "@/features/matematica-do-amor/server/gate";
import { parseReadingRequest } from "@/features/matematica-do-amor/server/input";
import { assertBrowserOrigin, noStoreHeaders } from "@/lib/security/origin";
import { enforceRateLimits, LIMITS } from "@/lib/security/rate-limit";
import { jsonNoStore, readJsonBody } from "@/lib/security/request";
import { assertSessionBinding } from "@/lib/security/session-cookie";

function previewFail(code: string, status: number, message = "Não foi possível gerar a leitura agora."): Response {
  console.error(code);
  return Response.json({ error: message, code }, { status, headers: noStoreHeaders() });
}

export async function POST(request: Request) {
  const originBlock = assertBrowserOrigin(request);
  if (originBlock) {
    console.error("MDA_PREVIEW_ORIGIN_ERROR");
    return Response.json(
      { error: "Requisição não autorizada.", code: "MDA_PREVIEW_ORIGIN_ERROR" },
      { status: 403, headers: noStoreHeaders() },
    );
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    console.error("MDA_PREVIEW_INVALID_INPUT");
    const failed = body.response;
    const payload = await failed.json().catch(() => ({ error: "Requisição inválida." }));
    return Response.json(
      { ...payload, code: "MDA_PREVIEW_INVALID_INPUT" },
      { status: failed.status, headers: noStoreHeaders() },
    );
  }

  const parsed = parseReadingRequest(body.value, new Date());
  if ("error" in parsed) {
    return previewFail(parsed.code, 400, parsed.error);
  }

  const sessionBlock = await assertSessionBinding(request, parsed.sessionId);
  if (sessionBlock) return sessionBlock;

  try {
    const limited = await enforceRateLimits(request, {
      endpoint: "previa",
      sessionId: parsed.sessionId,
      limits: LIMITS.previa,
    });
    if (limited) return limited;
  } catch {
    return previewFail("MDA_PREVIEW_REDIS_ERROR", 503);
  }

  try {
    const service = checkoutAvailability();
    const preview = buildPreview(
      parsed.answers,
      parsed.yourName,
      parsed.theirName,
      parsed.yourDate,
      parsed.theirDate,
      service.mode === "unavailable" ? "unavailable" : "simulated",
    );
    if ("error" in preview) {
      return previewFail("MDA_PREVIEW_GENERATION_ERROR", 400, preview.error);
    }
    return jsonNoStore(preview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("MDA_DATA_ENCRYPTION_KEY") || message.includes("ENCRYPTION")) {
      return previewFail("MDA_PREVIEW_ENCRYPTION_ERROR", 503);
    }
    return previewFail("MDA_PREVIEW_GENERATION_ERROR", 500);
  }
}
