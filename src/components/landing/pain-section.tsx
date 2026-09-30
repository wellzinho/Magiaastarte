import { landingImages } from "@/config/landing-images";
import { painSection } from "@/data/landing-content";
import { EditorialImage } from "@/components/ui/editorial-image";
import { PombagiraIcon } from "@/components/ui/pombagira-icon";

const triggerIcons = ["heart", "glass", "rose", "candle"] as const;

export function PainSection() {
  return (
    <section className="section-spacing-xl surface-vinho text-marfim">
      <div className="section-shell">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="min-w-0 lg:col-span-6">
            <h2
              data-reveal
              className="font-display section-headline max-w-xl text-marfim"
            >
              {painSection.h2}
            </h2>

            <ul data-reveal data-reveal-delay="1" className="mt-10 space-y-3">
              {painSection.triggers.map((line, index) => (
                <li
                  key={line}
                  className="ritual-card flex items-center gap-4 px-5 py-4"
                >
                  <span className="icon-seal">
                    <PombagiraIcon name={triggerIcons[index]} />
                  </span>
                  <p className="font-display text-[1.35rem] leading-snug text-ouro-claro md:text-[1.55rem]">
                    {line}
                  </p>
                </li>
              ))}
            </ul>

            <div data-reveal className="mt-8 space-y-1.5">
              {painSection.search.map((line) => (
                <p key={line} className="lead-text text-bege">
                  {line}
                </p>
              ))}
            </div>

            <p
              data-reveal
              className="font-display mt-8 text-[1.75rem] italic leading-tight text-marfim md:text-[2.15rem]"
            >
              {painSection.gap}
            </p>
            <ul data-reveal className="mt-4 space-y-1.5">
              {painSection.gapDetails.map((line) => (
                <li key={line} className="text-[1.0625rem] leading-relaxed text-bege/85">
                  {line}
                </li>
              ))}
            </ul>

            <div
              data-reveal
              className="ritual-card mt-10 px-6 py-6 md:px-7 md:py-7"
            >
              <p className="lead-text text-bege">{painSection.closing[0]}</p>
              <p className="font-display mt-2 text-[1.65rem] leading-snug text-ouro-claro md:text-[1.95rem]">
                {painSection.closing[1]}
              </p>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-6">
            <EditorialImage image={landingImages.problem} aspect="aspect-[4/5]" />
          </div>
        </div>
      </div>
    </section>
  );
}
