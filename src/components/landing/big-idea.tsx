import { bigIdea } from "@/data/landing-content";

export function BigIdea() {
  const [line0Lead, line0Rest] = bigIdea.lines[0].split("30 práticas salvas");
  const [supportLead, supportRest] = bigIdea.support.split("\n\n");

  return (
    <section className="section-spacing surface-light">
      <div className="section-shell max-w-3xl py-8 md:py-20">
        <article
          data-reveal
          className="ritual-card px-6 py-9 text-marfim md:px-12 md:py-14"
        >
          <p className="font-display display-statement whitespace-pre-line">
            {line0Lead}
            <span className="italic text-ouro-claro">30 práticas salvas</span>
            {line0Rest}
          </p>
        </article>

        <article
          data-reveal
          data-reveal-delay="1"
          className="ritual-card-light mt-4 px-6 py-9 md:px-12 md:py-14"
        >
          <p className="font-display display-statement whitespace-pre-line italic text-vermelho">
            {bigIdea.lines[1]}
          </p>
        </article>

        <div
          data-reveal
          data-reveal-delay="2"
          className="mt-10 px-2 text-center md:mt-14"
        >
          <p className="font-display whitespace-pre-line text-[1.75rem] leading-tight text-vinho md:text-4xl">
            {supportLead}
          </p>
          {supportRest ? (
            <p className="font-display mt-5 whitespace-pre-line text-[1.45rem] leading-snug italic text-vermelho md:text-[1.85rem]">
              {supportRest}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
