import Image from "next/image";
import { plans } from "@/config/checkout";
import { landingImages } from "@/config/landing-images";
import { hero } from "@/data/landing-content";
import { EditorialImage } from "@/components/ui/editorial-image";
import { CheckoutButton } from "@/components/ui/checkout-button";

function MobileHeadline({
  headline,
  emphasis,
}: {
  headline: string;
  emphasis: string;
}) {
  const index = headline.indexOf(emphasis);
  if (index === -1) {
    return <>{headline}</>;
  }

  const before = headline.slice(0, index);
  const after = headline.slice(index + emphasis.length);

  return (
    <>
      {before}
      <span className="font-semibold text-vermelho">{emphasis}</span>
      {after}
    </>
  );
}

export function Hero() {
  const [h1Lead, h1Rest] = hero.h1.split("\n");
  const practice = plans.practice;
  const formatLine = hero.format.replace("{price}", practice.priceDisplay);
  const [formatLabel] = formatLine.split(" • ");

  return (
    <section
      id="inicio"
      className="hero-surface surface-light overflow-x-clip pb-10 pt-20 md:pb-20 md:pt-24"
    >
      {/* Mobile: composição editorial com foto em largura total */}
      <div className="md:hidden">
        <div className="px-5">
          <p
            data-reveal
            className="text-[0.6875rem] font-semibold tracking-[0.14em] text-vermelho uppercase"
          >
            {hero.eyebrow}
          </p>

          <h1
            data-reveal
            data-reveal-delay="1"
            className="font-display hero-headline-mobile mt-3 text-vinho"
          >
            <MobileHeadline
              headline={hero.mobile.headline}
              emphasis={hero.mobile.headlineEmphasis}
            />
          </h1>
        </div>

        <div
          data-reveal
          data-reveal-delay="2"
          className="hero-mobile-photo mt-4 w-full px-5"
        >
          <div className="hero-mobile-photo-media relative">
            <Image
              src={landingImages.hero.src}
              alt={landingImages.hero.alt}
              fill
              preload
              sizes="100vw"
              className="object-cover object-[50%_22%]"
            />
          </div>
        </div>

        <div className="px-5 pt-4">
          <p
            data-reveal
            data-reveal-delay="2"
            className="text-[1rem] leading-[1.5] text-vinho/75"
          >
            {hero.mobile.subheadline}
          </p>

          <div id="hero-cta" data-reveal data-reveal-delay="3" className="mt-6">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <p className="text-[0.9375rem] text-vinho/55">{formatLabel}</p>
              <p className="font-display text-[1.75rem] leading-none font-semibold text-vermelho">
                {practice.priceDisplay}
              </p>
            </div>

            <div className="mt-3">
              <CheckoutButton
                planId="practice"
                variant="wine"
                className="hero-mobile-cta w-full"
              >
                {hero.mobile.cta}
              </CheckoutButton>
            </div>

            <p className="mt-3 text-[0.8125rem] leading-snug text-vinho/55">
              {hero.mobile.microcopy}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop: composição editorial existente */}
      <div className="section-shell hidden min-w-0 grid-cols-1 gap-8 md:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 lg:gap-y-6">
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
            data-reveal
            data-reveal-delay="3"
            className="ritual-card-light mt-6 px-5 py-6 md:px-7 md:py-7"
          >
            <p className="font-display text-[1.35rem] leading-snug text-vinho md:text-[1.55rem]">
              {formatLabel}
              <span className="text-vinho/40"> • </span>
              <span className="font-bold text-vermelho">
                {practice.priceDisplay}
              </span>
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
    </section>
  );
}
