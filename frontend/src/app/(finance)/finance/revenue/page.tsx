"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { financeApi, customersApi } from "@/lib/services";
import type { MonthlyRevenue, TopClient } from "@/lib/types";

export default function RevenuePage() {
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [pl, setPl] = useState({ revenue: 0, expenses: 0, profit: 0, margin_pct: 0 });

  useEffect(() => {
    // Headline profit & loss figures.
    financeApi.profitLoss()
      .then((r) => setPl({ revenue: r?.revenue ?? 0, expenses: r?.expenses ?? 0, profit: r?.profit ?? 0, margin_pct: r?.margin_pct ?? 0 }))
      .catch(() => {});

    // Monthly revenue vs expenses chart.
    financeApi.monthlyReport()
      .then((res) => {
        const rows = (res?.rows ?? []).map((row: any, i: number) => ({
          id: String(i),
          month: String(row.period).slice(0, 7), // YYYY-MM
          revenue: Number(row.revenue ?? 0),
          expenses: Number(row.expenses ?? 0),
        }));
        setMonthly(rows);
      })
      .catch(() => setMonthly([]));

    // Top clients by revenue: sum paid/issued invoices per customer, name via /customers.
    Promise.all([financeApi.invoices(), customersApi.list().catch(() => [])])
      .then(([invs, custs]: [any[], any[]]) => {
        const nameById: Record<string, string> = {};
        (custs ?? []).forEach((c) => { nameById[c.id] = c.name; });
        const byClient: Record<string, number> = {};
        (invs ?? []).forEach((i) => {
          const k = i.customer_id ?? "unknown";
          byClient[k] = (byClient[k] ?? 0) + Number(i.total ?? i.amount ?? 0);
        });
        const top = Object.entries(byClient)
          .map(([id, revenue]) => ({ id, client: nameById[id] ?? `${id.slice(0, 8)}…`, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        setTopClients(top);
      })
      .catch(() => setTopClients([]));
  }, []);

  const totalRevenue = pl.revenue;
  const totalExpenses = pl.expenses;
  const netProfit = pl.profit;
  const margin = pl.margin_pct.toFixed(1);
  const maxRevenue = monthly.length ? Math.max(...monthly.map((m) => Math.max(m.revenue, m.expenses)), 1) : 1;
  const maxClientRev = topClients.length ? Math.max(...topClients.map((c) => c.revenue)) : 1;

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/finance" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Finance</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Revenue Reports</h1>
        <p className="text-sm text-on-surface-variant mt-1">Analyze financial performance and year-to-date metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <DollarSign className="h-8 w-8 text-tertiary" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">${(totalRevenue / 1000).toFixed(0)}k</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Total Revenue</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <TrendingDown className="h-8 w-8 text-error" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">${(totalExpenses / 1000).toFixed(0)}k</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Total Expenses</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <TrendingUp className="h-8 w-8 text-green-400" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">${(netProfit / 1000).toFixed(0)}k</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Net Profit</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <BarChart2 className="h-8 w-8 text-secondary" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{margin}%</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Profit Margin</p>
          </div>
        </Card>
      </div>

      {/* Monthly Bar Chart */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-4">Monthly Revenue vs Expenses</h2>
        {monthly.length === 0 && (
          <p className="text-sm text-on-surface-variant py-8 text-center">No paid invoices yet — the chart fills in as revenue is recorded.</p>
        )}
        <div className="flex items-end justify-between gap-3 h-40">
          {monthly.map((m) => (
            <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-full flex items-end gap-1 justify-center" style={{ height: "120px" }}>
                <div
                  className="w-4 rounded-t-sm bg-tertiary/60 border-t border-tertiary"
                  style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                />
                <div
                  className="w-4 rounded-t-sm bg-error/40 border-t border-error"
                  style={{ height: `${(m.expenses / maxRevenue) * 100}%` }}
                />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                {new Date(m.month + "-01").toLocaleDateString("en-US", { month: "short" })}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-6 text-xs text-on-surface-variant">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-tertiary/60 inline-block" /> Revenue</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-error/40 inline-block" /> Expenses</span>
        </div>
      </Card>

      {/* Top Clients by Revenue */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Top Clients by Revenue</h2>
        {topClients.map((c) => {
          const pct = Math.round((c.revenue / maxClientRev) * 100);
          return (
            <div key={c.id}>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-on-surface">{c.client}</span>
                <span className="font-mono text-xs text-tertiary">${c.revenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-tertiary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        {topClients.length === 0 && (
          <p className="text-sm text-on-surface-variant">No client data available.</p>
        )}
      </Card>
    </div>
  );
}
