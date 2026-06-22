"use client";

import { useEffect, useState } from "react";
import { FileText, Download, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { financeApi } from "@/lib/services";
import { api } from "@/lib/api";

const TYPE_STYLES: Record<string, string> = {
  Quarterly: "text-tertiary bg-tertiary/10",
  Monthly: "text-secondary bg-secondary/10",
  Annual: "text-green-400 bg-green-400/10",
  "Ad-hoc": "text-on-surface-variant bg-white/5",
};

// Report types backed by GET /reports/download/{type} (streamed as CSV).
const REPORT_TYPES = [
  { key: "finance",  name: "Finance Report (invoices & payments)", type: "Annual" },
  { key: "shipment", name: "Shipment Report",                     type: "Monthly" },
  { key: "customer", name: "Customer Report",                     type: "Ad-hoc" },
  { key: "driver",   name: "Driver Report",                       type: "Ad-hoc" },
  { key: "delivery", name: "Delivery Report",                     type: "Monthly" },
];

interface Invoice {
  id: string;
  invoice_no?: string;
  customer_id?: string;
  amount: number;
  due_date?: string;
  status: string;
}

export default function ReportsPage() {
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    // Outstanding Reports — unpaid invoices
    financeApi.outstanding()
      .then((data) => setOverdueInvoices(data ?? []))
      .catch(() => setOverdueInvoices([]));
  }, []);

  // Fetch the CSV with the auth header attached, then trigger a browser download.
  async function downloadReport(key: string) {
    setDownloading(key);
    try {
      const res = await api.get(`/reports/download/${key}`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${key}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
    setDownloading(null);
  }

  const overdueTotal = overdueInvoices
    .filter((i) => i.status === "Overdue")
    .reduce((s, i) => s + i.amount, 0);
  const pendingTotal = overdueInvoices
    .filter((i) => i.status === "Pending")
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/finance" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Finance</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Reports</h1>
        <p className="text-sm text-on-surface-variant mt-1">Download financial reports and review outstanding balances.</p>
      </div>

      {/* Outstanding Reports Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 flex items-center gap-4 border border-error/20">
          <AlertCircle className="h-8 w-8 text-error shrink-0" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">${overdueTotal.toLocaleString()}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Overdue Amount</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border border-on-tertiary-container/20">
          <FileText className="h-8 w-8 text-on-tertiary-container shrink-0" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">${pendingTotal.toLocaleString()}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Pending Amount</p>
          </div>
        </Card>
      </div>

      {/* Outstanding Invoices Report */}
      {overdueInvoices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-error" /> Outstanding Invoice Report
          </h2>
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
                {overdueInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-tertiary">{inv.invoice_no ?? inv.id}</td>
                    <td className="px-4 py-3 text-on-surface">{inv.customer_id ?? "—"}</td>
                    <td className={`px-4 py-3 font-mono ${inv.status === "Overdue" ? "text-error" : "text-on-surface"}`}>
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{inv.due_date ?? "—"}</td>
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

      {/* Generated Reports */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Generated Reports</h2>
        <Card className="divide-y divide-white/5">
          {REPORT_TYPES.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-4 p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-tertiary" />
                <div>
                  <p className="text-sm text-on-surface">{r.name}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Live export · CSV</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_STYLES[r.type] ?? ""}`}>
                  {r.type}
                </span>
                <button
                  onClick={() => downloadReport(r.key)}
                  disabled={downloading === r.key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tertiary/10 text-tertiary text-xs font-semibold hover:bg-tertiary/20 transition-colors disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" /> {downloading === r.key ? "Downloading…" : "Download"}
                </button>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
