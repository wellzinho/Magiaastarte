"use client";

import { useEffect, useState } from "react";
import { getCheckoutHref } from "@/config/checkout";
import { siteConfig } from "@/config/site";

export function StickyCta() {
  const [visible, setVisible] = useState(false);
  const [knowsBox, setKnowsBox] = useState(false);

  useEffect(() => {
    const pricing = document.getElementById(siteConfig.anchors.pricing);
    const box = document.getElementById("box-completo");
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

    const boxObserver = box
      ? new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) setKnowsBox(true);
          },
          { threshold: 0.12 },
        )
      : null;

    if (pricing && pricingObserver) pricingObserver.observe(pricing);
    if (box && boxObserver) boxObserver.observe(box);
    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      pricingObserver?.disconnect();
      boxObserver?.disconnect();
    };
  }, []);

  if (!visible) return null;

  const { label, boxLabel, button } = siteConfig.stickyCta;

  return (
    <div
      className="sticky-bar fixed inset-x-0 bottom-0 z-40 px-4 py-2.5 md:hidden"
      role="region"
      aria-label="Atalho para opções de compra"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.8125rem] font-medium tracking-[0.02em] text-marfim">
          {knowsBox ? boxLabel : label}
        </p>
        <a
          href={getCheckoutHref("autonomy")}
          className="flex min-h-10 shrink-0 items-center justify-center rounded-full bg-dourado px-5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-preto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:scale-[.985]"
        >
          {button}
        </a>
      </div>
    </div>
  );
}
