export type PlanId = "practice" | "autonomy";

export type PlanConfig = {
  id: PlanId;
  checkoutUrl: string;
  price: string;
  priceDisplay: string;
};

export const plans: Record<PlanId, PlanConfig> = {
  practice: {
    id: "practice",
    checkoutUrl: "https://pay.kiwify.com.br/L3igk0G",
    price: "37,90",
    priceDisplay: "R$37,90",
  },
  autonomy: {
    id: "autonomy",
    checkoutUrl: "https://pay.kiwify.com.br/GssRacA",
    price: "47,90",
    priceDisplay: "R$47,90",
  },
};

export function getCheckoutHref(planId: PlanId): string {
  const url = plans[planId].checkoutUrl;
  return url || `#${planId}-opcao`;
}
