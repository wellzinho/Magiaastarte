import { plans } from "@/config/checkout";
import { finalAnchor } from "@/data/landing-content";
import { CheckoutButton } from "@/components/ui/checkout-button";
import { PombagiraIcon } from "@/components/ui/pombagira-icon";

export function FinalAnchor() {
  const [h2Lead, h2Rest] = finalAnchor.h2.split("\n");
  const [totalLead, totalRest] = finalAnchor.total.split("{price}");
  const complete = plans.autonomy;

  return (
    <section className="section-spacing-xl surface-vinho text-marfim">
      <div className="section-shell max-w-3xl py-6 md:py-12">
        <h2
          data-reveal
          className="font-display section-headline text-center"
        >
          <span className="block">{h2Lead}</span>
          <span className="mt-4 block italic text-ouro-claro">{h2Rest}</span>
        </h2>

        <div
          data-reveal
          data-reveal-delay="1"
          className="ritual-card-light mx-auto mt-14 max-w-md px-7 py-9 md:px-9 md:py-10"
        >
          <span className="icon-seal-light">
            <PombagiraIcon name="trident" className="h-6 w-6" />
          </span>
          <p className="font-display mt-5 text-[1.5rem] leading-snug text-vinho md:text-[1.75rem]">
            {finalAnchor.lead}
          </p>
          <ul className="mt-5 space-y-2.5">
            {finalAnchor.includes.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-vermelho" aria-hidden>
                  ✓
                </span>
                <span className="text-[1.0625rem] leading-relaxed text-vinho/80">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-8 flex flex-wrap items-baseline gap-x-2 text-vinho/70">
            <span className="text-[1.0625rem]">{totalLead.trim()}</span>
            <span className="font-display price-display text-vermelho">
              {complete.priceDisplay}
            </span>
            <span className="text-[1.0625rem]">{totalRest.trim()}</span>
          </p>
          <p className="microcopy mt-3 text-vinho/55">{finalAnchor.micro}</p>

          <div className="mt-8">
            <CheckoutButton planId="autonomy" variant="wine" className="w-full">
              {finalAnchor.cta}
            </CheckoutButton>
          </div>
        </div>
      </div>
    </section>
  );
}
