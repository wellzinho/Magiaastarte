import {
  bindSessionToken,
  newSessionToken,
  SESSION_COOKIE_NAME,
} from "./session-cookie";
import { resetRateLimitMemory } from "./rate-limit";
import { resetSessionMemory } from "./session-cookie";

export function resetSecurityMemory(): void {
  resetRateLimitMemory();
  resetSessionMemory();
}

export async function authedJsonRequest(
  url: string,
  sessionId: string,
  body: unknown,
  init: { origin?: string; extraHeaders?: Record<string, string> } = {},
): Promise<Request> {
  const token = newSessionToken();
  await bindSessionToken(token, sessionId);
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: init.origin ?? "http://localhost:3000",
      cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
      ...(init.extraHeaders ?? {}),
    },
    body: JSON.stringify(body),
  });
}
