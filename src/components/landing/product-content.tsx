import { siteConfig } from "@/config/site";
import { getCheckoutHref } from "@/config/checkout";
import { landingImages } from "@/config/landing-images";
import {
  afterProductsCta,
  boxBridge,
  product49,
  productAudios,
  productErvas,
  productLua,
  productPraticas,
} from "@/data/landing-content";
import { Button } from "@/components/ui/button";
import { EditorialImage } from "@/components/ui/editorial-image";
import { PombagiraIcon } from "@/components/ui/pombagira-icon";

const layerIcons = [
  "heart",
  "moon",
  "bowl",
  "candle",
  "trident",
  "rose",
  "smoke",
  "ask",
] as const;

export function ProductContent() {
  return (
    <section id={siteConfig.anchors.content} className="scroll-mt-28 md:scroll-mt-32">
      <PraticasBand />
      <BoxBridgeBand />
      <CardsBand />
      <ErvasBand />
      <LuaBand />
    </section>
  );
}

function PraticasBand() {
  const [h2Lead, h2Rest] = productPraticas.h2.split("\n\n");
  const [closingLead, closingRest] = productPraticas.closing.split("\n\n");

  return (
    <div className="section-spacing surface-light">
      <div className="section-shell">
        <p data-reveal className="eyebrow text-center text-vermelho">
          {productPraticas.eyebrow}
        </p>
        <h2
          data-reveal
          data-reveal-delay="1"
          className="font-display section-headline mt-4 w-full text-center whitespace-pre-line"
        >
          <span className="block text-vinho">{h2Lead}</span>
          <span className="mt-3 block italic text-vermelho">{h2Rest}</span>
        </h2>
        <p
          data-reveal
          className="mt-8 w-full text-center text-vinho/75"
        >
          {productPraticas.body}
        </p>
        <p data-reveal className="font-display mt-8 w-full text-center text-[1.65rem] leading-snug text-vermelho md:text-[2rem]">
          {productPraticas.galleryLead}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 md:mt-14 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-7">
            <EditorialImage image={landingImages.practicesCover} light />
          </div>
          <div className="min-w-0 grid gap-8 lg:col-span-5">
            <EditorialImage
              image={landingImages.practicesInside01}
              light
              aspect="aspect-[4/5]"
            />
            <EditorialImage
              image={landingImages.practicesInside02}
              light
              aspect="aspect-[4/5]"
            />
          </div>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {productPraticas.layers.map((layer, index) => (
            <li
              key={layer}
              className="ritual-card-light flex items-center gap-4 px-5 py-4"
            >
              <span className="icon-seal-light">
                <PombagiraIcon name={layerIcons[index]} />
              </span>
              <span className="text-[0.78rem] font-bold tracking-[0.14em] text-vinho">
                {layer}
              </span>
            </li>
          ))}
        </ul>
        <div
          data-reveal
          className="ritual-card-light mt-12 max-w-xl px-6 py-8 md:px-8 md:py-10"
        >
          <p className="lead-text text-vinho/70">{closingLead}</p>
          <p className="font-display mt-4 max-w-md whitespace-pre-line text-[1.65rem] leading-snug italic text-vinho md:text-[2rem]">
            {closingRest}
          </p>
        </div>
      </div>
    </div>
  );
}

function BoxBridgeBand() {
  return (
    <div id="box-completo" className="section-spacing surface-preto text-marfim">
      <div className="section-shell max-w-3xl">
        <h2
          data-reveal
          className="font-display section-headline whitespace-pre-line"
        >
          {boxBridge.h2}
        </h2>
        <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {boxBridge.questions.map((question) => (
            <li key={question} className="ritual-card px-5 py-5">
              <p className="font-display text-[1.55rem] leading-snug italic text-ouro-claro md:text-[1.75rem]">
                {question}
              </p>
            </li>
          ))}
        </ul>
        <p
          data-reveal
          className="font-display mt-14 text-[1.75rem] leading-tight md:text-4xl"
        >
          {boxBridge.close}
        </p>
      </div>
    </div>
  );
}

function CardsBand() {
  const bodyLines = product49.body.split("\n");
  const bodyLead = bodyLines.slice(0, 2).join("\n");
  const bodyRest = bodyLines.slice(2).join("\n");
  const [closingLead, closingRest] = product49.closing.split("\n\n");
  const [titleLead, titleRest] = product49.h2.split("\n");

  return (
    <div className="section-spacing surface-light">
      <div className="section-shell">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-7">
            <EditorialImage image={landingImages.cards} light>
              <p className="eyebrow text-dourado">{product49.eyebrow}</p>
            </EditorialImage>
          </div>
          <div className="flex min-w-0 flex-col justify-center text-center lg:col-span-5">
            <h2
              data-reveal
              className="font-display section-headline w-full whitespace-pre-line"
            >
              <span className="block text-vinho">{titleLead}</span>
              <span className="mt-1 block italic text-vermelho">{titleRest}</span>
            </h2>
            <p
              data-reveal
              className="font-display mt-8 w-full text-[1.85rem] leading-[1.12] italic text-vinho md:text-[2.35rem]"
            >
              {bodyLead.replace(/\n/g, " ")}
            </p>
            <p
              data-reveal
              className="mt-3 w-full text-[1.0625rem] leading-relaxed text-vinho/65"
            >
              {bodyRest.replace(/\n/g, " ")}
            </p>
            <ul className="mt-8 w-full space-y-3">
              {product49.cards.map((card) => (
                <li key={card} className="ritual-card-light px-5 py-4">
                  <p className="font-display text-[1.45rem] leading-snug text-vinho md:text-[1.65rem]">
                    {card}
                  </p>
                </li>
              ))}
            </ul>
            <div className="ritual-card-light mt-10 w-full px-6 py-6 text-center">
              <p className="font-display w-full text-[1.35rem] leading-snug text-vermelho md:text-[1.5rem]">
                {closingLead}
              </p>
              <p className="font-display mt-3 w-full text-[1.55rem] leading-snug italic text-vinho md:text-[1.85rem]">
                {closingRest.replace(/\n/g, " ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErvasBand() {
  const [problem, solution] = productErvas.body.split("\n\n");
  const solutionLines = solution.split("\n");
  const productName = solutionLines[0];
  const solutionRest = solutionLines.slice(1).join("\n");
  const [h2Lead, h2Rest] = productErvas.h2.split("\n\n");

  return (
    <div className="section-spacing surface-vinho text-marfim">
      <div className="section-shell">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:order-2 lg:col-span-7">
            <EditorialImage image={landingImages.herbs}>
              <p className="eyebrow text-dourado">{productErvas.eyebrow}</p>
            </EditorialImage>
          </div>
          <div className="flex min-w-0 flex-col justify-center text-center lg:order-1 lg:col-span-5">
            <h2
              data-reveal
              className="font-display section-headline w-full whitespace-pre-line"
            >
              <span className="block">{h2Lead}</span>
              <span className="mt-1 block italic text-ouro-claro">{h2Rest}</span>
            </h2>
            <p
              data-reveal
              className="mt-8 w-full text-[1.0625rem] leading-relaxed text-bege/80"
            >
              {problem.replace(/\n/g, " ")}
            </p>
            <p
              data-reveal
              className="font-display mt-6 w-full text-[1.85rem] leading-[1.12] italic text-ouro-claro md:text-[2.35rem]"
            >
              {productName}
            </p>
            <p
              data-reveal
              className="mt-3 w-full text-center text-[1.0625rem] leading-relaxed text-bege"
            >
              {solutionRest.replace(/\n/g, " ")}
            </p>
            <div className="ritual-card mt-10 w-full px-6 py-6 text-center">
              <span className="icon-seal mx-auto">
                <PombagiraIcon name="bowl" />
              </span>
              <p className="font-display mt-4 w-full text-[1.55rem] leading-tight italic text-ouro-claro md:text-[1.85rem]">
                {productErvas.highlight.replace(/\n/g, " ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LuaBand() {
  const [before, turn, after] = productLua.body.split("\n\n");
  const subLines = productLua.sub.split("\n");
  const subLead = subLines[0];
  const subItems = subLines.slice(1, -1);
  const subTail = subLines[subLines.length - 1];

  return (
    <div className="section-spacing surface-preto text-marfim">
      <div className="section-shell">
        <p data-reveal className="eyebrow text-center text-dourado">
          {productLua.eyebrow}
        </p>
        <h2 className="sr-only">{productLua.questions.join(" ")}</h2>
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {productLua.questions.map((item, index) => (
            <li key={item} className="ritual-card px-5 py-5 text-center">
              <span className="icon-seal mx-auto">
                <PombagiraIcon name={(["moon", "spark", "rose", "star"] as const)[index]} />
              </span>
              <p className="font-display mt-4 text-[1.55rem] leading-snug md:text-[1.85rem]">
                {item}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-10 w-full text-center">
          <p
            data-reveal
            className="w-full text-center text-[1.0625rem] leading-relaxed text-bege/80"
          >
            {before.replace(/\n/g, " ")}
          </p>
          <p
            data-reveal
            className="font-display mt-5 w-full text-[1.85rem] leading-[1.12] text-ouro-claro md:text-[2.15rem]"
          >
            {turn}
          </p>
          <p
            data-reveal
            className="font-display mt-4 w-full text-center text-[1.55rem] leading-snug italic text-marfim md:text-[1.75rem]"
          >
            {after.replace(/\n/g, " ")}
          </p>
        </div>

        <article className="mt-16 overflow-hidden ritual-card">
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-7">
              <EditorialImage
                image={landingImages.moon}
                aspect="aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-full"
                className="flush h-full min-h-[22rem]"
              >
                <h3 className="font-display text-[1.85rem] leading-tight text-marfim md:text-4xl">
                  {productLua.name}
                </h3>
              </EditorialImage>
            </div>
            <div className="flex min-w-0 flex-col justify-center px-6 py-8 lg:col-span-5 md:px-10 md:py-12">
              <p className="max-w-[36ch] text-[1.0625rem] leading-relaxed text-bege/80">
                {subLead}
              </p>
              <ul className="mt-5 space-y-2">
                {subItems.map((item) => (
                  <li
                    key={item}
                    className="font-display text-[1.65rem] leading-snug italic text-ouro-claro md:text-[1.95rem]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 max-w-[32ch] text-[1.0625rem] leading-relaxed text-bege">
                {subTail}
              </p>
              <p className="font-display mt-8 max-w-md whitespace-pre-line text-[1.55rem] leading-tight italic text-ouro-claro md:text-[1.85rem]">
                {productLua.closing}
              </p>
            </div>
          </div>
        </article>

        <div className="ritual-card mx-auto mt-20 max-w-xl px-8 py-10 text-center">
          <span className="icon-seal mx-auto">
            <PombagiraIcon name="smoke" />
          </span>
          <p className="font-display mt-5 text-[1.65rem] text-ouro-claro md:text-3xl">
            {productAudios.benefit}
          </p>
          <p className="lead-text mx-auto mt-4 max-w-sm whitespace-pre-line text-bege">
            {productAudios.micro}
          </p>
          <div className="mt-8">
            <Button href={getCheckoutHref("autonomy")} className="w-full sm:w-auto">
              {afterProductsCta.cta}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
