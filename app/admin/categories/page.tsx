"use client";

import { useEffect, useState } from "react";
import { Package, Layers, CheckCircle, XCircle } from "lucide-react";

interface CategoryRow {
    name: string;
    slug: string;
    productCount: number;
    activeCount: number;
    draftCount: number;
    outOfStockCount: number;
}

interface CategoriesData {
    categories: CategoryRow[];
    totalCategories: number;
    totalProducts: number;
}

export default function AdminCategoriesPage() {
    const [data, setData] = useState<CategoriesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/categories/")
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
                Failed to load categories: {error}
            </div>
        );
    }

    const categories = data?.categories ?? [];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Categories</h1>
                <p className="text-white/60 mt-1">
                    Product categories with inventory breakdown
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <Layers className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{data?.totalCategories ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Total Categories</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <Package className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{data?.totalProducts ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Total Products</div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">
                        {categories.reduce((s, c) => s + c.activeCount, 0)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">Active Products</div>
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                    <h2 className="font-semibold">All Categories</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase">
                                <th className="text-left pb-3 pt-4 pl-6">Category</th>
                                <th className="text-left pb-3 pt-4">Slug</th>
                                <th className="text-right pb-3 pt-4">Products</th>
                                <th className="text-right pb-3 pt-4">Active</th>
                                <th className="text-right pb-3 pt-4">Draft</th>
                                <th className="text-right pb-3 pt-4 pr-6">Out of Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.slug} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 pl-6">
                                        <span className="font-semibold">{cat.name}</span>
                                    </td>
                                    <td className="py-3">
                                        <span className="font-mono text-xs text-zinc-400">{cat.slug}</span>
                                    </td>
                                    <td className="py-3 text-right">
                                        <span className="font-bold text-green-400">{cat.productCount}</span>
                                    </td>
                                    <td className="py-3 text-right">
                                        <span className="text-sm text-emerald-400">{cat.activeCount}</span>
                                    </td>
                                    <td className="py-3 text-right">
                                        <span className="text-sm text-zinc-400">{cat.draftCount}</span>
                                    </td>
                                    <td className="py-3 text-right pr-6">
                                        {cat.outOfStockCount > 0 ? (
                                            <span className="text-sm text-red-400 flex items-center justify-end gap-1">
                                                <XCircle className="h-3 w-3" />
                                                {cat.outOfStockCount}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-zinc-600">0</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        No categories found. Products will be grouped by their category field.
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
