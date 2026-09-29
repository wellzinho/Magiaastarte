import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

type KiwifyWebhook = {
  webhook_event_type?: unknown;
  order_status?: unknown;
  order_id?: unknown;
  Product?: {
    product_id?: unknown;
  };
  Commissions?: {
    charge_amount?: unknown;
    currency?: unknown;
  };
};

function isWebhookObject(value: unknown): value is KiwifyWebhook {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hmacMatches(
  rawBody: string,
  token: string,
  signature: string,
  algorithm: "sha1" | "sha256",
  encoding: "hex" | "base64",
): boolean {
  const expected = createHmac(algorithm, token).update(rawBody, "utf8").digest(encoding);
  const expectedBytes = Buffer.from(expected);
  const receivedBytes = Buffer.from(signature);
  if (expectedBytes.length !== receivedBytes.length) {
    return false;
  }
  return timingSafeEqual(expectedBytes, receivedBytes);
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.nextUrl.searchParams.get("signature");
  const token = process.env.KIWIFY_WEBHOOK_TOKEN;
  const tokenConfigured = typeof token === "string" && token.length > 0;
  const canCompare = tokenConfigured && typeof signature === "string" && signature.length > 0;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  if (!isWebhookObject(parsed)) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  console.log({
    webhook_event_type: parsed.webhook_event_type ?? null,
    order_status: parsed.order_status ?? null,
    order_id: parsed.order_id ?? null,
    "Product.product_id": parsed.Product?.product_id ?? null,
    "Commissions.charge_amount": parsed.Commissions?.charge_amount ?? null,
    "Commissions.currency": parsed.Commissions?.currency ?? null,
    has_signature: signature !== null,
    token_configured: tokenConfigured,
    signature_length: signature?.length ?? 0,
    hmac_sha1_hex: canCompare && hmacMatches(raw, token, signature, "sha1", "hex"),
    hmac_sha256_hex: canCompare && hmacMatches(raw, token, signature, "sha256", "hex"),
    hmac_sha1_base64: canCompare && hmacMatches(raw, token, signature, "sha1", "base64"),
    hmac_sha256_base64: canCompare && hmacMatches(raw, token, signature, "sha256", "base64"),
  });

  return NextResponse.json({ received: true });
}
