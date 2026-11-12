import { beforeEach, describe, expect, it } from "vitest";
import { enforceRateLimits, resetRateLimitMemory } from "./rate-limit";

beforeEach(() => {
  resetRateLimitMemory();
  process.env.ORDER_STORE_MODE = "memory";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

describe("rate limit", () => {
  it("bloqueia após o limite e inclui Retry-After", async () => {
    const request = new Request("http://localhost/api/x", {
      headers: { "x-forwarded-for": "203.0.113.10" },
    });
    const limits = [{ key: "ip" as const, limit: 2, windowSec: 60 }];
    expect(await enforceRateLimits(request, { endpoint: "t", limits })).toBeNull();
    expect(await enforceRateLimits(request, { endpoint: "t", limits })).toBeNull();
    const blocked = await enforceRateLimits(request, { endpoint: "t", limits });
    expect(blocked?.status).toBe(429);
    expect(blocked?.headers.get("Retry-After")).toBeTruthy();
  });

  it("isola chaves por sessão", async () => {
    const request = new Request("http://localhost/api/x", {
      headers: { "x-forwarded-for": "203.0.113.11" },
    });
    const limits = [{ key: "session" as const, limit: 1, windowSec: 60 }];
    expect(await enforceRateLimits(request, { endpoint: "s", sessionId: "a", limits })).toBeNull();
    expect((await enforceRateLimits(request, { endpoint: "s", sessionId: "a", limits }))?.status).toBe(429);
    expect(await enforceRateLimits(request, { endpoint: "s", sessionId: "b", limits })).toBeNull();
  });
});
