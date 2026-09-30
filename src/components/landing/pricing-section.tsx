"use client";

import Image from "next/image";
import { plans, type PlanId } from "@/config/checkout";
import { landingImages, type LandingImage } from "@/config/landing-images";
import { siteConfig } from "@/config/site";
import { offerSection } from "@/data/landing-content";
import { usePlanSelection } from "@/components/landing/plan-selection";
import { CheckoutButton } from "@/components/ui/checkout-button";

const cardImages: Record<PlanId, LandingImage> = {
  practice: landingImages.practicesThumb,
  autonomy: landingImages.completeBox,
};

const planIds: readonly PlanId[] = ["practice", "autonomy"];

export function PricingSection() {
  const { selected, select } = usePlanSelection();
  const [leadStart, leadEnd] = offerSection.lead.split("{practicePrice}");

  return (
    <section
      id={siteConfig.anchors.pricing}
      className="section-spacing scroll-mt-28 surface-light md:scroll-mt-32"
    >
      <div className="section-shell">
        <header className="mx-auto max-w-3xl text-center">
          <p data-reveal className="eyebrow text-vermelho">
            {offerSection.eyebrow}
          </p>
          <h2
            data-reveal
            className="font-display section-headline-lg mt-4 text-vinho"
          >
            {offerSection.h2}
          </h2>
          <p
            data-reveal
            className="lead-text mx-auto mt-6 max-w-2xl text-vinho/80"
          >
            {leadStart}
            <strong className="font-semibold text-vinho">
              {plans.practice.priceDisplay}
            </strong>
            {leadEnd}
          </p>
        </header>

        <div className="mx-auto mt-12 grid max-w-md grid-cols-1 gap-8 md:mt-16 lg:max-w-5xl lg:grid-cols-2 lg:items-start lg:gap-10">
          {offerSection.options.map((option) => {
            const plan = plans[option.id];
            const isSelected = option.id === selected;
            const isComplete = option.id === "autonomy";
            const image = cardImages[option.id];

            return (
              <article
                key={option.id}
                id={`opcao-${option.id}`}
                data-reveal
                data-reveal-delay={isComplete ? "1" : undefined}
                aria-current={isSelected ? "true" : undefined}
                onClick={() => select(option.id)}
                className={`offer-card flex flex-col overflow-hidden ${
                  isComplete ? "offer-card-complete" : ""
                } ${isSelected ? "is-selected" : ""}`.trim()}
              >
                <div className="relative aspect-[4/3] w-full bg-bege">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover object-center"
                  />
                  {option.badge ? (
                    <span
                      className={`offer-badge absolute left-5 top-5 ${
                        isComplete ? "offer-badge-complete" : ""
                      }`.trim()}
                    >
                      {option.badge}
                    </span>
                  ) : null}
                  {option.tag ? (
                    <span className="offer-tag absolute right-5 top-5">
                      {option.tag}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col px-6 py-7 md:px-8 md:py-9">
                  <h3 className="font-display text-[1.85rem] leading-tight text-vinho md:text-[2.1rem]">
                    {option.title}
                  </h3>
                  <p className="eyebrow mt-2 !text-[0.72rem] text-vermelho">
                    {option.subtitle}
                  </p>
                  <p className="mt-4 text-[1.0625rem] leading-relaxed text-vinho/80">
                    {option.tagline}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {option.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="offer-check mt-0.5" aria-hidden>
                          ✓
                        </span>
                        <span className="text-[1rem] leading-relaxed text-vinho/85">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 border-t border-vinho/10 pt-6">
                    <p className="text-[0.875rem] tracking-[0.02em] text-vinho/60">
                      {offerSection.paymentLabel}
                    </p>
                    <p className="font-display price-display-lg mt-1 leading-none text-vinho">
                      {plan.priceDisplay}
                    </p>
                    <p className="mt-2 text-[0.875rem] text-vinho/60">
                      {offerSection.accessLabel}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <CheckoutButton
                      planId={option.id}
                      variant={isComplete ? "wine" : "primary"}
                      className="w-full"
                    >
                      {option.cta}
                    </CheckoutButton>
                    <p className="microcopy text-center text-vinho/55">
                      {offerSection.micro}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div
          data-reveal
          className="offer-compare mx-auto mt-14 max-w-3xl overflow-hidden md:mt-20"
        >
          <h3 className="font-display px-6 pb-6 pt-8 text-center text-[1.6rem] tracking-[0.04em] text-vinho md:text-[2rem]">
            {offerSection.comparison.h3}
          </h3>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="offer-compare-head">
                <th scope="col" className="px-5 py-4 md:px-7">
                  <span className="sr-only">Item</span>
                </th>
                {planIds.map((id) => (
                  <th
                    key={id}
                    scope="col"
                    className="px-2 py-4 text-center text-[0.7rem] font-bold tracking-[0.12em] text-vinho md:px-4 md:text-[0.78rem]"
                  >
                    {offerSection.comparison.columns[id]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {offerSection.comparison.rows.map((row) => (
                <tr key={row.label} className="offer-compare-row">
                  <th
                    scope="row"
                    className="px-5 py-4 text-[0.95rem] font-normal leading-snug text-vinho/85 md:px-7 md:text-[1rem]"
                  >
                    {row.label}
                  </th>
                  {planIds.map((id) => (
                    <td key={id} className="px-2 py-4 text-center md:px-4">
                      {row[id] ? (
                        <span className="font-semibold text-vermelho" aria-hidden>
                          ✓
                        </span>
                      ) : (
                        <span className="text-vinho/35" aria-hidden>
                          —
                        </span>
                      )}
                      <span className="sr-only">
                        {row[id]
                          ? offerSection.comparison.included
                          : offerSection.comparison.notIncluded}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="offer-compare-foot">
                <th
                  scope="row"
                  className="px-5 py-5 text-[1.05rem] font-bold text-marfim md:px-7"
                >
                  {offerSection.comparison.priceLabel}
                </th>
                {planIds.map((id) => (
                  <td
                    key={id}
                    className="font-display px-2 py-5 text-center text-[1.25rem] text-ouro-claro md:px-4 md:text-[1.5rem]"
                  >
                    {plans[id].priceDisplay}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}
