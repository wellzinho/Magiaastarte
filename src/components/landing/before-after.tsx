import { landingImages } from "@/config/landing-images";
import { beforeAfter } from "@/data/landing-content";
import { EditorialImage } from "@/components/ui/editorial-image";
import { PombagiraIcon, type IconName } from "@/components/ui/pombagira-icon";
import { ProofGallery } from "@/components/ui/proof-gallery";

const beforeIcons = [
  "search",
  "bookmark",
  "ask",
  "search",
  "spark",
  "moon",
  "path",
] as const;

const afterIcons = [
  "heart",
  "rose",
  "star",
  "bowl",
  "trident",
  "candle",
  "ask",
] as const;

export function BeforeAfter() {
  return (
    <section>
      <div className="surface-vinho py-20 text-center md:py-28">
        <p data-reveal className="eyebrow text-dourado">
          {beforeAfter.eyebrow}
        </p>
        <h2
          data-reveal
          className="font-display section-headline section-shell mx-auto mt-5 max-w-2xl whitespace-pre-line text-marfim"
        >
          {beforeAfter.h2}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <FlowHalf
          label={beforeAfter.before.label}
          items={beforeAfter.before.items}
          icons={beforeIcons}
          tone="dark"
        />
        <FlowHalf
          label={beforeAfter.after.label}
          items={beforeAfter.after.items}
          icons={afterIcons}
          tone="light"
        />
      </div>

      <div className="surface-light py-16 md:py-20">
        <div className="section-shell mx-auto max-w-2xl">
          <EditorialImage image={landingImages.beforeAfter} light aspect="aspect-[10/11]" />
        </div>
      </div>

      <div className="surface-preto py-24 md:py-32">
        <div className="section-shell">
          <p
            data-reveal
            className="font-display display-statement mx-auto max-w-3xl whitespace-pre-line text-center text-marfim"
          >
            {beforeAfter.closing}
          </p>
          <h3
            data-reveal
            className="font-display mx-auto mt-16 max-w-xl whitespace-pre-line text-center text-[1.75rem] leading-tight text-ouro-claro md:text-4xl"
          >
            {beforeAfter.proofH2}
          </h3>
          <ProofGallery items={beforeAfter.prints} className="mx-auto" />
        </div>
      </div>
    </section>
  );
}

function FlowHalf({
  label,
  items,
  icons,
  tone,
}: {
  label: string;
  items: readonly string[];
  icons: readonly IconName[];
  tone: "dark" | "light";
}) {
  const isDark = tone === "dark";

  return (
    <div
      className={`px-6 py-16 md:px-10 md:py-24 ${
        isDark ? "surface-preto text-marfim" : "surface-light"
      }`}
    >
      <div className="mx-auto max-w-md">
        <p
          data-reveal
          className={`eyebrow !text-[1.125rem] tracking-[0.16em] md:!text-[1.35rem] lg:!text-[1.5rem] ${
            isDark ? "text-dourado" : "text-vermelho"
          }`}
        >
          {label}
        </p>
        <ol className="mt-8 space-y-3">
          {items.map((item, index) => (
            <li
              key={item}
              className={`flex flex-col items-center px-5 py-5 text-center ${
                isDark ? "ritual-card" : "ritual-card-light"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <span className={isDark ? "icon-seal" : "icon-seal-light"}>
                  <PombagiraIcon name={icons[index]} />
                </span>
                <span
                  className={`font-display text-xs tracking-[0.16em] ${
                    isDark ? "text-dourado/70" : "text-vermelho/70"
                  }`}
                >
                  0{index + 1}
                </span>
              </div>
              <p
                className={`mt-3 w-full text-center font-display text-[1.25rem] leading-snug md:text-[1.4rem] ${
                  isDark ? "text-marfim" : "text-vinho"
                }`}
              >
                {item.replace(/\n/g, " ")}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
