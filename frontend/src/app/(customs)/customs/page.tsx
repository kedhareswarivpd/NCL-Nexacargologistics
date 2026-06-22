"use client";

import { useEffect, useState } from "react";
import { FileText, Globe, CheckCircle2, AlertTriangle, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { customsApi } from "@/lib/services";
import Link from "next/link";

const QUICK_LINKS = [
  { label: "Customs Clearance", desc: "Track clearance status", href: "/customs/clearance", icon: FileText, color: "text-tertiary bg-tertiary/10" },
  { label: "Documentation", desc: "Manage customs docs", href: "/customs/documents", icon: FileText, color: "text-secondary bg-secondary/10" },
  { label: "Duty Calculator", desc: "Calculate import duties", href: "/customs/duty-calc", icon: Globe, color: "text-green-400 bg-green-400/10" },
  { label: "Compliance", desc: "Regulatory compliance", href: "/customs/compliance", icon: CheckCircle2, color: "text-on-tertiary-container bg-on-tertiary-container/10" },
];

const STATUS_STYLES: Record<string, string> = {
  "Pending Review": "text-tertiary bg-tertiary/10",
  "Approved": "text-green-400 bg-green-400/10",
  "On Hold": "text-error bg-error/10",
  "Cleared": "text-secondary bg-secondary/10",
};

export default function CustomsDashboardPage() {
  const { user } = useAuth();
  const [clearances, setClearances] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, onHold: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await customsApi.entries();
        const rows = (data ?? []).slice(0, 5);
        setClearances(rows);
        setStats({
          total: rows.length,
          pending: rows.filter((s: any) => s.status === "pending" || s.status === "under_review").length,
          approved: rows.filter((s: any) => s.status === "cleared").length,
          onHold: rows.filter((s: any) => s.status === "held").length,
        });
      } catch {
        setClearances([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-6 page-enter">
      <div className="animate-fade-up">
        <Link href="/admin" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Admin</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Customs Portal</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Welcome, {user?.name.split(" ")[0]}.</h1>
        <p className="text-sm text-on-surface-variant mt-1">Customs clearance and compliance management.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clearances", value: stats.total, Icon: FileText, color: "text-tertiary bg-tertiary/10" },
          { label: "Pending Review", value: stats.pending, Icon: Clock, color: "text-secondary bg-secondary/10" },
          { label: "On Hold", value: stats.onHold, Icon: AlertTriangle, color: "text-error bg-error/10" },
          { label: "Cleared", value: stats.approved, Icon: CheckCircle2, color: "text-green-400 bg-green-400/10" },
        ].map(({ label, value, Icon, color }, i) => (
          <Card key={label} className="p-5 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}><Icon className="h-5 w-5" /></span>
            <p className="mt-4 font-mono text-2xl font-bold text-on-surface">{loading ? "—" : value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Clearances */}
        <div className="lg:col-span-2 space-y-3 animate-fade-up" style={{ animationDelay: "0.32s" }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Recent Clearances</h2>
          <Card className="overflow-hidden">
            {loading ? (
              <p className="p-6 text-sm text-on-surface-variant">Loading from Supabase…</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Shipment</th>
                    <th className="px-4 py-3">Port</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {clearances.map((c, i) => (
                    <tr key={c.id} style={{ animationDelay: `${i * 0.05}s` }} className="animate-fade-up hover:bg-white/5 transition-all duration-150 hover:translate-x-0.5">
                      <td className="px-4 py-3 font-mono text-xs text-tertiary">{c.reference_number}</td>
                      <td className="px-4 py-3 text-on-surface">{c.shipment_id}</td>
                      <td className="px-4 py-3 text-on-surface">{c.port}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[c.status] ?? ""}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{c.updated_at ? new Date(c.updated_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                  {clearances.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant text-sm">No customs clearances found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* Quick Links */}
        <div className="space-y-3 animate-slide-right" style={{ animationDelay: "0.24s" }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Quick Access</h2>
          <Card className="divide-y divide-white/5">
            {QUICK_LINKS.map(({ label, desc, href, icon: Icon, color }) => (
              <Link key={label} href={href} className="flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-all duration-200 hover:translate-x-1 group">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}><Icon className="h-4 w-4" /></span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{label}</p>
                    <p className="text-xs text-on-surface-variant">{desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}