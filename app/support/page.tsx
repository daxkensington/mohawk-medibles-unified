/**
 * Support — Mohawk Medibles
 * Help center with live AI chat, contact info, and common topics.
 */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    MessageSquare, Mail, Phone, MapPin, Clock, Truck,
    CreditCard, ShieldCheck, Package, ChevronDown, Search,
    HelpCircle, ArrowRight, Sparkles, Zap, CheckCircle, HeadphonesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/LocaleProvider";

// ─── Support Topic Type ─────────────────────────────────────

interface SupportTopic {
    icon: typeof Mail;
    title: string;
    description: string;
    items: { q: string; a: string }[];
}

// ─── Expandable FAQ Item ───────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        }
    }, [isOpen, a]);

    return (
        <div className="border-b border-border/30 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <span className={`text-sm font-semibold pr-4 transition-colors duration-200 ${isOpen ? "text-forest dark:text-lime" : "text-foreground group-hover:text-forest dark:group-hover:text-lime"}`}>{q}</span>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? "bg-forest/10 dark:bg-lime/10 rotate-180" : "bg-muted/30"}`}>
                    <ChevronDown className={`h-3.5 w-3.5 transition-colors ${isOpen ? "text-forest dark:text-lime" : "text-muted-foreground"}`} />
                </div>
            </button>
            <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? `${height}px` : "0px", opacity: isOpen ? 1 : 0 }}
            >
                <div ref={contentRef} className="text-sm text-muted-foreground pb-4 leading-relaxed">{a}</div>
            </div>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { t } = useLocale();

    const SUPPORT_TOPICS: SupportTopic[] = [
        {
            icon: Truck,
            title: t("support.topicShippingTitle"),
            description: t("support.topicShippingDesc"),
            items: [
                { q: t("support.supportShipQ1"), a: t("support.supportShipA1") },
                { q: t("support.supportShipQ2"), a: t("support.supportShipA2") },
                { q: t("support.supportShipQ3"), a: t("support.supportShipA3") },
                { q: t("support.supportShipQ4"), a: t("support.supportShipA4") },
            ],
        },
        {
            icon: CreditCard,
            title: t("support.topicPaymentsTitle"),
            description: t("support.topicPaymentsDesc"),
            items: [
                { q: t("support.supportPayQ1"), a: t("support.supportPayA1") },
                { q: t("support.supportPayQ2"), a: t("support.supportPayA2") },
                { q: t("support.supportPayQ3"), a: t("support.supportPayA3") },
            ],
        },
        {
            icon: Package,
            title: t("support.topicOrdersTitle"),
            description: t("support.topicOrdersDesc"),
            items: [
                { q: t("support.supportOrderQ1"), a: t("support.supportOrderA1") },
                { q: t("support.supportOrderQ2"), a: t("support.supportOrderA2") },
                { q: t("support.supportOrderQ3"), a: t("support.supportOrderA3") },
            ],
        },
        {
            icon: ShieldCheck,
            title: t("support.topicSafetyTitle"),
            description: t("support.topicSafetyDesc"),
            items: [
                { q: t("support.supportSafetyQ1"), a: t("support.supportSafetyA1") },
                { q: t("support.supportSafetyQ2"), a: t("support.supportSafetyA2") },
                { q: t("support.supportSafetyQ3"), a: t("support.supportSafetyA3") },
            ],
        },
    ];

    // Filter topics by search
    const filteredTopics = searchQuery.trim()
        ? SUPPORT_TOPICS.map((topic) => ({
              ...topic,
              items: topic.items.filter(
                  (item) =>
                      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.a.toLowerCase().includes(searchQuery.toLowerCase())
              ),
          })).filter((topic) => topic.items.length > 0)
        : SUPPORT_TOPICS;

    return (
        <main className="relative min-h-screen page-glass text-foreground">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='currentColor' stroke-width='0.5'%3E%3Cpath d='M40 0L60 20L40 40L20 20Z'/%3E%3Cpath d='M0 40L20 20L40 40L20 60Z'/%3E%3Cpath d='M40 40L60 20L80 40L60 60Z'/%3E%3Cpath d='M40 40L60 60L40 80L20 60Z'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: "80px 80px" }} />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lime/[0.04] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
                <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-forest/[0.05] dark:bg-lime/[0.03] rounded-full blur-[100px] -translate-x-1/4" />
            </div>

            {/* Hero */}
            <section className="relative z-10 pt-28 pb-16 md:pb-20 overflow-hidden">
                <Image
                    src="/assets/pages/support-hero.jpg"
                    alt=""
                    fill
                    className="object-cover opacity-15"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-charcoal-deep/80 to-charcoal-deep/95" />
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-forest/10 dark:bg-lime/10 rounded-full px-5 py-2 mb-6">
                        <HeadphonesIcon className="h-4 w-4 text-forest dark:text-lime" />
                        <span className="text-sm font-bold text-forest dark:text-lime uppercase tracking-wider">We&apos;re Here to Help</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-4 text-foreground tracking-tight">
                        {t("support.title")}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                        {t("support.subtitle")}
                    </p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto relative mb-10">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("support.searchPlaceholder")}
                            className="w-full pl-14 pr-4 py-4 rounded-full bg-card text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-forest/40 dark:focus:ring-lime/40 shadow-xl shadow-black/5 transition-shadow"
                        />
                    </div>

                    {/* Trust signals */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                        {[
                            { icon: Zap, label: "Avg. response: 2 hours" },
                            { icon: CheckCircle, label: "98% satisfaction rate" },
                            { icon: Clock, label: "Daily 8am-10pm EST" },
                        ].map((signal) => (
                            <div key={signal.label} className="flex items-center gap-2">
                                <signal.icon className="h-4 w-4 text-forest dark:text-lime" />
                                <span className="font-medium">{signal.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Contact Cards */}
            <section className="relative z-10 py-12">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6 stagger-children">
                        <div className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-lg shadow-black/[0.03] dark:shadow-black/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                                <MessageSquare className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="font-bold text-foreground text-base mb-1">{t("support.liveAiChat")}</div>
                            <div className="text-sm text-muted-foreground mb-3">{t("support.liveAiChatDesc")}</div>
                            <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                Online now
                            </div>
                        </div>
                        <a
                            href="mailto:info@mohawkmedibles.ca"
                            className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-lg shadow-black/[0.03] dark:shadow-black/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-500" />
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                                <Mail className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="font-bold text-foreground text-base mb-1">{t("support.emailUs")}</div>
                            <div className="text-sm text-muted-foreground mb-3">{t("support.emailUsDesc")}</div>
                            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">info@mohawkmedibles.ca</div>
                        </a>
                        <a
                            href="tel:+16133966728"
                            className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-lg shadow-black/[0.03] dark:shadow-black/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                                <Phone className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="font-bold text-foreground text-base mb-1">{t("support.callUs")}</div>
                            <div className="text-sm text-muted-foreground mb-3">{t("support.callUsDesc")}</div>
                            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">(613) 396-6728</div>
                        </a>
                    </div>
                </div>
            </section>

            {/* Support Topics */}
            <section className="relative z-10 py-12">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">Common Topics</h2>
                        <p className="text-muted-foreground">Find answers to the most frequently asked questions</p>
                    </div>

                    {filteredTopics.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="h-20 w-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
                                <HelpCircle className="h-10 w-10 text-muted-foreground/40" />
                            </div>
                            <p className="text-foreground font-semibold mb-2">{t("support.noResultsFor")} &ldquo;{searchQuery}&rdquo;</p>
                            <p className="text-sm text-muted-foreground/70">{t("support.noResultsHint")}</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {filteredTopics.map((topic, idx) => {
                                const gradientColors = [
                                    "from-blue-500/20 to-cyan-500/20",
                                    "from-purple-500/20 to-pink-500/20",
                                    "from-orange-500/20 to-amber-500/20",
                                    "from-green-500/20 to-emerald-500/20",
                                ];
                                const iconColors = ["text-blue-600", "text-purple-600", "text-orange-600", "text-green-600"];
                                return (
                                    <div
                                        key={topic.title}
                                        className="bg-card rounded-2xl p-6 shadow-lg shadow-black/[0.03] dark:shadow-black/20 hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradientColors[idx % 4]} flex items-center justify-center shrink-0`}>
                                                <topic.icon className={`h-6 w-6 ${iconColors[idx % 4]}`} />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-foreground text-lg">{topic.title}</h2>
                                                <p className="text-xs text-muted-foreground">{topic.description}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-0">
                                            {topic.items.map((item) => (
                                                <FaqItem key={item.q} q={item.q} a={item.a} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Store Info */}
            <section className="relative z-10 py-14">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">
                            {t("support.visitUs")}
                        </h2>
                        <p className="text-muted-foreground">Come see us in person at the Mohawk Territory</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-card rounded-2xl p-6 shadow-lg shadow-black/[0.03] dark:shadow-black/20 flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                                <MapPin className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <div className="font-bold text-foreground mb-1">{t("support.locationLabel")}</div>
                                <div className="text-sm text-muted-foreground leading-relaxed">
                                    {t("support.locationAddress1")}<br />
                                    {t("support.locationAddress2")}<br />
                                    {t("support.locationAddress3")}
                                </div>
                            </div>
                        </div>
                        <div className="bg-card rounded-2xl p-6 shadow-lg shadow-black/[0.03] dark:shadow-black/20 flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center shrink-0">
                                <Clock className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <div className="font-bold text-foreground mb-1">{t("support.hoursLabel")}</div>
                                <div className="text-sm text-muted-foreground leading-relaxed">
                                    {t("support.hoursValue1")}<br />
                                    {t("support.hoursValue2")}<br />
                                    {t("support.hoursValue3")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 py-16 px-4">
                <div className="relative overflow-hidden max-w-3xl mx-auto rounded-3xl p-10 md:p-14 text-center shadow-2xl shadow-black/10 dark:shadow-black/30">
                    {/* Gradient BG */}
                    <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest/95 to-emerald-800 dark:from-charcoal-deep dark:via-charcoal-deep dark:to-forest/40" />
                    <div className="absolute inset-0 opacity-10 animate-gradient-shift" style={{ backgroundImage: "linear-gradient(45deg, transparent, rgba(200,230,62,0.3), transparent)", backgroundSize: "200% 200%" }} />

                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm mx-auto mb-5">
                            <HeadphonesIcon className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            {t("support.stillNeedHelp")}
                        </h2>
                        <p className="text-white/70 mb-8 max-w-lg mx-auto">
                            {t("support.stillNeedHelpDesc")}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/faq"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all"
                            >
                                {t("support.browseFullFaq")}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-forest font-bold rounded-full hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
                            >
                                {t("support.contactUsDirectly")}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
