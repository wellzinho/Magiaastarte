import { plans } from "@/config/checkout";
import { siteConfig } from "@/config/site";
import { offerSection } from "@/data/landing-content";
import { OfferGallery } from "@/components/landing/offer-gallery";
import { CheckoutButton } from "@/components/ui/checkout-button";

function ClosingLine({ text, emphasis }: { text: string; emphasis: string }) {
  if (!text.includes(emphasis)) {
    return <>{text}</>;
  }

  const index = text.indexOf(emphasis);
  return (
    <>
      <span className="font-medium text-vinho/85">{emphasis}</span>
      {text.slice(index + emphasis.length)}
    </>
  );
}

export function PricingSection() {
  const practice = plans.practice;

  return (
    <section
      id={siteConfig.anchors.pricing}
      className="offer-preview scroll-mt-28 surface-light md:scroll-mt-32"
    >
      <div className="section-shell max-w-5xl px-5 md:px-[var(--section-px)]">
        <header className="offer-preview-intro">
          <h2 data-reveal id="offer-gallery-label" className="offer-preview-title">
            <span className="offer-preview-lead">{offerSection.h2Lead}</span>
            <span className="offer-preview-question font-display">
              {offerSection.h2Question}
            </span>
          </h2>
          <p data-reveal className="offer-preview-description">
            {offerSection.description}
          </p>
        </header>

        <div className="offer-preview-media">
          <OfferGallery />
          <p data-reveal className="offer-preview-hint md:hidden">
            {offerSection.galleryHintMobile}
          </p>
          <p data-reveal className="offer-preview-hint hidden md:block">
            {offerSection.galleryHintDesktop}
          </p>
          <p data-reveal className="offer-preview-closing">
            <ClosingLine
              text={offerSection.galleryClosing}
              emphasis={offerSection.galleryClosingEmphasis}
            />
          </p>
        </div>

        <article
          data-reveal
          className="ritual-card-light mx-auto mt-10 max-w-xl overflow-hidden px-6 py-8 md:mt-12 md:px-9 md:py-10"
        >
          <p className="eyebrow text-vermelho">PRODUTO</p>
          <h3 className="font-display mt-3 text-[1.85rem] leading-tight text-vinho md:text-[2.25rem]">
            {offerSection.name}
          </h3>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-vinho/80">
            {offerSection.descriptionOffer}
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
