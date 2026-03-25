"use client";

/**
 * ProductCard — Ian's design, our data layer
 * Reusable across homepage, shop, search, recommendations.
 * Design: .cc card with hover scale, badges, quick actions
 * Data: Prisma Product type from lib/products.ts
 */

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useLocale } from "@/components/LocaleProvider";

export interface ProductCardProps {
    product: {
        id: number;
        slug: string;
        name: string;
        category: string;
        price: number;
        salePrice?: number | null;
        image: string;
        images?: string[];
        featured?: boolean;
        bestSeller?: boolean;
        specs?: {
            weight?: string;
            thc?: string;
        };
        avgRating?: number;
        reviewCount?: number;
        stockQuantity?: number;
    };
    variant?: "default" | "compact" | "horizontal";
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
    const { addItem } = useCart();
    const { toggleItem, isInWishlist } = useWishlist();
    const { t } = useLocale();
    const isWishlisted = isInWishlist(String(product.id));

    const hasImage = product.image && product.image.startsWith("http");
    const isOnSale = product.salePrice && product.salePrice < product.price;
    const outOfStock = product.stockQuantity !== undefined && product.stockQuantity <= 0;
    const displayPrice = isOnSale ? product.salePrice! : product.price;

    function handleQuickAdd(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: String(product.id),
            name: product.name,
            price: displayPrice,
            image: product.image,
            quantity: 1,
        });
    }

    function handleWishlist(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        toggleItem({
            id: String(product.id),
            name: product.name,
            price: displayPrice,
            image: product.image,
            slug: product.slug,
            category: product.category,
        });
    }

    if (variant === "compact") {
        return (
            <Link
                href={`/product/${product.slug}`}
                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-card transition-colors"
            >
                <div className="w-12 h-12 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {hasImage ? (
                        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" />
                    ) : (
                        <div className="w-full h-full bg-muted/50" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{product.name}</p>
                    <p className="text-xs text-primary font-bold">${displayPrice.toFixed(2)}</p>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
        >
            {/* Image */}
            <div className="aspect-square relative bg-white overflow-hidden">
                {hasImage ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/30 text-muted-foreground text-sm">
                        No Image
                    </div>
                )}

                {/* Badges */}
                {isOnSale && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        Sale
                    </span>
                )}
                {product.bestSeller ? (
                    <span className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded">
                        Best Seller
                    </span>
                ) : product.featured ? (
                    <span className="absolute top-2 right-2 bg-primary text-black text-[10px] font-bold px-2 py-1 rounded">
                        Featured
                    </span>
                ) : null}

                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                        onClick={handleWishlist}
                        className={`p-2.5 rounded-full backdrop-blur-sm transition-colors ${
                            isWishlisted
                                ? "bg-red-500/90 text-white"
                                : "bg-white/90 text-black hover:bg-primary hover:text-black"
                        }`}
                        aria-label="Add to wishlist"
                    >
                        <Heart className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                    <Link
                        href={`/product/${product.slug}`}
                        className="p-2.5 bg-white/90 rounded-full text-black hover:bg-primary hover:text-black transition-colors"
                        aria-label="Quick view"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    {!outOfStock && (
                        <button
                            onClick={handleQuickAdd}
                            className="p-2.5 bg-primary/90 rounded-full text-black hover:bg-primary transition-colors"
                            aria-label="Quick add to cart"
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                    {product.category}
                </p>
                <h3 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                    {product.name}
                </h3>
                {product.specs?.weight && (
                    <p className="text-[10px] text-muted-foreground mb-1">{product.specs.weight}</p>
                )}

                {/* Rating */}
                {(product.avgRating ?? 0) > 0 && (
                    <div className="flex items-center gap-1 mb-1.5">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-3 h-3 ${star <= (product.avgRating ?? 0) ? "text-amber-400" : "text-border"}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">${displayPrice.toFixed(2)}</span>
                    {isOnSale && (
                        <span className="text-muted-foreground text-sm line-through">${product.price.toFixed(2)}</span>
                    )}
                </div>

                {outOfStock && (
                    <p className="text-xs text-red-400 mt-1">Out of Stock</p>
                )}
            </div>
        </Link>
    );
}
