import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Flame, Zap, TrendingUp, Star, ArrowRight, Percent, Gift, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/products";
import DealsClient from "./DealsClient";

export const metadata: Metadata = {
    title: "Cannabis Deals & Promotions — Save on Premium Weed",
    description:
        "Save on premium lab-tested cannabis with active deals from Mohawk Medibles. Daily deals with countdown timers, free shipping over $149, bulk discounts, staff picks & best sellers. Indigenous-owned dispensary.",
    keywords: [
        "cannabis deals canada",
        "weed deals online",
        "cheap weed canada",
        "cannabis promotions",
        "mohawk medibles deals",
        "bulk cannabis discount",
        "free shipping cannabis canada",
        "dispensary deals",
        "cannabis sale canada",
        "best weed deals online",
        "daily deals cannabis",
    ],
    openGraph: {
        title: "Cannabis Deals & Promotions",
        description:
            "Save on 360+ premium cannabis products. Daily deals with countdown timers, free shipping over $149, bulk discounts, and more.",
        url: "https://mohawkmedibles.ca/deals",
        type: "website",
        images: ["/og-image.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Cannabis Deals",
        description: "Premium cannabis deals. Free shipping over $149 Canada-wide.",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/deals",
    },
};

export default async function DealsPage() {
    const products = await getAllProducts();

    const featuredProducts = products
        .filter((p) => p.featured)
        .slice(0, 4);

    const staffPicks = featuredProducts.length > 0
        ? featuredProducts
        : products.slice(0, 4);

    const bestSellers = products.slice(4, 8);

    return (
        <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
            {/* Hero Section — Fire-themed */}
            <section className="relative container mx-auto px-6 mb-20 overflow-hidden">
                {/* Animated fire glow blobs */}
                <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[150px] animate-float pointer-events-none" />
                <div className="absolute -top-10 right-1/4 w-[400px] h-[400px] bg-red-500/8 dark:bg-red-500/4 rounded-full blur-[120px] animate-float pointer-events-none" style={{ animationDelay: "-3s" }} />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-yellow-500/6 dark:bg-yellow-500/3 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: "-6s" }} />

                <div className="relative text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-full px-5 py-2 mb-6 animate-glow-pulse">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Hot Deals Drop Daily</span>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase mb-6">
                        <span className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">Blazing</span>{" "}
                        <span className="text-foreground">Deals</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                        Save on premium, lab-tested cannabis with our active offers. From daily deals to bulk discounts,
                        we&apos;re committed to making Empire Standard&trade; quality accessible to all Canadians.
                    </p>

                    {/* Quick stat pills */}
                    <div className="flex flex-wrap justify-center gap-4 mb-4">
                        {[
                            { icon: Percent, label: "Up to 40% Off", color: "text-red-500" },
                            { icon: Truck, label: "Free Ship $149+", color: "text-blue-500" },
                            { icon: Gift, label: "Mix & Match Savings", color: "text-purple-500" },
                            { icon: Zap, label: "New Deals Daily", color: "text-orange-500" },
                        ].map((pill) => (
                            <div key={pill.label} className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg shadow-black/5">
                                <pill.icon className={`h-4 w-4 ${pill.color}`} />
                                <span className="text-sm font-semibold text-foreground">{pill.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Daily Deals Section with Countdown Timers */}
            <section className="container mx-auto px-6 mb-20">
                <div className="flex items-center gap-4 mb-10">
                    <div className="relative p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
                        <Flame className="h-7 w-7 text-orange-500" />
                        <div className="absolute inset-0 rounded-2xl animate-glow-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">
                                Daily Deals
                            </h2>
                            <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full animate-pulse">
                                Live Now
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Limited-time offers with countdown timers — grab them before they expire
                        </p>
                    </div>
                </div>
                <DealsClient />
            </section>

            {/* Active Offers Section */}
            <section className="container mx-auto px-6 mb-20">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                        <Zap className="h-7 w-7 text-green-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">
                            Active Offers
                        </h2>
                        <p className="text-sm text-muted-foreground">Stack these savings on every order</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-8 stagger-children">
                    {[
                        { title: "Free Shipping", desc: <>Free shipping on all orders over <span className="font-bold text-forest dark:text-lime">$149 CAD</span> — Canada-wide via Xpresspost. Fast, discreet, secure delivery.</>, href: "/shop", image: "/assets/cards/deals-shipping.webp", icon: Truck, gradient: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-500" },
                        { title: "Mix & Match", desc: <>Buy any <span className="font-bold text-forest dark:text-lime">3 edibles</span>, get <span className="font-bold text-forest dark:text-lime">10% off</span> your edible total. Mix flavors, strains, and potencies — your choice.</>, href: "/shop?category=Edibles", image: "/assets/cards/deals-mixmatch.webp", icon: Gift, gradient: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-500" },
                        { title: "Bulk Savings", desc: <>Ounce deals starting at <span className="font-bold text-forest dark:text-lime">$40</span> — premium flower at unbeatable prices. Perfect for serious enthusiasts.</>, href: "/shop?category=Flower", image: "/assets/cards/deals-bulk.webp", icon: TrendingUp, gradient: "from-orange-500/20 to-red-500/20", iconColor: "text-orange-500" },
                    ].map((offer) => (
                        <div key={offer.title} className="group relative overflow-hidden rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute inset-0">
                                <Image src={offer.image} alt={offer.title} fill className="object-cover opacity-20 dark:opacity-15 group-hover:opacity-30 dark:group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" />
                            </div>
                            {/* Shimmer on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            </div>
                            <div className="relative z-10 p-8 backdrop-blur-sm">
                                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${offer.gradient} mb-4`}>
                                    <offer.icon className={`h-6 w-6 ${offer.iconColor}`} />
                                </div>
                                <h3 className="text-2xl font-black text-forest dark:text-lime mb-3 uppercase tracking-wide">
                                    {offer.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    {offer.desc}
                                </p>
                                <Link href={offer.href}>
                                    <Button variant="brand" size="lg" className="group/btn">
                                        Shop Now
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Staff Picks Section */}
            <section className="container mx-auto px-6 mb-20">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
                        <Star className="h-7 w-7 text-yellow-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">
                            Staff Picks
                        </h2>
                        <p className="text-sm text-muted-foreground">Hand-selected by our team for quality and value</p>
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {staffPicks.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="group relative h-[300px] rounded-2xl overflow-hidden glass-card border border-border hover:border-secondary/50 transition-all duration-500"
                        >
                            {product.image && (
                                <Image
                                    src={product.image}
                                    alt={product.altText || product.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent" />
                            <div className="absolute top-4 left-4 bg-secondary/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                                {product.category}
                            </div>
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border border-border px-3 py-1 rounded-full text-sm font-bold text-forest dark:text-lime">
                                ${product.price.toFixed(2)}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-lg font-bold text-white line-clamp-2">
                                    {product.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Best Sellers Section */}
            <section className="container mx-auto px-6 mb-20">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                        <TrendingUp className="h-7 w-7 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">
                            Best Sellers
                        </h2>
                        <p className="text-sm text-muted-foreground">The most popular products our customers love</p>
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bestSellers.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="group relative h-[300px] rounded-2xl overflow-hidden glass-card border border-border hover:border-secondary/50 transition-all duration-500"
                        >
                            {product.image && (
                                <Image
                                    src={product.image}
                                    alt={product.altText || product.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent" />
                            <div className="absolute top-4 left-4 bg-secondary/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                                {product.category}
                            </div>
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border border-border px-3 py-1 rounded-full text-sm font-bold text-forest dark:text-lime">
                                ${product.price.toFixed(2)}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-lg font-bold text-white line-clamp-2">
                                    {product.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-6 text-center">
                <div className="relative overflow-hidden p-12 md:p-16 rounded-3xl max-w-3xl mx-auto shadow-2xl shadow-black/10 dark:shadow-black/30">
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest/95 to-emerald-800 dark:from-charcoal-deep dark:via-charcoal-deep dark:to-forest/40" />
                    <div className="absolute inset-0 opacity-10 animate-gradient-shift" style={{ backgroundImage: "linear-gradient(45deg, transparent, rgba(200,230,62,0.3), transparent)", backgroundSize: "200% 200%" }} />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase">
                            Browse All 360+ Products
                        </h2>
                        <p className="text-white/70 mb-8 text-lg max-w-lg mx-auto">
                            Discover our complete selection of premium cannabis products, all meeting the Empire Standard&trade;.
                        </p>
                        <Link href="/shop">
                            <Button size="lg" className="bg-white text-forest hover:bg-white/90 font-black text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                Explore Full Shop
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
