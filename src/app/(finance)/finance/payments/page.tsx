"use client";

import { useEffect, useState } from "react";
import { Search, Banknote, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { FinancePayment, FinanceInvoice } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  Completed: "text-green-400 bg-green-400/10",
  Failed: "text-error bg-error/10",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [outstanding, setOutstanding] = useState<FinanceInvoice[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("finance_payments").select("*").order("date", { ascending: false })
      .then(({ data }) => data && setPayments(data));
    // Outstanding = pending + overdue invoices
    supabase.from("finance_invoices").select("*").in("status", ["Pending", "Overdue"]).order("due")
      .then(({ data }) => data && setOutstanding(data));
  }, []);

  const filtered = payments.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.method.toLowerCase().includes(search.toLowerCase()) ||
      p.status.toLowerCase().includes(search.toLowerCase())
  );

  const completed = payments.filter((p) => p.status === "Completed").length;
  const failed = payments.filter((p) => p.status === "Failed").length;
  const totalReceived = payments
    .filter((p) => p.status === "Completed")
    .reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = outstanding.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/finance" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Finance</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Payments</h1>
        <p className="text-sm text-on-surface-variant mt-1">Monitor payments and outstanding balances.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <Banknote className="h-8 w-8 text-tertiary" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">${totalReceived.toLocaleString()}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Total Received</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{completed}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Completed</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <XCircle className="h-8 w-8 text-error" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{failed}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Failed</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <AlertCircle className="h-8 w-8 text-on-tertiary-container" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">${totalOutstanding.toLocaleString()}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Outstanding</p>
          </div>
        </Card>
      </div>

      {/* Payment Tracking Table */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search by ID, client, method or status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50"
        />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
              <th className="px-4 py-3">Payment ID</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-tertiary">{p.id}</td>
                <td className="px-4 py-3 text-on-surface">{p.client}</td>
                <td className="px-4 py-3 font-mono text-on-surface">${p.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-on-surface-variant">{p.method}</td>
                <td className="px-4 py-3 text-on-surface-variant">{p.date}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[p.status]}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-sm">No payments match your search.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Outstanding Balances */}
      {outstanding.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-error" /> Outstanding Balances
          </h2>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Amount Due</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {outstanding.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-tertiary">{inv.id}</td>
                    <td className="px-4 py-3 text-on-surface">{inv.client}</td>
                    <td className="px-4 py-3 font-mono text-error">${inv.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{inv.due}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${inv.status === "Overdue" ? "text-error bg-error/10" : "text-on-tertiary-container bg-on-tertiary-container/10"}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
