"use client";

import { useEffect, useState } from "react";
import { Search, Package, Plus, Trash2, Edit, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

function generateShipmentId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SHIP-${timestamp}-${random}`;
}

const STATUS_STYLES: Record<string, string> = {
  "In Transit": "text-tertiary bg-tertiary/10",
  Delayed: "text-error bg-error/10",
  "Awaiting Dispatch": "text-on-surface-variant bg-white/5",
  Delivered: "text-green-400 bg-green-400/10",
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tracking_id: generateShipmentId(), origin: "", destination: "", cargo_type: "", weight: "", customer: "", eta: "" });
  const [saving, setSaving] = useState(false);
  const [shipmentErrors, setShipmentErrors] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("shipments").select("*").order("created_at", { ascending: false });
    if (data) setShipments(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.tracking_id.trim()) errs.tracking_id = "Tracking ID is required.";
    if (!form.origin.trim()) errs.origin = "Origin is required.";
    if (!form.destination.trim()) errs.destination = "Destination is required.";
    if (Object.keys(errs).length) { setShipmentErrors(errs); return; }
    setShipmentErrors({});
    setSaving(true);
    await supabase.from("shipments").insert([{ ...form, status: "Awaiting Dispatch" }]);
    setForm({ tracking_id: "", origin: "", destination: "", cargo_type: "", weight: "", customer: "", eta: "" });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    await supabase.from("shipments").delete().eq("id", id);
    load();
  }

  const filtered = shipments.filter((s) =>
    s.tracking_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.origin?.toLowerCase().includes(search.toLowerCase()) ||
    s.destination?.toLowerCase().includes(search.toLowerCase()) ||
    s.status?.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/logistics" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
            <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
            <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-tertiary">Logistics</p>
          <h1 className="text-3xl font-bold text-on-surface mt-1">Shipment Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">Organise and oversee all shipments from Supabase.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-on-surface-variant text-xs font-semibold hover:bg-white/10 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-tertiary/20 text-tertiary text-xs font-semibold hover:bg-tertiary/30 transition-colors">
            <Plus className="h-4 w-4" /> Add Shipment
          </button>
        </div>
      </div>

      {showForm && (
        <Card className="p-5 space-y-4 border border-tertiary/20">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">New Shipment</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Tracking ID</label><input value={form.tracking_id} onChange={(e) => { setForm({ ...form, tracking_id: e.target.value }); setShipmentErrors(p => ({...p, tracking_id: ""})); }} placeholder="e.g. SHP-90500" className={`${inputCls} ${shipmentErrors.tracking_id ? "border-red-500" : ""}`} />{shipmentErrors.tracking_id && <p className="text-xs text-error mt-1">{shipmentErrors.tracking_id}</p>}</div>
              <div><button type="button" onClick={() => setForm({ ...form, tracking_id: generateShipmentId() })} className="absolute mt-1 ml-28 px-2 py-1 rounded bg-white/5 text-[10px] text-on-surface-variant hover:bg-white/10 transition-colors">Generate ID</button></div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Origin</label><input value={form.origin} onChange={(e) => { setForm({ ...form, origin: e.target.value }); setShipmentErrors(p => ({...p, origin: ""})); }} placeholder="e.g. Shanghai" className={`${inputCls} ${shipmentErrors.origin ? "border-red-500" : ""}`} />{shipmentErrors.origin && <p className="text-xs text-error mt-1">{shipmentErrors.origin}</p>}</div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Destination</label><input value={form.destination} onChange={(e) => { setForm({ ...form, destination: e.target.value }); setShipmentErrors(p => ({...p, destination: ""})); }} placeholder="e.g. Rotterdam" className={`${inputCls} ${shipmentErrors.destination ? "border-red-500" : ""}`} />{shipmentErrors.destination && <p className="text-xs text-error mt-1">{shipmentErrors.destination}</p>}</div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Cargo Type</label><input value={form.cargo_type} onChange={(e) => setForm({ ...form, cargo_type: e.target.value })} placeholder="e.g. Electronics" className={inputCls} /></div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Weight</label><input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 5,000 kg" className={inputCls} /></div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Customer</label><input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="e.g. Amazon EU" className={inputCls} /></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-tertiary/20 text-tertiary text-sm font-semibold hover:bg-tertiary/30 transition-colors disabled:opacity-50">
                {saving ? "Saving…" : "Save Shipment"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-white/5 text-on-surface-variant text-sm font-semibold hover:bg-white/10 transition-colors">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input type="text" placeholder="Search by ID, origin, destination or status…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50" />
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-on-surface-variant">Loading from Supabase…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Origin</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">ETA</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-tertiary">{s.tracking_id}</td>
                  <td className="px-4 py-3 text-on-surface">{s.origin}</td>
                  <td className="px-4 py-3 text-on-surface">{s.destination}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{s.cargo_type ?? "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{s.customer ?? "—"}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[s.status] ?? ""}`}>{s.status}</span></td>
                  <td className="px-4 py-3 text-on-surface-variant">{s.eta ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(s.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-error/10 text-error transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-on-surface-variant text-sm">No shipments found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
