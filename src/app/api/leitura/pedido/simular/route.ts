import { assertBrowserOrigin, noStoreHeaders } from "@/lib/security/origin";

export async function POST(request: Request) {
  const originBlock = assertBrowserOrigin(request);
  if (originBlock) return originBlock;
  return Response.json({ error: "A simulação não aprova pagamento." }, { status: 403, headers: noStoreHeaders() });
}
