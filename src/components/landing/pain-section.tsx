import { landingImages } from "@/config/landing-images";
import { painSection } from "@/data/landing-content";
import { EditorialImage } from "@/components/ui/editorial-image";
import { PombagiraIcon } from "@/components/ui/pombagira-icon";

export function PainSection() {
  const saveLines = painSection.body.slice(0, 4);
  const thinkLines = painSection.body.slice(4);

  return (
    <section className="section-spacing-xl surface-vinho text-marfim">
      <div className="section-shell">
        <p data-reveal className="eyebrow text-dourado">
          {painSection.eyebrow}
        </p>
        <h2
          data-reveal
          data-reveal-delay="1"
          className="font-display section-headline mt-4 max-w-2xl whitespace-pre-line"
        >
          {painSection.h2}
        </h2>

        <div data-reveal className="mt-12 max-w-xl md:mt-16">
          <ul className="space-y-3">
            {saveLines.map((line, index) => (
              <li key={line} className="ritual-card flex items-center gap-4 px-5 py-4">
                <span className="icon-seal">
                  <PombagiraIcon name={(["bookmark", "bowl", "glass", "ask"] as const)[index]} />
                </span>
                <p className="lead-text text-bege">{line}</p>
                <span className="ml-auto font-display text-sm text-dourado/50">
                  0{index + 1}
                </span>
              </li>
            ))}
          </ul>
          <div className="ritual-card mt-3 px-5 py-6">
            {thinkLines.map((line) => (
              <p
                key={line}
                className={
                  line.startsWith("“")
                    ? "font-display mt-2 text-[1.85rem] italic leading-tight text-ouro-claro md:text-[2.15rem]"
                    : "lead-text text-marfim"
                }
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <p data-reveal className="lead-text mt-12 text-marfim">
          {painSection.when}
        </p>
        <ul className="mt-6 grid max-w-2xl grid-cols-1 gap-3">
          {painSection.questions.map((question) => (
            <li key={question} className="ritual-card px-5 py-5">
              <p className="font-display text-[1.55rem] italic leading-snug text-ouro-claro md:text-[1.85rem]">
                {question}
              </p>
            </li>
          ))}
        </ul>

        <h2
          data-reveal
          className="font-display section-headline mt-24 max-w-2xl whitespace-pre-line md:mt-32"
        >
          {painSection.pauseH2}
        </h2>

        <div className="mx-auto mt-16 max-w-4xl md:mt-20">
          <EditorialImage image={landingImages.problem} aspect="aspect-[3/2]" />
        </div>

        <h2
          data-reveal
          className="font-display section-headline mt-24 max-w-2xl whitespace-pre-line md:mt-32"
        >
          {painSection.deepeningH2}
        </h2>
        <div data-reveal className="mt-10 max-w-xl space-y-3">
          {painSection.deepeningBody.map((line) => (
            <p
              key={line}
              className={
                line.startsWith("“")
                  ? "ritual-card px-5 py-5 font-display text-[1.65rem] italic text-ouro-claro"
                  : "lead-text text-bege"
              }
            >
              {line}
            </p>
          ))}
        </div>
        <p data-reveal className="lead-text mt-10 text-marfim">
          {painSection.want}
        </p>
        <p data-reveal className="ritual-card mt-4 max-w-xl px-6 py-6 font-display text-[1.85rem] italic leading-tight text-ouro-claro md:text-[2.35rem]">
          {painSection.wantQuote}
        </p>
        <p
          data-reveal
          className="font-display mt-16 max-w-2xl whitespace-pre-line text-[1.75rem] leading-tight md:text-4xl"
        >
          {painSection.spotlight}
        </p>
      </div>
    </section>
  );
}
