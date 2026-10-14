import { landingImages } from "@/config/landing-images";
import { siteConfig } from "@/config/site";
import { productSection } from "@/data/landing-content";
import { CheckoutButton } from "@/components/ui/checkout-button";
import { EditorialImage } from "@/components/ui/editorial-image";
import { PombagiraIcon, type IconName } from "@/components/ui/pombagira-icon";

const pointIcons: IconName[] = ["bowl", "candle", "ask"];

export function ProductContent() {
  return (
    <section
      id={siteConfig.anchors.content}
      className="section-spacing surface-light scroll-mt-28 md:scroll-mt-32"
    >
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
          <h2
            data-reveal
            className="font-display section-headline text-vinho"
          >
            {productSection.h2}
          </h2>
          <p
            data-reveal
            className="lead-text mx-auto mt-5 max-w-2xl text-vinho/80 lg:mx-0"
          >
            {productSection.intro}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-8 lg:mt-14 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-5">
            <EditorialImage
              image={landingImages.practicesInside01}
              light
              aspect="aspect-[4/5]"
            />
            <p className="microcopy mt-3 text-center text-vinho/50">
              Prévia de página real — Afoshé de Atração.
            </p>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid grid-cols-1 gap-4">
              {productSection.points.map((point, index) => (
                <li
                  key={point.title}
                  data-reveal
                  className="ritual-card-light flex gap-4 px-5 py-5 md:px-6"
                >
                  <span className="icon-seal-light shrink-0">
                    <PombagiraIcon name={pointIcons[index] ?? "candle"} />
                  </span>
                  <div>
                    <p className="font-display text-[1.35rem] leading-snug text-vinho md:text-[1.5rem]">
                      {point.title}
                    </p>
                    <p className="mt-1.5 text-[1.0625rem] leading-relaxed text-vinho/75">
                      {point.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p
              data-reveal
              className="font-display mt-8 text-[1.35rem] italic leading-snug text-vermelho md:text-[1.55rem]"
            >
              {productSection.closing}
            </p>

            <div data-reveal className="mt-8">
              <CheckoutButton planId="practice" className="w-full sm:w-auto">
                {productSection.cta}
              </CheckoutButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
