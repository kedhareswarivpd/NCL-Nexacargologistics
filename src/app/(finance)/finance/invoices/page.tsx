"use client";

import { useEffect, useState } from "react";
import { Search, Receipt, Clock, CheckCircle2, AlertTriangle, Plus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { FinanceInvoice } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  Pending: "text-secondary bg-secondary/10",
  Paid: "text-green-400 bg-green-400/10",
  Overdue: "text-error bg-error/10",
};

const EMPTY_FORM = { client: "", amount: "", due: "", description: "" };

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  async function load() {
    const { data } = await supabase.from("finance_invoices").select("*").order("due", { ascending: false });
    if (data) setInvoices(data);
  }

  useEffect(() => { load(); }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.client.trim()) errs.client = "Client name is required.";
    if (!form.amount.trim()) errs.amount = "Amount is required.";
    else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) errs.amount = "Enter a valid positive amount.";
    if (!form.due) errs.due = "Due date is required.";
    else if (new Date(form.due) < new Date(new Date().toDateString())) errs.due = "Due date must be today or later.";
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSaving(true);
    const id = `INV-${Date.now().toString().slice(-4)}`;
    await supabase.from("finance_invoices").insert({
      id,
      client: form.client,
      amount: parseFloat(form.amount),
      issued: new Date().toISOString().slice(0, 10),
      due: form.due,
      description: form.description,
      status: "Pending",
    });
    setSaving(false);
    setForm(EMPTY_FORM);
    setShowForm(false);
    load();
  }

  const filtered = invoices.filter(
    (i) =>
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.client.toLowerCase().includes(search.toLowerCase()) ||
      i.status.toLowerCase().includes(search.toLowerCase())
  );

  const pending = invoices.filter((i) => i.status === "Pending").length;
  const overdue = invoices.filter((i) => i.status === "Overdue").length;
  const paid = invoices.filter((i) => i.status === "Paid").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/finance" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
            <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
            <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-tertiary">Finance</p>
          <h1 className="text-3xl font-bold text-on-surface mt-1">Invoices</h1>
          <p className="text-sm text-on-surface-variant mt-1">Generate and manage all client invoices.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-tertiary/10 text-tertiary text-sm font-semibold hover:bg-tertiary/20 transition-colors mt-1"
        >
          <Plus className="h-4 w-4" /> Generate Invoice
        </button>
      </div>

      {/* Invoice Generation Modal */}
      {showForm && (
        <Card className="p-6 border border-tertiary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">New Invoice</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-on-surface-variant" /></button>
          </div>
          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Client Name</label>
              <input
                value={form.client}
                onChange={(e) => { setForm((f) => ({ ...f, client: e.target.value })); setFormErrors(p => ({...p, client: ""})); }}
                placeholder="e.g. Amazon EU"
                className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50 ${formErrors.client ? "border-red-500" : "border-white/10"}`}
              />
              {formErrors.client && <p className="text-xs text-error mt-1">{formErrors.client}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Amount (USD)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.amount}
                onChange={(e) => { setForm((f) => ({ ...f, amount: e.target.value })); setFormErrors(p => ({...p, amount: ""})); }}
                placeholder="e.g. 12400"
                className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50 ${formErrors.amount ? "border-red-500" : "border-white/10"}`}
              />
              {formErrors.amount && <p className="text-xs text-error mt-1">{formErrors.amount}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Due Date</label>
              <input
                type="date"
                value={form.due}
                onChange={(e) => { setForm((f) => ({ ...f, due: e.target.value })); setFormErrors(p => ({...p, due: ""})); }}
                className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50 ${formErrors.due ? "border-red-500" : "border-white/10"}`}
              />
              {formErrors.due && <p className="text-xs text-error mt-1">{formErrors.due}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-tertiary/10 text-tertiary text-sm font-semibold hover:bg-tertiary/20 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Create Invoice"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <Clock className="h-8 w-8 text-secondary" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{pending}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Pending</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-error" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{overdue}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Overdue</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{paid}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Paid</p>
          </div>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search by ID, client or status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50"
        />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Issued</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-tertiary">{inv.id}</td>
                <td className="px-4 py-3 text-on-surface">{inv.client}</td>
                <td className="px-4 py-3 font-mono text-on-surface">${inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-on-surface-variant">{inv.issued}</td>
                <td className="px-4 py-3 text-on-surface-variant">{inv.due}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-sm">No invoices match your search.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Outstanding Report inline */}
      {invoices.filter((i) => i.status === "Overdue").length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-error flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Outstanding / Overdue
          </h2>
          {invoices.filter((i) => i.status === "Overdue").map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 rounded-xl border border-error/20 bg-error/5 p-4">
              <Receipt className="h-4 w-4 shrink-0 text-error" />
              <div>
                <span className="font-mono text-xs text-error mr-2">{inv.id}</span>
                <span className="text-sm text-on-surface">{inv.client} — ${inv.amount.toLocaleString()} due {inv.due}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
