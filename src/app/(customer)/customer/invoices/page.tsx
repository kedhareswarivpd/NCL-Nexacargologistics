"use client";

import { Receipt, Download, FileText, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const HOW_IT_WORKS = [
  { icon: FileText, title: "Invoice Generated", desc: "An invoice is automatically created once your shipment is confirmed and dispatched." },
  { icon: Clock, title: "Payment Due", desc: "You'll receive a notification with payment details and due date via email." },
  { icon: Download, title: "Download Anytime", desc: "Access and download your invoices as PDF at any time from this page." },
  { icon: CheckCircle2, title: "Mark as Paid", desc: "Once payment is processed, your invoice status updates automatically." },
];

export default function InvoicesPage() {
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

      {/* Empty state */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Your Invoices</h2>
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
      </div>
    </div>
  );
}
