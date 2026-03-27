"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DollarSign, Calculator, Check, X, ChevronUp, ChevronDown,
  Search, Edit3, Package, TrendingUp, AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

/* ── Constants ───────────────────────────────────────────── */

const GRAMS_PER_UNIT: Record<string, number> = {
  lb: 453.592,
  oz: 28,
  g: 1,
  kg: 1000,
  unit: 1,
};

const UNIT_LABELS: Record<string, string> = {
  lb: "per lb",
  oz: "per oz",
  g: "per g",
  kg: "per kg",
  unit: "per unit",
};

type CostUnit = "lb" | "oz" | "g" | "kg" | "unit";
type SortField = "name" | "category" | "price" | "costPrice" | "margin";
type SortDir = "asc" | "desc";

/* ── Pricing Math ────────────────────────────────────────── */

function costPerGram(cost: number, unit: string): number {
  if (unit === "unit") return cost;
  return cost / GRAMS_PER_UNIT[unit];
}

function sellPerGram(cost: number, unit: string): number {
  return costPerGram(cost, unit) * 2.2;
}

function sellRounded(cost: number, unit: string): number {
  return Math.ceil(sellPerGram(cost, unit) * 100) / 100;
}

function marginPercent(sellPrice: number, cpg: number): number {
  if (sellPrice <= 0) return 0;
  return ((sellPrice - cpg) / sellPrice) * 100;
}

function marginColor(m: number): string {
  if (m >= 50) return "text-green-400";
  if (m >= 30) return "text-yellow-400";
  return "text-red-400";
}

function marginBg(m: number): string {
  if (m >= 50) return "bg-green-500/10 border-green-500/20";
  if (m >= 30) return "bg-yellow-500/10 border-yellow-500/20";
  return "bg-red-500/10 border-red-500/20";
}

/* ── Formatter ───────────────────────────────────────────── */

function fmt(n: number): string {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

/* ── Component ───────────────────────────────────────────── */

export default function PricingPage() {
  /* Calculator state */
  const [calcCost, setCalcCost] = useState<string>("");
  const [calcUnit, setCalcUnit] = useState<CostUnit>("lb");

  /* Product list state */
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  /* Inline edit state */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCost, setEditCost] = useState("");
  const [editUnit, setEditUnit] = useState<CostUnit>("lb");

  /* Bulk apply state */
  const [bulkApplying, setBulkApplying] = useState(false);

  /* ── tRPC ────────────────────────────────────────────── */

  const utils = trpc.useUtils();

  const { data: products = [], isLoading } = trpc.pricing.list.useQuery(
    {
      ...(search ? { search } : {}),
      ...(categoryFilter ? { category: categoryFilter } : {}),
    },
    { refetchOnWindowFocus: false }
  );

  const { data: categories = [] } = trpc.pricing.categories.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const updatePricing = trpc.pricing.updatePricing.useMutation({
    onSuccess: () => {
      utils.pricing.list.invalidate();
      setEditingId(null);
    },
  });

  const bulkUpdate = trpc.pricing.bulkUpdatePricing.useMutation({
    onSuccess: () => {
      utils.pricing.list.invalidate();
      setSelectedIds(new Set());
      setBulkApplying(false);
    },
  });

  /* ── Calculator results ──────────────────────────────── */

  const calcCostNum = parseFloat(calcCost) || 0;
  const calcResults = useMemo(() => {
    if (calcCostNum <= 0) return null;
    const cpg = costPerGram(calcCostNum, calcUnit);
    const spg = cpg * 2.2;
    return {
      costPerGram: cpg,
      sellPerGram: Math.ceil(spg * 100) / 100,
      sellPerEighth: Math.ceil(spg * 3.5 * 100) / 100,
      sellPerQuarter: Math.ceil(spg * 7 * 100) / 100,
      sellPerHalfOz: Math.ceil(spg * 14 * 100) / 100,
      sellPerOz: Math.ceil(spg * 28 * 100) / 100,
    };
  }, [calcCostNum, calcUnit]);

  /* ── Sorting ─────────────────────────────────────────── */

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    arr.sort((a: any, b: any) => {
      let va: any, vb: any;
      switch (sortField) {
        case "name": va = a.name; vb = b.name; break;
        case "category": va = a.category; vb = b.category; break;
        case "price": va = a.price; vb = b.price; break;
        case "costPrice": va = a.costPrice ?? 0; vb = b.costPrice ?? 0; break;
        case "margin": {
          const am = a.costPrice && a.costUnit
            ? marginPercent(a.price, costPerGram(a.costPrice, a.costUnit))
            : -1;
          const bm = b.costPrice && b.costUnit
            ? marginPercent(b.price, costPerGram(b.costPrice, b.costUnit))
            : -1;
          va = am; vb = bm; break;
        }
        default: va = a.name; vb = b.name;
      }
      if (typeof va === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return arr;
  }, [products, sortField, sortDir]);

  /* ── Handlers ────────────────────────────────────────── */

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }, [sortField]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === sortedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedProducts.map((p: any) => p.id)));
    }
  }, [selectedIds.size, sortedProducts]);

  const startEdit = useCallback((product: any) => {
    setEditingId(product.id);
    setEditCost(product.costPrice?.toString() || "");
    setEditUnit(product.costUnit || "lb");
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId || !editCost) return;
    const cost = parseFloat(editCost);
    if (cost <= 0 || isNaN(cost)) return;
    updatePricing.mutate({ productId: editingId, costPrice: cost, costUnit: editUnit });
  }, [editingId, editCost, editUnit, updatePricing]);

  const applyBulk = useCallback(() => {
    if (selectedIds.size === 0 || calcCostNum <= 0) return;
    setBulkApplying(true);
    bulkUpdate.mutate({
      productIds: Array.from(selectedIds),
      costPrice: calcCostNum,
      costUnit: calcUnit,
    });
  }, [selectedIds, calcCostNum, calcUnit, bulkUpdate]);

  /* ── Sort icon helper ────────────────────────────────── */

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-20" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-green-400" />
      : <ChevronDown className="h-3 w-3 text-green-400" />;
  }

  /* ── Render ──────────────────────────────────────────── */

  const inputClass =
    "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20 transition-all";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            Pricing Calculator
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Formula: (Purchase Cost x 2) + 10% = Sell Price
          </p>
        </div>
        {selectedIds.size > 0 && calcCostNum > 0 && (
          <button
            onClick={applyBulk}
            disabled={bulkApplying}
            className="px-5 py-2.5 bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-400 hover:to-green-500 rounded-xl text-sm font-semibold text-black transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {bulkApplying ? (
              <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Apply to {selectedIds.size} Product{selectedIds.size > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* ── Calculator Card ──────────────────────────────── */}
      <div className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-lime-500/5 to-green-500/5">
          <div className="flex items-center gap-2 text-lime-400 font-semibold mb-4">
            <Calculator className="h-5 w-5" />
            Quick Calculator
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Purchase Cost
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={calcCost}
                  onChange={e => setCalcCost(e.target.value)}
                  placeholder="800.00"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Cost Unit
              </label>
              <select
                value={calcUnit}
                onChange={e => setCalcUnit(e.target.value as CostUnit)}
                className={inputClass}
              >
                {Object.entries(UNIT_LABELS).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#12121a]">{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Markup Formula
              </label>
              <div className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300">
                Cost x 2 x 1.10 = <span className="text-lime-400 font-mono">x 2.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results grid */}
        {calcResults && (
          <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <ResultCard label="Cost/g" value={fmt(calcResults.costPerGram)} sub="raw cost" />
            <ResultCard label="Sell/g" value={fmt(calcResults.sellPerGram)} sub="1 gram" accent />
            <ResultCard label="Sell/3.5g" value={fmt(calcResults.sellPerEighth)} sub="eighth" accent />
            <ResultCard label="Sell/7g" value={fmt(calcResults.sellPerQuarter)} sub="quarter" accent />
            <ResultCard label="Sell/14g" value={fmt(calcResults.sellPerHalfOz)} sub="half oz" accent />
            <ResultCard label="Sell/28g" value={fmt(calcResults.sellPerOz)} sub="full oz" accent />
          </div>
        )}
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className={`${inputClass} w-full md:w-56`}
        >
          <option value="" className="bg-[#12121a]">All Categories</option>
          {categories.map((c: string) => (
            <option key={c} value={c} className="bg-[#12121a]">{c}</option>
          ))}
        </select>
      </div>

      {/* ── Product Table ────────────────────────────────── */}
      <div className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={sortedProducts.length > 0 && selectedIds.size === sortedProducts.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-white/10 border-white/20 text-lime-500 focus:ring-lime-500/30"
                  />
                </th>
                <ThSort label="Product" field="name" current={sortField} dir={sortDir} onClick={toggleSort} />
                <ThSort label="Category" field="category" current={sortField} dir={sortDir} onClick={toggleSort} />
                <ThSort label="Current Price" field="price" current={sortField} dir={sortDir} onClick={toggleSort} />
                <ThSort label="Cost Price" field="costPrice" current={sortField} dir={sortDir} onClick={toggleSort} />
                <th className="p-3 text-left text-xs text-zinc-500 uppercase tracking-wider">Cost Unit</th>
                <th className="p-3 text-left text-xs text-zinc-500 uppercase tracking-wider">Suggested</th>
                <ThSort label="Margin" field="margin" current={sortField} dir={sortDir} onClick={toggleSort} />
                <th className="p-3 text-right text-xs text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-5 w-5 border-2 border-zinc-600 border-t-lime-500 rounded-full animate-spin" />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-zinc-500">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No products found
                  </td>
                </tr>
              ) : (
                sortedProducts.map((p: any) => {
                  const isEditing = editingId === p.id;
                  const hasCost = p.costPrice && p.costUnit;
                  const cpg = hasCost ? costPerGram(p.costPrice, p.costUnit) : 0;
                  const suggested = hasCost ? sellRounded(p.costPrice, p.costUnit) : 0;
                  const margin = hasCost ? marginPercent(p.price, cpg) : -1;

                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                        selectedIds.has(p.id) ? "bg-lime-500/5" : ""
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="rounded bg-white/10 border-white/20 text-lime-500 focus:ring-lime-500/30"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {p.image && (
                            <img
                              src={p.image}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover bg-white/5"
                            />
                          )}
                          <span className="font-medium text-white truncate max-w-[200px]">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-zinc-400">{p.category}</td>
                      <td className="p-3 font-mono text-white">{fmt(p.price)}</td>

                      {/* Cost Price — inline edit */}
                      <td className="p-3">
                        {isEditing ? (
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editCost}
                              onChange={e => setEditCost(e.target.value)}
                              className="w-24 px-2 py-1 pl-5 bg-white/10 border border-lime-500/30 rounded text-white text-xs font-mono focus:outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="font-mono text-zinc-400">
                            {hasCost ? fmt(p.costPrice) : "--"}
                          </span>
                        )}
                      </td>

                      {/* Cost Unit */}
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={editUnit}
                            onChange={e => setEditUnit(e.target.value as CostUnit)}
                            className="px-2 py-1 bg-white/10 border border-lime-500/30 rounded text-white text-xs focus:outline-none"
                          >
                            {Object.entries(UNIT_LABELS).map(([k, v]) => (
                              <option key={k} value={k} className="bg-[#12121a]">{v}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-zinc-500 text-xs uppercase">
                            {hasCost ? p.costUnit : "--"}
                          </span>
                        )}
                      </td>

                      {/* Suggested price */}
                      <td className="p-3">
                        {isEditing && editCost ? (
                          <span className="font-mono text-lime-400 text-xs">
                            {fmt(sellRounded(parseFloat(editCost) || 0, editUnit))}/g
                          </span>
                        ) : hasCost ? (
                          <span className="font-mono text-lime-400 text-xs">
                            {fmt(suggested)}/g
                          </span>
                        ) : (
                          <span className="text-zinc-600">--</span>
                        )}
                      </td>

                      {/* Margin */}
                      <td className="p-3">
                        {hasCost && margin >= 0 ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${marginBg(margin)} ${marginColor(margin)}`}>
                            <TrendingUp className="h-3 w-3" />
                            {margin.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-zinc-600">--</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={saveEdit}
                              disabled={updatePricing.isPending}
                              className="p-1.5 rounded-lg bg-lime-500/10 text-lime-400 hover:bg-lime-500/20 transition-colors disabled:opacity-50"
                              title="Save"
                            >
                              {updatePricing.isPending ? (
                                <div className="h-3.5 w-3.5 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 transition-colors"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(p)}
                            className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                            title="Edit cost"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer stats */}
        {sortedProducts.length > 0 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
            <span>{sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}</span>
            <span>
              {sortedProducts.filter((p: any) => p.costPrice).length} with cost data |{" "}
              {selectedIds.size} selected
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function ResultCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        accent
          ? "bg-lime-500/5 border-lime-500/10"
          : "bg-white/[0.02] border-white/5"
      }`}
    >
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono ${accent ? "text-lime-400" : "text-white"}`}>
        {value}
      </div>
      <div className="text-[10px] text-zinc-600 mt-0.5">{sub}</div>
    </div>
  );
}

function ThSort({
  label,
  field,
  current,
  dir,
  onClick,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: SortDir;
  onClick: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <th
      className="p-3 text-left text-xs text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors select-none"
      onClick={() => onClick(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp className="h-3 w-3 text-lime-400" />
          ) : (
            <ChevronDown className="h-3 w-3 text-lime-400" />
          )
        ) : (
          <ChevronUp className="h-3 w-3 opacity-20" />
        )}
      </span>
    </th>
  );
}
