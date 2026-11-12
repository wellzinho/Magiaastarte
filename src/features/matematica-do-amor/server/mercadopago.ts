import { createHash, randomUUID } from "node:crypto";

export const REFERENCE_PREFIX = "astarte_matematica_amor_";
export const CHARGE_AMOUNT = "19.90";
export const PRODUCT_NAME = "Orientação Completa - Matemática do Amor";

export type MercadoPagoMode = "test" | "production";

export type NormalizedStatus = "pending" | "approved" | "rejected" | "cancelled" | "expired" | "error";

export type ChargeView = {
  mpOrderId: string;
  paymentId: string | null;
  externalReference: string;
  copyPaste: string | null;
  ticketUrl: string | null;
  status: NormalizedStatus;
};

type Payer = {
  email: string;
  first_name?: string;
};

export type PixChargeBody = {
  type: "online";
  processing_mode: "automatic";
  total_amount: typeof CHARGE_AMOUNT;
  external_reference: string;
  description: typeof PRODUCT_NAME;
  items: [{ title: typeof PRODUCT_NAME; quantity: 1; unit_price: typeof CHARGE_AMOUNT }];
  payer: Payer;
  transactions: {
    payments: [{ amount: typeof CHARGE_AMOUNT; payment_method: { id: "pix"; type: "bank_transfer" } }];
  };
};

export function mercadoPagoMode(env: NodeJS.ProcessEnv = process.env): MercadoPagoMode | null {
  const mode = env.MERCADO_PAGO_MODE;
  const token = env.MERCADO_PAGO_ACCESS_TOKEN;
  if ((mode !== "test" && mode !== "production") || typeof token !== "string" || token.trim() === "") return null;
  return mode;
}

export function newExternalReference(): string {
  return `${REFERENCE_PREFIX}${randomUUID()}`;
}

export function isOwnReference(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(REFERENCE_PREFIX) && value.length > REFERENCE_PREFIX.length && value.length <= 96;
}

export function isExactPrice(value: unknown): boolean {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value * 100) === 1990;
  if (typeof value !== "string" || !/^\d+\.\d{2}$/.test(value)) return false;
  const [whole, fraction] = value.split(".");
  return Number(whole) * 100 + Number(fraction) === 1990;
}

export function pixChargeBody(input: {
  email: string;
  reference: string;
  mode: MercadoPagoMode;
  buyerFirstName: string;
}): PixChargeBody {
  const payer: Payer = { email: input.email };
  if (input.mode === "test") payer.first_name = "APRO";
  else if (input.buyerFirstName.trim()) payer.first_name = input.buyerFirstName.trim();
  return {
    type: "online",
    processing_mode: "automatic",
    total_amount: CHARGE_AMOUNT,
    external_reference: input.reference,
    description: PRODUCT_NAME,
    items: [{ title: PRODUCT_NAME, quantity: 1, unit_price: CHARGE_AMOUNT }],
    payer,
    transactions: {
      payments: [{ amount: CHARGE_AMOUNT, payment_method: { id: "pix", type: "bank_transfer" } }],
    },
  };
}

export function assessMercadoPagoOrder(payload: unknown, knownReference: string | null): ChargeView | null {
  if (!payload || typeof payload !== "object") return null;
  const order = payload as Record<string, unknown>;
  const reference = order.external_reference;
  if (!isOwnReference(reference)) return null;
  if (knownReference && reference !== knownReference) return null;
  if (!isExactPrice(order.total_amount)) return null;
  const payment = firstPayment(order.transactions);
  if (!payment) return null;
  if (!isExactPrice(payment.amount)) return null;
  const method = payment.payment_method;
  if (!method || method.id !== "pix" || method.type !== "bank_transfer") return null;
  const mpOrderId = typeof order.id === "string" ? order.id : "";
  if (!/^[A-Za-z0-9]{10,64}$/.test(mpOrderId)) return null;
  const status = normalizeStatus(order.status, order.status_detail, payment.status, payment.status_detail);
  return {
    mpOrderId,
    paymentId: typeof payment.id === "string" ? payment.id : null,
    externalReference: reference,
    copyPaste: typeof method.qr_code === "string" && method.qr_code.trim() ? method.qr_code.trim() : null,
    ticketUrl: typeof method.ticket_url === "string" && method.ticket_url.startsWith("https://") ? method.ticket_url : null,
    status,
  };
}

export function normalizeStatus(orderStatus: unknown, orderDetail: unknown, paymentStatus: unknown, paymentDetail: unknown): NormalizedStatus {
  const order = text(orderStatus);
  const detail = text(orderDetail);
  const payment = text(paymentStatus);
  const paymentNote = text(paymentDetail);
  const approved =
    order === "approved" ||
    payment === "approved" ||
    (order === "processed" && (detail === "accredited" || paymentNote === "accredited")) ||
    (payment === "processed" && paymentNote === "accredited");
  if (approved) return "approved";
  if (order === "expired" || payment === "expired" || detail === "expired" || paymentNote === "expired") return "expired";
  if (isCancelled(order) || isCancelled(payment) || isCancelled(detail) || isCancelled(paymentNote)) return "cancelled";
  if (isRejected(order) || isRejected(payment) || isRejected(detail) || isRejected(paymentNote)) return "rejected";
  if (isPending(order) || isPending(payment) || order === "" || payment === "") return "pending";
  return "error";
}

export function safeQrMarkup(svg: string): string | null {
  const trimmed = svg.trim();
  if (!trimmed.startsWith("<svg") || !trimmed.includes("</svg>")) return null;
  if (/<script|javascript:|on\w+=/i.test(trimmed)) return null;
  return trimmed;
}

export async function qrMarkup(copyPaste: string): Promise<string | null> {
  const qr = await import("qrcode");
  const svg = await qr.toString(copyPaste, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
  return safeQrMarkup(svg);
}

export function pixIdempotencyKey(orderId: string): string {
  return createHash("sha256").update(`mda-pix:${orderId}`, "utf8").digest("hex");
}

export async function createPixOrder(input: {
  email: string;
  reference: string;
  mode: MercadoPagoMode;
  buyerFirstName: string;
  idempotencyKey: string;
}): Promise<{ ok: true; charge: ChargeView } | { ok: false; kind: "unavailable" | "pix" }> {
  const token = accessToken();
  if (!token) {
    console.error("Cobrança indisponível: configuração ausente.");
    return { ok: false, kind: "unavailable" };
  }
  const idempotency =
    input.idempotencyKey.startsWith("mda-pix:") ? pixIdempotencyKey(input.idempotencyKey.slice("mda-pix:".length)) : createHash("sha256").update(input.idempotencyKey, "utf8").digest("hex");
  let response: Response;
  try {
    response = await fetch("https://api.mercadopago.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotency,
      },
      body: JSON.stringify(pixChargeBody(input)),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    console.error("Cobrança indisponível (create).");
    return { ok: false, kind: "pix" };
  }
  if (!response.ok) {
    console.error(`Cobrança indisponível (create, ${response.status}).`);
    return { ok: false, kind: "pix" };
  }
  const charge = assessMercadoPagoOrder(await response.json().catch(() => null), input.reference);
  if (!charge || charge.status === "error" || charge.status === "rejected" || !charge.copyPaste) {
    console.error("Cobrança indisponível (create, resposta incompleta).");
    return { ok: false, kind: "pix" };
  }
  return { ok: true, charge };
}

export async function readPixOrder(mpOrderId: string, knownReference: string): Promise<{ ok: true; charge: ChargeView } | { ok: false }> {
  if (!/^[A-Za-z0-9]{10,64}$/.test(mpOrderId) || !isOwnReference(knownReference)) return { ok: false };
  const token = accessToken();
  if (!token) {
    console.error("Cobrança indisponível: configuração ausente.");
    return { ok: false };
  }
  let response: Response;
  try {
    response = await fetch(`https://api.mercadopago.com/v1/orders/${mpOrderId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    console.error("Cobrança indisponível (status).");
    return { ok: false };
  }
  if (!response.ok) {
    console.error(`Cobrança indisponível (status, ${response.status}).`);
    return { ok: false };
  }
  const charge = assessMercadoPagoOrder(await response.json().catch(() => null), knownReference);
  if (!charge || charge.mpOrderId !== mpOrderId) return { ok: false };
  return { ok: true, charge };
}

function accessToken(): string | null {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (typeof token !== "string" || token.trim() === "") return null;
  return token.trim();
}

function firstPayment(transactions: unknown): {
  id?: unknown;
  amount?: unknown;
  status?: unknown;
  status_detail?: unknown;
  payment_method?: { id?: unknown; type?: unknown; qr_code?: unknown; ticket_url?: unknown };
} | null {
  if (!transactions || typeof transactions !== "object") return null;
  const payments = (transactions as { payments?: unknown }).payments;
  if (!Array.isArray(payments) || !payments[0] || typeof payments[0] !== "object") return null;
  return payments[0] as {
    id?: unknown;
    amount?: unknown;
    status?: unknown;
    status_detail?: unknown;
    payment_method?: { id?: unknown; type?: unknown; qr_code?: unknown; ticket_url?: unknown };
  };
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isPending(value: string): boolean {
  return value === "action_required" || value === "processing" || value === "created" || value === "pending" || value === "in_process";
}

function isCancelled(value: string): boolean {
  return value === "cancelled" || value === "canceled";
}

function isRejected(value: string): boolean {
  return value === "rejected" || value === "failed" || value === "charged_back" || value === "refunded";
}
