"use client";

import { Star, Camera, BadgeCheck, FileText } from "lucide-react";

const rewardTiers = [
  {
    icon: Star,
    label: "Base Review",
    points: "+50 pts",
    color: "text-primary",
  },
  {
    icon: Camera,
    label: "With Photos",
    points: "+25/photo",
    color: "text-blue-400",
  },
  {
    icon: BadgeCheck,
    label: "Verified Purchase",
    points: "+75 pts",
    color: "text-green-400",
  },
  {
    icon: FileText,
    label: "Detailed Review",
    points: "+100 pts",
    color: "text-yellow-400",
  },
];

export function ReviewIncentiveBanner() {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-5 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg mb-0.5">
              Share Your Experience
            </h3>
            <p className="text-sm text-muted-foreground">
              Write a review and earn loyalty points! Reviews with photos earn
              bonus points.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById("review-section");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="flex-shrink-0 px-6 py-2.5 bg-primary text-black font-bold text-sm uppercase tracking-wider rounded hover:bg-primary/90 transition-colors"
        >
          Write a Review
        </button>
      </div>

      {/* Reward tiers */}
      <div className="relative mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {rewardTiers.map((tier, i) => (
          <div
            key={i}
            className="bg-card/50 rounded-lg p-2.5 border border-border/20 flex items-center gap-2"
          >
            <tier.icon className={`w-4 h-4 ${tier.color} shrink-0`} />
            <div>
              <p className="text-[10px] text-muted-foreground truncate">
                {tier.label}
              </p>
              <p className={`font-bold text-sm ${tier.color}`}>
                {tier.points}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
