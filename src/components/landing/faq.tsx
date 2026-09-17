"use client";

import { useId, useState } from "react";
import { siteConfig } from "@/config/site";
import { faqItems } from "@/data/landing-content";

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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id={siteConfig.anchors.faq}
      className="section-spacing surface-light scroll-mt-28 md:scroll-mt-32"
    >
      <div className="section-shell max-w-3xl">
        <h2 data-reveal className="font-display section-headline text-vinho">
          Dúvidas
        </h2>

        <div className="mt-12 divide-y divide-vinho/10 rounded-[20px] border border-vinho/10 bg-white/42 px-5 shadow-[0_12px_35px_rgba(45,23,27,0.06)] md:px-7">
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
                    className="flex w-full items-center justify-between gap-4 py-6 text-left text-vinho transition-colors hover:text-vermelho"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span className="pr-2 text-[1.125rem] font-medium leading-snug md:text-[1.1875rem]">
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
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="whitespace-pre-line pb-6 text-[1.0625rem] leading-[1.65] text-vinho/75 md:text-[1.125rem]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
