import { siteOrigin } from "@/lib/site-url";

const PROD_ORIGINS = new Set(["https://magiaastarte.com.br", "https://www.magiaastarte.com.br"]);

export function allowedOrigins(env: NodeJS.ProcessEnv = process.env): Set<string> {
  const origins = new Set(PROD_ORIGINS);
  origins.add(siteOrigin(env));
  try {
    origins.add(new URL(siteOrigin(env)).origin);
  } catch {
    // ignore
  }
  if (env.VERCEL_ENV === "preview" && typeof env.VERCEL_URL === "string" && env.VERCEL_URL.trim()) {
    origins.add(`https://${env.VERCEL_URL.trim()}`);
  }
  // Dev local padrão.
  if (env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return origins;
}

function isLocalNonVercelOrigin(origin: string, env: NodeJS.ProcessEnv): boolean {
  // Smoke/`next start` local: permite localhost/127.0.0.1 em qualquer porta.
  // Em Vercel (VERCEL/VERCEL_ENV) permanece fechado.
  if (env.VERCEL === "1" || Boolean(env.VERCEL_ENV)) return false;
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Compara origem completa via URL — sem endsWith vulnerável. */
export function isAllowedOrigin(originHeader: string | null, env: NodeJS.ProcessEnv = process.env): boolean {
  if (!originHeader || originHeader === "null") return false;
  let origin: string;
  try {
    origin = new URL(originHeader).origin;
  } catch {
    return false;
  }
  if (allowedOrigins(env).has(origin)) return true;
  return isLocalNonVercelOrigin(origin, env);
}

export function assertBrowserOrigin(request: Request, env: NodeJS.ProcessEnv = process.env): Response | null {
  const origin = request.headers.get("origin");
  if (isAllowedOrigin(origin, env)) return null;
  // Alguns navegadores omitem Origin em same-site GET; APIs MDA são POST mutáveis.
  if (!origin) {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        if (isAllowedOrigin(new URL(referer).origin, env)) return null;
      } catch {
        // fall through
      }
    }
  }
  return Response.json({ error: "Requisição não autorizada." }, { status: 403, headers: noStoreHeaders() });
}

export function noStoreHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-store",
  };
}
