import { plans } from "@/config/checkout";
import { siteConfig } from "@/config/site";
import { offerSection } from "@/data/landing-content";
import { OfferGallery } from "@/components/landing/offer-gallery";
import { CheckoutButton } from "@/components/ui/checkout-button";
import { PombagiraIcon, type IconName } from "@/components/ui/pombagira-icon";

const questionIcons: IconName[] = ["bowl", "candle", "ask"];

export function PricingSection() {
  const practice = plans.practice;
  const [h2Lead, h2Rest] = offerSection.h2.split("\n");

  return (
    <section
      id={siteConfig.anchors.pricing}
      className="section-spacing scroll-mt-28 surface-light md:scroll-mt-32"
    >
      <div className="section-shell max-w-xl">
        <header>
          <div className="text-center">
            <h2
              data-reveal
              className="font-display text-[1.85rem] leading-[1.15] tracking-[-0.02em] text-vinho md:text-[2.35rem]"
            >
              <span className="block">{h2Lead}</span>
              <span className="mt-2 block italic text-vermelho">{h2Rest}</span>
            </h2>
          </div>

          <ul
            data-reveal
            className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3"
            aria-label="Dúvidas no preparo"
          >
            {offerSection.questions.map((question, index) => (
              <li
                key={question}
                className="ritual-card-light flex items-center gap-3 px-4 py-4 sm:flex-col sm:items-center sm:px-3 sm:py-5 sm:text-center"
              >
                <span className="icon-seal-light shrink-0">
                  <PombagiraIcon name={questionIcons[index] ?? "ask"} />
                </span>
                <p className="font-display text-[1.2rem] leading-snug text-vinho md:text-[1.3rem]">
                  {question}
                </p>
              </li>
            ))}
          </ul>

          <p
            data-reveal
            className="mx-auto mt-7 max-w-md text-center text-[1.05rem] leading-relaxed text-vinho/70 md:text-[1.125rem]"
          >
            {offerSection.body.map((part, index) =>
              "emphasis" in part && part.emphasis ? (
                <strong key={index} className="font-semibold text-vinho">
                  {part.text}
                </strong>
              ) : (
                <span key={index}>{part.text}</span>
              ),
            )}
          </p>
        </header>

        <OfferGallery />

        <article
          data-reveal
          className="ritual-card-light mx-auto mt-10 overflow-hidden px-6 py-8 md:mt-12 md:px-9 md:py-10"
        >
          <p className="eyebrow text-vermelho">PRODUTO</p>
          <h3 className="font-display mt-3 text-[1.85rem] leading-tight text-vinho md:text-[2.25rem]">
            {offerSection.name}
          </h3>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-vinho/80">
            {offerSection.description}
          </p>

          <ul className="mt-6 space-y-3">
            {offerSection.includes.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="offer-check mt-0.5" aria-hidden>
                  ✓
                </span>
                <span className="text-[1.0625rem] leading-relaxed text-vinho/85">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-vinho/10 pt-6">
            <p className="text-[0.875rem] text-vinho/60">
              {offerSection.condition}
            </p>
            <p className="font-display price-display-lg mt-1 leading-none text-vermelho">
              {practice.priceDisplay}
            </p>
          </div>

          <div className="mt-6">
            <CheckoutButton planId="practice" className="w-full">
              {offerSection.cta}
            </CheckoutButton>
            <p className="microcopy mt-3 text-center text-vinho/55">
              {offerSection.micro}
            </p>
          </div>
        </article>

        <aside
          data-reveal
          className="mx-auto mt-6 max-w-xl rounded-[1.25rem] border border-vinho/12 bg-white/50 px-6 py-6 md:px-8"
        >
          <p className="font-display text-[1.35rem] leading-snug text-vinho md:text-[1.5rem]">
            {offerSection.guaranteeTitle}
          </p>
          <p className="mt-2 text-[1.0625rem] leading-relaxed text-vinho/75">
            {offerSection.guaranteeBody}
          </p>
        </aside>
      </div>
    </section>
  );
}
