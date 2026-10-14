"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { landingImages } from "@/config/landing-images";
import { offerSection } from "@/data/landing-content";

export function OfferGallery() {
  const labelId = useId();
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const slides = offerSection.gallery;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onScroll = () => {
      const width = scroller.clientWidth;
      if (width <= 0) return;
      const next = Math.round(scroller.scrollLeft / width);
      setIndex(Math.min(Math.max(next, 0), slides.length - 1));
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  const goTo = (next: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const clamped = Math.min(Math.max(next, 0), slides.length - 1);
    scroller.scrollTo({
      left: clamped * scroller.clientWidth,
      behavior: "smooth",
    });
    setIndex(clamped);
  };

  return (
    <div className="mx-auto mt-12 max-w-xl md:mt-14" data-reveal>
      <header className="text-center">
        <h3
          id={labelId}
          className="font-display text-[1.45rem] leading-tight text-vinho md:text-[1.7rem]"
        >
          {offerSection.galleryTitle}
        </h3>
      </header>

      <div className="relative mt-5">
        <ul
          ref={scrollerRef}
          aria-labelledby={labelId}
          aria-roledescription="carrossel"
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-[1.25rem] border border-vinho/12 bg-bege/40 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide) => {
            const image = landingImages[slide.imageKey];
            return (
              <li
                key={image.src}
                className="w-full shrink-0 snap-center"
                aria-roledescription="slide"
              >
                <figure className="px-3 pb-4 pt-3 md:px-4 md:pb-5 md:pt-4">
                  <div className="photo-frame-light relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 640px) 36rem, 100vw"
                      className="object-cover object-center"
                    />
                  </div>
                  <figcaption className="mt-3 text-center text-[0.95rem] leading-snug text-vinho/75">
                    {slide.caption}
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-full border border-vinho/18 bg-white/70 px-4 py-2 text-[0.75rem] font-semibold tracking-[0.1em] text-vinho uppercase transition-colors hover:border-vermelho hover:text-vermelho disabled:opacity-35"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Página anterior do material"
          >
            Anterior
          </button>

          <div className="flex items-center gap-2" aria-hidden>
            {slides.map((slide, i) => (
              <button
                key={slide.imageKey}
                type="button"
                aria-label={`Ir para a imagem ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-vermelho" : "w-2 bg-vinho/25"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            className="rounded-full border border-vinho/18 bg-white/70 px-4 py-2 text-[0.75rem] font-semibold tracking-[0.1em] text-vinho uppercase transition-colors hover:border-vermelho hover:text-vermelho disabled:opacity-35"
            onClick={() => goTo(index + 1)}
            disabled={index === slides.length - 1}
            aria-label="Próxima página do material"
          >
            Próxima
          </button>
        </div>

        <p className="sr-only" aria-live="polite">
          Imagem {index + 1} de {slides.length}
        </p>
      </div>
    </div>
  );
}
