import { landingImages } from "@/config/landing-images";
import { beforeAfter } from "@/data/landing-content";
import { EditorialImage } from "@/components/ui/editorial-image";
import { PombagiraIcon, type IconName } from "@/components/ui/pombagira-icon";
import { ProofGallery } from "@/components/ui/proof-gallery";

export function BeforeAfter() {
  const [complementLead, complementRest] = beforeAfter.complement.split("\n");

  return (
    <section>
      <div className="surface-vinho py-20 text-center md:py-28">
        <h2
          data-reveal
          className="font-display section-headline section-shell mx-auto max-w-3xl text-marfim"
        >
          {beforeAfter.h2}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <Half
          label={beforeAfter.before.label}
          text={beforeAfter.before.text}
          icon="search"
          tone="dark"
        />
        <Half
          label={beforeAfter.after.label}
          text={beforeAfter.after.text}
          icon="candle"
          tone="light"
        />
      </div>

      <div className="surface-light py-16 md:py-20">
        <div className="section-shell mx-auto max-w-3xl text-center">
          <h3
            data-reveal
            className="font-display section-headline text-vinho"
          >
            <span className="block">{complementLead}</span>
            <span className="mt-3 block italic text-vermelho">
              {complementRest}
            </span>
          </h3>
          <div className="mt-10">
            <EditorialImage
              image={landingImages.beforeAfter}
              light
              aspect="aspect-[10/11]"
            />
          </div>
        </div>
      </div>

      <div className="surface-preto py-24 md:py-32">
        <div className="section-shell">
          <h3
            data-reveal
            className="font-display mx-auto max-w-2xl text-center text-[1.75rem] leading-tight text-ouro-claro md:text-4xl"
          >
            {beforeAfter.proofH2}
          </h3>
          <ProofGallery items={beforeAfter.prints} className="mx-auto" />
        </div>
      </div>
    </section>
  );
}

function Half({
  label,
  text,
  icon,
  tone,
}: {
  label: string;
  text: string;
  icon: IconName;
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
        <div className="flex items-center gap-3">
          <span className={isDark ? "icon-seal" : "icon-seal-light"}>
            <PombagiraIcon name={icon} />
          </span>
          <p
            data-reveal
            className={`eyebrow !text-[1rem] tracking-[0.16em] md:!text-[1.125rem] ${
              isDark ? "text-dourado" : "text-vermelho"
            }`}
          >
            {label}
          </p>
        </div>
        <p
          data-reveal
          className={`font-display mt-6 text-[1.45rem] leading-snug md:text-[1.7rem] ${
            isDark ? "text-marfim" : "text-vinho"
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
