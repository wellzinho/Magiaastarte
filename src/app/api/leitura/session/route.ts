import { randomUUID } from "node:crypto";
import { assertBrowserOrigin, noStoreHeaders } from "@/lib/security/origin";
import {
  assertSessionBinding,
  bindSessionToken,
  cookieName,
  newSessionToken,
  readCookie,
  resolveSessionIdFromToken,
  setSessionCookieHeader,
  SESSION_COOKIE_NAME,
} from "@/lib/security/session-cookie";

export async function POST(request: Request) {
  const originBlock = assertBrowserOrigin(request);
  if (originBlock) return originBlock;

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
}

/** Valida binding sem criar sessão — útil para testes. */
export async function GET(request: Request) {
  const originBlock = assertBrowserOrigin(request);
  if (originBlock) return originBlock;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId") ?? "";
  if (!sessionId) {
    return Response.json({ error: "Sessão inválida." }, { status: 401, headers: noStoreHeaders() });
  }
  const denied = await assertSessionBinding(request, sessionId);
  if (denied) return denied;
  return Response.json({ ok: true }, { headers: noStoreHeaders() });
}
