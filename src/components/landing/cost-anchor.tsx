import { plans } from "@/config/checkout";
import { costAnchor } from "@/data/landing-content";
import { CheckoutButton } from "@/components/ui/checkout-button";
import { PombagiraIcon } from "@/components/ui/pombagira-icon";

const scatteredIcons = ["bookmark", "bowl", "search"] as const;

export function CostAnchor() {
  const [h2Lead, h2Rest] = costAnchor.h2.split("\n");
  const [offerLead, offerRest] = costAnchor.offer.split("{price}");
  const price = plans.practice.priceDisplay;

  return (
    <section className="section-spacing-xl surface-preto text-marfim">
      <div className="section-shell max-w-3xl text-center">
        <h2 data-reveal className="font-display section-headline">
          <span className="block">{h2Lead}</span>
          <span className="mt-2 block italic text-dourado">{h2Rest}</span>
        </h2>

        <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {costAnchor.scattered.map((line, index) => (
            <li
              key={line}
              data-reveal
              data-reveal-delay={String(index + 1)}
              className="ritual-card flex flex-col items-center px-5 py-6 text-center"
            >
              <span className="icon-seal">
                <PombagiraIcon name={scatteredIcons[index]} />
              </span>
              <p className="font-display mt-4 text-[1.3rem] leading-snug text-marfim md:text-[1.45rem]">
                {line}
              </p>
            </li>
          ))}
        </ul>

        <div
          data-reveal
          className="ritual-card mx-auto mt-12 max-w-xl px-6 py-9 md:mt-16 md:px-10 md:py-12"
        >
          <p className="lead-text text-bege">
            {offerLead}
            <span className="font-display text-[1.6rem] font-semibold text-ouro-claro md:text-[1.85rem]">
              {price}
            </span>
            {offerRest}
          </p>
          <p className="font-display mt-8 text-[1.65rem] leading-tight text-ouro-claro md:text-[2rem]">
            {costAnchor.closing[0]}
          </p>
          <p className="font-display mt-1 text-[1.65rem] leading-tight text-marfim md:text-[2rem]">
            {costAnchor.closing[1]}
          </p>
          <div className="mt-8">
            <CheckoutButton planId="practice" className="w-full sm:w-auto">
              {costAnchor.cta}
            </CheckoutButton>
          </div>
        </div>
      </div>
    </section>
  );
}
