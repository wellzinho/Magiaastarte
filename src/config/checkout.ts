export type PlanId = "practice" | "autonomy";

export type PlanConfig = {
  id: PlanId;
  name: string;
  checkoutUrl: string;
  price: string;
  priceDisplay: string;
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const plans: Record<PlanId, PlanConfig> = {
  practice: {
    id: "practice",
    name: "21 Práticas de Pombagira",
    checkoutUrl: "https://pay.kiwify.com.br/L3igk0G",
    price: "37,90",
    priceDisplay: "R$37,90",
  },
  autonomy: {
    id: "autonomy",
    name: "Guia Completo de Pombagira",
    checkoutUrl: "https://pay.kiwify.com.br/GssRacA",
    price: "47,90",
    priceDisplay: "R$47,90",
  },
};

export function getCheckoutHref(
  planId: PlanId,
  pageSearch?: string | URLSearchParams | null,
): string {
  const url = plans[planId].checkoutUrl;
  if (!url) {
    return `#${planId}-opcao`;
  }
  return withPageUtms(url, pageSearch);
}

/** Copies utm_* from the sales page onto the checkout URL. Organic visits stay clean. */
export function withPageUtms(
  checkoutUrl: string,
  pageSearch?: string | URLSearchParams | null,
): string {
  if (pageSearch == null || pageSearch === "") {
    return checkoutUrl;
  }

  const incoming =
    typeof pageSearch === "string"
      ? new URLSearchParams(
          pageSearch.startsWith("?") ? pageSearch.slice(1) : pageSearch,
        )
      : pageSearch;

  const target = new URL(checkoutUrl);
  for (const key of UTM_KEYS) {
    if (target.searchParams.has(key)) {
      continue;
    }
    const value = incoming.get(key);
    if (value !== null && value !== "") {
      target.searchParams.set(key, value);
    }
  }
  return target.toString();
}
