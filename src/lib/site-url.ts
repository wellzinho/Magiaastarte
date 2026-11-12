const DEFAULT_SITE_URL = "https://magiaastarte.com.br";

/** Origem do site sem barra final. */
export function siteOrigin(env: NodeJS.ProcessEnv = process.env): string {
  const raw = typeof env.NEXT_PUBLIC_SITE_URL === "string" && env.NEXT_PUBLIC_SITE_URL.trim()
    ? env.NEXT_PUBLIC_SITE_URL.trim()
    : DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}

/**
 * URL absoluta a partir da base configurada.
 * `path` "/" → raiz com barra final; demais paths sem barra duplicada.
 */
export function siteUrl(path: string = "/", env: NodeJS.ProcessEnv = process.env): string {
  const origin = siteOrigin(env);
  if (!path || path === "/") return `${origin}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized.replace(/\/+$/, "")}`;
}
