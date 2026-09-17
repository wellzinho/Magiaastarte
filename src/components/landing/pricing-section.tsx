import { getCheckoutHref, plans } from "@/config/checkout";
import { landingImages } from "@/config/landing-images";
import { siteConfig } from "@/config/site";
import { pricingSection } from "@/data/landing-content";
import { Button } from "@/components/ui/button";
import { EditorialImage } from "@/components/ui/editorial-image";

export function PricingSection() {
  const { boxAnchor, paymentNote } = pricingSection;

  return (
    <section
      id={siteConfig.anchors.pricing}
      className="section-spacing scroll-mt-28 surface-light md:scroll-mt-32"
    >
      <div className="section-shell">
        <header className="mx-auto max-w-3xl text-center">
          <h2
            data-reveal
            className="font-display section-headline-lg whitespace-pre-line"
          >
            {pricingSection.h2.split("\n").map((line, index) => (
              <span
                key={line}
                className={`block ${index === 1 ? "italic text-vermelho" : "text-vinho"}`}
              >
                {line}
              </span>
            ))}
          </h2>
          <div className="mt-10 grid grid-cols-1 items-stretch gap-4 md:mt-12 md:grid-cols-2 md:gap-5">
            {pricingSection.sub.split("\n\n").map((block, index) => {
              const lines = block.split("\n");
              const lead = lines[0];
              const rest = lines.slice(1).join("\n");
              const isBox = index === 1;
              const headline = isBox ? lead : rest;
              const support = isBox ? rest : lead;
              const image = isBox
                ? landingImages.completeBox
                : landingImages.practicesThumb;

              return (
                <article
                  key={block}
                  data-reveal
                  data-reveal-delay="1"
                  className={`flex h-full flex-col overflow-hidden text-center ${
                    isBox ? "ritual-card text-marfim" : "ritual-card-light"
                  }`}
                >
                  <EditorialImage
                    image={image}
                    light={!isBox}
                    aspect="aspect-[16/10]"
                    className="flush"
                  />
                  <div className="flex flex-1 flex-col justify-center px-6 py-6 md:px-7 md:py-7">
                    {!isBox ? (
                      <p className="font-display w-full text-[1.65rem] leading-snug text-vinho md:text-[1.95rem]">
                        {support.replace(/\n/g, " ")}
                      </p>
                    ) : null}
                    <p
                      className={`font-display w-full leading-tight ${
                        isBox
                          ? "text-[1.55rem] text-ouro-claro md:text-[1.75rem]"
                          : "mt-1 text-[2rem] italic text-vermelho md:text-[2.5rem]"
                      }`}
                    >
                      {headline.replace(/\n/g, " ")}
                    </p>
                    {isBox ? (
                      <p className="mt-3 w-full text-center text-[1.0625rem] leading-relaxed text-bege">
                        {support.replace(/\n/g, " ")}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </header>

        <div className="mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-12 lg:items-stretch">
          {pricingSection.options.map((option) => {
            const price = plans[option.id].priceDisplay;
            const isBox = Boolean(option.recommended);

            if (!isBox) {
              return (
                <article
                  key={option.id}
                  id={`${option.id}-opcao`}
                  data-reveal
                  className="plan-card flex flex-col p-8 text-marfim md:p-9 lg:col-span-5"
                >
                  <h3 className="font-display text-[1.7rem] leading-snug md:text-[1.85rem]">
                    {option.label}
                  </h3>
                  {option.title ? (
                    <p className="mt-5 font-medium text-bege">{option.title}</p>
                  ) : null}

                  {option.includes ? (
                    <ul className="mt-6 space-y-2.5">
                      {option.includes.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="shrink-0 text-dourado" aria-hidden>
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <p className="price-display mt-auto pt-10 text-dourado">{price}</p>
                  <p className="microcopy mt-3 text-bege">{paymentNote}</p>

                  <div className="mt-8">
                    <Button
                      href={getCheckoutHref(option.id)}
                      variant="secondary"
                      className="w-full"
                    >
                      {option.cta}
                    </Button>
                  </div>
                </article>
              );
            }

            return (
              <article
                key={option.id}
                id={`${option.id}-opcao`}
                data-reveal
                data-reveal-delay="1"
                className="plan-card-featured flex flex-col p-9 text-marfim md:p-12 lg:col-span-7"
              >
                <span className="inline-flex w-fit rounded-full bg-dourado px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-preto">
                  {option.badge}
                </span>

                <div className="mt-8">
                  <EditorialImage
                    image={landingImages.completeBox}
                    aspect="aspect-[4/5]"
                  />
                </div>

                <p className="font-display mt-8 w-full text-center text-[1.8rem] leading-snug md:text-4xl">
                  {option.headline?.replace(/\n/g, " ")}
                </p>

                {option.includes ? (
                  <ul className="mt-10 space-y-3">
                    {option.includes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="shrink-0 text-dourado" aria-hidden>
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <p className="font-display mt-12 whitespace-pre-line text-[1.7rem] leading-snug text-ouro-claro md:text-3xl">
                  {boxAnchor.big}
                </p>

                <p className="price-display-lg mt-7 text-dourado">{price}</p>
                <p className="microcopy mt-3 text-bege">{paymentNote}</p>

                <div className="mt-9">
                  <Button href={getCheckoutHref(option.id)} className="w-full">
                    {option.cta}
                  </Button>
                </div>

                <p className="font-display mt-8 whitespace-pre-line text-center text-[1.55rem] tracking-wide text-ouro-claro md:text-2xl">
                  {boxAnchor.micro}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
