"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, DollarSign, TrendingUp, Clock } from "lucide-react";

interface CartRow {
    id: number;
    email: string;
    customerName: string | null;
    cartTotal: number;
    emailsSent: number;
    status: string;
    lastEmailStatus: string | null;
    createdAt: string;
    recoveredAt: string | null;
}

interface CartRecoveryData {
    stats: {
        active: number;
        recovered: number;
        expired: number;
        total: number;
        recoveryRate: string;
        abandonedValue: number;
        recoveredValue: number;
    };
    carts: CartRow[];
}

const STATUS_STYLES: Record<string, string> = {
    active: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    recovered: "bg-green-500/20 text-green-400 border-green-500/30",
    expired: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AbandonedCartsPage() {
    const [data, setData] = useState<CartRecoveryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "recovered" | "expired">("all");

    useEffect(() => {
        fetch("/api/admin/cart-recovery/")
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
                Failed to load cart recovery data: {error}
            </div>
        );
    }

    const stats = data?.stats;
    const allCarts = data?.carts ?? [];
    const carts = statusFilter === "all"
        ? allCarts
        : allCarts.filter((c) => c.status === statusFilter);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Cart Recovery</h1>
                    <p className="text-white/60 mt-1">
                        Track and recover abandoned shopping carts
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-amber-400">{stats?.active ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Active Abandoned</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-400">
                        ${(stats?.abandonedValue ?? 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">Abandoned Value</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">{stats?.recoveryRate ?? "0.0"}%</div>
                    <div className="text-xs text-zinc-500 mt-1">Recovery Rate</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                        ${(stats?.recoveredValue ?? 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">Recovered Revenue</div>
                </div>
            </div>

            {/* Carts Table */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-semibold">
                        Abandoned Carts
                        <span className="ml-2 text-zinc-500 text-sm">({carts.length})</span>
                    </h2>
                    <div className="flex gap-2">
                        {(["all", "active", "recovered", "expired"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                                    statusFilter === f
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
                                <th className="text-left pb-3 pt-4 pl-6">Customer</th>
                                <th className="text-right pb-3 pt-4">Cart Value</th>
                                <th className="text-right pb-3 pt-4">Emails Sent</th>
                                <th className="text-left pb-3 pt-4">Status</th>
                                <th className="text-right pb-3 pt-4 pr-6">Abandoned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carts.map((cart) => (
                                <tr key={cart.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 pl-6">
                                        <div className="text-sm font-medium">{cart.customerName || cart.email}</div>
                                        {cart.customerName && (
                                            <div className="text-xs text-zinc-500">{cart.email}</div>
                                        )}
                                    </td>
                                    <td className="py-3 text-right font-mono font-bold text-green-400">
                                        ${cart.cartTotal.toFixed(2)}
                                    </td>
                                    <td className="py-3 text-right text-sm text-zinc-400">
                                        {cart.emailsSent}
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${STATUS_STYLES[cart.status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>
                                            {cart.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right pr-6 text-xs text-zinc-500">
                                        {new Date(cart.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {carts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        {statusFilter === "all"
                                            ? "No abandoned carts found."
                                            : `No ${statusFilter} carts found.`}
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
