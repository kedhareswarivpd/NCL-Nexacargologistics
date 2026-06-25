"use client";

import { useEffect, useRef, useState } from "react";
import { Search, AlertTriangle, TrendingDown, Package, ScanBarcode, ArrowLeft, Edit, X, Plus } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { warehouseApi } from "@/lib/services";
import type { InventoryItem } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  OK: "text-green-400 bg-green-400/10",
  Low: "text-on-tertiary-container bg-on-tertiary-container/10",
  Out: "text-error bg-error/10",
  // Legacy Supabase status key — kept so older rows still render.
  Critical: "text-error bg-error/10",
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [scanning, setScanning] = useState(false);
  const barcodeBuffer = useRef("");
  const barcodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({ name: "", qty: "", reorder_at: "", zone: "", category: "" });
  const [editSaving, setEditSaving] = useState(false);

  function openEdit(item: InventoryItem) {
    setEditTarget(item);
    setEditForm({ name: item.name, qty: String(item.qty), reorder_at: String(item.reorder_at ?? ""), zone: item.zone ?? "", category: item.category ?? "" });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await warehouseApi.updateInventory(editTarget.id, { name: editForm.name, qty: Number(editForm.qty), reorder_at: editForm.reorder_at ? Number(editForm.reorder_at) : undefined, zone: editForm.zone, category: editForm.category });
      setEditTarget(null);
      const data = await warehouseApi.inventory(); setItems(data ?? []);
    } catch { /* ignore */ }
    setEditSaving(false);
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await warehouseApi.inventory();
        setItems(data ?? []);
      } catch {
        setItems([]);
      }
    })();
  }, []);

  // Barcode Scanner Integration — listens for rapid keyboard input (USB/BT scanners)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && barcodeBuffer.current.length > 3) {
        setSearch(barcodeBuffer.current);
        setScanning(false);
        barcodeBuffer.current = "";
        return;
      }
      if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
        setScanning(true);
        if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
        barcodeTimer.current = setTimeout(() => {
          barcodeBuffer.current = "";
          setScanning(false);
        }, 100);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      (i.barcode && i.barcode.includes(search))
  );

  const critical = items.filter((i) => i.status === "Out" || i.status === "Critical").length;
  const low = items.filter((i) => i.status === "Low").length;
  const total = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/warehouse" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Warehouse</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Inventory</h1>
        <p className="text-sm text-on-surface-variant mt-1">Live stock levels across all zones.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <Package className="h-8 w-8 text-tertiary" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{total.toLocaleString()}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Total Units</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <TrendingDown className="h-8 w-8 text-on-tertiary-container" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{low}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Low Stock SKUs</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-error" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{critical}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Critical SKUs</p>
          </div>
        </Card>
      </div>

      <div className="relative">
        {scanning ? (
          <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary animate-pulse" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        )}
        <input
          type="text"
          placeholder="Search by SKU, name, category or scan barcode…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50"
        />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Reorder At</th>
              <th className="px-4 py-3">Barcode</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((item) => (
              <tr key={item.sku} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-tertiary">{item.sku}</td>
                <td className="px-4 py-3 text-on-surface">{item.name}</td>
                <td className="px-4 py-3 text-on-surface-variant">{item.category}</td>
                <td className="px-4 py-3 text-on-surface-variant">Zone {item.zone}</td>
                <td className="px-4 py-3 font-mono text-on-surface">{item.qty}</td>
                <td className="px-4 py-3 font-mono text-on-surface-variant">{item.reorder_at}</td>
                <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{item.barcode ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[item.status]}`}>{item.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-tertiary/10 text-tertiary transition-colors" title="Edit"><Edit className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-on-surface-variant text-sm">
                  No items match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      {/* Edit Inventory Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-container shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="text-base font-bold text-on-surface">Edit Item — <span className="font-mono text-tertiary">{editTarget.sku}</span></h2>
              <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant"><X className="h-4 w-4" /></button>
            </div>
            <form noValidate onSubmit={saveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-xs uppercase tracking-widest text-on-surface-variant">Name</label><input value={editForm.name} onChange={e => { const filtered = e.target.value.replace(/[0-9]/g, ''); setEditForm(p => ({...p, name: filtered})); }} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
                <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Quantity</label><input type="number" value={editForm.qty} onChange={e => setEditForm(p => ({...p, qty: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
                <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Reorder At</label><input type="number" value={editForm.reorder_at} onChange={e => setEditForm(p => ({...p, reorder_at: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
                <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Zone</label><input value={editForm.zone} onChange={e => setEditForm(p => ({...p, zone: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
                <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Category</label><input value={editForm.category} onChange={e => setEditForm(p => ({...p, category: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
              </div>
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
