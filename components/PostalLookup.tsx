"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Truck,
  Clock,
  DollarSign,
  Loader2,
  Search,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Leaf,
} from "lucide-react";
import type { PostalLookupResult } from "@/lib/postalLookup";

type LookupError = { valid: false; error: { en: string; fr: string } };
type LookupResponse = PostalLookupResult | LookupError | null;

export default function PostalLookup({ subtotal = 0 }: { subtotal?: number }) {
  const [postalCode, setPostalCode] = useState("");
  const [result, setResult] = useState<LookupResponse>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const code = postalCode.trim();
      if (code.length < 3) return;

      setLoading(true);
      setError("");
      setResult(null);

      try {
        const params = new URLSearchParams({ postalCode: code, subtotal: String(subtotal) });
        const res = await fetch(`/api/postal-lookup?${params}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong");
          return;
        }

        setResult(data);
      } catch {
        setError("Failed to look up postal code. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [postalCode, subtotal]
  );

  const validResult = result && result.valid === true ? (result as PostalLookupResult) : null;
  const errorResult = result && result.valid === false && "error" in result ? (result as LookupError) : null;

  return (
    <div className="w-full">
      {/* Search Form */}
      <form onSubmit={handleLookup} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-500/60" />
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
            placeholder="Enter postal code (e.g., M5V 1A1)"
            maxLength={7}
            autoComplete="postal-code"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500/50 tracking-wider"
          />
        </div>
        <button
          type="submit"
          disabled={loading || postalCode.trim().length < 3}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-lime-600 hover:bg-lime-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-black transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {loading ? "Checking..." : "Check"}
        </button>
      </form>

      {/* Error States */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {errorResult && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorResult.error.en}</span>
        </div>
      )}

      {/* Results */}
      {validResult && (
        <div className="mt-4 rounded-xl bg-card border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-lime-600/10 border-b border-border">
            <CheckCircle2 className="w-4 h-4 text-lime-500" />
            <span className="text-sm font-semibold text-foreground">
              Delivery estimate for{" "}
              <span className="text-lime-500">{validResult.postalCode}</span>
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            {/* Province */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-lime-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Province</p>
                <p className="text-sm font-semibold text-foreground">
                  {validResult.province.name.en}
                </p>
              </div>
            </div>

            {/* Region */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivery Region</p>
                <p className="text-sm font-semibold text-foreground">
                  {validResult.region.name.en}
                </p>
                <p className="text-xs text-muted-foreground">
                  {validResult.region.carrier}
                </p>
              </div>
            </div>

            {/* Estimated Days */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                <p className="text-lg font-bold text-foreground">
                  {validResult.region.deliveryDays.min}-{validResult.region.deliveryDays.max}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    business days
                  </span>
                </p>
              </div>
            </div>

            {/* Shipping Cost */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Shipping Cost</p>
                {validResult.shipping.isFree ? (
                  <p className="text-lg font-bold text-lime-500">FREE</p>
                ) : (
                  <>
                    <p className="text-lg font-bold text-foreground">
                      ${validResult.shipping.flatRate}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        flat rate
                      </span>
                    </p>
                    <p className="text-xs text-lime-500">
                      Free shipping on orders over ${validResult.shipping.freeThreshold}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Nearest City Link */}
          {validResult.nearestCity && (
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Nearest Delivery Hub
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {validResult.nearestCity.name.en},{" "}
                      {validResult.province.abbreviation}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/delivery/${validResult.nearestCity.provinceSlug}/${validResult.nearestCity.slug}`}
                  className="flex items-center gap-1 text-xs font-medium text-lime-500 hover:text-lime-400 transition-colors"
                >
                  View info <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
