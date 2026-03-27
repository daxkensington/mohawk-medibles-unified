"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import Link from "next/link";
import {
  Gift, Star, Trophy, Zap, Copy, Share2, ArrowRight,
  ShoppingCart, Camera, UserPlus, Cake, Sparkles,
  Crown, Target, Gem, Flame, ChevronRight, Tag,
  Percent, Package, Heart, Users,
} from "lucide-react";

const TIER_DATA = [
  {
    key: "bronze",
    name: "Bronze",
    icon: Star,
    color: "#cd7f32",
    gradient: "from-amber-700 to-amber-900",
    glow: "shadow-amber-700/20",
    multiplier: "1x",
    discount: "0%",
    minSpend: "$0",
    perks: ["1 point per $1", "Birthday bonus", "Member-only deals"],
  },
  {
    key: "silver",
    name: "Silver",
    icon: Gem,
    color: "#C0C0C0",
    gradient: "from-gray-400 to-gray-600",
    glow: "shadow-gray-400/20",
    multiplier: "1.5x",
    discount: "3%",
    minSpend: "$200",
    perks: ["1.5x points", "3% order discount", "Early sale access", "Birthday bonus"],
  },
  {
    key: "gold",
    name: "Gold",
    icon: Crown,
    color: "#FFD700",
    gradient: "from-yellow-500 to-yellow-700",
    glow: "shadow-yellow-500/20",
    multiplier: "2x",
    discount: "5%",
    minSpend: "$500",
    perks: ["2x points", "5% order discount", "Free express shipping", "Exclusive products", "Birthday bonus"],
  },
  {
    key: "diamond",
    name: "Diamond",
    icon: Trophy,
    color: "#B9F2FF",
    gradient: "from-cyan-400 to-blue-600",
    glow: "shadow-cyan-400/20",
    multiplier: "3x",
    discount: "10%",
    minSpend: "$1,000",
    perks: ["3x points", "10% order discount", "Free express shipping", "VIP support", "Exclusive products", "Birthday 3x bonus"],
  },
];

const EARN_METHODS = [
  { icon: ShoppingCart, title: "Every Purchase", desc: "Earn 1 point for every $1 spent. Higher tiers earn up to 3x.", points: "1-3 pts/$1", color: "from-green-500 to-emerald-600" },
  { icon: Star, title: "Write a Review", desc: "Share your experience and earn bonus points on any product.", points: "+50 pts", color: "from-blue-500 to-cyan-600" },
  { icon: Camera, title: "Photo Review", desc: "Add a photo to your review for even more bonus points.", points: "+100 pts", color: "from-purple-500 to-violet-600" },
  { icon: UserPlus, title: "Refer a Friend", desc: "Both you and your friend earn points when they place their first order.", points: "+200 pts", color: "from-amber-500 to-orange-600" },
  { icon: Cake, title: "Birthday Month", desc: "Earn double points on all purchases during your birthday month.", points: "2x pts", color: "from-pink-500 to-rose-600" },
  { icon: Sparkles, title: "Welcome Bonus", desc: "Get a head start with bonus points on your very first order.", points: "+100 pts", color: "from-lime-500 to-green-600" },
];

const REDEEM_OPTIONS = [
  { title: "Discount on Orders", desc: "Apply points at checkout for instant savings. 100 points = $1 off.", icon: Percent, value: "100 pts = $1" },
  { title: "Free Products", desc: "Save up enough points to get free items from our rewards catalog.", icon: Package, value: "Varies" },
  { title: "Exclusive Merch", desc: "Redeem points for limited-edition Mohawk Medibles merchandise.", icon: Tag, value: "500+ pts" },
  { title: "Gift Cards", desc: "Convert your points into gift cards for friends and family.", icon: Gift, value: "1000+ pts" },
];

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
      <section className="relative bg-gradient-to-b from-[#1a1a22] to-[var(--background)] py-24 md:py-32 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(132,204,22,0.1),transparent_60%)]" />
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 bg-[var(--lime)]/10 border border-[var(--lime)]/30 rounded-full text-[var(--lime)] text-sm font-bold uppercase tracking-widest">
            <Trophy className="w-4 h-4" />
            Mohawk Rewards
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-black mb-6 leading-tight">
            EARN POINTS.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-green-400 to-emerald-500">
              GET REWARDED.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Every dollar you spend earns points. Climb tiers for multiplied earnings and exclusive perks.
            Redeem anytime -- 100 points = $1 off. No minimum order required.
          </p>
          {!isLoggedIn && (
            <Link
              href="/login?redirect=/rewards"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--lime)] text-black font-bold text-sm uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-lime-500/25"
            >
              Sign In to Join <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Balance Card (logged in only) */}
      {isLoggedIn && membership.data && (
        <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
          <div className="bg-[var(--card)] rounded-2xl p-8 shadow-xl shadow-black/20">
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
                  {membership.data.tier.multiplier}x points &middot; {membership.data.tier.discount}% discount
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Next Tier</p>
                {membership.data.nextTier ? (
                  <>
                    <p className="text-lg font-bold">{membership.data.nextTier.name}</p>
                    <div className="mt-2 h-3 bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--lime)] to-green-400 rounded-full transition-all"
                        style={{ width: `${membership.data.nextTier.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      ${membership.data.nextTier.remaining.toFixed(0)} to go &middot; {membership.data.nextTier.progress.toFixed(0)}%
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Trophy className="w-5 h-5 text-[var(--lime)]" />
                    <p className="text-lg font-bold text-[var(--lime)]">Max Tier!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab Navigation */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <div className="flex gap-1 border-b border-[var(--border)] mb-8 overflow-x-auto">
          {(["overview", "tiers", "history", "referrals"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "text-[var(--lime)] border-b-2 border-[var(--lime)]"
                  : "text-[var(--muted-foreground)] hover:text-white"
              }`}
            >
              {tab === "overview" ? "How It Works" : tab === "history" ? "Points History" : tab === "tiers" ? "Tier Benefits" : "Refer & Earn"}
            </button>
          ))}
        </div>

        {/* ==================== HOW IT WORKS ==================== */}
        {activeTab === "overview" && (
          <div className="space-y-20 pb-16">
            {/* Earn Points Section */}
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-3">
                  Ways to Earn Points
                </h2>
                <p className="text-[var(--muted-foreground)]">Stack up points fast with these earning opportunities.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {EARN_METHODS.map((method) => (
                  <div
                    key={method.title}
                    className="group bg-[var(--card)] rounded-2xl p-6 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <method.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-black text-[var(--lime)] bg-[var(--lime)]/10 px-3 py-1 rounded-full">
                        {method.points}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{method.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{method.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Redeem Points Section */}
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-3">
                  Redeem Your Rewards
                </h2>
                <p className="text-[var(--muted-foreground)]">Turn your points into real savings and exclusive perks.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {REDEEM_OPTIONS.map((option) => (
                  <div key={option.title} className="bg-[var(--card)] rounded-2xl p-6 shadow-lg shadow-black/10 text-center group hover:shadow-xl hover:shadow-black/20 transition-all">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--lime)]/20 to-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <option.icon className="w-7 h-7 text-[var(--lime)]" />
                    </div>
                    <h3 className="font-bold text-white mb-1">{option.title}</h3>
                    <p className="text-xs text-[var(--muted-foreground)] mb-3">{option.desc}</p>
                    <span className="text-sm font-bold text-[var(--lime)]">{option.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tier Preview */}
            <div className="bg-gradient-to-r from-[var(--lime)]/5 via-green-500/5 to-emerald-500/5 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-black text-white mb-2">
                  Tier Progression
                </h2>
                <p className="text-[var(--muted-foreground)]">Spend more to unlock higher tiers and bigger rewards.</p>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
                {TIER_DATA.map((tier, i) => (
                  <div key={tier.key} className="flex items-center gap-2">
                    <div className="text-center px-6 py-4">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}>
                        <tier.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-bold text-white text-sm">{tier.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{tier.multiplier} points</p>
                    </div>
                    {i < TIER_DATA.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-[var(--lime)]/40 hidden md:block" />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <button
                  onClick={() => setActiveTab("tiers")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--lime)]/10 border border-[var(--lime)]/30 text-[var(--lime)] font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[var(--lime)]/20 transition-colors"
                >
                  View All Tier Benefits <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TIER BENEFITS ==================== */}
        {activeTab === "tiers" && (
          <div className="pb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-3">
                Tier Benefits
              </h2>
              <p className="text-[var(--muted-foreground)]">Unlock incredible perks as you climb the ranks.</p>
            </div>

            {/* Visual Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TIER_DATA.map((tier) => {
                const isCurrentTier = membership.data?.tier.key === tier.key;
                return (
                  <div
                    key={tier.key}
                    className={`relative rounded-2xl p-6 transition-all hover:-translate-y-1 ${
                      isCurrentTier
                        ? `bg-[var(--lime)]/5 ring-2 ring-[var(--lime)]/30 shadow-xl ${tier.glow}`
                        : "bg-[var(--card)] shadow-lg shadow-black/10"
                    }`}
                  >
                    {isCurrentTier && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--lime)] text-black text-xs font-bold uppercase tracking-wider rounded-full">
                        Current
                      </div>
                    )}

                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4`}>
                      <tier.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-2xl font-heading font-black" style={{ color: tier.color }}>
                      {tier.name}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-4">
                      Spend {tier.minSpend}+/year
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-[var(--muted-foreground)]">Points</span>
                        <span className="text-sm font-black text-white">{tier.multiplier}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-[var(--muted-foreground)]">Discount</span>
                        <span className="text-sm font-black text-white">{tier.discount}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {tier.perks.map((perk) => (
                        <div key={perk} className="flex items-start gap-2">
                          <Zap className="w-3.5 h-3.5 text-[var(--lime)] mt-0.5 shrink-0" />
                          <span className="text-xs text-zinc-300">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Also show API tier data if available */}
            {tiers.data && tiers.data.length > 0 && (
              <div className="mt-12 bg-[var(--card)] rounded-2xl p-8">
                <h3 className="text-xl font-heading font-bold mb-6">Tier Thresholds</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--muted-foreground)] text-xs uppercase tracking-wider border-b border-white/5">
                        <th className="text-left py-3 pr-4">Tier</th>
                        <th className="text-left py-3 pr-4">Min. Annual Spend</th>
                        <th className="text-left py-3 pr-4">Points Multiplier</th>
                        <th className="text-left py-3">Order Discount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(tiers.data ?? []).map((tier: any) => (
                        <tr key={tier.key} className="border-b border-white/5">
                          <td className="py-3 pr-4">
                            <span className="font-bold" style={{ color: tier.color }}>{tier.name}</span>
                          </td>
                          <td className="py-3 pr-4 text-white">${tier.minSpend}</td>
                          <td className="py-3 pr-4 text-white font-bold">{tier.multiplier}x</td>
                          <td className="py-3 text-[var(--lime)] font-bold">{tier.discount}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== POINTS HISTORY ==================== */}
        {activeTab === "history" && (
          <div className="pb-16">
            {!isLoggedIn ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--lime)]/10 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-[var(--lime)]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sign in to view your history</h3>
                <p className="text-[var(--muted-foreground)] mb-4">Track every point you earn and spend.</p>
                <Link href="/login?redirect=/rewards" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--lime)] text-black font-bold text-sm uppercase rounded-xl hover:opacity-90 transition-opacity">
                  Sign In <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : history.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-[var(--card)] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (history.data ?? []).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--lime)]/10 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-[var(--lime)]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No points activity yet</h3>
                <p className="text-[var(--muted-foreground)] mb-4">Start shopping to earn your first points!</p>
                <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--lime)] text-black font-bold text-sm uppercase rounded-xl hover:opacity-90 transition-opacity">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {(history.data ?? []).map((entry: any) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between px-5 py-4 rounded-xl bg-[var(--card)] shadow-sm shadow-black/10 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        entry.points > 0 ? "bg-green-500/10" : "bg-red-500/10"
                      }`}>
                        {entry.points > 0 ? (
                          <Zap className="w-5 h-5 text-green-400" />
                        ) : (
                          <Gift className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{entry.description}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-black text-lg ${
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

        {/* ==================== REFERRALS ==================== */}
        {activeTab === "referrals" && (
          <div className="pb-16">
            {!isLoggedIn ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--lime)]/10 flex items-center justify-center">
                  <UserPlus className="w-8 h-8 text-[var(--lime)]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sign in to access referrals</h3>
                <p className="text-[var(--muted-foreground)] mb-4">Get your unique referral code and start earning.</p>
                <Link href="/login?redirect=/rewards" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--lime)] text-black font-bold text-sm uppercase rounded-xl hover:opacity-90 transition-opacity">
                  Sign In <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* How Referrals Work */}
                <div className="bg-gradient-to-r from-[var(--lime)]/5 via-green-500/5 to-emerald-500/5 rounded-2xl p-8">
                  <h3 className="text-xl font-heading font-bold text-white mb-6 text-center">
                    How Referrals Work
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { step: "1", title: "Share Your Code", desc: "Give your unique referral code to friends.", icon: Share2 },
                      { step: "2", title: "They Order", desc: "Your friend places their first order using your code.", icon: ShoppingCart },
                      { step: "3", title: "Both Earn", desc: "You both get 200 bonus points. Everyone wins!", icon: Gift },
                    ].map((item, i) => (
                      <div key={item.step} className="relative text-center">
                        <div className="text-5xl font-black text-[var(--lime)]/10 mb-2">{item.step}</div>
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--lime)]/10 flex items-center justify-center">
                          <item.icon className="w-6 h-6 text-[var(--lime)]" />
                        </div>
                        <h4 className="font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-sm text-[var(--muted-foreground)]">{item.desc}</p>
                        {i < 2 && (
                          <ChevronRight className="hidden md:block absolute top-1/2 -right-3 w-5 h-5 text-[var(--lime)]/30" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Referral Code Card */}
                <div className="bg-[var(--card)] rounded-2xl p-8 text-center shadow-xl shadow-black/20">
                  <h3 className="text-xl font-heading font-bold mb-2">Your Referral Code</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">
                    Share this code with friends. When they make their first order, you both earn 200 points!
                  </p>
                  <div className="inline-flex items-center gap-3 bg-[var(--background)] border border-[var(--border)] rounded-xl px-8 py-4">
                    <span className="text-3xl font-mono font-black text-[var(--lime)]">
                      {referralInfo.data?.referralCode ?? "..."}
                    </span>
                    <button
                      onClick={copyReferralCode}
                      className="p-2 hover:bg-[var(--card)] rounded-lg transition-colors"
                    >
                      <Copy className="w-5 h-5 text-[var(--muted-foreground)] hover:text-white" />
                    </button>
                  </div>
                  {copied && (
                    <p className="text-sm text-green-400 mt-3">Copied to clipboard!</p>
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
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--lime)]/10 border border-[var(--lime)]/30 rounded-xl text-[var(--lime)] text-sm font-bold hover:bg-[var(--lime)]/20 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share with Friends
                    </button>
                  </div>
                </div>

                {/* Referral Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Referrals", value: referralInfo.data?.totalReferrals ?? 0, icon: Users, color: "from-blue-500 to-cyan-600" },
                    { label: "Completed", value: referralInfo.data?.completedReferrals ?? 0, icon: Flame, color: "from-green-500 to-emerald-600" },
                    { label: "Points Earned", value: referralInfo.data?.totalPointsEarned ?? 0, icon: Zap, color: "from-amber-500 to-orange-600" },
                    { label: "Value", value: `$${Math.floor((referralInfo.data?.totalPointsEarned ?? 0) / 100)}`, icon: Gift, color: "from-purple-500 to-violet-600" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[var(--card)] rounded-xl p-5 text-center shadow-lg shadow-black/10">
                      <div className={`w-10 h-10 mx-auto mb-3 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-2xl font-black text-white">{stat.value}</p>
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
