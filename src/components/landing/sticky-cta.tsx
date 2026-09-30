"use client";

import { useEffect, useState } from "react";
import { plans } from "@/config/checkout";
import { siteConfig } from "@/config/site";
import { CheckoutLink } from "@/components/ui/checkout-link";

// The sticky bar always sells the Guia Completo, so the price shown must match its checkout.
const plan = plans.autonomy;

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const pricing = document.getElementById(siteConfig.anchors.pricing);
    let inPricing = false;

    const update = () => {
      const scrolledPastFold = window.scrollY > window.innerHeight * 0.85;
      setVisible(scrolledPastFold && !inPricing);
    };

    const onScroll = () => update();

    const pricingObserver = pricing
      ? new IntersectionObserver(
          ([entry]) => {
            inPricing = entry.isIntersecting;
            update();
          },
          { threshold: 0.08 },
        )
      : null;

    if (pricing && pricingObserver) pricingObserver.observe(pricing);
    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      pricingObserver?.disconnect();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="sticky-bar fixed inset-x-0 bottom-0 z-40 px-4 py-2.5 md:hidden"
      role="region"
      aria-label="Atalho para o checkout do Guia Completo"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-[0.8125rem] font-medium tracking-[0.02em] text-marfim">
          <span className="block truncate">{plan.name}</span>
          <span className="font-display text-[1.05rem] leading-none text-ouro-claro">
            {plan.priceDisplay}
          </span>
        </p>
        <CheckoutLink
          planId="autonomy"
          className="flex min-h-10 shrink-0 items-center justify-center rounded-full bg-dourado px-5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-preto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:scale-[.985]"
        >
          {siteConfig.stickyCta.button}
        </CheckoutLink>
      </div>
    </div>
  );
}
