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

export async function POST(request: NextRequest) {
  const raw = await request.text();

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
    has_signature: request.nextUrl.searchParams.has("signature"),
  });

  return NextResponse.json({ received: true });
}
