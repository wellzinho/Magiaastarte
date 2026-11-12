import type { PreviewPayload, ReadingDocument } from "./assemble";

export const PRICE_CENTS = 1990 as const;

export type OrderStatus = "pending" | "approved" | "expired" | "canceled" | "failed";

export type ChargeState = "open" | "rejected" | "cancelled" | "expired";

export type Order = {
  id: string;
  sessionId: string;
  status: OrderStatus;
  amountCents: typeof PRICE_CENTS;
  currency: "BRL";
  providerPaymentId: string | null;
  providerOrderId: string | null;
  externalReference: string | null;
  pixCopyPaste: string | null;
  qrSvg: string | null;
  ticketUrl: string | null;
  buyerFirstName: string;
  pixLock: boolean;
  chargeState: ChargeState;
  testMode: boolean;
  contentVersion: string;
  snapshotHash: string;
  formatId: string;
  document: ReadingDocument | null;
  preview: PreviewPayload | null;
  createdAt: string;
  updatedAt: string;
};
