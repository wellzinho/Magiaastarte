import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("simular", () => {
  it("sempre responde 403", async () => {
    const response = await POST(
      new Request("http://localhost/api/leitura/pedido/simular", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
      }),
    );
    expect(response.status).toBe(403);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
});
