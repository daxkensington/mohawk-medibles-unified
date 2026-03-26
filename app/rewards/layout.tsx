import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rewards Program — Earn Points on Every Order",
  description:
    "Join the Mohawk Medibles rewards program. Earn points on purchases, unlock tiers, get exclusive discounts and free products.",
  alternates: { canonical: "https://mohawkmedibles.ca/rewards" },
  openGraph: { images: ["/og-image.png"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
