/**
 * FAQ — Mohawk Medibles
 * Frequently asked questions with expandable sections.
 */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Search, MessageSquare, ShoppingCart, Truck, FlaskConical, RotateCcw, UserCircle, Sparkles, Mail, ArrowRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface FaqItem {
    q: string;
    a: string;
}

interface FaqSection {
    title: string;
    items: FaqItem[];
}

const SECTION_ICONS: Record<string, typeof ShoppingCart> = {
    "0": ShoppingCart,
    "1": Truck,
    "2": FlaskConical,
    "3": RotateCcw,
    "4": UserCircle,
};

function FaqAccordion({ item }: { item: FaqItem }) {
    const [open, setOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        }
    }, [open, item.a]);

    return (
        <div className="border-b border-border/50 last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-5 text-left group"
            >
                <span className={`text-sm font-semibold pr-4 transition-colors duration-200 ${open ? "text-forest dark:text-lime" : "text-foreground group-hover:text-green-600 dark:group-hover:text-green-400"}`}>
                    {item.q}
                </span>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${open ? "bg-forest/10 dark:bg-lime/10 rotate-180" : "bg-muted/50 group-hover:bg-forest/10 dark:group-hover:bg-lime/10"}`}>
                    <ChevronDown
                        className={`h-4 w-4 transition-colors duration-200 ${open ? "text-forest dark:text-lime" : "text-muted-foreground/60"}`}
                    />
                </div>
            </button>
            <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: open ? `${height}px` : "0px", opacity: open ? 1 : 0 }}
            >
                <div ref={contentRef} className="pb-5 text-sm text-muted-foreground leading-relaxed pr-8">
                    {item.a}
                </div>
            </div>
        </div>
    );
}

export default function FaqPage() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const { t } = useLocale();

    const FAQ_DATA: FaqSection[] = [
        {
            title: t("faq.orderingPayment"),
            items: [
                { q: t("faq.faqQ1"), a: t("faq.faqA1") },
                { q: t("faq.faqQ2"), a: t("faq.faqA2") },
                { q: t("faq.faqQ3"), a: t("faq.faqA3") },
                { q: t("faq.faqQ4"), a: t("faq.faqA4") },
                { q: t("faq.faqQ5"), a: t("faq.faqA5") },
            ],
        },
        {
            title: t("faq.shippingDelivery"),
            items: [
                { q: t("faq.faqQ6"), a: t("faq.faqA6") },
                { q: t("faq.faqQ7"), a: t("faq.faqA7") },
                { q: t("faq.faqQ8"), a: t("faq.faqA8") },
                { q: t("faq.faqQ9"), a: t("faq.faqA9") },
                { q: t("faq.faqQ10"), a: t("faq.faqA10") },
                { q: t("faq.faqQ11"), a: t("faq.faqA11") },
            ],
        },
        {
            title: t("faq.productsQuality"),
            items: [
                { q: t("faq.faqQ12"), a: t("faq.faqA12") },
                { q: t("faq.faqQ13"), a: t("faq.faqA13") },
                { q: t("faq.faqQ14"), a: t("faq.faqA14") },
                { q: t("faq.faqQ15"), a: t("faq.faqA15") },
            ],
        },
        {
            title: t("faq.returnsRefunds"),
            items: [
                { q: t("faq.faqQ16"), a: t("faq.faqA16") },
                { q: t("faq.faqQ17"), a: t("faq.faqA17") },
                { q: t("faq.faqQ18"), a: t("faq.faqA18") },
            ],
        },
        {
            title: t("faq.accountPrivacy"),
            items: [
                { q: t("faq.faqQ19"), a: t("faq.faqA19") },
                { q: t("faq.faqQ20"), a: t("faq.faqA20") },
                { q: t("faq.faqQ21"), a: t("faq.faqA21") },
            ],
        },
    ];

    const filteredSections = FAQ_DATA.map((section, idx) => ({
        ...section,
        items: section.items.filter(
            (item) =>
                item.q.toLowerCase().includes(search.toLowerCase()) ||
                item.a.toLowerCase().includes(search.toLowerCase())
        ),
        originalIndex: idx,
    })).filter((section) => section.items.length > 0)
      .filter((section) => activeCategory === null || section.originalIndex === activeCategory);

    return (
        <div className="relative min-h-screen bg-background">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='currentColor' stroke-width='0.5'%3E%3Cpath d='M40 0L60 20L40 40L20 20Z'/%3E%3Cpath d='M0 40L20 20L40 40L20 60Z'/%3E%3Cpath d='M40 40L60 20L80 40L60 60Z'/%3E%3Cpath d='M40 40L60 60L40 80L20 60Z'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: "80px 80px" }} />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lime/[0.04] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
                <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-forest/[0.05] dark:bg-lime/[0.03] rounded-full blur-[100px] -translate-x-1/4" />
            </div>

            {/* Hero Header */}
            <section className="relative z-10 pt-28 pb-10">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-forest/10 dark:bg-lime/10 rounded-full px-5 py-2 mb-6">
                        <Sparkles className="h-4 w-4 text-forest dark:text-lime" />
                        <span className="text-sm font-bold text-forest dark:text-lime uppercase tracking-wider">{t("faq.badge")}</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4 tracking-tight">
                        {t("faq.title")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                        {t("faq.subtitle")}
                    </p>

                    {/* Search — larger, more prominent */}
                    <div className="relative max-w-xl mx-auto mb-10">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                        <input
                            type="text"
                            placeholder={t("faq.searchPlaceholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-4 py-4 rounded-full bg-card text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-forest/40 dark:focus:ring-lime/40 shadow-xl shadow-black/5 transition-shadow"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === null ? "bg-forest text-white dark:bg-lime dark:text-charcoal-deep shadow-lg" : "bg-card text-muted-foreground hover:bg-muted/80 shadow"}`}
                        >
                            All Topics
                        </button>
                        {FAQ_DATA.map((section, idx) => {
                            const Icon = SECTION_ICONS[String(idx)] || ShoppingCart;
                            return (
                                <button
                                    key={section.title}
                                    onClick={() => setActiveCategory(activeCategory === idx ? null : idx)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === idx ? "bg-forest text-white dark:bg-lime dark:text-charcoal-deep shadow-lg" : "bg-card text-muted-foreground hover:bg-muted/80 shadow"}`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {section.title}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="relative z-10 pb-20">
                <div className="max-w-3xl mx-auto px-6 space-y-8">
                    {filteredSections.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">
                                {t("faq.noResultsFor")} &ldquo;{search}&rdquo;
                            </p>
                            <p className="text-sm text-muted-foreground/60">
                                {t("faq.noResultsHint")}{" "}
                                <Link href="/contact" className="text-green-600 dark:text-green-400 underline">
                                    {t("faq.contactUsLink")}
                                </Link>{" "}
                                {t("faq.noResultsHintEnd")}
                            </p>
                        </div>
                    ) : (
                        filteredSections.map((section) => {
                            const Icon = SECTION_ICONS[String(section.originalIndex)] || ShoppingCart;
                            return (
                                <div key={section.title}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-9 w-9 rounded-xl bg-forest/10 dark:bg-lime/10 flex items-center justify-center">
                                            <Icon className="h-4.5 w-4.5 text-forest dark:text-lime" />
                                        </div>
                                        <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
                                        <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full">{section.items.length} questions</span>
                                    </div>
                                    <div className="bg-card rounded-2xl px-6 shadow-lg shadow-black/[0.03] dark:shadow-black/20 hover:shadow-xl transition-shadow duration-300">
                                        {section.items.map((item) => (
                                            <FaqAccordion key={item.q} item={item} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Still Need Help — Premium CTA */}
                    <div className="relative overflow-hidden rounded-3xl p-10 md:p-12 text-center shadow-2xl shadow-black/10 dark:shadow-black/30">
                        {/* Gradient BG */}
                        <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest/95 to-emerald-800 dark:from-charcoal-deep dark:via-charcoal-deep dark:to-forest/40" />
                        <div className="absolute inset-0 opacity-10 animate-gradient-shift" style={{ backgroundImage: "linear-gradient(45deg, transparent, rgba(200,230,62,0.3), transparent)", backgroundSize: "200% 200%" }} />

                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm mx-auto mb-5">
                                <MessageSquare className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3">{t("faq.stillHaveQuestions")}</h3>
                            <p className="text-white/70 mb-8 max-w-md mx-auto">
                                {t("faq.stillHaveQuestionsDesc")}
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center justify-center gap-2 bg-white text-forest px-6 py-3 rounded-full text-sm font-bold hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
                                >
                                    {t("faq.contactUs")}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a
                                    href="mailto:info@mohawkmedibles.ca"
                                    className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-white/10 transition-all"
                                >
                                    <Mail className="h-4 w-4" />
                                    {t("faq.emailSupport")}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
