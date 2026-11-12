import { noStoreHeaders } from "./origin";

export const MAX_JSON_BODY_BYTES = 48_000;
export const MAX_WEBHOOK_BODY_BYTES = 256_000;

export function assertJsonContentType(request: Request): Response | null {
  const ct = request.headers.get("content-type");
  if (!ct || !ct.toLowerCase().includes("application/json")) {
    return Response.json({ error: "Requisição inválida." }, { status: 415, headers: noStoreHeaders() });
  }
  return null;
}

export function assertBodySize(request: Request, max = MAX_JSON_BODY_BYTES): Response | null {
  const cl = request.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > max) {
      return Response.json({ error: "Requisição inválida." }, { status: 413, headers: noStoreHeaders() });
    }
  }
  return null;
}

export async function readJsonBody(
  request: Request,
  max = MAX_JSON_BODY_BYTES,
): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
  const typeErr = assertJsonContentType(request);
  if (typeErr) return { ok: false, response: typeErr };
  const sizeErr = assertBodySize(request, max);
  if (sizeErr) return { ok: false, response: sizeErr };
  const text = await request.text();
  if (text.length > max) {
    return {
      ok: false,
      response: Response.json({ error: "Requisição inválida." }, { status: 413, headers: noStoreHeaders() }),
    };
  }
  try {
    return { ok: true, value: text.length ? JSON.parse(text) : null };
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Requisição inválida." }, { status: 400, headers: noStoreHeaders() }),
    };
  }
}

export function jsonNoStore(data: unknown, init: { status?: number } = {}): Response {
  return Response.json(data, { status: init.status ?? 200, headers: noStoreHeaders() });
}
