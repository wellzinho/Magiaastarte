import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { PainSection } from "@/components/landing/pain-section";
import { ProductContent } from "@/components/landing/product-content";
import { AuthoritySection } from "@/components/landing/authority-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { Faq } from "@/components/landing/faq";
import { SiteFooter } from "@/components/landing/site-footer";
import { StickyCta } from "@/components/landing/sticky-cta";
import { RevealObserver } from "@/components/ui/reveal-observer";
import { MetaViewContent } from "@/components/analytics/meta-view-content";

export default function Home() {
  return (
    <div className="pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <MetaViewContent />
      <RevealObserver />
      <SiteHeader />
      <main>
        <Hero />
        <PainSection />
        <ProductContent />
        <PricingSection />
        <AuthoritySection />
        <Faq />
      </main>
      <SiteFooter />
      <StickyCta />
    </div>
  );
}
