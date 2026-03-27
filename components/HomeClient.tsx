"use client";

import dynamic from "next/dynamic";

// ─── Above the fold — load immediately ──────────────────
import ContestBanner from "@/components/ContestBanner";
import { HeroCarousel } from "@/components/HeroCarousel";
import { BenefitsBar } from "@/components/BenefitsBar";
import { SafeSection } from "@/components/SafeSection";

// ─── Below the fold — lazy load (ssr: false) ────────────
const DealTicker = dynamic(
  () => import("@/components/DealTicker").then(m => ({ default: m.DealTicker })),
  { ssr: false }
);
const CategoryBrandShowcase = dynamic(
  () => import("@/components/CategoryBrandShowcase").then(m => ({ default: m.CategoryBrandShowcase })),
  { ssr: false }
);
const NewArrivals = dynamic(
  () => import("@/components/NewArrivals"),
  { ssr: false }
);
const MonthlyDeals = dynamic(
  () => import("@/components/MonthlyDeals").then(m => ({ default: m.MonthlyDeals })),
  { ssr: false }
);
const ShopByMood = dynamic(
  () => import("@/components/ShopByMood"),
  { ssr: false }
);
const MixMatchCTA = dynamic(
  () => import("@/components/MixMatchCTA"),
  { ssr: false }
);
const DealOfTheDay = dynamic(
  () => import("@/components/DealOfTheDay"),
  { ssr: false }
);
const BentoGrid = dynamic(
  () => import("@/components/BentoGrid").then(m => ({ default: m.BentoGrid })),
  { ssr: false }
);
const HowItWorks = dynamic(
  () => import("@/components/HowItWorks").then(m => ({ default: m.HowItWorks })),
  { ssr: false }
);
const GoogleReviewsWidget = dynamic(
  () => import("@/components/GoogleReviewsWidget"),
  { ssr: false }
);
const StorePromo = dynamic(
  () => import("@/components/StorePromo"),
  { ssr: false }
);
const ReviewCarousel = dynamic(
  () => import("@/components/ReviewCarousel").then(m => ({ default: m.ReviewCarousel })),
  { ssr: false }
);
const StickyMobileNav = dynamic(
  () => import("@/components/StickyMobileNav").then(m => ({ default: m.StickyMobileNav })),
  { ssr: false }
);

export default function HomeClient() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <SafeSection name="ContestBanner"><ContestBanner /></SafeSection>
      <SafeSection name="HeroCarousel"><HeroCarousel /></SafeSection>
      <SafeSection name="BenefitsBar"><BenefitsBar /></SafeSection>
      <SafeSection name="DealTicker"><DealTicker /></SafeSection>
      <SafeSection name="CategoryBrandShowcase"><CategoryBrandShowcase /></SafeSection>
      <SafeSection name="NewArrivals"><NewArrivals /></SafeSection>
      <SafeSection name="MonthlyDeals"><MonthlyDeals /></SafeSection>
      <SafeSection name="ShopByMood"><ShopByMood /></SafeSection>
      <SafeSection name="MixMatchCTA"><MixMatchCTA /></SafeSection>
      <SafeSection name="DealOfTheDay"><DealOfTheDay /></SafeSection>
      <SafeSection name="BentoGrid"><BentoGrid /></SafeSection>
      <SafeSection name="HowItWorks"><HowItWorks /></SafeSection>
      <SafeSection name="GoogleReviewsWidget"><GoogleReviewsWidget /></SafeSection>
      <SafeSection name="StorePromo"><StorePromo /></SafeSection>
      <SafeSection name="ReviewCarousel"><ReviewCarousel /></SafeSection>
      <SafeSection name="StickyMobileNav"><StickyMobileNav /></SafeSection>
    </div>
  );
}
