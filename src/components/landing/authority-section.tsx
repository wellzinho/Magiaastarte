import { landingImages } from "@/config/landing-images";
import { authoritySection } from "@/data/landing-content";
import { EditorialImage } from "@/components/ui/editorial-image";
import { ProofGallery } from "@/components/ui/proof-gallery";

export function AuthoritySection() {
  return (
    <section className="section-spacing surface-vinho text-marfim">
      <div className="section-shell">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:order-2 lg:col-span-6 lg:h-full">
            <EditorialImage
              image={landingImages.authority}
              aspect="aspect-[4/5]"
              className="h-full"
            >
              <p className="authority-mark">{authoritySection.badge}</p>
              <p className="mt-3 max-w-sm whitespace-pre-line text-bege">
                {authoritySection.badgeNote}
              </p>
            </EditorialImage>
          </div>

          <div className="flex min-w-0 flex-col justify-center text-center lg:order-1 lg:col-span-6">
            <p data-reveal className="eyebrow text-dourado">
              {authoritySection.eyebrow}
            </p>
            <h2
              data-reveal
              data-reveal-delay="2"
              className="font-display section-headline mt-6 w-full whitespace-pre-line"
            >
              {authoritySection.h2}
            </h2>
            <p
              data-reveal
              className="lead-text mt-8 w-full whitespace-pre-line text-bege"
            >
              {authoritySection.body}
            </p>
            <p data-reveal className="mt-8 w-full whitespace-pre-line text-marfim">
              {authoritySection.shift}
            </p>
            <p data-reveal className="mt-4 w-full whitespace-pre-line text-marfim">
              {authoritySection.but}
            </p>
            <ul className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {authoritySection.questions.map((question) => (
                <li key={question} className="ritual-card px-5 py-5">
                  <p className="font-display text-[1.45rem] italic leading-snug text-ouro-claro md:text-[1.65rem]">
                    {question}
                  </p>
                </li>
              ))}
            </ul>
            <p
              data-reveal
              className="font-display mt-12 w-full text-[1.75rem] leading-snug md:text-4xl"
            >
              {authoritySection.closing}
            </p>
          </div>
        </div>

        <div className="mt-24 border-t border-dourado/16 pt-16 text-center">
          <h3
            data-reveal
            className="font-display display-statement mx-auto max-w-2xl whitespace-pre-line italic text-ouro-claro"
          >
            {authoritySection.proofH3}
          </h3>
          <ProofGallery items={authoritySection.prints} className="mx-auto" />
        </div>
      </div>
    </section>
  );
}
