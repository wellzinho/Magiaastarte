import { getCheckoutHref } from "@/config/checkout";
import { landingImages } from "@/config/landing-images";
import { hero } from "@/data/landing-content";
import { Button } from "@/components/ui/button";
import { EditorialImage } from "@/components/ui/editorial-image";
import { PombagiraIcon } from "@/components/ui/pombagira-icon";

const subIcons = ["heart", "bowl", "candle", "spark"] as const;

export function Hero() {
  const [subLead, subItemsBlock] = hero.subheadline.split("\n\n");
  const subItems = subItemsBlock.split("\n");

  return (
    <section
      id="inicio"
      className="hero-surface surface-light overflow-x-clip pb-24 pt-28 md:pb-32 md:pt-36"
    >
      <div className="section-shell">
        <div className="grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-16 lg:gap-y-8">
          <div className="min-w-0 lg:col-span-7">
            <p data-reveal className="eyebrow text-vermelho">
              {hero.eyebrow}
            </p>
            <h1
              data-reveal
              data-reveal-delay="1"
              className="font-display hero-headline mt-5 whitespace-pre-line text-vinho md:mt-6"
            >
              {hero.h1.split("\n\n").map((part, index) => (
                <span
                  key={part}
                  className={
                    index === 1 ? "mt-4 block italic text-vermelho" : "block"
                  }
                >
                  {part}
                </span>
              ))}
            </h1>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <p
              data-reveal
              data-reveal-delay="2"
              className="font-display text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-vermelho md:text-[2.15rem]"
            >
              {hero.productName}
            </p>
          </div>

          <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:row-span-3 lg:row-start-1">
            <div className="hero-object">
              <EditorialImage
                image={landingImages.hero}
                light
                aspect="aspect-[4/5]"
                preload
              />
            </div>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <p
              data-reveal
              data-reveal-delay="2"
              className="lead-text measure text-vinho/80"
            >
              {subLead}
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {subItems.map((item, index) => (
                <li
                  key={item}
                  data-reveal
                  className="ritual-card-light flex items-center gap-3 px-4 py-3.5"
                >
                  <span className="icon-seal-light">
                    <PombagiraIcon name={subIcons[index]} />
                  </span>
                  <span className="font-display text-[1.2rem] leading-snug text-vinho md:text-[1.35rem]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <div
              data-reveal
              data-reveal-delay="3"
              className="ritual-card-light mt-8 px-6 py-7 md:mt-10 md:px-8 md:py-8"
            >
              <p className="promise-line text-vermelho">{hero.highlight[0]}</p>
              <p className="font-display mt-4 whitespace-pre-line text-[1.75rem] leading-tight text-vinho md:text-4xl">
                {hero.highlight[1]}
              </p>
              <p className="font-display price-display mt-6 text-vinho">
                {hero.price}
              </p>
              <p className="microcopy mt-3 text-vinho/55">{hero.microcopy}</p>
              <div className="mt-5">
                <Button href={getCheckoutHref("practice")} className="w-full">
                  {hero.cta}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="hero-end" className="h-px w-full" aria-hidden="true" />
    </section>
  );
}
