"use client";

import { useId, useState } from "react";
import { siteConfig } from "@/config/site";
import { faqItems, faqSection } from "@/data/landing-content";
import { CheckoutButton } from "@/components/ui/checkout-button";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={`shrink-0 text-vermelho transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <path
        d="M5 8l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Faq() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id={siteConfig.anchors.faq}
      className="section-spacing surface-vinho scroll-mt-28 text-marfim md:scroll-mt-32"
    >
      <div className="section-shell max-w-3xl">
        <h2 data-reveal className="font-display section-headline text-marfim">
          {faqSection.h2}
        </h2>

        <div className="mt-10 divide-y divide-marfim/12 rounded-[20px] border border-marfim/12 bg-black/20 px-5 md:px-7">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;

            return (
              <div key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-5 text-left text-marfim transition-colors hover:text-ouro-claro md:py-6"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span className="pr-2 text-[1.0625rem] font-medium leading-snug md:text-[1.125rem]">
                      {item.question}
                    </span>
                    <Chevron open={isOpen} />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="whitespace-pre-line pb-5 text-[1.0625rem] leading-[1.65] text-bege md:text-[1.125rem]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div data-reveal className="mt-10 text-center">
          <CheckoutButton planId="practice" className="w-full sm:w-auto">
            {faqSection.cta}
          </CheckoutButton>
        </div>
      </div>
    </section>
  );
}
