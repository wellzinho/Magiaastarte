import { MDA_PRICE_CENTS, MDA_PRICE_LABEL } from "./price";

export const PRICE_CENTS = MDA_PRICE_CENTS;

export const PRICE_LABEL = MDA_PRICE_LABEL;

export const UNLOCK_LABEL = `Desbloquear minha leitura · ${MDA_PRICE_LABEL}`;

export const STAY_LABEL = "Ficar com a leitura grátis";

export const SIMULATE_LABEL = "Simular confirmação";

export const PIX_BADGE = "Pix simulado · ambiente de demonstração";

export const PIX_STATUS = "Aguardando confirmação do pagamento…";

export function isPayerEmail(value: string): boolean {
  const email = value.trim();
  if (email.length < 6 || email.length > 80) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export const PAYMENT_ONCE = "Pagamento único";

export const PREPARING_LABEL = "Pagamento confirmado · preparando sua leitura";

export type ChargeIntent = {
  id: string;
  amountCents: typeof PRICE_CENTS;
  currency: "BRL";
  mode: "simulated";
  status: "pending" | "approved";
};

export type PaymentPort = {
  createSimulatedIntent: () => ChargeIntent;
  confirmSimulated: (intent: ChargeIntent) => ChargeIntent;
};

export function createSimulatedIntent(): ChargeIntent {
  return {
    id: `sim-${createId()}`,
    amountCents: PRICE_CENTS,
    currency: "BRL",
    mode: "simulated",
    status: "pending",
  };
}

export function confirmSimulated(intent: ChargeIntent): ChargeIntent {
  if (intent.mode !== "simulated" || intent.amountCents !== PRICE_CENTS) {
    throw new Error(`Este build só confirma a simulação de ${PRICE_LABEL}.`);
  }

  return { ...intent, status: "approved" };
}

export const simulatedPayment: PaymentPort = {
  createSimulatedIntent,
  confirmSimulated,
};

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}`;
}
