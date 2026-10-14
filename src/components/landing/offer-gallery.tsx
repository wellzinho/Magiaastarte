"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { landingImages } from "@/config/landing-images";
import { offerSection } from "@/data/landing-content";

export function OfferGallery() {
  const counterId = useId();
  const scrollerRef = useRef<HTMLUListElement>(null);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const slides = offerSection.gallery;

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const openLightbox = (fromButton: HTMLButtonElement | null) => {
    openButtonRef.current = fromButton;
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    queueMicrotask(() => {
      openButtonRef.current?.focus();
    });
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) => Math.max(0, current - 1));
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) => Math.min(slides.length - 1, current + 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, slides.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({
      left: index * scroller.clientWidth,
      behavior: "auto",
    });
  }, [index, lightboxOpen]);

  const activeImage = landingImages[slides[index].imageKey];
  const counterLabel = `${index + 1} de ${slides.length}`;

  const onSlideKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    slideIndex: number,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIndex(slideIndex);
      openLightbox(event.currentTarget);
    }
  };

  return (
    <div className="w-full" data-reveal>
      <div className="relative">
        <ul
          ref={scrollerRef}
          aria-labelledby="offer-gallery-label"
          aria-describedby={counterId}
          aria-roledescription="carrossel"
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-[1rem] border border-vinho/10 bg-bege/30 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, slideIndex) => {
            const image = landingImages[slide.imageKey];
            return (
              <li
                key={image.src}
                className="w-full shrink-0 snap-center"
                aria-roledescription="slide"
                aria-label={`${slideIndex + 1} de ${slides.length}`}
              >
                <button
                  type="button"
                  className="block w-full cursor-zoom-in p-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado md:p-2.5"
                  onClick={(event) => {
                    setIndex(slideIndex);
                    openLightbox(event.currentTarget);
                  }}
                  onKeyDown={(event) => onSlideKeyDown(event, slideIndex)}
                  aria-label={`Ampliar página ${slideIndex + 1} de ${slides.length}: ${image.alt}`}
                >
                  <div className="relative aspect-[1122/1402] w-full overflow-hidden rounded-[0.65rem] bg-marfim">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 36rem, 100vw"
                      className="object-contain object-center"
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="min-h-11 rounded-full border border-vinho/18 bg-white/80 px-4 py-2.5 text-[0.75rem] font-semibold tracking-[0.1em] text-vinho uppercase transition-colors hover:border-vermelho hover:text-vermelho disabled:opacity-35"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Página anterior do material"
          >
            Anterior
          </button>

          <p
            id={counterId}
            className="min-w-[4.5rem] text-center text-[0.875rem] font-medium tracking-[0.04em] text-vinho/70"
            aria-live="polite"
          >
            {counterLabel}
          </p>

          <button
            type="button"
            className="min-h-11 rounded-full border border-vinho/18 bg-white/80 px-4 py-2.5 text-[0.75rem] font-semibold tracking-[0.1em] text-vinho uppercase transition-colors hover:border-vermelho hover:text-vermelho disabled:opacity-35"
            onClick={() => goTo(index + 1)}
            disabled={index === slides.length - 1}
            aria-label="Próxima página do material"
          >
            Próxima
          </button>
        </div>
      </div>

      {mounted &&
        lightboxOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-stretch justify-center bg-preto/88 p-3 sm:p-5"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeLightbox();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Página ampliada ${counterLabel}`}
              className="relative flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-[1rem] border border-marfim/15 bg-[#120c0e]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-marfim/10 px-3 py-2.5 sm:px-4">
                <p className="text-[0.875rem] font-medium tracking-[0.04em] text-marfim/80">
                  {counterLabel}
                </p>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeLightbox}
                  className="min-h-11 rounded-full border border-marfim/25 bg-marfim/10 px-4 text-[0.75rem] font-semibold tracking-[0.1em] text-marfim uppercase transition-colors hover:border-ouro-claro hover:text-ouro-claro"
                >
                  Fechar
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-auto overscroll-contain px-2 py-3 sm:px-4 sm:py-4">
                <div className="relative mx-auto aspect-[1122/1402] w-full max-w-3xl min-h-[min(70vh,36rem)]">
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    sizes="(min-width: 768px) 48rem, 100vw"
                    className="object-contain object-center"
                    priority
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-marfim/10 px-3 py-2.5 sm:px-4">
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-marfim/25 px-4 text-[0.75rem] font-semibold tracking-[0.1em] text-marfim uppercase disabled:opacity-35"
                  onClick={() => setIndex((current) => Math.max(0, current - 1))}
                  disabled={index === 0}
                  aria-label="Página anterior ampliada"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-marfim/25 px-4 text-[0.75rem] font-semibold tracking-[0.1em] text-marfim uppercase disabled:opacity-35"
                  onClick={() =>
                    setIndex((current) =>
                      Math.min(slides.length - 1, current + 1),
                    )
                  }
                  disabled={index === slides.length - 1}
                  aria-label="Próxima página ampliada"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
