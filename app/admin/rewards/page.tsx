"use client";

import { trpc } from "@/lib/trpc";

export default function AdminRewardsPage() {
  const stats = trpc.rewards.adminStats.useQuery(undefined, { retry: false });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Rewards & Loyalty</h1>
          <p className="text-white/60 mt-1">
            Loyalty program overview and member management
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-24 mb-3" />
                <div className="h-8 bg-white/10 rounded w-16" />
              </div>
            ))
          ) : stats.isError ? (
            <div className="col-span-4 bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
              Unable to load loyalty stats. Connect the tRPC rewards router.
            </div>
          ) : (
            <>
              <StatCard label="Total Members" value={String(stats.data?.totalMembers ?? 0)} />
              <StatCard label="Points Issued" value={(stats.data?.totalPointsIssued ?? 0).toLocaleString()} />
              <StatCard label="Points Redeemed" value={(stats.data?.totalPointsRedeemed ?? 0).toLocaleString()} />
              <StatCard label="Completed Referrals" value={String(stats.data?.activeReferrals ?? 0)} />
            </>
          )}
        </div>

        {/* Tier Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tier System</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: "Insider", spend: "$0+", mult: "1x", discount: "0%", color: "#9ca3af" },
              { name: "VIP", spend: "$500+", mult: "1.5x", discount: "5%", color: "#f59e0b" },
              { name: "Elite", spend: "$1,500+", mult: "2x", discount: "10%", color: "#C8E63E" },
              { name: "Diamond", spend: "$5,000+", mult: "3x", discount: "15%", color: "#8b5cf6" },
            ].map((tier) => (
              <div key={tier.name} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="font-bold text-lg" style={{ color: tier.color }}>{tier.name}</h3>
                <p className="text-xs text-white/40 mt-1">Annual spend: {tier.spend}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Multiplier</span>
                    <span className="font-bold">{tier.mult}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Discount</span>
                    <span className="font-bold">{tier.discount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/rewards" target="_blank" className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="font-semibold mb-1">View Public Rewards Page</h3>
              <p className="text-white/50 text-sm">See what customers see</p>
            </a>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-semibold mb-1">Points Conversion</h3>
              <p className="text-white/50 text-sm">100 points = $1 discount</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-semibold mb-1">Referral Reward</h3>
              <p className="text-white/50 text-sm">200 points for both referrer &amp; referee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <p className="text-white/50 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
