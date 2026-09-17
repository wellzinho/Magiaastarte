import Link from "next/link";
import { siteConfig } from "@/config/site";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`font-display text-lg tracking-wide text-current md:text-xl ${className}`.trim()}
      aria-label={`${siteConfig.name} — início`}
    >
      {siteConfig.name}
    </Link>
  );
}
