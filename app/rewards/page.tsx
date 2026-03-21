"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import Link from "next/link";
import { Gift, Star, Trophy, Zap, Copy, Share2, ArrowRight } from "lucide-react";

export default function RewardsPage() {
  const membership = trpc.rewards.membership.useQuery(undefined, { retry: false });
  const history = trpc.rewards.history.useQuery({ limit: 20 }, { retry: false });
  const tiers = trpc.rewards.tiers.useQuery(undefined, { retry: false });
  const referralInfo = trpc.rewards.referralInfo.useQuery(undefined, { retry: false });

  const [activeTab, setActiveTab] = useState<"overview" | "history" | "tiers" | "referrals">("overview");
  const [copied, setCopied] = useState(false);

  const copyReferralCode = () => {
    if (referralInfo.data?.referralCode) {
      navigator.clipboard.writeText(referralInfo.data.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLoggedIn = !membership.isError;

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#1a1a22] to-[var(--background)] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-[var(--lime)]/10 border border-[var(--lime)]/30 rounded-full text-[var(--lime)] text-sm font-bold uppercase tracking-widest">
            <Trophy className="w-4 h-4" />
            Mohawk Rewards
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black mb-4">
            EARN POINTS.{" "}
            <span className="text-[var(--lime)]">GET REWARDED.</span>
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-8">
            Earn 1 point for every $1 you spend. Climb tiers for bonus multipliers.
            Redeem points for discounts on your next order. 100 points = $1 off.
          </p>
          {!isLoggedIn && (
            <Link
              href="/login?redirect=/rewards"
              className="inline-block px-8 py-3 bg-[var(--lime)] text-black font-bold text-sm uppercase tracking-wider rounded hover:opacity-90 transition-opacity"
            >
              Sign In to Join →
            </Link>
          )}
        </div>
      </section>

      {/* Balance Card (logged in only) */}
      {isLoggedIn && membership.data && (
        <section className="max-w-5xl mx-auto px-4 -mt-8">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Your Balance</p>
                <p className="text-5xl font-heading font-black text-[var(--lime)]">
                  {membership.data.balance.toLocaleString()}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  = ${membership.data.dollarValue} discount available
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Current Tier</p>
                <p className="text-2xl font-bold" style={{ color: membership.data.tier.color }}>
                  {membership.data.tier.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {membership.data.tier.multiplier}x points · {membership.data.tier.discount}% discount
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Next Tier</p>
                {membership.data.nextTier ? (
                  <>
                    <p className="text-lg font-bold">{membership.data.nextTier.name}</p>
                    <div className="mt-2 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--lime)] rounded-full transition-all"
                        style={{ width: `${membership.data.nextTier.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      ${membership.data.nextTier.remaining.toFixed(0)} to go
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-[var(--lime)]">Max Tier!</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab Navigation */}
      <section className="max-w-5xl mx-auto px-4 mt-8">
        <div className="flex gap-1 border-b border-[var(--border)] mb-8">
          {(["overview", "history", "tiers", "referrals"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? "text-[var(--lime)] border-b-2 border-[var(--lime)]"
                  : "text-[var(--muted-foreground)] hover:text-white"
              }`}
            >
              {tab === "overview" ? "How It Works" : tab === "history" ? "Points History" : tab === "tiers" ? "Tier Benefits" : "Refer & Earn"}
            </button>
          ))}
        </div>

        {/* How It Works */}
        {activeTab === "overview" && (
          <div className="space-y-12 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Zap className="w-8 h-8" />, title: "Earn Points", desc: "Get 1 point per $1 spent. Higher tiers earn up to 3x points on every order." },
                { icon: <Star className="w-8 h-8" />, title: "Climb Tiers", desc: "Spend more to unlock VIP, Elite, and Diamond tiers with bonus multipliers and exclusive discounts." },
                { icon: <Gift className="w-8 h-8" />, title: "Redeem Rewards", desc: "Use your points at checkout. 100 points = $1 off. No minimum order required." },
              ].map((item, i) => (
                <div key={i} className="text-center p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                  <div className="flex justify-center mb-4 text-[var(--lime)]">{item.icon}</div>
                  <h3 className="font-heading font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Bonus points table */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
              <h3 className="text-xl font-heading font-bold mb-6">Bonus Points</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { action: "Write a product review", points: "+50 points" },
                  { action: "Add a photo to your review", points: "+100 points" },
                  { action: "Refer a friend (they order)", points: "+200 points" },
                  { action: "Birthday month", points: "2x points all month" },
                  { action: "Welcome bonus (first order)", points: "+100 points" },
                  { action: "Double points events", points: "2x points (check deals)" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 px-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                    <span className="text-sm">{item.action}</span>
                    <span className="text-sm font-bold text-[var(--lime)]">{item.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Points History */}
        {activeTab === "history" && (
          <div className="pb-16">
            {!isLoggedIn ? (
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                <p>Sign in to view your points history.</p>
                <Link href="/login?redirect=/rewards" className="text-[var(--lime)] font-bold mt-2 inline-block">
                  Sign In →
                </Link>
              </div>
            ) : history.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-[var(--card)] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (history.data ?? []).length === 0 ? (
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                <p>No points activity yet. Start shopping to earn!</p>
                <Link href="/shop" className="text-[var(--lime)] font-bold mt-2 inline-block">
                  Shop Now →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {(history.data ?? []).map((entry: any) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between px-5 py-4 rounded-lg bg-[var(--card)] border border-[var(--border)]"
                  >
                    <div>
                      <p className="text-sm font-medium">{entry.description}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`font-bold ${
                        entry.points > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {entry.points > 0 ? "+" : ""}
                      {entry.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tier Benefits */}
        {activeTab === "tiers" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-16">
            {(tiers.data ?? []).map((tier: any) => (
              <div
                key={tier.key}
                className={`p-6 rounded-2xl border ${
                  membership.data?.tier.key === tier.key
                    ? "border-[var(--lime)] bg-[var(--lime)]/5"
                    : "border-[var(--border)] bg-[var(--card)]"
                }`}
              >
                {membership.data?.tier.key === tier.key && (
                  <span className="text-xs font-bold text-[var(--lime)] uppercase tracking-wider">
                    Current Tier
                  </span>
                )}
                <h3
                  className="text-2xl font-heading font-black mt-1"
                  style={{ color: tier.color }}
                >
                  {tier.name}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">
                  Spend ${tier.minSpend}+/year
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Points multiplier</span>
                    <span className="font-bold">{tier.multiplier}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Order discount</span>
                    <span className="font-bold">{tier.discount}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Referral Program */}
        {activeTab === "referrals" && (
          <div className="pb-16">
            {!isLoggedIn ? (
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                <p>Sign in to access your referral code.</p>
                <Link href="/login?redirect=/rewards" className="text-[var(--lime)] font-bold mt-2 inline-block">
                  Sign In →
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Referral Code Card */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center">
                  <h3 className="text-xl font-heading font-bold mb-2">Your Referral Code</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">
                    Share this code with friends. When they make their first order, you both earn 200 points!
                  </p>
                  <div className="inline-flex items-center gap-3 bg-[var(--background)] border border-[var(--border)] rounded-lg px-6 py-3">
                    <span className="text-2xl font-mono font-bold text-[var(--lime)]">
                      {referralInfo.data?.referralCode ?? "..."}
                    </span>
                    <button
                      onClick={copyReferralCode}
                      className="p-2 hover:bg-[var(--card)] rounded transition-colors"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  {copied && (
                    <p className="text-sm text-green-400 mt-2">Copied!</p>
                  )}
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: "Mohawk Medibles",
                            text: `Use my referral code ${referralInfo.data?.referralCode} for bonus points!`,
                            url: "https://mohawkmedibles.ca",
                          });
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--lime)]/10 border border-[var(--lime)]/30 rounded-lg text-[var(--lime)] text-sm font-bold hover:bg-[var(--lime)]/20 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>

                {/* Referral Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Referrals", value: referralInfo.data?.totalReferrals ?? 0 },
                    { label: "Completed", value: referralInfo.data?.completedReferrals ?? 0 },
                    { label: "Points Earned", value: referralInfo.data?.totalPointsEarned ?? 0 },
                    { label: "Value", value: `$${Math.floor((referralInfo.data?.totalPointsEarned ?? 0) / 100)}` },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
