import { trustSection } from "@/data/landing-content";
import { ProofGallery } from "@/components/ui/proof-gallery";

export function AuthoritySection() {
  return (
    <section className="section-spacing surface-preto text-marfim">
      <div className="section-shell max-w-3xl">
        <h2
          data-reveal
          className="font-display section-headline text-center text-ouro-claro"
        >
          {trustSection.h2}
        </h2>
        <div
          data-reveal
          className="mx-auto mt-6 max-w-2xl space-y-3 text-center"
        >
          {trustSection.body.map((paragraph) => (
            <p
              key={paragraph}
              className="text-[1.0625rem] leading-relaxed text-bege md:text-[1.125rem]"
            >
              {paragraph}
            </p>
          ))}
        </div>
        <ProofGallery items={trustSection.prints} className="mx-auto" />
      </div>
    </section>
  );
}
