"use client";

import { useEffect, useState } from "react";
import { MapPin, FileSignature, Receipt, Shield, HeadphonesIcon, ChevronRight, ArrowRight, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { shipmentsApi, financeApi, supportApi, insuranceApi } from "@/lib/services";

const ACTIONS = [
  {
    title: "Request a Quote",
    desc: "Tell us your origin, destination, cargo type and weight. We'll get back with pricing within 24 hours.",
    href: "/customer/quotes",
    icon: FileSignature,
    color: "text-tertiary bg-tertiary/10 border-tertiary/20",
    cta: "Get a Quote",
    enabled: true,
  },
  {
    title: "Track Your Shipment",
    desc: "Once your shipment is confirmed, track it in real-time with step-by-step milestone updates.",
    href: "/customer/track",
    icon: MapPin,
    color: "text-secondary bg-secondary/10 border-secondary/20",
    cta: "Track Shipments",
    enabled: true,
  },
  {
    title: "Download Invoices",
    desc: "Access and download all your billing records and payment history from one place.",
    href: "/customer/invoices",
    icon: Receipt,
    color: "text-green-400 bg-green-400/10 border-green-400/20",
    cta: "View Invoices",
    enabled: true,
  },
  {
    title: "Insure Your Cargo",
    desc: "Protect your goods against loss, damage and delays with our flexible insurance plans.",
    href: "/customer/insurance",
    icon: Shield,
    color: "text-on-tertiary-container bg-on-tertiary-container/10 border-on-tertiary-container/20",
    cta: "Get Insured",
    enabled: true,
  },
  {
    title: "Get Support",
    desc: "Have a question or issue? Raise a support ticket and our team will respond within 24 hours.",
    href: "/customer/support",
    icon: HeadphonesIcon,
    color: "text-error bg-error/10 border-error/20",
    cta: "Contact Support",
    enabled: true,
  },
];

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ shipments: 0, unpaid: 0, tickets: 0, policies: 0 });

  useEffect(() => {
    const load = () => Promise.allSettled([
      shipmentsApi.list(),
      financeApi.invoices(),
      supportApi.tickets(),
      insuranceApi.policies(),
    ]).then(([sh, inv, tk, pol]) => {
      const val = (r: PromiseSettledResult<any>) => (r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []);
      const invoices = val(inv);
      setStats({
        shipments: val(sh).filter((s: any) => !["Delivered", "Cancelled"].includes(s.status)).length,
        unpaid: invoices.filter((i: any) => i.status !== "Paid").length,
        tickets: val(tk).filter((t: any) => t.status !== "closed" && t.status !== "resolved").length,
        policies: val(pol).length,
      });
    });

    // Ping /health first to wake the Render service, then load data.
    fetch("/api/proxy/health").catch(() => null).finally(load);
  }, []);

  const STATS = [
    { label: "Active Shipments", value: stats.shipments, icon: Package, color: "text-secondary bg-secondary/10" },
    { label: "Unpaid Invoices", value: stats.unpaid, icon: Receipt, color: "text-green-400 bg-green-400/10" },
    { label: "Open Tickets", value: stats.tickets, icon: HeadphonesIcon, color: "text-error bg-error/10" },
    { label: "Insurance Policies", value: stats.policies, icon: Shield, color: "text-tertiary bg-tertiary/10" },
  ];

  return (
    <div className="space-y-8 page-enter">
      {/* Welcome */}
      <div>
        <p className="text-xs uppercase tracking-widest text-tertiary">Customer Portal</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">
          Welcome, {user?.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Manage your shipments, quotes, billing, and support in one secure place.
        </p>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4 flex items-center gap-3 border border-white/5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-2xl font-bold text-on-surface">{value}</p>
              <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Quick Actions</h2>
        {ACTIONS.map(({ title, desc, href, icon: Icon, color, cta, enabled }) => (
          <Card key={title} className={`p-5 border border-white/5 transition-colors duration-150 ${enabled ? "hover:bg-white/2" : "opacity-40"}`}>
            <div className="flex items-start sm:items-center gap-4">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold text-on-surface">{title}</p>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{desc}</p>
                {enabled ? (
                  <Link href={href} className="mt-3 sm:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E88E5] text-white text-xs font-bold hover:bg-[#1565C0] transition-all shadow-[0_0_16px_rgba(30,136,229,0.3)]">
                    {cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="mt-3 sm:hidden inline-block px-4 py-2 rounded-xl bg-white/5 text-on-surface-variant text-xs font-bold cursor-not-allowed">Coming Soon</span>
                )}
              </div>
              {enabled ? (
                <Link href={href} className="shrink-0 hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E88E5] text-white text-xs font-bold hover:bg-[#1565C0] transition-all shadow-[0_0_16px_rgba(30,136,229,0.3)] whitespace-nowrap">
                  {cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="shrink-0 hidden sm:block px-4 py-2 rounded-xl bg-white/5 text-on-surface-variant text-xs font-bold cursor-not-allowed whitespace-nowrap">Coming Soon</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Help Footer */}
      <Card className="p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-on-surface">Need help?</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Our support team is available 24/7 to assist you.</p>
        </div>
        <Link href="/customer/support" className="flex items-center gap-2 bg-[#1E88E5] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#1565C0] transition-colors shrink-0 shadow-[0_0_16px_rgba(30,136,229,0.25)]">
          Contact Support <ChevronRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  );
}
