"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft, Zap, Building2, Globe, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    icon: Zap,
    price: "$299",
    period: "/month",
    desc: "For small businesses and startups getting started with logistics management.",
    color: "#1E88E5",
    features: [
      "Up to 500 shipments/month",
      "Basic real-time tracking",
      "Email support",
      "2 user accounts",
      "Standard reporting",
      "API access (100 calls/day)",
    ],
    cta: "Get Started",
    href: "/register",
    highlight: false,
  },
  {
    name: "Business",
    icon: Building2,
    price: "$899",
    period: "/month",
    desc: "For growing companies that need advanced tools and deeper integrations.",
    color: "#00C2FF",
    features: [
      "Up to 5,000 shipments/month",
      "AI-powered route optimization",
      "Priority 24/7 support",
      "15 user accounts",
      "Advanced analytics & BI dashboards",
      "Full API access",
      "Customs Assist integration",
      "Warehouse Cloud module",
    ],
    cta: "Start Free Trial",
    href: "/register",
    highlight: true,
  },
  {
    name: "Enterprise",
    icon: Globe,
    price: "Custom",
    period: "",
    desc: "For large enterprises with complex global supply chains and custom requirements.",
    color: "#0B5EA8",
    features: [
      "Unlimited shipments",
      "Dedicated account manager",
      "SLA-backed uptime guarantee",
      "Unlimited users & branches",
      "Custom integrations (ERP/CRM)",
      "On-premise deployment option",
      "White-label portal",
      "SOC2 Type II compliance reports",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlight: false,
  },
];

const FAQ = [
  { q: "Can I switch plans later?", a: "Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle." },
  { q: "Is there a free trial?", a: "The Business plan includes a 14-day free trial, no credit card required." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, wire transfers, and invoicing for annual Enterprise contracts." },
  { q: "Do you offer annual billing discounts?", a: "Yes — pay annually and save 20% on Starter and Business plans." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0B1F3A] text-white pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <Link href="/products" className="inline-flex items-center gap-2 text-blue-300/60 hover:text-[#00C2FF] text-sm mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full border border-[#00C2FF]/30 bg-[#00C2FF]/10 text-[#00C2FF] text-xs font-bold uppercase tracking-widest mb-5">
            Transparent Pricing
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Plans Built for Every Scale</h1>
          <p className="text-blue-200/60 max-w-xl mx-auto text-lg">
            No hidden fees. No long-term lock-in. Pick the plan that fits your operation today — and scale when you're ready.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map(({ name, icon: Icon, price, period, desc, color, features, cta, href, highlight }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                highlight
                  ? "border-[#00C2FF]/50 bg-[#00C2FF]/5 shadow-[0_0_40px_rgba(0,194,255,0.15)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white text-xs font-bold uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{name}</h2>
              <p className="text-blue-200/50 text-sm mb-5">{desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{price}</span>
                <span className="text-blue-200/50 text-sm">{period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-blue-100/80">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={href}>
                <button
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                  style={highlight
                    ? { background: "linear-gradient(to right, #1E88E5, #00C2FF)", color: "#fff", boxShadow: "0 0 24px rgba(0,194,255,0.3)" }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }
                  }
                >
                  {cta} <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Feature comparison note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-white/8 bg-white/[0.02] p-8 mb-20 text-center">
          <p className="text-blue-200/60 text-sm">
            All plans include <span className="text-white font-semibold">bank-grade security</span>, <span className="text-white font-semibold">99.9% uptime SLA</span>, and access to the{" "}
            <span className="text-white font-semibold">NexaCargo developer API</span>.{" "}
            Need a custom add-on?{" "}
            <Link href="/contact" className="text-[#00C2FF] hover:underline">Talk to sales →</Link>
          </p>
        </motion.div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-semibold text-white mb-2">{q}</p>
                <p className="text-sm text-blue-200/60">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl border border-[#1E88E5]/30 bg-gradient-to-r from-[#0d2545] to-[#0B1F3A] p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Still not sure?</h2>
          <p className="text-blue-200/60 mb-6">Book a free 45-minute consultation with one of our logistics specialists.</p>
          <Link href="/industries/consultation">
            <button className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(0,194,255,0.25)]">
              Schedule a Free Consultation
            </button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
