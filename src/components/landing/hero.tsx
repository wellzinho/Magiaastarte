import { plans } from "@/config/checkout";
import { landingImages } from "@/config/landing-images";
import { hero } from "@/data/landing-content";
import { EditorialImage } from "@/components/ui/editorial-image";
import { CheckoutButton } from "@/components/ui/checkout-button";

export function Hero() {
  const [h1Lead, h1Rest] = hero.h1.split("\n");
  const practice = plans.practice;
  const formatLine = hero.format.replace("{price}", practice.priceDisplay);

  return (
    <section
      id="inicio"
      className="hero-surface surface-light overflow-x-clip pb-14 pt-20 md:pb-20 md:pt-24"
    >
      <div className="section-shell">
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-x-12 lg:gap-y-6">
          <div className="min-w-0 lg:col-span-6 lg:col-start-7 lg:row-start-1">
            <p data-reveal className="eyebrow text-vermelho">
              {hero.eyebrow}
            </p>
            <h1
              data-reveal
              data-reveal-delay="1"
              className="font-display hero-headline mt-4 text-vinho md:mt-5"
            >
              <span className="block">{h1Lead}</span>
              <span className="mt-3 block text-[1.2rem] italic leading-snug text-vermelho md:mt-4 md:text-[1.85rem]">
                {h1Rest}
              </span>
            </h1>
            <p
              data-reveal
              data-reveal-delay="2"
              className="lead-text measure mt-5 text-vinho/80"
            >
              {hero.subheadline}
            </p>

            <div
              id="hero-cta"
              data-reveal
              data-reveal-delay="3"
              className="ritual-card-light mt-6 px-5 py-6 md:px-7 md:py-7"
            >
              <p className="font-display text-[1.35rem] leading-snug text-vinho md:text-[1.55rem]">
                {formatLine.split(" • ")[0]}
                <span className="text-vinho/40"> • </span>
                <span className="font-bold text-vermelho">{practice.priceDisplay}</span>
              </p>
              <div className="mt-5">
                <CheckoutButton planId="practice" className="w-full">
                  {hero.cta}
                </CheckoutButton>
              </div>
              <p className="microcopy mt-3 text-center text-vinho/55">
                {hero.microcopy}
              </p>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-5 lg:col-start-1 lg:row-span-1 lg:row-start-1">
            <div className="hero-object">
              <EditorialImage
                image={landingImages.hero}
                light
                aspect="aspect-[4/5]"
                preload
              />
            </div>
            <p className="microcopy mt-3 text-center text-vinho/50 lg:text-left">
              Material digital — consulta no celular ou computador.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
