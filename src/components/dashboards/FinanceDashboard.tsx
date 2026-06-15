"use client";

import { useEffect, useState } from "react";
import {
  Banknote, TrendingUp, TrendingDown, Receipt,
  Clock, CheckCircle2, AlertCircle, ArrowUpRight, FileText, ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { FinanceInvoice, FinancePayment, MonthlyRevenue } from "@/lib/types";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  Overdue: "text-error bg-error/10",
  Pending: "text-on-tertiary-container bg-on-tertiary-container/10",
  Paid:    "text-green-400 bg-green-400/10",
};

function fmt(n: number) {
  return n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : `$${(n / 1000).toFixed(0)}K`;
}

export default function FinanceDashboard() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [monthly,  setMonthly]  = useState<MonthlyRevenue[]>([]);

  useEffect(() => {
    supabase.from("finance_invoices").select("*").order("due", { ascending: false }).limit(5)
      .then(({ data }) => data && setInvoices(data));
    supabase.from("finance_payments").select("*").order("date", { ascending: false })
      .then(({ data }) => data && setPayments(data));
    supabase.from("monthly_revenue").select("*").order("month", { ascending: true }).limit(7)
      .then(({ data }) => data && setMonthly(data));
  }, []);

  const totalRevenueMTD = monthly.at(-1)?.revenue ?? 0;
  const outstanding     = invoices.filter((i) => i.status === "Pending").reduce((s, i) => s + i.amount, 0);
  const collectedToday  = payments
    .filter((p) => p.date === new Date().toISOString().slice(0, 10) && p.status === "Completed")
    .reduce((s, p) => s + p.amount, 0);
  const overdueCount    = invoices.filter((i) => i.status === "Overdue").length;

  const STATS = [
    { label: "Revenue (MTD)",    value: fmt(totalRevenueMTD), up: true,  Icon: Banknote    },
    { label: "Outstanding",      value: fmt(outstanding),     up: false, Icon: Clock       },
    { label: "Collected Today",  value: fmt(collectedToday),  up: true,  Icon: CheckCircle2},
    { label: "Overdue Invoices", value: String(overdueCount), up: false, Icon: AlertCircle },
  ];

  const maxRev = monthly.length ? Math.max(...monthly.map((m) => m.revenue)) : 1;
  const totalExpMTD = monthly.at(-1)?.expenses ?? 0;
  const netProfit   = totalRevenueMTD - totalExpMTD;

  const COST_BREAKDOWN = [
    { label: "Fuel & Transport", pct: 38 },
    { label: "Warehouse Ops",    pct: 24 },
    { label: "Driver Payroll",   pct: 21 },
    { label: "Customs & Duties", pct: 17 },
  ];

  return (
    <div className="p-6 space-y-6 page-enter">

      {/* Header */}
      <div className="animate-fade-up">
        <Link href="/admin" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Admin</span>
        </Link>
        <p className="font-label-caps text-xs uppercase tracking-widest text-tertiary">Finance Dashboard</p>
        <h1 className="font-headline-lg mt-1 text-3xl font-bold text-on-surface">
          Welcome back, {user?.name.split(" ")[0]}.
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">Financial overview for NexaCargo operations.</p>
      </div>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, up, Icon }, i) => (
          <Card key={label} className="p-5 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary">
                <Icon className="h-5 w-5" />
              </span>
              <span className={`flex items-center gap-1 text-xs font-medium ${up ? "text-tertiary" : "text-error"}`}>
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              </span>
            </div>
            <p className="mt-4 font-mono text-2xl font-bold text-on-surface">{value}</p>
            <p className="font-label-caps mt-1 text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
          </Card>
        ))}
      </section>

      {/* Revenue Chart + Cost Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-6 animate-fade-up" style={{ animationDelay: "0.32s" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-on-surface">Revenue vs Expenses</h2>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-tertiary inline-block" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-error/60 inline-block" />Expenses</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 h-40 px-2">
            {monthly.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: "100%" }}>
                  <div
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-tertiary/30 to-tertiary/10 border-t border-tertiary animate-bar-grow hover:from-tertiary/50 hover:to-tertiary/20 transition-colors duration-200"
                    style={{ height: `${(m.revenue / maxRev) * 100}%`, animationDelay: `${i * 0.07}s` }}
                  />
                  <div
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-error/20 to-error/5 border-t border-error/60 animate-bar-grow hover:from-error/35 hover:to-error/15 transition-colors duration-200"
                    style={{ height: `${(m.expenses / maxRev) * 100}%`, animationDelay: `${i * 0.07 + 0.035}s` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between px-2 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
            {monthly.map((m) => (
              <span key={m.month}>{new Date(m.month + "-01").toLocaleDateString("en-US", { month: "short" })}</span>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 animate-slide-right" style={{ animationDelay: "0.36s" }}>
          <h2 className="mb-5 text-base font-semibold text-on-surface">Cost Breakdown</h2>
          <div className="space-y-4">
            {COST_BREAKDOWN.map(({ label, pct }, i) => (
              <div key={label} className="animate-fade-up" style={{ animationDelay: `${0.4 + i * 0.08}s` }}>
                <div className="flex justify-between mb-1.5 text-sm">
                  <span className="text-on-surface">{label}</span>
                  <span className="font-mono text-xs text-on-surface-variant">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tertiary rounded-full animate-progress-fill"
                    style={{ width: `${pct}%`, animationDelay: `${0.5 + i * 0.08}s` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Total Expenses (MTD)</span>
              <span className="font-mono font-bold text-on-surface">{fmt(totalExpMTD)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-on-surface-variant">Net Profit</span>
              <span className="font-mono font-bold text-tertiary">{fmt(netProfit)}</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Recent Invoices */}
      <section className="animate-fade-up" style={{ animationDelay: "0.42s" }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Recent Invoices</h2>
          <button className="flex items-center gap-1 text-xs text-tertiary hover:underline transition-all hover:gap-2">
            <FileText className="h-3 w-3" /> Export <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv, i) => (
                <tr
                  key={inv.id}
                  style={{ animationDelay: `${0.46 + i * 0.05}s` }}
                  className="animate-fade-up hover:bg-white/5 transition-all duration-150 hover:translate-x-0.5"
                >
                  <td className="px-4 py-3 font-mono text-xs text-tertiary">{inv.id}</td>
                  <td className="px-4 py-3 text-on-surface">{inv.client}</td>
                  <td className="px-4 py-3 font-mono text-on-surface">${inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{inv.due}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[inv.status] ?? ""}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant text-sm">No invoices found.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Overdue Alerts */}
      <section className="animate-fade-up" style={{ animationDelay: "0.5s" }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-error">
          <AlertCircle className="h-4 w-4 animate-pulse" /> Overdue Alerts
        </h2>
        <div className="space-y-2">
          {invoices.filter((i) => i.status === "Overdue").map((inv, i) => (
            <div
              key={inv.id}
              style={{ animationDelay: `${0.54 + i * 0.06}s` }}
              className="animate-slide-left flex items-center gap-3 rounded-xl border border-error/20 bg-error/5 p-4 hover:bg-error/10 transition-colors duration-200"
            >
              <Receipt className="h-4 w-4 shrink-0 text-error" />
              <div>
                <span className="font-mono text-xs text-error mr-2">{inv.id}</span>
                <span className="text-sm text-on-surface">{inv.client} — ${inv.amount.toLocaleString()} was due {inv.due}</span>
              </div>
            </div>
          ))}
          {invoices.filter((i) => i.status === "Overdue").length === 0 && (
            <p className="text-sm text-on-surface-variant">No overdue invoices.</p>
          )}
        </div>
      </section>
    </div>
  );
}
