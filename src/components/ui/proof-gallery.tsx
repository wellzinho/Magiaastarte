import Image from "next/image";

export type ProofPrint = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type ProofGalleryProps = {
  items: readonly ProofPrint[];
  className?: string;
};

export function ProofGallery({ items, className = "" }: ProofGalleryProps) {
  return (
    <ul className={`mt-12 flex w-full max-w-lg flex-col gap-5 ${className}`.trim()}>
      {items.map((item) => (
        <li key={item.src}>
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
      ))}
    </ul>
  );
}
