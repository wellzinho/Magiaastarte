import { painSection } from "@/data/landing-content";

export function PainSection() {
  return (
    <section className="section-spacing surface-vinho text-marfim">
      <div className="section-shell max-w-2xl">
        <h2
          data-reveal
          className="font-display section-headline text-marfim"
        >
          {painSection.h2}
        </h2>

        <div className="mt-8 max-w-xl space-y-5">
          {painSection.body.map((paragraph) => (
            <p
              key={paragraph}
              data-reveal
              className="text-[1.125rem] leading-relaxed text-bege md:text-[1.2rem]"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <p
          data-reveal
          className="mt-10 border-l-2 border-dourado/55 pl-5 font-display text-[1.45rem] leading-snug text-ouro-claro md:pl-6 md:text-[1.75rem]"
        >
          {painSection.bridge}
        </p>

        <p
          data-reveal
          className="mt-8 max-w-xl text-[1.125rem] leading-relaxed text-bege md:text-[1.2rem]"
        >
          {painSection.closing}
        </p>
      </div>
    </section>
  );
}
