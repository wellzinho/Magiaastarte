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

function isSha1HexSignature(signature: string): boolean {
  return /^[0-9a-f]{40}$/.test(signature);
}

function signatureMatches(rawBody: string, token: string, signature: string): boolean {
  if (!isSha1HexSignature(signature)) {
    return false;
  }

  const expected = createHmac("sha1", token).update(rawBody, "utf8").digest("hex");
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  const token = process.env.KIWIFY_WEBHOOK_TOKEN;
  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json({ received: false }, { status: 500 });
  }

  const raw = await request.text();
  const signature = request.nextUrl.searchParams.get("signature");
  if (!signature || !signatureMatches(raw, token, signature)) {
    return NextResponse.json({ received: false }, { status: 401 });
  }

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
  });

  return NextResponse.json({ received: true });
}
