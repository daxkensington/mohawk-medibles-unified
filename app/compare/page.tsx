import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/products";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Compare Products | Side-by-Side Cannabis Comparison",
    description:
        "Compare cannabis products side by side at Mohawk Medibles. View prices, specs, ratings and availability in one place.",
    alternates: {
        canonical: "https://mohawkmedibles.ca/compare",
    },
};

export default async function ComparePage({
    searchParams,
}: {
    searchParams: Promise<{ ids?: string }>;
}) {
    const params = await searchParams;

    const ids = params.ids
        ? params.ids
              .split(",")
              .map(Number)
              .filter((n) => !isNaN(n))
        : [];

    // Fetch products using the unified product service
    const allProducts = await getAllProducts();
    const compareProducts = ids.length > 0
        ? allProducts.filter((p) => ids.includes(p.id))
        : [];

    // Fetch supplementary DB data (sale prices, inventory, reviews) for compared products
    let saleMap = new Map<number, number | null>();
    let stockMap = new Map<number, number>();
    let ratingsMap = new Map<number, { avg: number; count: number }>();

    if (ids.length > 0) {
        const [dbProducts, inventoryData, reviewData] = await Promise.all([
            prisma.product.findMany({
                where: { id: { in: ids } },
                select: { id: true, salePrice: true },
            }),
            prisma.inventory.findMany({
                where: { productId: { in: ids } },
                select: { productId: true, quantity: true },
            }),
            prisma.review.groupBy({
                by: ["productId"],
                where: {
                    productId: { in: ids },
                    status: "APPROVED",
                },
                _avg: { rating: true },
                _count: { rating: true },
            }),
        ]);

        for (const p of dbProducts) {
            saleMap.set(p.id, p.salePrice);
        }
        for (const inv of inventoryData) {
            stockMap.set(inv.productId, inv.quantity);
        }
        for (const r of reviewData) {
            ratingsMap.set(r.productId, {
                avg: Math.round((r._avg.rating ?? 0) * 10) / 10,
                count: r._count.rating,
            });
        }
    }

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-b from-forest/10 to-background dark:from-forest/5 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground mb-3">
                        Compare Products
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Side-by-side comparison
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {compareProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-muted-foreground mb-4">
                            No products to compare
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            Add products to compare from the shop page
                        </p>
                        <Button asChild>
                            <Link href="/shop">Browse Products</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="p-4 text-left text-muted-foreground font-medium min-w-[120px]">
                                        Feature
                                    </th>
                                    {compareProducts.map((p) => (
                                        <th key={p.id} className="p-4 min-w-[200px]">
                                            <Link
                                                href={`/product/${p.slug}`}
                                                className="block group"
                                            >
                                                {p.image && (
                                                    <div className="w-28 h-28 relative mx-auto mb-3 rounded-lg overflow-hidden bg-muted">
                                                        <Image
                                                            src={p.image}
                                                            alt={p.altText || p.name}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform"
                                                            sizes="112px"
                                                        />
                                                    </div>
                                                )}
                                                <span className="text-foreground font-bold group-hover:text-forest dark:group-hover:text-lime transition-colors">
                                                    {p.name}
                                                </span>
                                            </Link>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Price */}
                                <tr className="border-t border-border">
                                    <td className="p-4 text-muted-foreground font-medium">
                                        Price
                                    </td>
                                    {compareProducts.map((p) => {
                                        const sale = saleMap.get(p.id);
                                        return (
                                            <td
                                                key={p.id}
                                                className="p-4 text-center"
                                            >
                                                {sale ? (
                                                    <div>
                                                        <span className="text-red-400 font-bold text-lg">
                                                            ${sale.toFixed(2)}
                                                        </span>
                                                        <span className="text-muted-foreground text-xs line-through ml-1">
                                                            ${p.price.toFixed(2)}
                                                        </span>
                                                        <span className="block text-xs text-green-400 mt-0.5">
                                                            Save $
                                                            {(p.price - sale).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-forest dark:text-lime font-bold text-lg">
                                                        ${p.price.toFixed(2)}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* Rating */}
                                <tr className="border-t border-border">
                                    <td className="p-4 text-muted-foreground font-medium">
                                        Rating
                                    </td>
                                    {compareProducts.map((p) => {
                                        const rating = ratingsMap.get(p.id);
                                        return (
                                            <td
                                                key={p.id}
                                                className="p-4 text-center"
                                            >
                                                {rating && rating.count > 0 ? (
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <StarRating
                                                            rating={rating.avg}
                                                        />
                                                        <span className="text-xs text-muted-foreground">
                                                            {rating.avg} (
                                                            {rating.count})
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">
                                                        No reviews
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* Category */}
                                <tr className="border-t border-border">
                                    <td className="p-4 text-muted-foreground font-medium">
                                        Category
                                    </td>
                                    {compareProducts.map((p) => (
                                        <td
                                            key={p.id}
                                            className="p-4 text-center text-foreground"
                                        >
                                            {p.category || "\u2014"}
                                        </td>
                                    ))}
                                </tr>

                                {/* Weight */}
                                <tr className="border-t border-border">
                                    <td className="p-4 text-muted-foreground font-medium">
                                        Weight
                                    </td>
                                    {compareProducts.map((p) => (
                                        <td
                                            key={p.id}
                                            className="p-4 text-center text-foreground"
                                        >
                                            {p.specs.weight && p.specs.weight !== "TBD"
                                                ? p.specs.weight
                                                : "\u2014"}
                                        </td>
                                    ))}
                                </tr>

                                {/* THC */}
                                <tr className="border-t border-border">
                                    <td className="p-4 text-muted-foreground font-medium">
                                        THC
                                    </td>
                                    {compareProducts.map((p) => (
                                        <td
                                            key={p.id}
                                            className="p-4 text-center text-foreground"
                                        >
                                            {p.specs.thc && p.specs.thc !== "TBD"
                                                ? p.specs.thc
                                                : "\u2014"}
                                        </td>
                                    ))}
                                </tr>

                                {/* CBD */}
                                <tr className="border-t border-border">
                                    <td className="p-4 text-muted-foreground font-medium">
                                        CBD
                                    </td>
                                    {compareProducts.map((p) => (
                                        <td
                                            key={p.id}
                                            className="p-4 text-center text-foreground"
                                        >
                                            {p.specs.cbd && p.specs.cbd !== "TBD"
                                                ? p.specs.cbd
                                                : "\u2014"}
                                        </td>
                                    ))}
                                </tr>

                                {/* Type / Strain */}
                                <tr className="border-t border-border">
                                    <td className="p-4 text-muted-foreground font-medium">
                                        Type
                                    </td>
                                    {compareProducts.map((p) => (
                                        <td
                                            key={p.id}
                                            className="p-4 text-center text-foreground"
                                        >
                                            {p.specs.type || "\u2014"}
                                        </td>
                                    ))}
                                </tr>

                                {/* Stock */}
                                <tr className="border-t border-border">
                                    <td className="p-4 text-muted-foreground font-medium">
                                        Availability
                                    </td>
                                    {compareProducts.map((p) => {
                                        const qty = stockMap.get(p.id);
                                        const inStock =
                                            qty !== undefined ? qty > 0 : true;
                                        return (
                                            <td
                                                key={p.id}
                                                className="p-4 text-center"
                                            >
                                                {inStock ? (
                                                    <span className="inline-flex items-center gap-1.5 text-green-400">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                                                        In Stock
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-red-400">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* Badges */}
                                <tr className="border-t border-border">
                                    <td className="p-4 text-muted-foreground font-medium">
                                        Badges
                                    </td>
                                    {compareProducts.map((p) => {
                                        const sale = saleMap.get(p.id);
                                        const hasBadge = !!sale || p.featured;
                                        return (
                                            <td
                                                key={p.id}
                                                className="p-4 text-center"
                                            >
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {sale && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-red-600/20 text-red-400 rounded font-bold">
                                                            SALE
                                                        </span>
                                                    )}
                                                    {p.featured && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-forest/20 text-forest dark:text-lime rounded font-bold">
                                                            FEATURED
                                                        </span>
                                                    )}
                                                    {!hasBadge && (
                                                        <span className="text-muted-foreground text-xs">
                                                            {"\u2014"}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* Description */}
                                <tr className="border-t border-border">
                                    <td className="p-4 text-muted-foreground font-medium align-top">
                                        Description
                                    </td>
                                    {compareProducts.map((p) => (
                                        <td
                                            key={p.id}
                                            className="p-4 text-center text-muted-foreground text-xs leading-relaxed"
                                        >
                                            {p.shortDescription || "\u2014"}
                                        </td>
                                    ))}
                                </tr>

                                {/* Action */}
                                <tr className="border-t border-border">
                                    <td className="p-4" />
                                    {compareProducts.map((p) => (
                                        <td
                                            key={p.id}
                                            className="p-4 text-center"
                                        >
                                            <Button asChild size="sm">
                                                <Link
                                                    href={`/product/${p.slug}`}
                                                >
                                                    View Product
                                                </Link>
                                            </Button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Inline StarRating Component ─────────────────────────────
// Matches the pattern used in app/reviews/page.tsx

function StarRating({
    rating,
    size = 16,
}: {
    rating: number;
    size?: number;
}) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = rating >= star;
                const half = !filled && rating >= star - 0.5;
                return (
                    <svg
                        key={star}
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={filled ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className={
                            filled
                                ? "text-amber-400"
                                : half
                                  ? "text-amber-400"
                                  : "text-muted-foreground/30"
                        }
                    >
                        {half ? (
                            <>
                                <defs>
                                    <linearGradient id={`half-${star}`}>
                                        <stop
                                            offset="50%"
                                            stopColor="currentColor"
                                        />
                                        <stop
                                            offset="50%"
                                            stopColor="transparent"
                                        />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                    fill={`url(#half-${star})`}
                                />
                            </>
                        ) : (
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        )}
                    </svg>
                );
            })}
        </div>
    );
}
