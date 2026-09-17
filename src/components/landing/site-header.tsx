"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { SocialLinks } from "@/components/ui/social-links";

export function SiteHeader() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setCompact(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
      <div
        className={`nav-shell mx-auto flex max-w-[78rem] items-center justify-between rounded-full text-marfim ${
          compact ? "min-h-12 px-4 py-2 md:min-h-[3.25rem] md:px-5" : "min-h-14 px-5 py-2.5 md:min-h-16 md:px-6"
        }`}
      >
        <Logo />
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          <SocialLinks compact />
          <Button
            href={`#${siteConfig.anchors.pricing}`}
            variant="outline"
            className="!hidden !min-h-9 shrink-0 !px-4 !py-2 !text-[0.6875rem] !tracking-[0.08em] md:!inline-grid"
          >
            VER OPÇÕES
          </Button>
        </div>
      </div>
    </header>
  );
}
