import Link from "next/link";
import { siteConfig } from "@/config/site";
import { footerDisclaimer } from "@/data/landing-content";
import { Logo } from "@/components/ui/logo";
import { SocialLinks } from "@/components/ui/social-links";

export function SiteFooter() {
  return (
    <footer className="border-t border-dourado/15 surface-preto py-14">
      <div className="section-shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-bege">{siteConfig.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <nav aria-label="Links legais">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-bege">
                <li>
                  <Link
                    href={siteConfig.urls.terms}
                    className="transition-colors hover:text-marfim"
                  >
                    Termos
                  </Link>
                </li>
                <li>
                  <Link
                    href={siteConfig.urls.privacy}
                    className="transition-colors hover:text-marfim"
                  >
                    Privacidade
                  </Link>
                </li>
              </ul>
            </nav>
            <SocialLinks className="text-bege" />
          </div>
        </div>
        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-bege/85">
          {footerDisclaimer}
        </p>
      </div>
    </footer>
  );
}
