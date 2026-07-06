"use client";

import { useEffect, useState } from "react";
import { Receipt, Download, FileText, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { financeApi } from "@/lib/services";
import { apiError } from "@/lib/api";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";

const HOW_IT_WORKS = [
  { icon: FileText, title: "Invoice Generated", desc: "An invoice is automatically created once your shipment is confirmed and dispatched." },
  { icon: Clock, title: "Payment Due", desc: "You'll receive a notification with payment details and due date via email." },
  { icon: Download, title: "Download PDF", desc: "Access and download your invoices as PDF once the payment has been completed." },
  { icon: CheckCircle2, title: "Mark as Paid", desc: "Once payment is processed, your invoice status updates automatically." },
];

const INV_STATUS_STYLES: Record<string, string> = {
  Paid: "text-green-400 bg-green-400/10",
  Pending: "text-amber-400 bg-amber-400/10",
  Overdue: "text-error bg-error/10",
  Cancelled: "text-on-surface-variant bg-white/5",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try { setInvoices((await financeApi.invoices()) ?? []); } catch { setInvoices([]); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function payInvoice(inv: any) {
    setPayingId(inv.id);
    setError("");
    try {
      await financeApi.pay({ invoice_id: inv.id, amount: inv.total ?? inv.amount, currency: inv.currency ?? "USD", method: "card" });
      load();
    } catch (err) {
      setError(apiError(err));
    }
    setPayingId(null);
  }

  function downloadInvoice(inv: any) {
    generateInvoicePDF({
      txRef: inv.invoice_no ?? inv.id,
      invoiceId: inv.invoice_no ?? inv.id,
      shipment: inv.shipment_id ?? "—",
      route: inv.description ?? "—",
      origin: inv.origin ?? inv.origin_address ?? undefined,
      destination: inv.destination ?? inv.destination_address ?? undefined,
      amount: inv.total ?? inv.amount ?? 0,
      paymentMethod: inv.status === "Paid" ? "Paid" : "Pending",
      dateTime: inv.issue_date ?? new Date().toISOString(),
      customerName: inv.customer_name ?? undefined,
      customerEmail: inv.customer_email ?? undefined,
    });
  }

  return (
    <div className="space-y-6">
      <Link href="/customer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
        <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
        <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
      </Link>
      <div>
        <p className="text-xs uppercase tracking-widest text-tertiary">Customer Portal</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Invoices</h1>
        <p className="text-sm text-on-surface-variant mt-1">Easy access to all your billing documents — view, download and track payments.</p>
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map(({ icon: Icon, title, desc }, i) => (
            <Card key={title} className="p-5 flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tertiary/10">
                <Icon className="h-4 w-4 text-tertiary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-on-surface-variant">0{i + 1}</span>
                  <p className="text-sm font-semibold text-on-surface">{title}</p>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Your Invoices</h2>
        {error && <p className="text-xs text-error mb-3">{error}</p>}
        {loading ? (
          <Card className="p-12 text-center text-sm text-on-surface-variant">Loading your invoices…</Card>
        ) : invoices.length === 0 ? (
          <Card className="p-12 flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Receipt className="h-8 w-8 text-on-surface-variant/40" />
            </div>
            <div>
              <p className="text-base font-semibold text-on-surface">No invoices yet</p>
              <p className="text-sm text-on-surface-variant mt-1 max-w-sm">
                Your invoices will appear here once your first shipment is confirmed. Start by requesting a quote.
              </p>
            </div>
            <Link
              href="/customer/quotes"
              className="mt-1 px-6 py-3 rounded-xl bg-[#1E88E5] text-white text-sm font-bold hover:bg-[#1565C0] transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(30,136,229,0.25)]"
            >
              <Receipt className="h-4 w-4" /> Request a Quote to Get Started
            </Link>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Issued</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-tertiary">{inv.invoice_no}</td>
                    <td className="px-4 py-3 text-on-surface font-semibold">
                      ${Number(inv.total ?? inv.amount ?? 0).toLocaleString()} {inv.currency ?? "USD"}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{inv.issue_date ? String(inv.issue_date).slice(0, 10) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${INV_STATUS_STYLES[inv.status] ?? ""}`}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => downloadInvoice(inv)}
                          disabled={inv.status !== "Paid"}
                          title={inv.status !== "Paid" ? "Payment required to download PDF" : "Download Invoice PDF"}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-on-surface-variant text-xs font-semibold hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </button>
                        {inv.status !== "Paid" && (
                          <button onClick={() => payInvoice(inv)} disabled={payingId === inv.id} className="px-3 py-1.5 rounded-lg bg-[#1E88E5] text-white text-xs font-bold hover:bg-[#1565C0] transition-colors disabled:opacity-50">
                            {payingId === inv.id ? "Paying…" : "Pay Now"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
