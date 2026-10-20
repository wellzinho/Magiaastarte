"use client";

import Image from "next/image";
import { useId, useState } from "react";

export type ProofPrint = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type ProofGalleryProps = {
  items: readonly ProofPrint[];
  className?: string;
  initialVisible?: number;
};

function ProofItem({ item }: { item: ProofPrint }) {
  return (
    <li>
      <figure className="proof-frame">
        <Image
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          sizes="(min-width: 512px) 512px, 100vw"
          className="h-auto w-full rounded-md"
        />
      </figure>
    </li>
  );
}

export function ProofGallery({
  items,
  className = "",
  initialVisible = 3,
}: ProofGalleryProps) {
  const extraId = useId();
  const [expanded, setExpanded] = useState(false);
  const visible = items.slice(0, initialVisible);
  const extra = items.slice(initialVisible);

  return (
    <div className={className}>
      <ul className="mt-12 flex w-full max-w-lg flex-col gap-5">
        {visible.map((item) => (
          <ProofItem key={item.src} item={item} />
        ))}
      </ul>

      {extra.length > 0 ? (
        <>
          <ul
            id={extraId}
            hidden={!expanded}
            className={
              expanded
                ? "mt-5 flex w-full max-w-lg flex-col gap-5"
                : "hidden"
            }
          >
            {extra.map((item) => (
              <ProofItem key={item.src} item={item} />
            ))}
          </ul>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="min-h-11 rounded-full border border-marfim/20 bg-white/5 px-5 py-2.5 text-[0.8125rem] font-semibold tracking-[0.08em] text-ouro-claro uppercase transition-colors hover:border-ouro-claro/50 hover:text-marfim"
              aria-expanded={expanded}
              aria-controls={extraId}
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? "Ver menos relatos" : "Ver mais relatos"}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
