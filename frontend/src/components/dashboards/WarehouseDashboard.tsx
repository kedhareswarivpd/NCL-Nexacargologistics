"use client";

import { useEffect, useState } from "react";
import {
  PackageOpen, Truck, AlertTriangle, ClipboardList,
  ScanBarcode, TrendingUp, Thermometer, Boxes, ArrowLeft, Edit, X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { warehouseApi } from "@/lib/services";
import type { InventoryItem, StorageZone, InboundShipment, WarehouseTask, ThroughputEntry } from "@/lib/types";
import Link from "next/link";

const PRIORITY_STYLES: Record<string, string> = {
  High: "text-error bg-error/10",
  Medium: "text-on-tertiary-container bg-on-tertiary-container/10",
  Low: "text-on-surface-variant bg-white/5",
};

const STATUS_STYLES: Record<string, string> = {
  Arriving: "text-tertiary bg-tertiary/10",
  Unloading: "text-on-tertiary-container bg-on-tertiary-container/10",
  Inspecting: "text-secondary bg-secondary/10",
  Putaway: "text-green-400 bg-green-400/10",
};

export default function WarehouseDashboard() {
  const { user } = useAuth();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [zones, setZones] = useState<StorageZone[]>([]);
  const [inbound, setInbound] = useState<InboundShipment[]>([]);
  const [tasks, setTasks] = useState<WarehouseTask[]>([]);
  const [throughput, setThroughput] = useState<ThroughputEntry[]>([]);
  const [editTarget, setEditTarget] = useState<WarehouseTask | null>(null);
  const [editForm, setEditForm] = useState({ description: "", status: "", assigned_to: "" });
  const [editSaving, setEditSaving] = useState(false);

  function openEdit(t: WarehouseTask) {
    setEditTarget(t);
    setEditForm({ description: t.description, status: t.status, assigned_to: t.assigned_to ?? "" });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await warehouseApi.updateTask(editTarget.id, editForm);
      setEditTarget(null);
      const t = await warehouseApi.tasks();
      setTasks((t ?? []).filter((x: WarehouseTask) => x.status === "Pending").slice(0, 4));
    } catch { }
    setEditSaving(false);
  }

  useEffect(() => {
    (async () => {
      try {
        const inv = await warehouseApi.inventory();
        setInventory(inv ?? []);
      } catch {
        setInventory([]);
      }
      try {
        const inb = await warehouseApi.tasks("inbound");
        setInbound((inb ?? []).slice(0, 4));
      } catch {
        setInbound([]);
      }
      try {
        const t = await warehouseApi.tasks();
        setTasks((t ?? []).filter((x: WarehouseTask) => x.status === "Pending").slice(0, 4));
      } catch {
        setTasks([]);
      }
    })();
    // TODO: no backend source yet for storage zones or weekly throughput.
    setZones([]);
    setThroughput([]);
  }, []);

  const totalSKUs = inventory.length;
  const inboundToday = inbound.filter((s) => s.status === "Arriving").length;
  const outboundToday = inbound.filter((s) => s.status === "Putaway").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;

  const STATS = [
    { label: "Total SKUs", value: totalSKUs.toLocaleString(), Icon: Boxes, href: "/warehouse/inventory" },
    { label: "Inbound Today", value: String(inboundToday), Icon: PackageOpen, href: "/warehouse/inbound" },
    { label: "Outbound Today", value: String(outboundToday), Icon: Truck, href: "/warehouse/outbound" },
    { label: "Pending Tasks", value: String(pendingTasks), Icon: ClipboardList, href: "/warehouse/tasks" },
  ];

  const maxUnits = throughput.length ? Math.max(...throughput.map((t) => t.units)) : 1;
  const todayUnits = throughput.at(-1)?.units ?? 0;

  return (
    <div className="p-6 space-y-6 page-enter">
      <div>
        <Link href={user?.role === "admin" ? "/admin" : "/"} className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">
            {user?.role === "admin" ? "Back to Admin" : "Back to Home"}
          </span>
        </Link>
        <p className="font-label-caps text-xs uppercase tracking-widest text-tertiary">Warehouse Dashboard</p>
        <h1 className="font-headline-lg mt-1 text-3xl font-bold text-on-surface">
          Welcome back, {user?.name.split(" ")[0]}.
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">Live view of your warehouse operations.</p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, Icon, href }, i) => (
          <Link href={href} key={label} className="block group">
            <Card className="p-5 animate-fade-up group-hover:border-tertiary/50 transition-colors duration-200 cursor-pointer" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary group-hover:bg-tertiary group-hover:text-white transition-all duration-200">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-mono text-2xl font-bold text-on-surface">{value}</p>
              <p className="font-label-caps mt-1 text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
            </Card>
          </Link>
        ))}
      </section>

      {/* Zone Utilization + Cold Storage */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Zone Utilization</h2>
          <Card className="p-5 space-y-5">
            {zones.map((b) => {
              const pct = Math.round((b.used_bins / b.total_bins) * 100);
              const warn = pct >= 90;
              return (
                <div key={b.id}>
                  <div className="flex justify-between mb-1.5 text-sm">
                    <span className="flex items-center gap-2 text-on-surface">
                      {warn && <AlertTriangle className="h-3.5 w-3.5 text-error" />}
                      {b.zone}
                    </span>
                    <span className={`font-mono text-xs ${warn ? "text-error" : "text-on-surface-variant"}`}>
                      {b.used_bins}/{b.total_bins} bins ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full animate-progress-fill ${pct >= 90 ? "bg-error" : pct >= 70 ? "bg-on-tertiary-container" : "bg-tertiary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Cold Storage Status</h2>
          <Card className="p-5 space-y-4 h-[calc(100%-2rem)]">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-tertiary/5 border border-tertiary/20">
              <Thermometer className="h-8 w-8 text-tertiary" />
              <div>
                <p className="font-mono text-2xl font-bold text-on-surface">-18°C</p>
                <p className="text-xs text-on-surface-variant">Freezer Units (F1–F4)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
              <Thermometer className="h-8 w-8 text-secondary" />
              <div>
                <p className="font-mono text-2xl font-bold text-on-surface">+4°C</p>
                <p className="text-xs text-on-surface-variant">Chiller Units (C1–C8)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-error/5 border border-error/20">
              <AlertTriangle className="h-5 w-5 text-error" />
              <div>
                <p className="text-sm font-semibold text-on-surface">Reefer Unit C6</p>
                <p className="text-xs text-on-surface-variant">Temp fluctuation +2°C — check required</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Inbound Shipments */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Inbound Shipments</h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inbound.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-tertiary">{s.id}</td>
                  <td className="px-4 py-3 text-on-surface">{s.supplier}</td>
                  <td className="px-4 py-3 font-mono text-on-surface">{s.items}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[s.status] ?? ""}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{s.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Task Queue */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Task Queue</h2>
        <Card className="divide-y divide-white/5">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-4 p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <ScanBarcode className="h-4 w-4 shrink-0 text-on-surface-variant" />
                <div>
                  <span className="font-mono text-xs text-tertiary mr-2">{t.id}</span>
                  <span className="text-sm text-on-surface">{t.description}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-on-surface-variant">{t.assignee}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[t.priority ?? ""]}`}>{t.priority}</span>
                <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-tertiary/10 text-tertiary transition-colors" title="Edit"><Edit className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* Weekly Throughput — Warehouse Analytics */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Weekly Throughput</h2>
        <Card className="p-6">
          <div className="flex items-end justify-between gap-2 h-36 px-2">
            {throughput.map((entry, i) => (
              <div key={i} className="relative flex w-full flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm bg-gradient-to-t from-tertiary/30 to-tertiary/10 border-t border-tertiary animate-bar-grow"
                  style={{ height: `${(entry.units / maxUnits) * 100}%`, animationDelay: `${i * 0.07}s` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between px-2 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
            {throughput.map((entry) => (
              <span key={entry.day}>{new Date(entry.day).toLocaleDateString("en-US", { weekday: "short" })}</span>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1 text-xs text-tertiary">
            <TrendingUp className="h-3 w-3" /> {todayUnits} units processed today
          </p>
        </Card>
      </section>
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-container shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="text-base font-bold text-on-surface">Edit Task</h2>
              <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant"><X className="h-4 w-4" /></button>
            </div>
            <form noValidate onSubmit={saveEdit} className="p-6 space-y-4">
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Description</label><input value={editForm.description} onChange={e => setEditForm(p => ({...p, description: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Status</label>
                <select value={editForm.status} onChange={e => setEditForm(p => ({...p, status: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
                  <option>Pending</option><option>In Progress</option><option>Done</option>
                </select>
              </div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Assigned To</label><input value={editForm.assigned_to} onChange={e => setEditForm(p => ({...p, assigned_to: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editSaving} className="flex-1 py-2.5 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] disabled:opacity-50">{editSaving ? "Saving…" : "Save Changes"}</button>
                <button type="button" onClick={() => setEditTarget(null)} className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-on-surface-variant hover:bg-white/10">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
