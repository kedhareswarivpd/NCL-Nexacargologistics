"use client";

import { useEffect, useState } from "react";
import {
  Package, Truck, Route, CheckCircle2, AlertTriangle,
  ChevronRight, Plus, X, Copy, Check, Loader2, RefreshCw, ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_LINKS = [
  { label: "Shipments",          desc: "Manage all shipments",           href: "/logistics/shipments",  icon: Package, color: "text-tertiary bg-tertiary/10" },
  { label: "Containers",         desc: "Track container usage",          href: "/logistics/containers", icon: Package, color: "text-secondary bg-secondary/10" },
  { label: "Routes",             desc: "Optimize delivery routes",       href: "/logistics/routes",     icon: Route,   color: "text-green-400 bg-green-400/10" },
  { label: "Delivery Tracking",  desc: "Monitor deliveries in real time",href: "/logistics/deliveries", icon: Truck,   color: "text-on-tertiary-container bg-on-tertiary-container/10" },
  { label: "Vehicle Assignment", desc: "Allocate vehicles to shipments", href: "/logistics/vehicles",   icon: Truck,   color: "text-error bg-error/10" },
];

const STATUS_STYLES: Record<string, string> = {
  "In Transit":        "text-tertiary bg-tertiary/10",
  "Delayed":           "text-error bg-error/10",
  "Awaiting Dispatch": "text-on-surface-variant bg-white/5",
  "Delivered":         "text-green-400 bg-green-400/10",
};

const CARGO_TYPES = ["FCL 20FT", "FCL 40FT", "FCL 40HQ", "LCL", "Air Freight", "Bulk", "Break Bulk"];

/* ── Auto-generate shipment ID matching existing SHIP-xxx format ── */
function generateId(): string {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SHIP-${ts}-${rnd}`;
}

const EMPTY_FORM = () => ({
  tracking_id: generateId(),
  origin:      "",
  destination: "",
  cargo_type:  "FCL 20FT",
  weight:      "",
  customer:    "",
  eta:         "",
  status:      "Awaiting Dispatch",
});

export default function LogisticsDashboardPage() {
  const { user } = useAuth();
  const [shipments,   setShipments]   = useState<any[]>([]);
  const [stats,       setStats]       = useState({ total: 0, inTransit: 0, delayed: 0, delivered: 0 });
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [success,     setSuccess]     = useState<string | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const [form,        setForm]        = useState(EMPTY_FORM());

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("shipments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);
    if (data) {
      setShipments(data);
      setStats({
        total:     data.length,
        inTransit: data.filter((s) => s.status === "In Transit").length,
        delayed:   data.filter((s) => s.status === "Delayed").length,
        delivered: data.filter((s) => s.status === "Delivered").length,
      });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openModal() {
    setForm(EMPTY_FORM());
    setError(null);
    setShowModal(true);
  }

  function copyId() {
    navigator.clipboard.writeText(form.tracking_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: Record<string, any> = {
      tracking_id:  form.tracking_id,
      origin:       form.origin.trim(),
      destination:  form.destination.trim(),
      cargo_type:   form.cargo_type || null,
      weight:       form.weight.trim() || null,
      customer:     form.customer.trim() || null,
      eta:          form.eta || null,
      status:       form.status,
    };

    const { error: sbError } = await supabase.from("shipments").insert([payload]);
    setSubmitting(false);

    if (sbError) {
      setError(sbError.message);
      return;
    }

    const createdId = form.tracking_id;
    setSuccess(createdId);
    setShowModal(false);
    load();
    setTimeout(() => setSuccess(null), 5000);
  }

  const inputCls = "mt-1 w-full px-3 py-2.5 rounded-xl bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/60 transition-colors";
  const labelCls = "text-xs font-semibold uppercase tracking-widest text-on-surface-variant";

  return (
    <div className="p-6 space-y-6 page-enter">

      {/* Header */}
      <div className="animate-fade-up flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
            <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
            <span className="text-sm font-bold text-[#0B1F3A]">← Back to Admin</span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-tertiary">Logistics Portal</p>
          <h1 className="text-3xl font-bold text-on-surface mt-1">
            Welcome, {user?.name.split(" ")[0]}.
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">Real-time overview of your logistics network.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-sm shadow-[0_0_24px_rgba(0,194,255,0.3)] hover:shadow-[0_0_36px_rgba(0,194,255,0.45)] transition-all shrink-0"
        >
          <Plus className="h-4 w-4" /> Create Shipment
        </motion.button>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-green-400/10 border border-green-400/25 text-green-400"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">
              Shipment <span className="font-mono">{success}</span> created and saved to Supabase!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Shipments", value: stats.total,     Icon: Package,       color: "text-tertiary bg-tertiary/10" },
          { label: "In Transit",      value: stats.inTransit, Icon: Truck,         color: "text-secondary bg-secondary/10" },
          { label: "Delayed",         value: stats.delayed,   Icon: AlertTriangle, color: "text-error bg-error/10" },
          { label: "Delivered",       value: stats.delivered, Icon: CheckCircle2,  color: "text-green-400 bg-green-400/10" },
        ].map(({ label, value, Icon, color }, i) => (
          <Card key={label} className="p-5 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-mono text-2xl font-bold text-on-surface">{loading ? "—" : value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Shipments table */}
        <div className="lg:col-span-2 space-y-3 animate-fade-up" style={{ animationDelay: "0.32s" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Recent Shipments</h2>
            <div className="flex items-center gap-3">
              <button onClick={load} className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <button onClick={openModal} className="flex items-center gap-1.5 text-xs font-bold text-[#00C2FF] hover:text-white transition-colors">
                <Plus className="h-3.5 w-3.5" /> New Shipment
              </button>
            </div>
          </div>
          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-8 flex items-center justify-center gap-3 text-on-surface-variant">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading shipments…</span>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant bg-white/[0.02]">
                    <th className="px-4 py-3">Shipment ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Origin</th>
                    <th className="px-4 py-3">Destination</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shipments.map((s, i) => (
                    <tr key={s.id}
                      className="hover:bg-white/5 transition-all duration-150 hover:translate-x-0.5 animate-fade-up"
                      style={{ animationDelay: `${i * 0.04}s` }}>
                      <td className="px-4 py-3 font-mono text-xs text-[#00C2FF] font-bold">{s.tracking_id}</td>
                      <td className="px-4 py-3 text-on-surface-variant text-xs">{s.customer ?? "—"}</td>
                      <td className="px-4 py-3 text-on-surface">{s.origin}</td>
                      <td className="px-4 py-3 text-on-surface">{s.destination}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[s.status] ?? ""}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant text-xs">{s.eta ?? "—"}</td>
                    </tr>
                  ))}
                  {shipments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant text-sm">
                        No shipments yet.{" "}
                        <button onClick={openModal} className="text-[#00C2FF] font-semibold hover:underline">
                          Create the first one →
                        </button>
                      </td>
                    </tr>
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
              <Link key={label} href={href}
                className="flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-all duration-200 hover:translate-x-1 group">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
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

      {/* ══════════════════════════════════════════
          CREATE SHIPMENT MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="w-full max-w-2xl rounded-2xl border border-white/10 bg-surface-container shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1E88E5]/20 border border-[#1E88E5]/30 flex items-center justify-center">
                    <Package className="h-4 w-4 text-[#00C2FF]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Create New Shipment</h2>
                    <p className="text-xs text-on-surface-variant">Saved directly to Supabase shipments table</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-on-surface-variant hover:text-on-surface">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-error/10 border border-error/25 text-error text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Auto-generated Shipment ID */}
                <div>
                  <label className={labelCls}>
                    Shipment ID
                    <span className="ml-2 text-[#00C2FF] normal-case tracking-normal font-normal text-[11px]">
                      auto-generated
                    </span>
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#1E88E5]/10 border border-[#1E88E5]/35">
                      <Package className="h-4 w-4 text-[#00C2FF] shrink-0" />
                      <span className="font-mono text-sm font-bold text-[#00C2FF] tracking-wider flex-1 select-all">
                        {form.tracking_id}
                      </span>
                    </div>
                    <button type="button" onClick={copyId}
                      title="Copy ID"
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all">
                      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button type="button"
                      onClick={() => setForm((f) => ({ ...f, tracking_id: generateId() }))}
                      title="Generate new ID"
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#1E88E5]/20 hover:border-[#1E88E5]/40 text-xs font-semibold text-on-surface-variant hover:text-[#00C2FF] transition-all">
                      ↻ New ID
                    </button>
                  </div>
                </div>

                {/* Origin & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Origin Port / City *</label>
                    <input required value={form.origin}
                      onChange={(e) => setForm({ ...form, origin: e.target.value })}
                      placeholder="e.g. Shanghai, CN" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Destination Port / City *</label>
                    <input required value={form.destination}
                      onChange={(e) => setForm({ ...form, destination: e.target.value })}
                      placeholder="e.g. Rotterdam, NL" className={inputCls} />
                  </div>
                </div>

                {/* Customer & Cargo Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Customer</label>
                    <input value={form.customer}
                      onChange={(e) => setForm({ ...form, customer: e.target.value })}
                      placeholder="e.g. Acme Corp" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Cargo Type</label>
                    <select value={form.cargo_type}
                      onChange={(e) => setForm({ ...form, cargo_type: e.target.value })}
                      className={inputCls}>
                      {CARGO_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Weight & ETA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Weight</label>
                    <input value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      placeholder="e.g. 12,000 kg" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>ETA</label>
                    <input type="date" value={form.eta}
                      onChange={(e) => setForm({ ...form, eta: e.target.value })}
                      className={inputCls} />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className={labelCls}>Initial Status</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["Awaiting Dispatch", "In Transit", "Delayed"] as const).map((s) => (
                      <button key={s} type="button"
                        onClick={() => setForm({ ...form, status: s })}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          form.status === s
                            ? STATUS_STYLES[s] + " border-current shadow-sm"
                            : "border-white/10 text-on-surface-variant hover:border-white/25 hover:bg-white/5"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-white/8">
                  <button type="submit" disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shadow-[0_0_20px_rgba(0,194,255,0.25)]">
                    {submitting
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving to Supabase…</>
                      : <><Package className="h-4 w-4" /> Create Shipment</>
                    }
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-on-surface-variant hover:bg-white/10 hover:text-on-surface transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
