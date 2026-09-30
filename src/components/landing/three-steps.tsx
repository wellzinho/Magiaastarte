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
        <div className="mx-auto max-w-3xl text-center">
          <p data-reveal className="eyebrow text-vermelho">
            {threeSteps.eyebrow}
          </p>
          <h2
            data-reveal
            data-reveal-delay="1"
            className="font-display section-headline mt-4 text-vinho"
          >
            {threeSteps.h2}
          </h2>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-5 md:mt-20 lg:grid-cols-3 lg:items-stretch">
          {threeSteps.steps.map((step, index) => (
            <li
              key={step.title}
              data-reveal
              data-reveal-delay={String(index)}
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
              <p className="font-display mt-4 text-[1.4rem] leading-snug text-vinho md:text-[1.6rem]">
                {step.text}
              </p>
            </li>
          ))}
        </ol>

        <p
          data-reveal
          className="font-display mx-auto mt-12 max-w-2xl text-center text-[1.65rem] italic leading-snug text-vermelho md:mt-16 md:text-[2rem]"
        >
          {threeSteps.closing}
        </p>
      </div>
    </section>
  );
}
