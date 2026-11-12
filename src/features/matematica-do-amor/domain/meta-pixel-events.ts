import { mdaProductPayload } from "./meta-catalog";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const onceKeys = new Set<string>();

function once(key: string): boolean {
  if (onceKeys.has(key)) return false;
  onceKeys.add(key);
  return true;
}

function fbqReady(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

function trackStandard(event: string, payload: Record<string, unknown>, eventId?: string): void {
  if (!fbqReady()) return;
  if (eventId) window.fbq!("track", event, payload, { eventID: eventId });
  else window.fbq!("track", event, payload);
}

function trackCustom(event: string, payload: Record<string, unknown>): void {
  if (!fbqReady()) return;
  window.fbq!("trackCustom", event, payload);
}

/** Reseta chaves one-shot (testes). */
export function resetMetaPixelEvents(): void {
  onceKeys.clear();
}

export function trackMdaViewContent(): void {
  if (!once("ViewContent")) return;
  trackStandard("ViewContent", mdaProductPayload());
}

export function trackMdaQuizStarted(): void {
  if (!once("QuizStarted")) return;
  trackCustom("QuizStarted", mdaProductPayload());
}

export function trackMdaFreeReadingCompleted(): void {
  if (!once("FreeReadingCompleted")) return;
  trackCustom("FreeReadingCompleted", mdaProductPayload());
}

export function trackMdaOfferViewed(): void {
  if (!once("OfferViewed")) return;
  trackCustom("OfferViewed", mdaProductPayload());
}

export function trackMdaInitiateCheckout(): void {
  if (!once("InitiateCheckout")) return;
  trackStandard("InitiateCheckout", mdaProductPayload());
}

export function trackMdaAddPaymentInfo(): void {
  if (!once("AddPaymentInfo")) return;
  trackStandard("AddPaymentInfo", mdaProductPayload());
}

/**
 * Compra no navegador — mesmo nome e event_id do CAPI para deduplicação.
 * Não chamar em modo de teste do Mercado Pago.
 */
export function trackMdaCompraConcluida(eventId: string): void {
  if (!eventId.trim()) return;
  if (!once(`CompraConcluida:${eventId}`)) return;
  trackStandard("CompraConcluida", mdaProductPayload(), eventId.trim());
}
