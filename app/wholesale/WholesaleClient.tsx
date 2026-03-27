"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Image from "next/image";
import {
  Building2, TrendingUp, Truck, UserCheck, Crown,
  Send, CheckCircle, Clock, XCircle, Package,
  DollarSign, CreditCard, FileText, Shield,
  Handshake, Globe, ChevronDown, ChevronUp,
  BarChart3, Leaf, Star, Users, Zap,
} from "lucide-react";

const TIERS = [
  {
    name: "Bronze",
    discount: "10%",
    min: "$500+/mo",
    color: "from-amber-700 to-amber-900",
    border: "border-amber-700/30",
    icon: Shield,
    features: ["10% off all products", "Standard shipping", "Email support", "Monthly invoicing"],
  },
  {
    name: "Silver",
    discount: "15%",
    min: "$2K+/mo",
    color: "from-gray-400 to-gray-600",
    border: "border-gray-400/30",
    icon: Star,
    features: ["15% off all products", "Priority shipping", "Phone support", "Net 15 terms", "Early product access"],
  },
  {
    name: "Gold",
    discount: "20%",
    min: "$5K+/mo",
    color: "from-yellow-500 to-yellow-700",
    border: "border-yellow-500/30",
    icon: Crown,
    features: ["20% off all products", "Free express shipping", "Dedicated account manager", "Net 30 terms", "Custom product requests", "Marketing co-op funds"],
    popular: true,
  },
  {
    name: "Platinum",
    discount: "25%",
    min: "$10K+/mo",
    color: "from-purple-400 to-purple-700",
    border: "border-purple-400/30",
    icon: Zap,
    features: ["25% off all products", "Same-day dispatch", "24/7 priority line", "Net 45 terms", "White-label options", "Exclusive strain access", "Volume rebates"],
  },
];

const BENEFITS = [
  { icon: TrendingUp, title: "Volume Discounts", desc: "Save 10-25% on every order based on your tier", stat: "Up to 25%" },
  { icon: CreditCard, title: "Net Terms", desc: "Qualified accounts get net 15-45 day payment terms", stat: "Net 45" },
  { icon: UserCheck, title: "Dedicated Account Manager", desc: "Personal support for all your wholesale needs", stat: "1-on-1" },
  { icon: Truck, title: "Priority Shipping", desc: "Your orders ship first with expedited fulfillment", stat: "Same Day" },
];

const TRUST_STATS = [
  { value: "120+", label: "Wholesale Partners", icon: Users },
  { value: "$2.4M", label: "Wholesale Volume/Year", icon: BarChart3 },
  { value: "360+", label: "Products Available", icon: Leaf },
  { value: "98%", label: "Partner Retention Rate", icon: Handshake },
];

const FAQS = [
  {
    q: "What are the minimum order requirements?",
    a: "Bronze tier starts at $500/month. There is no minimum per-order, but reaching your monthly tier threshold unlocks your discount. Orders below your tier minimum will be billed at the next lower tier rate.",
  },
  {
    q: "How quickly will my application be reviewed?",
    a: "We review all wholesale applications within 1-2 business days. You will receive an email confirmation once approved, along with your account setup details and pricing sheet.",
  },
  {
    q: "What payment terms are available?",
    a: "New accounts start with payment due on order. After 3 months of consistent ordering, Silver+ accounts can qualify for Net 15-45 day terms depending on tier and credit history.",
  },
  {
    q: "Can I get custom or white-label products?",
    a: "Platinum partners have access to white-label and custom product options. Gold partners can submit custom product requests which we evaluate on a case-by-case basis.",
  },
  {
    q: "Do you offer marketing support?",
    a: "Yes! Gold and Platinum partners receive marketing co-op funds and access to professional product photography, descriptions, and promotional materials to help grow your business.",
  },
  {
    q: "What regions do you deliver to?",
    a: "We currently serve wholesale partners across all Canadian provinces. Shipping is included for Gold+ orders over $2,000, and Platinum partners receive free express shipping on all orders.",
  },
];

const BUSINESS_TYPES = [
  { value: "DISPENSARY", label: "Dispensary" },
  { value: "DELIVERY", label: "Delivery Service" },
  { value: "RETAILER", label: "Retailer" },
  { value: "OTHER", label: "Other" },
] as const;

interface ApplicationForm {
  businessName: string;
  businessType: "DISPENSARY" | "DELIVERY" | "RETAILER" | "OTHER";
  taxId: string;
  website: string;
  phone: string;
  email: string;
  estimatedMonthlyVolume: string;
  message: string;
}

const defaultForm: ApplicationForm = {
  businessName: "",
  businessType: "DISPENSARY",
  taxId: "",
  website: "",
  phone: "",
  email: "",
  estimatedMonthlyVolume: "",
  message: "",
};

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-white font-semibold pr-4">{q}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-green-400 shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-zinc-500 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-zinc-400 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

function WholesaleDashboard() {
  const accountQuery = trpc.wholesale.getMyAccount.useQuery();
  const ordersQuery = trpc.wholesale.getMyOrders.useQuery();
  const utils = trpc.useUtils();
  const [orderItems, setOrderItems] = useState<Array<{ productId: number; name: string; sku: string; quantity: number; unitPrice: number }>>([]);
  const [orderNotes, setOrderNotes] = useState("");

  const placeOrder = trpc.wholesale.placeOrder.useMutation({
    onSuccess: () => {
      utils.wholesale.getMyOrders.invalidate();
      setOrderItems([]);
      setOrderNotes("");
    },
  });

  const account = accountQuery.data?.account;
  if (!account) return null;

  const orders = ordersQuery.data || [];
  const outstanding = orders.filter((o) => o.paymentStatus === "UNPAID" || o.paymentStatus === "OVERDUE");

  return (
    <div className="space-y-8">
      {/* Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-zinc-400">Tier</span>
          </div>
          <p className="text-2xl font-bold text-white">{account.tier}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span className="text-sm text-zinc-400">Discount</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{account.discountPercent}%</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-zinc-400">Credit Limit</span>
          </div>
          <p className="text-2xl font-bold text-white">${account.creditLimit.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-zinc-400">Net Terms</span>
          </div>
          <p className="text-2xl font-bold text-white">{account.netTerms > 0 ? `Net ${account.netTerms}` : "Due on Order"}</p>
        </div>
      </div>

      {/* Quick Order */}
      <div className="bg-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-green-400" /> Quick Wholesale Order
        </h3>
        <div className="space-y-3">
          {orderItems.map((item, i) => (
            <div key={i} className="grid grid-cols-5 gap-3">
              <input
                placeholder="Product name"
                value={item.name}
                onChange={(e) => {
                  const updated = [...orderItems];
                  updated[i] = { ...updated[i], name: e.target.value };
                  setOrderItems(updated);
                }}
                className="col-span-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
              />
              <input
                placeholder="SKU"
                value={item.sku}
                onChange={(e) => {
                  const updated = [...orderItems];
                  updated[i] = { ...updated[i], sku: e.target.value };
                  setOrderItems(updated);
                }}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity || ""}
                onChange={(e) => {
                  const updated = [...orderItems];
                  updated[i] = { ...updated[i], quantity: parseInt(e.target.value) || 0 };
                  setOrderItems(updated);
                }}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Price"
                  value={item.unitPrice || ""}
                  onChange={(e) => {
                    const updated = [...orderItems];
                    updated[i] = { ...updated[i], unitPrice: parseFloat(e.target.value) || 0 };
                    setOrderItems(updated);
                  }}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                />
                <button
                  onClick={() => setOrderItems(orderItems.filter((_, idx) => idx !== i))}
                  className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 text-sm"
                >
                  X
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => setOrderItems([...orderItems, { productId: 0, name: "", sku: "", quantity: 1, unitPrice: 0 }])}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/10"
          >
            + Add Item
          </button>
          <textarea
            placeholder="Order notes (optional)"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white mt-3"
            rows={2}
          />
          {orderItems.length > 0 && (
            <button
              onClick={() => placeOrder.mutate({ items: orderItems, notes: orderNotes })}
              disabled={placeOrder.isPending}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
            >
              {placeOrder.isPending ? "Placing Order..." : "Place Wholesale Order"}
            </button>
          )}
        </div>
      </div>

      {/* Outstanding Invoices */}
      {outstanding.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-400" /> Outstanding Invoices
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-white/5">
                  <th className="text-left py-2 pr-4">Order #</th>
                  <th className="text-left py-2 pr-4">Total</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {outstanding.map((o) => (
                  <tr key={o.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white font-mono">{o.orderNumber}</td>
                    <td className="py-3 pr-4 text-white">${o.total.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${o.paymentStatus === "OVERDUE" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-400">
                      {o.paymentDueDate ? new Date(o.paymentDueDate).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="bg-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-green-400" /> Order History
        </h3>
        {orders.length === 0 ? (
          <p className="text-zinc-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-white/5">
                  <th className="text-left py-2 pr-4">Order #</th>
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-left py-2 pr-4">Subtotal</th>
                  <th className="text-left py-2 pr-4">Discount</th>
                  <th className="text-left py-2 pr-4">Total</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2">Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white font-mono">{o.orderNumber}</td>
                    <td className="py-3 pr-4 text-zinc-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-white">${o.subtotal.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-green-400">-${o.discount.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-white font-semibold">${o.total.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400">{o.status}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        o.paymentStatus === "PAID" ? "bg-green-500/10 text-green-400" :
                        o.paymentStatus === "OVERDUE" ? "bg-red-500/10 text-red-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>{o.paymentStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WholesaleClient() {
  const [form, setForm] = useState<ApplicationForm>(defaultForm);
  const [submitted, setSubmitted] = useState(false);

  const accountQuery = trpc.wholesale.getMyAccount.useQuery(undefined, {
    retry: false,
  });

  const submitApp = trpc.wholesale.submitApplication.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const account = accountQuery.data?.account;
  const application = accountQuery.data?.application;
  const isLoggedIn = !accountQuery.isError;

  // If user is approved wholesale, show dashboard
  if (account?.approved) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-2">Wholesale Dashboard</h1>
            <p className="text-zinc-400">Welcome back, {account.businessName}</p>
          </div>
          <WholesaleDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Hero background image */}
        <Image
            src="/assets/pages/wholesale-hero.jpg"
            alt=""
            fill
            className="object-cover opacity-15"
            priority
        />
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-[#0a0a0f] to-emerald-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-green-600/5 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-bold uppercase tracking-widest mb-8">
            <Building2 className="h-4 w-4" /> B2B Wholesale Program
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Partner With Us{" "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-lime-400">
              Wholesale Cannabis
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Join 120+ retail partners who trust Mohawk Medibles for premium Indigenous-sourced cannabis.
            Volume discounts up to 25%, flexible net terms, and dedicated account management.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25"
            >
              Apply Now <Send className="h-4 w-4" />
            </a>
            <a
              href="#tiers"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all"
            >
              View Pricing Tiers
            </a>
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="max-w-5xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Why Partner With Mohawk Medibles</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            We are not just a supplier -- we are a growth partner. Our wholesale program is designed to help your business thrive.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="group relative bg-white/[0.03] rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-300 overflow-hidden">
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/5 group-hover:to-emerald-500/5 transition-all duration-300 rounded-2xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <b.icon className="h-7 w-7 text-green-400" />
                </div>
                <div className="text-2xl font-black text-green-400 mb-1">{b.stat}</div>
                <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tier Breakdown */}
      <section id="tiers" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Wholesale Pricing Tiers</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              The more you order, the more you save. Every tier includes additional perks beyond just pricing.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-white/[0.03] rounded-2xl p-6 ${tier.border} border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 ${
                  tier.popular ? "ring-2 ring-green-500/30" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-600 text-center py-1.5 text-xs font-bold text-white uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tier.color} ${tier.popular ? "hidden" : ""}`} />

                <div className={`${tier.popular ? "mt-6" : "mt-2"}`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                    <tier.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-4xl font-black text-green-400 mb-1">{tier.discount}</p>
                  <p className="text-sm text-zinc-400 mb-1">off all products</p>
                  <p className="text-xs text-zinc-500">Minimum: <span className="text-white font-semibold">{tier.min}</span></p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5 space-y-2.5">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-300">{f}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="#apply"
                  className={`block mt-6 py-3 text-center rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                    tier.popular
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/20"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Process */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">How It Works</h2>
          <p className="text-zinc-400">From application to your first order in as little as 48 hours.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Apply", desc: "Fill out the application form below. Takes less than 5 minutes.", icon: FileText },
            { step: "02", title: "Get Approved", desc: "Our team reviews and responds within 1-2 business days.", icon: CheckCircle },
            { step: "03", title: "Browse Catalog", desc: "Access our full wholesale catalog with tier-based pricing.", icon: Globe },
            { step: "04", title: "Start Ordering", desc: "Place orders, track shipments, and grow your business.", icon: Truck },
          ].map((item, i) => (
            <div key={item.step} className="relative">
              <div className="bg-white/[0.03] rounded-2xl p-6 h-full hover:bg-white/[0.06] transition-all">
                <div className="text-5xl font-black text-green-500/10 mb-3">{item.step}</div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                  <item.icon className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-green-500/30 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <section className="relative py-24 overflow-hidden" id="apply">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-transparent" />
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Apply for Wholesale</h2>
            <p className="text-zinc-400">
              Ready to grow your business? Fill out the application below and our team will be in touch.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 md:p-10">
            {submitted || application?.status === "PENDING" ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-10 w-10 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Application Under Review</h3>
                <p className="text-zinc-400 max-w-md mx-auto">
                  We&apos;ll review your application and get back to you within 1-2 business days.
                  Check your email for updates.
                </p>
              </div>
            ) : application?.status === "REJECTED" ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Application Not Approved</h3>
                <p className="text-zinc-400 max-w-md mx-auto">
                  Unfortunately your application was not approved at this time. Please contact us at{" "}
                  <a href="mailto:wholesale@mohawkmedibles.ca" className="text-green-400 hover:underline">
                    wholesale@mohawkmedibles.ca
                  </a>{" "}
                  for details.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Business Name *</label>
                    <input
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Business Type *</label>
                    <select
                      value={form.businessType}
                      onChange={(e) => setForm({ ...form, businessType: e.target.value as ApplicationForm["businessType"] })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    >
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Tax ID</label>
                    <input
                      value={form.taxId}
                      onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                      placeholder="Business tax ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Website</label>
                    <input
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Phone *</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                      placeholder="(555) 555-5555"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                      placeholder="wholesale@yourbusiness.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Estimated Monthly Volume</label>
                  <input
                    value={form.estimatedMonthlyVolume}
                    onChange={(e) => setForm({ ...form, estimatedMonthlyVolume: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    placeholder="e.g. $2,000 - $5,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                    rows={4}
                    placeholder="Tell us about your business and what you're looking for..."
                  />
                </div>

                {submitApp.error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">{submitApp.error.message}</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!form.businessName || !form.phone || !form.email) return;
                    submitApp.mutate(form);
                  }}
                  disabled={submitApp.isPending || !isLoggedIn}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 text-sm uppercase tracking-wider"
                >
                  <Send className="h-5 w-5" />
                  {submitApp.isPending ? "Submitting..." : "Submit Wholesale Application"}
                </button>

                {!isLoggedIn && (
                  <p className="text-amber-400 text-sm text-center">You must be logged in to submit an application.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-zinc-400">Everything you need to know about our wholesale program.</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
        <div className="text-center mt-10">
          <p className="text-zinc-500 text-sm">
            Still have questions? Email us at{" "}
            <a href="mailto:wholesale@mohawkmedibles.ca" className="text-green-400 hover:underline">
              wholesale@mohawkmedibles.ca
            </a>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-emerald-900/10 to-green-900/20" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-zinc-400 mb-8 text-lg">
            Join 120+ wholesale partners already saving up to 25% on premium cannabis products.
          </p>
          <a
            href="#apply"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25"
          >
            Apply Now <Send className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
