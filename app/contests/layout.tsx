import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contests & Giveaways — Win Free Cannabis",
  description:
    "Enter active contests and giveaways at Mohawk Medibles. Win free cannabis products, gift cards, and exclusive prizes.",
  alternates: { canonical: "https://mohawkmedibles.ca/contests" },
  openGraph: { images: ["/og-image.png"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
