import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  META_DATASET_ID,
  buildCompraConcluida,
  interpretMetaResponse,
  isEligiblePurchase,
  type SaleWebhook,
} from "./purchase-event";

const META_EVENTS_URL = `https://graph.facebook.com/v23.0/${META_DATASET_ID}/events`;

type KiwifyWebhook = SaleWebhook;

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

  if (!isEligiblePurchase(parsed)) {
    return NextResponse.json({ received: true });
  }

  const built = buildCompraConcluida(parsed);
  if (!built.ok) {
    console.log({ meta_status: null, meta_error_code: built.reason });
    if (built.reason === "missing_customer_identifier") {
      return NextResponse.json({ received: true });
    }
    return NextResponse.json({ received: false }, { status: 400 });
  }
  const event = built.event;

  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    console.log({ meta_status: null, meta_error_code: "missing_access_token" });
    return NextResponse.json({ received: false }, { status: 500 });
  }

  const result = await sendCompraConcluida(event, accessToken);
  console.log({
    meta_status: result.status,
    meta_error_code: result.errorCode,
    events_received: result.eventsReceived,
  });

  if (!result.ok) {
    return NextResponse.json({ received: false }, { status: 502 });
  }

  return NextResponse.json({ received: true });
}

async function sendCompraConcluida(
  event: Extract<ReturnType<typeof buildCompraConcluida>, { ok: true }>["event"],
  accessToken: string,
): Promise<{ ok: boolean; status: number; errorCode: number | null; eventsReceived: number | null }> {
  const url = new URL(META_EVENTS_URL);
  url.searchParams.set("access_token", accessToken);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: [event] }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = await readJson(response);
    const interpreted = interpretMetaResponse(response.status, body);
    return {
      ok: interpreted.ok,
      status: response.status,
      errorCode: interpreted.errorCode,
      eventsReceived: interpreted.eventsReceived,
    };
  } catch {
    return { ok: false, status: 0, errorCode: null, eventsReceived: null };
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
