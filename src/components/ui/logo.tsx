import Link from "next/link";
import { siteConfig } from "@/config/site";

type LogoProps = {
  className?: string;
  /** Use a hash on the landing so the page query (UTMs) is never rewritten. */
  href?: string;
};

export function Logo({ className = "", href = "#inicio" }: LogoProps) {
  const classes =
    `font-display text-lg tracking-wide text-current md:text-xl ${className}`.trim();
  const label = `${siteConfig.name} — início`;

  if (href.startsWith("#") || href.startsWith("http")) {
    return (
      <a href={href} className={classes} aria-label={label}>
        {siteConfig.name}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={label}>
      {siteConfig.name}
    </Link>
  );
}
