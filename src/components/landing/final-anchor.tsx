import { getCheckoutHref } from "@/config/checkout";
import { finalAnchor } from "@/data/landing-content";
import { Button } from "@/components/ui/button";
import { PombagiraIcon } from "@/components/ui/pombagira-icon";

export function FinalAnchor() {
  const { offer } = finalAnchor;
  const [headline, quote] = finalAnchor.h2.split("\n\n");

  return (
    <section className="section-spacing-xl surface-vinho text-marfim">
      <div className="section-shell max-w-3xl py-6 md:py-12">
        <div className="text-center">
          <p data-reveal className="eyebrow text-dourado">
            {finalAnchor.eyebrow}
          </p>

          <h2
            data-reveal
            data-reveal-delay="1"
            className="font-display section-headline mt-6 whitespace-pre-line"
          >
            <span className="block">{headline}</span>
            <span className="mt-6 block italic text-ouro-claro">{quote}</span>
          </h2>
        </div>

        <div className="ritual-card-light mx-auto mt-14 max-w-md px-8 py-10 text-center">
          <span className="icon-seal-light mx-auto">
            <PombagiraIcon name="trident" className="h-6 w-6" />
          </span>
          {finalAnchor.body.split("\n").map((line, index) => (
            <p
              key={line}
              className={
                index === 0
                  ? "font-display mt-5 text-[1.85rem] leading-tight italic text-vermelho md:text-4xl"
                  : "font-display mt-3 text-[1.85rem] leading-tight text-vinho md:text-4xl"
              }
            >
              {line}
            </p>
          ))}
          <p className="mt-6 text-[1.0625rem] leading-relaxed text-vinho/70">
            {offer.box} — {offer.boxPrice}
          </p>
          <div className="mt-8">
            <Button
              href={getCheckoutHref("autonomy")}
              variant="wine"
              className="w-full sm:w-auto"
            >
              {finalAnchor.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
