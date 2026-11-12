import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("headers de segurança", () => {
  it("next.config declara headers essenciais e CSP report-only", () => {
    const source = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    expect(source).toContain("X-Content-Type-Options");
    expect(source).toContain("nosniff");
    expect(source).toContain("Referrer-Policy");
    expect(source).toContain("X-Frame-Options");
    expect(source).toContain("Permissions-Policy");
    expect(source).toContain("Content-Security-Policy-Report-Only");
    expect(source).not.toContain("Access-Control-Allow-Origin: *");
  });
});
