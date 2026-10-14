import { painSection } from "@/data/landing-content";

function DesireLine({
  text,
  emphasis,
}: {
  text: string;
  emphasis?: string;
}) {
  if (!emphasis || !text.includes(emphasis)) {
    return <>{text}</>;
  }

  const index = text.indexOf(emphasis);
  return (
    <>
      {text.slice(0, index)}
      <span className="font-medium text-marfim">{emphasis}</span>
      {text.slice(index + emphasis.length)}
    </>
  );
}

function ClosingLine({ text, productName }: { text: string; productName: string }) {
  if (!text.includes(productName)) {
    return <>{text}</>;
  }

  const index = text.indexOf(productName);
  return (
    <>
      {text.slice(0, index)}
      <span className="font-semibold text-marfim">{productName}</span>
      {text.slice(index + productName.length)}
    </>
  );
}

export function PainSection() {
  return (
    <section className="section-spacing surface-vinho text-marfim">
      <div className="section-shell max-w-5xl px-5 md:px-[var(--section-px)]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-0">
          {/* Desejo + identificação */}
          <div className="lg:col-span-6">
            <h2
              data-reveal
              className="font-display max-w-md text-[1.85rem] leading-[1.15] tracking-[-0.02em] text-marfim md:text-[2rem]"
            >
              <span className="block text-marfim/88">{painSection.h2Lead}</span>
              <span className="pain-message-bubble mt-4">
                {painSection.h2Bubble}
              </span>
              <span className="sr-only">.</span>
            </h2>

            <div className="mt-10 max-w-md space-y-2.5">
              {painSection.desires.map((line) => (
                <p
                  key={line}
                  data-reveal
                  className="text-[1.0625rem] leading-[1.5] text-bege/90 md:text-[1.125rem]"
                >
                  <DesireLine
                    text={line}
                    emphasis={
                      line.includes(painSection.desireEmphasis)
                        ? painSection.desireEmphasis
                        : undefined
                    }
                  />
                </p>
              ))}
            </div>

            <p
              data-reveal
              className="mt-8 max-w-md text-[1.0625rem] leading-[1.5] text-bege/80 md:text-[1.125rem]"
            >
              {painSection.transition}
            </p>
          </div>

          {/* Dúvida + resposta */}
          <div className="lg:col-span-6 lg:flex lg:items-start">
            <div
              data-reveal
              className="pain-doubt-card w-full max-w-lg"
            >
              <p className="text-[0.9375rem] leading-relaxed text-bege/75 md:text-[1rem]">
                {painSection.doubtLead}
              </p>
              <p className="font-display mt-3 text-[1.45rem] leading-snug text-ouro-claro md:text-[1.65rem]">
                “{painSection.doubtQuestion}”
              </p>
              <p className="mt-5 text-[1.0625rem] leading-[1.5] text-bege/85 md:text-[1.125rem]">
                <ClosingLine
                  text={painSection.closing}
                  productName={painSection.productName}
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
