"use client";

import { useEffect, useState } from "react";
import { Mail, UserPlus, UserMinus, AlertTriangle } from "lucide-react";

interface SubscriberRow {
    id: string;
    email: string;
    name: string | null;
    status: string;
    source: string | null;
    subscribedAt: string | null;
    unsubscribedAt: string | null;
}

interface NewsletterData {
    stats: {
        total: number;
        active: number;
        unsubscribed: number;
        bounced: number;
        recentCount: number;
        sources: { source: string; count: number }[];
    };
    subscribers: SubscriberRow[];
}

const STATUS_STYLES: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    unsubscribed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    bounced: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminNewsletterPage() {
    const [data, setData] = useState<NewsletterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "active" | "unsubscribed" | "bounced">("all");

    useEffect(() => {
        fetch("/api/admin/newsletter/")
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
                Failed to load newsletter data: {error}
            </div>
        );
    }

    const stats = data?.stats;
    const allSubscribers = data?.subscribers ?? [];
    const subscribers = filter === "all"
        ? allSubscribers
        : allSubscribers.filter((s) => s.status === filter);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
                <p className="text-white/60 mt-1">
                    Manage email subscribers and track growth
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <Mail className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Total Subscribers</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                            <UserPlus className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">{stats?.active ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Active</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-600 flex items-center justify-center">
                            <UserMinus className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-zinc-400">{stats?.unsubscribed ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Unsubscribed</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-red-400">{stats?.bounced ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Bounced</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="text-2xl font-bold text-cyan-400">{stats?.recentCount ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Last 30 Days</div>
                </div>
            </div>

            {/* Source Breakdown */}
            {stats?.sources && stats.sources.length > 0 && (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6 mb-8">
                    <h2 className="font-semibold mb-4">Signup Sources</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {stats.sources.map((s) => (
                            <div key={s.source} className="bg-white/5 rounded-xl p-4">
                                <div className="text-lg font-bold">{s.count}</div>
                                <div className="text-xs text-zinc-500 capitalize">{s.source}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Subscribers Table */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-semibold">
                        {filter === "all" ? "All Subscribers" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Subscribers`}
                        <span className="ml-2 text-zinc-500 text-sm">({subscribers.length})</span>
                    </h2>
                    <div className="flex gap-2">
                        {(["all", "active", "unsubscribed", "bounced"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                                    filter === f
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase">
                                <th className="text-left pb-3 pt-4 pl-6">Email</th>
                                <th className="text-left pb-3 pt-4">Name</th>
                                <th className="text-left pb-3 pt-4">Source</th>
                                <th className="text-left pb-3 pt-4">Status</th>
                                <th className="text-right pb-3 pt-4 pr-6">Subscribed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((sub) => (
                                <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 pl-6 text-sm font-medium">{sub.email}</td>
                                    <td className="py-3 text-sm text-zinc-400">{sub.name || "\u2014"}</td>
                                    <td className="py-3">
                                        {sub.source ? (
                                            <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-zinc-300 capitalize">
                                                {sub.source}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-600">\u2014</span>
                                        )}
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${STATUS_STYLES[sub.status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right pr-6 text-xs text-zinc-500">
                                        {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : "\u2014"}
                                    </td>
                                </tr>
                            ))}
                            {subscribers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        {filter === "all"
                                            ? "No subscribers found. Newsletter signups will appear here."
                                            : `No ${filter} subscribers found.`}
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
