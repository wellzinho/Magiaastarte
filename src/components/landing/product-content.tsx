import { siteConfig } from "@/config/site";
import { landingImages } from "@/config/landing-images";
import { productPraticas } from "@/data/landing-content";
import { EditorialImage } from "@/components/ui/editorial-image";
import { CheckoutButton } from "@/components/ui/checkout-button";
import { PombagiraIcon } from "@/components/ui/pombagira-icon";

const layerIcons = [
  "heart",
  "moon",
  "bowl",
  "ask",
  "candle",
  "rose",
  "smoke",
  "spark",
] as const;

export function ProductContent() {
  return (
    <section
      id={siteConfig.anchors.content}
      className="section-spacing scroll-mt-28 surface-vinho text-marfim md:scroll-mt-32"
    >
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p data-reveal className="eyebrow text-dourado">
            {productPraticas.eyebrow}
          </p>
          <h2
            data-reveal
            data-reveal-delay="1"
            className="font-display section-headline mt-4"
          >
            {productPraticas.h2}
          </h2>
          <p data-reveal className="lead-text mt-8 text-bege">
            {productPraticas.body}
          </p>
          <p
            data-reveal
            className="font-display mt-4 text-[1.55rem] italic leading-snug text-ouro-claro md:text-[1.85rem]"
          >
            {productPraticas.focus}
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl md:mt-16">
          <p data-reveal className="eyebrow text-center text-dourado">
            {productPraticas.layersLead}
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {productPraticas.layers.map((layer, index) => (
              <li
                key={layer}
                className="ritual-card flex items-center gap-4 px-5 py-4"
              >
                <span className="icon-seal">
                  <PombagiraIcon name={layerIcons[index]} />
                </span>
                <span className="font-display text-[1.25rem] leading-snug text-marfim md:text-[1.4rem]">
                  {layer}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p
          data-reveal
          className="font-display mt-16 text-center text-[1.55rem] leading-snug text-marfim md:mt-20 md:text-[1.85rem]"
        >
          {productPraticas.galleryLead}
        </p>
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <EditorialImage
            image={landingImages.practicesThumb}
            aspect="aspect-[4/5]"
          />
          <EditorialImage
            image={landingImages.practicesInside01}
            aspect="aspect-[4/5]"
          />
          <EditorialImage
            image={landingImages.practicesInside02}
            aspect="aspect-[4/5]"
          />
        </div>

        <div data-reveal className="mt-12 text-center md:mt-14">
          <CheckoutButton planId="practice" className="w-full sm:w-auto">
            {productPraticas.cta}
          </CheckoutButton>
        </div>
      </div>
    </section>
  );
}
