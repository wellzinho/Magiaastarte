import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const FORBIDDEN = [
  /MERCADO_PAGO_ACCESS_TOKEN\s*[:=]/,
  /UPSTASH_REDIS_REST_TOKEN\s*[:=]/,
  /META_CAPI_ACCESS_TOKEN\s*[:=]/,
  /KIWIFY_WEBHOOK_TOKEN\s*[:=]/,
  /MDA_DATA_ENCRYPTION_KEY\s*[:=]/,
  /APP_USR-/,
  /BEGIN RSA PRIVATE KEY/,
];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs|md|json)$/.test(name) && !/\.test\.(ts|tsx|js)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe("segredos fora do cliente", () => {
  it("não hardcoda tokens de servidor em fontes versionáveis", () => {
    const roots = ["src", "public"].map((p) => join(process.cwd(), p));
    const files = roots.flatMap((root) => {
      try {
        return walk(root);
      } catch {
        return [];
      }
    });
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN) {
        // process.env.NAME é permitido; atribuição de valor secreto não.
        if (pattern.source.includes("TOKEN") || pattern.source.includes("KEY")) {
          const assigns = text.match(new RegExp(pattern.source + "\\s*['\"][^'\"]+['\"]"));
          expect(assigns, file).toBeNull();
        } else if (pattern.test(text)) {
          expect.fail(`padrão sensível em ${file}`);
        }
      }
    }
  });

  it("NEXT_PUBLIC_* permanece somente para URL pública do site", () => {
    const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");
    const site = readFileSync(join(process.cwd(), "src/lib/site-url.ts"), "utf8");
    expect(layout + site).toMatch(/NEXT_PUBLIC_SITE_URL/);
    expect(layout + site).not.toMatch(/NEXT_PUBLIC_.*TOKEN/);
    expect(layout + site).not.toMatch(/NEXT_PUBLIC_MERCADO/);
  });
});
