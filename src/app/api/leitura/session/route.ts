import { randomUUID } from "node:crypto";
import { assertBrowserOrigin, noStoreHeaders } from "@/lib/security/origin";
import {
  assertSessionBinding,
  bindSessionToken,
  cookieName,
  newSessionToken,
  readCookie,
  resolveSessionIdFromToken,
  sessionErrorResponse,
  setSessionCookieHeader,
  SESSION_COOKIE_NAME,
} from "@/lib/security/session-cookie";

export async function POST(request: Request) {
  const originBlock = assertBrowserOrigin(request);
  if (originBlock) {
    console.error("MDA_PREVIEW_ORIGIN_ERROR");
    return Response.json(
      { error: "Requisição não autorizada.", code: "MDA_PREVIEW_ORIGIN_ERROR" },
      { status: 403, headers: noStoreHeaders() },
    );
  }

  try {
    const existing =
      readCookie(request, cookieName()) ?? readCookie(request, SESSION_COOKIE_NAME);
    if (existing) {
      const sessionId = await resolveSessionIdFromToken(existing);
      if (sessionId) {
        return Response.json(
          { sessionId },
          { status: 200, headers: { ...noStoreHeaders(), "Set-Cookie": setSessionCookieHeader(existing) } },
        );
      }
    }

    const sessionId = randomUUID();
    const token = newSessionToken();
    await bindSessionToken(token, sessionId);
    return Response.json(
      { sessionId },
      {
        status: 200,
        headers: {
          ...noStoreHeaders(),
          "Set-Cookie": setSessionCookieHeader(token),
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "MDA_SESSION_REDIS_REQUIRED") {
      return sessionErrorResponse("MDA_PREVIEW_REDIS_ERROR", 503);
    }
    console.error("MDA_PREVIEW_SESSION_ERROR");
    return sessionErrorResponse("MDA_PREVIEW_SESSION_ERROR", 503);
  }
}

/** Valida binding sem criar sessão — útil para testes. */
export async function GET(request: Request) {
  const originBlock = assertBrowserOrigin(request);
  if (originBlock) {
    return Response.json(
      { error: "Requisição não autorizada.", code: "MDA_PREVIEW_ORIGIN_ERROR" },
      { status: 403, headers: noStoreHeaders() },
    );
  }
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId") ?? "";
  if (!sessionId) {
    return sessionErrorResponse("MDA_PREVIEW_SESSION_ERROR");
  }
  const denied = await assertSessionBinding(request, sessionId);
  if (denied) return denied;
  return Response.json({ ok: true }, { headers: noStoreHeaders() });
}
