import Link from "next/link";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "wine";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-dourado text-preto border border-dourado/90 hover:bg-ouro-claro hover:border-ouro-claro hover:shadow-[0_10px_30px_rgba(195,160,100,0.18)]",
  secondary:
    "bg-transparent text-marfim border border-dourado/40 hover:border-dourado/65 hover:bg-vinho/40",
  outline:
    "bg-transparent text-marfim border border-marfim/25 hover:border-dourado/50 hover:bg-white/5",
  wine:
    "bg-vermelho text-marfim border border-vermelho hover:bg-bordo hover:border-bordo",
};

type ButtonBaseProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };

type ButtonAsLink = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "inline-grid min-h-[52px] min-w-0 place-items-center rounded-full px-6 py-3.5 text-center text-[0.875rem] font-semibold uppercase leading-snug tracking-[0.08em] text-balance transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dourado disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 active:scale-[.985] md:min-h-[3.35rem] md:px-7 md:text-[0.9375rem] motion-reduce:transform-none motion-reduce:hover:transform-none";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = `${base} ${variantClasses[variant]} ${className}`.trim();

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkProps } = rest;
    const isExternal = href.startsWith("http");
    if (isExternal) {
      return (
        <a href={href} className={classes} {...linkProps}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } =
    rest as ComponentPropsWithoutRef<"button">;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
