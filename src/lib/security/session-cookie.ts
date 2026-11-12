import { randomBytes } from "node:crypto";
import { ORDER_TTL_SECONDS } from "@/features/matematica-do-amor/server/order-store";
import { hashToken } from "./crypto";
import { noStoreHeaders } from "./origin";
import { sessionAuthKey, sessionRedis, sessionStoreMode } from "./session-store";

export const SESSION_COOKIE_NAME = "mda-session";
export const SESSION_COOKIE_HOST = "__Host-mda-session";

type SessionRecord = { sessionId: string; createdAt: string };

function memory(): Map<string, SessionRecord> {
  const g = globalThis as { __mdaSessions?: Map<string, SessionRecord> };
  g.__mdaSessions ??= new Map();
  return g.__mdaSessions;
}

export function resetSessionMemory(): void {
  memory().clear();
}

export function cookieName(env: NodeJS.ProcessEnv = process.env): string {
  // __Host- exige HTTPS; só em Vercel Production.
  return env.VERCEL_ENV === "production" ? SESSION_COOKIE_HOST : SESSION_COOKIE_NAME;
}

export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function bindSessionToken(token: string, sessionId: string, env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const record: SessionRecord = { sessionId, createdAt: new Date().toISOString() };
  const key = sessionAuthKey(hashToken(token), env);
  const mode = sessionStoreMode(env);
  if (mode === "redis") {
    await sessionRedis(env).set(key, record, { ex: ORDER_TTL_SECONDS });
    return;
  }
  memory().set(key, record);
}

export async function resolveSessionIdFromToken(token: string, env: NodeJS.ProcessEnv = process.env): Promise<string | null> {
  const key = sessionAuthKey(hashToken(token), env);
  const mode = sessionStoreMode(env);
  if (mode === "redis") {
    const record = await sessionRedis(env).get<SessionRecord>(key);
    return record?.sessionId ?? null;
  }
  return memory().get(key)?.sessionId ?? null;
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function setSessionCookieHeader(token: string, env: NodeJS.ProcessEnv = process.env): string {
  const name = cookieName(env);
  const secure = env.VERCEL === "1" || env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview";
  const parts = [
    `${name}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${ORDER_TTL_SECONDS}`,
  ];
  if (secure || name === SESSION_COOKIE_HOST) parts.push("Secure");
  return parts.join("; ");
}

export function sessionErrorResponse(code: string, status = 401): Response {
  console.error(code);
  return Response.json({ error: "Sessão inválida.", code }, { status, headers: noStoreHeaders() });
}

/** Garante que o sessionId do body corresponde ao cookie HttpOnly. */
export async function assertSessionBinding(
  request: Request,
  bodySessionId: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<Response | null> {
  try {
    const token = readCookie(request, cookieName(env)) ?? readCookie(request, SESSION_COOKIE_NAME);
    if (!token) {
      return sessionErrorResponse("MDA_PREVIEW_SESSION_ERROR");
    }
    const bound = await resolveSessionIdFromToken(token, env);
    if (!bound || bound !== bodySessionId) {
      return sessionErrorResponse("MDA_PREVIEW_SESSION_ERROR");
    }
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "MDA_SESSION_REDIS_REQUIRED") {
      return sessionErrorResponse("MDA_PREVIEW_REDIS_ERROR", 503);
    }
    console.error("MDA_PREVIEW_SESSION_ERROR");
    return sessionErrorResponse("MDA_PREVIEW_SESSION_ERROR", 503);
  }
}
