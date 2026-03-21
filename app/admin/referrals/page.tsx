"use client";

import { useEffect, useState } from "react";
import { Users, Award, Clock, TrendingUp } from "lucide-react";

interface ReferralRow {
    id: number;
    referralCode: string;
    referrerName: string;
    refereeId: string | null;
    status: string;
    referrerPointsAwarded: number;
    refereePointsAwarded: number;
    createdAt: string;
    completedAt: string | null;
}

interface ReferralsData {
    stats: {
        totalReferrals: number;
        completed: number;
        pending: number;
        expired: number;
        totalPointsAwarded: number;
        conversionRate: string;
    };
    referrals: ReferralRow[];
}

const STATUS_STYLES: Record<string, string> = {
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    signed_up: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    expired: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminReferralsPage() {
    const [data, setData] = useState<ReferralsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/referrals/")
            .then((r) => r.json())
            .then((d) => { setData(d); setLoading(false); })
            .catch((e) => { setError(e.message); setLoading(false); });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
                Failed to load referrals: {error}
            </div>
        );
    }

    const stats = data?.stats;
    const referrals = data?.referrals ?? [];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Referrals</h1>
                <p className="text-white/60 mt-1">
                    Referral program performance and tracking
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{stats?.totalReferrals ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Total Referrals</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <Award className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">{stats?.completed ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Completed</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-amber-400">{stats?.pending ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Pending</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">{stats?.conversionRate ?? "0.0"}%</div>
                    <div className="text-xs text-zinc-500 mt-1">Conversion Rate</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="text-2xl font-bold text-cyan-400">{(stats?.totalPointsAwarded ?? 0).toLocaleString()}</div>
                    <div className="text-xs text-zinc-500 mt-1">Points Awarded</div>
                </div>
            </div>

            {/* Referrals Table */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                    <h2 className="font-semibold">All Referrals</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase">
                                <th className="text-left pb-3 pt-4 pl-6">Code</th>
                                <th className="text-left pb-3 pt-4">Referrer</th>
                                <th className="text-left pb-3 pt-4">Referred User</th>
                                <th className="text-left pb-3 pt-4">Status</th>
                                <th className="text-right pb-3 pt-4">Referrer Pts</th>
                                <th className="text-right pb-3 pt-4">Referee Pts</th>
                                <th className="text-right pb-3 pt-4 pr-6">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {referrals.map((ref) => (
                                <tr key={ref.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 pl-6">
                                        <span className="font-mono text-sm font-bold text-green-400">{ref.referralCode}</span>
                                    </td>
                                    <td className="py-3 text-sm">{ref.referrerName}</td>
                                    <td className="py-3 text-sm text-zinc-400">
                                        {ref.refereeId ? `User #${ref.refereeId.slice(0, 8)}...` : "\u2014"}
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${STATUS_STYLES[ref.status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>
                                            {ref.status.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right font-bold text-sm">
                                        {ref.referrerPointsAwarded > 0 ? (
                                            <span className="text-green-400">{ref.referrerPointsAwarded}</span>
                                        ) : (
                                            <span className="text-zinc-600">0</span>
                                        )}
                                    </td>
                                    <td className="py-3 text-right font-bold text-sm">
                                        {ref.refereePointsAwarded > 0 ? (
                                            <span className="text-cyan-400">{ref.refereePointsAwarded}</span>
                                        ) : (
                                            <span className="text-zinc-600">0</span>
                                        )}
                                    </td>
                                    <td className="py-3 text-right pr-6 text-xs text-zinc-500">
                                        {new Date(ref.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {referrals.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                        No referrals found. Referral codes will appear here when customers use the referral program.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
