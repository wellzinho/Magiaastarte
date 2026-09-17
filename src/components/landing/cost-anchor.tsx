import { getCheckoutHref } from "@/config/checkout";
import { costAnchor } from "@/data/landing-content";
import { Button } from "@/components/ui/button";
import { PombagiraIcon } from "@/components/ui/pombagira-icon";

const sequenceIcons = [
  "search",
  "spark",
  "search",
  "ask",
  "spark",
  "bookmark",
  "path",
] as const;

const bodyIcons = ["search", "spark", "bowl"] as const;

export function CostAnchor() {
  const bodyCards = costAnchor.body.split("\n\n");

  return (
    <section className="section-spacing-xl surface-preto text-marfim">
      <div className="section-shell">
        <div className="text-center">
          <p data-reveal className="eyebrow !text-[0.9375rem] tracking-[0.14em] text-dourado md:!text-[1.0625rem] lg:!text-[1.125rem]">
            {costAnchor.eyebrow}
          </p>
        </div>

        <div className="relative mx-auto mt-16 max-w-md md:mt-20">
          <div
            className="absolute left-8 top-6 bottom-6 w-px bg-gradient-to-b from-dourado/50 via-dourado/15 to-transparent"
            aria-hidden
          />
          <div className="flex flex-col gap-3">
            {costAnchor.sequence.map((step, index) => {
              const isQuote = step.includes("“");
              return (
                <div
                  key={step}
                  data-reveal
                  {...(index > 0
                    ? { "data-reveal-delay": String(Math.min(index, 5)) }
                    : {})}
                  className="ritual-card relative flex items-start gap-4 px-5 py-5"
                >
                  <span className="icon-seal mt-0.5">
                    <PombagiraIcon name={sequenceIcons[index]} />
                  </span>
                  <p
                    className={
                      isQuote
                        ? "font-display whitespace-pre-line text-[1.55rem] italic leading-tight text-marfim md:text-[1.85rem]"
                        : "lead-text pt-1 text-bege"
                    }
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-2xl text-center md:mt-32">
          <p data-reveal className="font-display display-statement text-marfim">
            {costAnchor.h2Lead}
          </p>
          <p
            data-reveal
            data-reveal-delay="1"
            className="font-display display-statement mt-5 text-marfim"
          >
            {costAnchor.h2[0]}{" "}
            <span className="italic text-dourado">{costAnchor.h2[1]}</span>
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-3 md:mt-16">
          {bodyCards.map((block, index) => (
            <article
              key={block}
              data-reveal
              className="ritual-card flex items-center gap-5 px-6 py-6 md:px-8 md:py-7"
            >
              <span className="icon-seal">
                <PombagiraIcon name={bodyIcons[index]} />
              </span>
              <p className="font-display whitespace-pre-line text-[1.45rem] leading-snug italic text-marfim md:text-[1.75rem]">
                {block}
              </p>
            </article>
          ))}
        </div>

        <div
          data-reveal
          className="ritual-card mx-auto mt-16 max-w-lg px-6 py-9 text-center md:mt-20 md:px-10 md:py-12"
        >
          <p className="font-display whitespace-pre-line text-[1.85rem] leading-tight text-ouro-claro md:text-4xl">
            {costAnchor.highlight}
          </p>
          <p className="microcopy mt-5 text-bege">{costAnchor.paymentNote}</p>
          <p className="font-display mt-8 whitespace-pre-line text-[1.45rem] leading-snug text-marfim md:text-[1.85rem]">
            {costAnchor.closing}
          </p>
          <div className="mt-8">
            <Button href={getCheckoutHref("practice")} className="w-full">
              {costAnchor.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
