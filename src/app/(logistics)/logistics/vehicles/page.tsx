"use client";

import { useEffect, useState } from "react";
import { Truck, Search, Plus, Trash2, RefreshCw, CheckCircle2, AlertTriangle, Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const STATUS_STYLES: Record<string, string> = {
  Available: "text-green-400 bg-green-400/10",
  "In Use": "text-tertiary bg-tertiary/10",
  Maintenance: "text-error bg-error/10",
};

const TYPE_STYLES: Record<string, string> = {
  "Container Ship": "text-secondary bg-secondary/10",
  "Bulk Carrier": "text-on-tertiary-container bg-on-tertiary-container/10",
  "Heavy Truck": "text-tertiary bg-tertiary/10",
  "Medium Truck": "text-tertiary bg-tertiary/10",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle_no: "", type: "Heavy Truck", driver: "", location: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
    if (data) setVehicles(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("vehicles").insert([{ ...form, status: "Available" }]);
    setForm({ vehicle_no: "", type: "Heavy Truck", driver: "", location: "" });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    await supabase.from("vehicles").delete().eq("id", id);
    load();
  }

  async function handleAssign(id: string, driver: string) {
    const newDriver = prompt("Assign driver name:", driver ?? "");
    if (newDriver === null) return;
    await supabase.from("vehicles").update({ driver: newDriver, status: newDriver ? "In Use" : "Available" }).eq("id", id);
    load();
  }

  const filtered = vehicles.filter((v) =>
    v.vehicle_no?.toLowerCase().includes(search.toLowerCase()) ||
    v.type?.toLowerCase().includes(search.toLowerCase()) ||
    v.status?.toLowerCase().includes(search.toLowerCase()) ||
    v.driver?.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50";
  const available = vehicles.filter(v => v.status === "Available").length;
  const inUse = vehicles.filter(v => v.status === "In Use").length;
  const maintenance = vehicles.filter(v => v.status === "Maintenance").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/logistics" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
            <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
            <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-tertiary">Logistics</p>
          <h1 className="text-3xl font-bold text-on-surface mt-1">Vehicle Assignment</h1>
          <p className="text-sm text-on-surface-variant mt-1">Allocate vehicles to shipments effectively from Supabase.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-on-surface-variant text-xs font-semibold hover:bg-white/10 transition-colors"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-tertiary/20 text-tertiary text-xs font-semibold hover:bg-tertiary/30 transition-colors"><Plus className="h-4 w-4" /> Add Vehicle</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4"><CheckCircle2 className="h-8 w-8 text-green-400" /><div><p className="font-mono text-2xl font-bold text-on-surface">{available}</p><p className="text-xs uppercase tracking-widest text-on-surface-variant">Available</p></div></Card>
        <Card className="p-5 flex items-center gap-4"><Truck className="h-8 w-8 text-tertiary" /><div><p className="font-mono text-2xl font-bold text-on-surface">{inUse}</p><p className="text-xs uppercase tracking-widest text-on-surface-variant">In Use</p></div></Card>
        <Card className="p-5 flex items-center gap-4"><Wrench className="h-8 w-8 text-error" /><div><p className="font-mono text-2xl font-bold text-on-surface">{maintenance}</p><p className="text-xs uppercase tracking-widest text-on-surface-variant">Maintenance</p></div></Card>
      </div>

      {showForm && (
        <Card className="p-5 space-y-4 border border-tertiary/20">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">New Vehicle</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Vehicle No</label><input required value={form.vehicle_no} onChange={(e) => setForm({ ...form, vehicle_no: e.target.value })} placeholder="e.g. TRUCK-100" className={inputCls} /></div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                  <option>Heavy Truck</option><option>Medium Truck</option><option>Container Ship</option><option>Bulk Carrier</option><option>Van</option>
                </select>
              </div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Driver (optional)</label><input value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} placeholder="e.g. Marcus Johnson" className={inputCls} /></div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Dubai Hub" className={inputCls} /></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-tertiary/20 text-tertiary text-sm font-semibold hover:bg-tertiary/30 transition-colors disabled:opacity-50">{saving ? "Saving…" : "Save Vehicle"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-white/5 text-on-surface-variant text-sm font-semibold hover:bg-white/10 transition-colors">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input type="text" placeholder="Search vehicles…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50" />
      </div>

      <Card className="overflow-hidden">
        {loading ? <p className="p-6 text-sm text-on-surface-variant">Loading from Supabase…</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-3">Vehicle No</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-tertiary">{v.vehicle_no}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_STYLES[v.type] ?? "text-on-surface-variant bg-white/5"}`}>{v.type}</span>
                  </td>
                  <td className="px-4 py-3 text-on-surface">{v.driver ?? <span className="text-on-surface-variant italic">Unassigned</span>}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{v.location ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[v.status] ?? ""}`}>{v.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleAssign(v.id, v.driver)} className="px-3 py-1.5 rounded-lg bg-tertiary/10 text-tertiary text-xs font-semibold hover:bg-tertiary/20 transition-colors">
                        {v.driver ? "Reassign" : "Assign"}
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-sm">No vehicles found.</td></tr>}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
