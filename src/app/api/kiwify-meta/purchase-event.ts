import { createHash } from "node:crypto";

export const META_DATASET_ID = "1648078539613617";
export const PRACTICE_PRODUCT_ID = "df7946b0-b2c3-11f1-a689-cd733c12bf87";

const BRAZIL_OFFSET = "-03:00";

export type SaleWebhook = {
  webhook_event_type?: unknown;
  order_status?: unknown;
  order_id?: unknown;
  approved_date?: unknown;
  Product?: {
    product_id?: unknown;
  };
  Customer?: {
    email?: unknown;
  };
  Commissions?: {
    charge_amount?: unknown;
    currency?: unknown;
  };
};

export type CompraConcluidaEvent = {
  event_name: "CompraConcluida";
  event_time: number;
  event_id: string;
  action_source: "other";
  user_data: {
    em: string[];
  };
  custom_data: {
    value: number;
    currency: string;
  };
};

export type PurchaseBuildResult =
  | { ok: true; event: CompraConcluidaEvent }
  | { ok: false; reason: "invalid_purchase" | "missing_customer_identifier" };

export function isEligiblePurchase(sale: SaleWebhook): boolean {
  return (
    sale.webhook_event_type === "order_approved" &&
    sale.order_status === "paid" &&
    productId(sale) === PRACTICE_PRODUCT_ID
  );
}

export function centsToMajorUnits(amount: unknown): number | null {
  const cents = integerCents(amount);
  if (cents === null) {
    return null;
  }
  return Number((cents / 100).toFixed(2));
}

export function hashEmail(email: unknown): string | null {
  if (typeof email !== "string") {
    return null;
  }
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return null;
  }
  return sha256(normalized);
}

export function approvalUnixSeconds(approvedDate: unknown): number | null {
  if (typeof approvedDate !== "string") {
    return null;
  }
  const trimmed = approvedDate.trim();
  if (!trimmed) {
    return null;
  }

  const withZone = hasTimeZone(trimmed) ? trimmed : `${trimmed.replace(" ", "T")}${BRAZIL_OFFSET}`;
  const milliseconds = Date.parse(withZone);
  if (!Number.isFinite(milliseconds)) {
    return null;
  }

  const seconds = Math.floor(milliseconds / 1000);
  return seconds > 0 ? seconds : null;
}

export function buildCompraConcluida(sale: SaleWebhook): PurchaseBuildResult {
  if (!isEligiblePurchase(sale)) {
    return { ok: false, reason: "invalid_purchase" };
  }
  if (typeof sale.order_id !== "string" || sale.order_id.trim() === "") {
    return { ok: false, reason: "invalid_purchase" };
  }

  const orderId = sale.order_id.trim();
  const eventTime = approvalUnixSeconds(sale.approved_date);
  const value = centsToMajorUnits(sale.Commissions?.charge_amount);
  const currency = currencyCode(sale.Commissions?.currency);
  if (eventTime === null || value === null || currency === null) {
    return { ok: false, reason: "invalid_purchase" };
  }

  const emailHash = hashEmail(sale.Customer?.email);
  if (!emailHash) {
    return { ok: false, reason: "missing_customer_identifier" };
  }

  return {
    ok: true,
    event: {
      event_name: "CompraConcluida",
      event_time: eventTime,
      event_id: orderId,
      action_source: "other",
      user_data: {
        em: [emailHash],
      },
      custom_data: {
        value,
        currency,
      },
    },
  };
}

export function interpretMetaResponse(
  status: number,
  body: unknown,
): { ok: boolean; errorCode: number | null; eventsReceived: number | null } {
  const errorCode = metaErrorCode(body);
  const eventsReceived = metaEventsReceived(body);
  const hasError = bodyHasError(body);
  const ok = status >= 200 && status < 300 && !hasError && eventsReceived === 1;
  return { ok, errorCode, eventsReceived };
}

function productId(sale: SaleWebhook): string | null {
  const value = sale.Product?.product_id;
  if (typeof value !== "string") {
    return null;
  }
  return value.trim().toLowerCase();
}

function integerCents(amount: unknown): number | null {
  if (typeof amount === "string") {
    if (!/^[0-9]+$/.test(amount)) {
      return null;
    }
    amount = Number(amount);
  }
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount < 0) {
    return null;
  }
  return amount;
}

function currencyCode(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const code = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : null;
}

function hasTimeZone(value: string): boolean {
  return /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function bodyHasError(body: unknown): boolean {
  return typeof body === "object" && body !== null && "error" in body;
}

function metaErrorCode(body: unknown): number | null {
  if (!bodyHasError(body)) {
    return null;
  }
  const error = (body as { error?: { code?: unknown } }).error;
  return typeof error?.code === "number" && Number.isInteger(error.code) ? error.code : null;
}

function metaEventsReceived(body: unknown): number | null {
  if (typeof body !== "object" || body === null || !("events_received" in body)) {
    return null;
  }
  const received = (body as { events_received?: unknown }).events_received;
  return typeof received === "number" && Number.isInteger(received) ? received : null;
}
