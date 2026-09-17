import Image from "next/image";
import type { ReactNode } from "react";
import type { LandingImage } from "@/config/landing-images";

type EditorialImageProps = {
  image: LandingImage;
  light?: boolean;
  className?: string;
  aspect?: string;
  preload?: boolean;
  children?: ReactNode;
};

export function EditorialImage({
  image,
  light = false,
  className = "",
  aspect = "aspect-[4/5]",
  preload = false,
  children,
}: EditorialImageProps) {
  const frame = light ? "photo-frame-light" : "photo-frame";
  const overlayClass = children ? "has-photo-caption" : "";

  if (!image.src) {
    return (
      <div
        data-reveal="image"
        className={`${frame} ${overlayClass} ${aspect} flex w-full items-center justify-center px-6 text-center ${className}`.trim()}
        aria-hidden="true"
      >
        <p className="font-display text-xl tracking-wide text-dourado/70 md:text-2xl">
          [{image.placeholder}]
        </p>
      </div>
    );
  }

  return (
    <div
      data-reveal="image"
      className={`${frame} ${overlayClass} relative ${aspect} w-full ${className}`.trim()}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        preload={preload}
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="object-cover object-center"
      />
      {children ? (
        <div className="photo-caption">
          {children}
        </div>
      ) : null}
    </div>
  );
}
