import { siteConfig } from "@/config/site";
import { threeSteps } from "@/data/landing-content";
import { PombagiraIcon } from "@/components/ui/pombagira-icon";

const stepIcons = ["rose", "moon", "candle"] as const;

export function ThreeSteps() {
  return (
    <section
      id={siteConfig.anchors.howItWorks}
      className="section-spacing scroll-mt-28 surface-light md:scroll-mt-32"
    >
      <div className="section-shell">
        <p data-reveal className="eyebrow text-vermelho">
          {threeSteps.eyebrow}
        </p>
        <h2
          data-reveal
          className="font-display display-statement mt-4 max-w-xl whitespace-pre-line text-vinho"
        >
          {threeSteps.h2}
        </h2>

        <ol className="mt-14 grid grid-cols-1 gap-5 md:mt-20 lg:grid-cols-3 lg:items-stretch">
          {threeSteps.steps.map((step, index) => (
            <li
              key={step.title}
              data-reveal
              className="ritual-card-light relative flex flex-col overflow-hidden p-7 text-center md:p-8"
            >
              <span
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-vermelho/35 to-transparent"
                aria-hidden
              />
              <div className="flex items-center justify-center gap-3">
                <span className="icon-seal-light">
                  <PombagiraIcon name={stepIcons[index]} className="h-6 w-6" />
                </span>
                <span className="font-display text-sm tracking-[0.18em] text-vermelho/70">
                  {step.number}
                </span>
              </div>
              <h3 className="eyebrow mt-6 text-vermelho">{step.title}</h3>
              <StepCopy text={step.text} />
            </li>
          ))}
        </ol>

        <div
          data-reveal
          className="mt-12 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-2"
        >
          <div className="ritual-card-light px-6 py-7">
            <p className="eyebrow text-vinho/45">{threeSteps.closingLead}</p>
            <p className="font-display mt-3 text-[1.65rem] italic leading-snug text-vermelho md:text-[2rem]">
              {threeSteps.closingLess}
            </p>
          </div>
          <div className="ritual-card-light px-6 py-7">
            <p className="eyebrow text-vinho/45">{threeSteps.closingMoreLead}</p>
            <p className="font-display mt-3 text-[1.65rem] italic leading-snug text-vermelho md:text-[2rem]">
              {threeSteps.closingMore}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCopy({ text }: { text: string }) {
  const [lead, list] = text.split("\n\n");
  const lines = lead.split("\n");
  const headline = lines.length <= 2 ? lead : lines[0];
  const support = lines.length <= 2 ? [] : lines.slice(1);
  const items = list ? list.split("\n").filter(Boolean) : [];

  return (
    <div className="mt-4 flex flex-1 flex-col justify-center">
      <p className="font-display w-full text-[1.7rem] leading-[1.12] text-vinho md:text-[1.95rem]">
        {headline.replace(/\n/g, " ")}
      </p>
      {support.length > 0 ? (
        <p className="mt-3 w-full text-[1.0625rem] leading-relaxed text-vinho/68">
          {support.join(" ")}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className="mt-5 w-full space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center justify-center gap-3 rounded-full border border-vinho/8 bg-white/55 px-4 py-2.5"
            >
              <span className="mt-0.5 text-vermelho" aria-hidden>
                <PombagiraIcon name="rose" className="h-3.5 w-3.5" />
              </span>
              <span className="font-display text-[1.125rem] leading-snug text-vinho">
                {item}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
