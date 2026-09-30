import { plans } from "@/config/checkout";
import { landingImages } from "@/config/landing-images";
import { hero } from "@/data/landing-content";
import { EditorialImage } from "@/components/ui/editorial-image";
import { CheckoutButton } from "@/components/ui/checkout-button";

export function Hero() {
  const [h1Lead, h1Rest] = hero.h1.split("\n");
  const practice = plans.practice;

  return (
    <section
      id="inicio"
      className="hero-surface surface-light overflow-x-clip pb-24 pt-28 md:pb-32 md:pt-36"
    >
      <div className="section-shell">
        <div className="grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-16 lg:gap-y-8">
          {/* Headline stays at the very top on every viewport. */}
          <div className="min-w-0 lg:col-span-7 lg:col-start-6 lg:row-start-1">
            <p data-reveal className="eyebrow text-vermelho">
              {hero.eyebrow}
            </p>
            <h1
              data-reveal
              data-reveal-delay="1"
              className="font-display hero-headline mt-5 text-vinho md:mt-6"
            >
              <span className="block">{h1Lead}</span>
              <span className="mt-4 block text-[1.6rem] italic leading-snug text-vermelho md:text-[2.15rem]">
                {h1Rest}
              </span>
            </h1>
          </div>

          <div className="min-w-0 lg:col-span-5 lg:col-start-1 lg:row-span-3 lg:row-start-1">
            <div className="hero-object">
              <EditorialImage
                image={landingImages.hero}
                light
                aspect="aspect-[4/5]"
                preload
              />
            </div>
          </div>

          <div className="min-w-0 lg:col-span-7 lg:col-start-6 lg:row-start-2">
            <p
              data-reveal
              data-reveal-delay="2"
              className="lead-text measure text-vinho/80"
            >
              {hero.subheadline}
            </p>
            <p
              data-reveal
              data-reveal-delay="2"
              className="measure mt-5 text-[1.0625rem] leading-relaxed text-vinho/70"
            >
              {hero.complement}
            </p>
          </div>

          <div className="min-w-0 lg:col-span-7 lg:col-start-6 lg:row-start-3">
            <div
              data-reveal
              data-reveal-delay="3"
              className="ritual-card-light px-6 py-7 md:px-8 md:py-8"
            >
              <p className="eyebrow text-vinho/50">{hero.productLabel}</p>
              <p className="font-display mt-3 text-[1.75rem] leading-tight text-vinho md:text-4xl">
                {practice.name}
              </p>
              <p className="font-display price-display mt-5 text-vermelho">
                {practice.priceDisplay}
              </p>
              <p className="microcopy mt-3 text-vinho/55">{hero.microcopy}</p>
              <div className="mt-6">
                <CheckoutButton planId="practice" className="w-full">
                  {hero.cta}
                </CheckoutButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="hero-end" className="h-px w-full" aria-hidden="true" />
    </section>
  );
}
