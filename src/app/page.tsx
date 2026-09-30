import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { PainSection } from "@/components/landing/pain-section";
import { AuthoritySection } from "@/components/landing/authority-section";
import { CostAnchor } from "@/components/landing/cost-anchor";
import { ThreeSteps } from "@/components/landing/three-steps";
import { ProductContent } from "@/components/landing/product-content";
import { PricingSection } from "@/components/landing/pricing-section";
import { BeforeAfter } from "@/components/landing/before-after";
import { Faq } from "@/components/landing/faq";
import { FinalAnchor } from "@/components/landing/final-anchor";
import { SiteFooter } from "@/components/landing/site-footer";
import { StickyCta } from "@/components/landing/sticky-cta";
import { PlanSelectionProvider } from "@/components/landing/plan-selection";
import { RevealObserver } from "@/components/ui/reveal-observer";
import { MetaViewContent } from "@/components/analytics/meta-view-content";

export default function Home() {
  return (
    <PlanSelectionProvider>
      <MetaViewContent />
      <RevealObserver />
      <SiteHeader />
      <main>
        {/* 1 */} <Hero />
        {/* 2 */} <PainSection />
        {/* 3 */} <AuthoritySection />
        {/* 4 */} <CostAnchor />
        {/* 5 */} <ThreeSteps />
        {/* 6 */} <ProductContent />
        {/* 7 */} <PricingSection />
        {/* 8 */} <BeforeAfter />
        {/* 9 */} <Faq />
        {/* 10 */} <FinalAnchor />
      </main>
      <SiteFooter />
      <StickyCta />
    </PlanSelectionProvider>
  );
}
