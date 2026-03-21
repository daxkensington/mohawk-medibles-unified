"use client";

import dynamic from "next/dynamic";

// ─── Critical above-the-fold components (loaded immediately) ───
import { HeroCarousel } from "@/components/HeroCarousel";
import { BenefitsBar } from "@/components/BenefitsBar";
import { DealTicker } from "@/components/DealTicker";
import { SocialProofStrip } from "@/components/SocialProofStrip";

// ─── Below-the-fold components (lazy-loaded) ───
const BentoGrid = dynamic(() => import("@/components/BentoGrid").then(m => ({ default: m.BentoGrid })));
const EffectFilter = dynamic(() => import("@/components/EffectFilter").then(m => ({ default: m.EffectFilter })));
const TrustPillars = dynamic(() => import("@/components/TrustPillars").then(m => ({ default: m.TrustPillars })));
const DealsSection = dynamic(() => import("@/components/DealsSection").then(m => ({ default: m.DealsSection })));
const ReviewCarousel = dynamic(() => import("@/components/ReviewCarousel").then(m => ({ default: m.ReviewCarousel })));
const StickyMobileNav = dynamic(() => import("@/components/StickyMobileNav").then(m => ({ default: m.StickyMobileNav })));
const CategoryBrandShowcase = dynamic(() => import("@/components/CategoryBrandShowcase").then(m => ({ default: m.CategoryBrandShowcase })));
const MonthlyDeals = dynamic(() => import("@/components/MonthlyDeals").then(m => ({ default: m.MonthlyDeals })));
const HowItWorks = dynamic(() => import("@/components/HowItWorks").then(m => ({ default: m.HowItWorks })));
const CustomerTestimonials = dynamic(() => import("@/components/CustomerTestimonials").then(m => ({ default: m.CustomerTestimonials })));

export default function HomeClient() {
  return (
    <div className="min-h-screen flex flex-col relative">

      {/* ═══════════════════════════════════════════════════════════
          HERO CAROUSEL — .cc 4-slide rotating banners + .ca photography
          Conversion: Anchoring ($5/G), Visual Hierarchy, Cognitive Ease
          Auto-advances every 6s, pause on hover, crossfade transitions
          ═══════════════════════════════════════════════════════════ */}
      <HeroCarousel />

      {/* ═══════════════════════════════════════════════════════════
          BENEFITS BAR — .cc 5-column trust signals
          Free Shipping, Discreet Packaging, Indigenous Owned, Delivery, Since 2018
          ═══════════════════════════════════════════════════════════ */}
      <BenefitsBar />

      {/* ═══════════════════════════════════════════════════════════
          DEAL TICKER — .cc scrolling marquee with live deals
          Conversion: Scarcity, Urgency, Loss Aversion
          ═══════════════════════════════════════════════════════════ */}
      <DealTicker />

      {/* ═══════════════════════════════════════════════════════════
          SOCIAL PROOF STRIP — Stats bar
          Conversion: Social Proof, Authority, Commitment
          ═══════════════════════════════════════════════════════════ */}
      <SocialProofStrip />

      {/* ═══════════════════════════════════════════════════════════
          EFFECT-BASED FILTER — "What are you looking for?"
          Conversion: Cognitive Ease, Fogg Model (simplify action)
          ═══════════════════════════════════════════════════════════ */}
      <EffectFilter />

      {/* ═══════════════════════════════════════════════════════════
          CATEGORY + BRAND SHOWCASE — Unified section with Mohawk
          Territory tile pattern. Category carousel + auto-scrolling
          Brand carousel with expand to 3-row / full grid.
          Conversion: Authority, Brand Trust, Product Discovery
          ═══════════════════════════════════════════════════════════ */}
      <CategoryBrandShowcase />

      {/* ═══════════════════════════════════════════════════════════
          MONTHLY DEALS — .cc gradient deal cards (green/amber/purple)
          Conversion: Anchoring, Category Entry Points
          ═══════════════════════════════════════════════════════════ */}
      <MonthlyDeals />

      {/* ═══════════════════════════════════════════════════════════
          DEALS SECTION — Bento deals with countdown + anchor pricing
          Conversion: Anchoring, Scarcity (countdown), Loss Aversion
          ═══════════════════════════════════════════════════════════ */}
      <DealsSection />

      {/* ═══════════════════════════════════════════════════════════
          FEATURED PRODUCTS — Bento Grid (kept from Vercel)
          ═══════════════════════════════════════════════════════════ */}
      <BentoGrid />

      {/* ═══════════════════════════════════════════════════════════
          TRUST PILLARS — Why choose Mohawk Medibles
          Conversion: Authority, Reciprocity, Risk Reversal
          ═══════════════════════════════════════════════════════════ */}
      <TrustPillars />

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — .cc 3-step process (Browse → Pay → Deliver)
          Conversion: Cognitive Ease, Friction Reduction
          ═══════════════════════════════════════════════════════════ */}
      <HowItWorks />

      {/* ═══════════════════════════════════════════════════════════
          CUSTOMER TESTIMONIALS — .cc review cards with avatars
          Conversion: Social Proof, Trust
          ═══════════════════════════════════════════════════════════ */}
      <CustomerTestimonials />

      {/* ═══════════════════════════════════════════════════════════
          REVIEW CAROUSEL — Social proof scrolling reviews
          Conversion: Social Proof, Commitment/Consistency
          ═══════════════════════════════════════════════════════════ */}
      <ReviewCarousel />

      {/* ═══════════════════════════════════════════════════════════
          STICKY MOBILE NAV — Bottom bar for mobile (md:hidden)
          Conversion: Fogg Model (reduce friction on mobile)
          ═══════════════════════════════════════════════════════════ */}
      <StickyMobileNav />
    </div>
  );
}
