"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Trash2, RefreshCw, Route, MapPin, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { routesApi } from "@/lib/services";
import { apiError } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  Active: "text-tertiary bg-tertiary/10",
  Delayed: "text-error bg-error/10",
  Scheduled: "text-secondary bg-secondary/10",
  Completed: "text-green-400 bg-green-400/10",
};

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ route_code: "", origin: "", destination: "", distance: "", duration: "", driver: "", vehicle: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await routesApi.list();
      setRoutes(data ?? []);
    } catch {
      setRoutes([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const [routeErrors, setRouteErrors] = useState<Record<string, string>>({});

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.route_code.trim()) errs.route_code = "Route code is required.";
    if (!form.origin.trim()) errs.origin = "Origin is required.";
    if (!form.destination.trim()) errs.destination = "Destination is required.";
    if (Object.keys(errs).length) { setRouteErrors(errs); return; }
    setRouteErrors({});
    setSaving(true);
    try {
      // driver/vehicle are free-text UI fields with no backend column — omitted.
      await routesApi.create({
        route_code: form.route_code,
        origin: form.origin,
        destination: form.destination,
        distance: form.distance,
        duration: form.duration,
        status: "Scheduled",
      });
      setForm({ route_code: "", origin: "", destination: "", distance: "", duration: "", driver: "", vehicle: "" });
      setShowForm(false);
    } catch (err) {
      setRouteErrors({ route_code: apiError(err) });
    }
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    try { await routesApi.remove(id); } catch { /* ignore */ }
    load();
  }

  const filtered = routes.filter((r) =>
    r.route_code?.toLowerCase().includes(search.toLowerCase()) ||
    r.origin?.toLowerCase().includes(search.toLowerCase()) ||
    r.destination?.toLowerCase().includes(search.toLowerCase()) ||
    r.status?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold text-on-surface mt-1">Route Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">Optimize delivery routes for efficiency from Supabase.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-on-surface-variant text-xs font-semibold hover:bg-white/10 transition-colors"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-tertiary/20 text-tertiary text-xs font-semibold hover:bg-tertiary/30 transition-colors"><Plus className="h-4 w-4" /> Add Route</button>
        </div>
      </div>

      {showForm && (
        <Card className="p-5 space-y-4 border border-tertiary/20">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">New Route</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-on-surface-variant">Route Code</label>
                <input required value={form.route_code} onChange={(e) => { setForm({ ...form, route_code: e.target.value }); setRouteErrors(p => ({...p, route_code: ""})); }} placeholder="e.g. RTE-2300" className={`${inputCls} ${routeErrors.route_code ? "border-red-500" : ""}`} />
                {routeErrors.route_code && <p className="text-xs text-error mt-1">{routeErrors.route_code}</p>}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-on-surface-variant">Origin</label>
                <input required value={form.origin} onChange={(e) => { setForm({ ...form, origin: e.target.value }); setRouteErrors(p => ({...p, origin: ""})); }} placeholder="e.g. Shanghai" className={`${inputCls} ${routeErrors.origin ? "border-red-500" : ""}`} />
                {routeErrors.origin && <p className="text-xs text-error mt-1">{routeErrors.origin}</p>}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-on-surface-variant">Destination</label>
                <input required value={form.destination} onChange={(e) => { setForm({ ...form, destination: e.target.value }); setRouteErrors(p => ({...p, destination: ""})); }} placeholder="e.g. Rotterdam" className={`${inputCls} ${routeErrors.destination ? "border-red-500" : ""}`} />
                {routeErrors.destination && <p className="text-xs text-error mt-1">{routeErrors.destination}</p>}
              </div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Distance</label><input value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} placeholder="e.g. 19,500 km" className={inputCls} /></div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Duration</label><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 25 days" className={inputCls} /></div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Driver</label><input value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} placeholder="e.g. Elena Rodriguez" className={inputCls} /></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-tertiary/20 text-tertiary text-sm font-semibold hover:bg-tertiary/30 transition-colors disabled:opacity-50">{saving ? "Saving…" : "Save Route"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-white/5 text-on-surface-variant text-sm font-semibold hover:bg-white/10 transition-colors">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input type="text" placeholder="Search routes…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="text-sm text-on-surface-variant col-span-3">Loading from Supabase…</p> :
          filtered.map((r) => (
            <Card key={r.id} className="p-5 space-y-3 group hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-tertiary">{r.route_code}</p>
                  <p className="text-sm font-semibold text-on-surface mt-0.5">{r.origin} → {r.destination}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status] ?? ""}`}>{r.status}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
                {r.distance && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.distance}</span>}
                {r.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.duration}</span>}
              </div>
              {r.driver && <p className="text-xs text-on-surface-variant">Driver: <span className="text-on-surface">{r.driver}</span></p>}
              {r.vehicle && <p className="text-xs text-on-surface-variant">Vehicle: <span className="text-on-surface">{r.vehicle}</span></p>}
              <button onClick={() => handleDelete(r.id)} className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-error text-xs hover:bg-error/10 transition-all">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </Card>
          ))
        }
        {!loading && filtered.length === 0 && <p className="text-sm text-on-surface-variant col-span-3 text-center py-8">No routes found.</p>}
      </div>
    </div>
  );
}
