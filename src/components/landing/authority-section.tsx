import { landingImages } from "@/config/landing-images";
import { authoritySection } from "@/data/landing-content";
import { EditorialImage } from "@/components/ui/editorial-image";
import { ProofGallery } from "@/components/ui/proof-gallery";

export function AuthoritySection() {
  return (
    <section className="section-spacing surface-light">
      <div className="section-shell">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:order-2 lg:col-span-6">
            <EditorialImage
              image={landingImages.authority}
              light
              aspect="aspect-[4/5]"
            >
              <p className="authority-mark">{authoritySection.badge}</p>
            </EditorialImage>
          </div>

          <div className="flex min-w-0 flex-col justify-center text-center lg:order-1 lg:col-span-6 lg:text-left">
            <p data-reveal className="eyebrow text-vermelho">
              {authoritySection.eyebrow}
            </p>
            <h2
              data-reveal
              data-reveal-delay="1"
              className="font-display section-headline mt-5 text-vinho"
            >
              {authoritySection.h2}
            </h2>
            <ul className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {authoritySection.questions.map((question) => (
                <li key={question} className="ritual-card-light px-5 py-5">
                  <p className="font-display text-[1.35rem] italic leading-snug text-vermelho md:text-[1.55rem]">
                    {question}
                  </p>
                </li>
              ))}
            </ul>
            <p data-reveal className="lead-text mt-8 text-vinho/80">
              {authoritySection.body}
            </p>
            <p
              data-reveal
              className="font-display mt-5 text-[1.55rem] leading-snug text-vinho md:text-[1.85rem]"
            >
              {authoritySection.closing}
            </p>
          </div>
        </div>

        <div className="mt-20 border-t border-vinho/10 pt-14 text-center md:mt-24 md:pt-16">
          <h3
            data-reveal
            className="font-display mx-auto max-w-2xl text-[1.75rem] leading-tight text-vinho md:text-4xl"
          >
            {authoritySection.proofH3}
          </h3>
          <ProofGallery items={authoritySection.prints} className="mx-auto" />
        </div>
      </div>
    </section>
  );
}
