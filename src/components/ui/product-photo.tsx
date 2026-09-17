import Image from "next/image";

type ProductPhotoProps = {
  src: string;
  alt: string;
  light?: boolean;
  className?: string;
};

export function ProductPhoto({
  src,
  alt,
  light = false,
  className = "",
}: ProductPhotoProps) {
  return (
    <div
      data-reveal="image"
      className={`${light ? "photo-frame-light" : "photo-frame"} relative aspect-[4/5] w-full ${className}`.trim()}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="object-cover object-center"
      />
    </div>
  );
}
