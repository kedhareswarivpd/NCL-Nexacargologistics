"use client";

import { useEffect, useState } from "react";
import { Search, PackageOpen, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { warehouseApi } from "@/lib/services";
import type { InboundShipment } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  // Backend warehouse-task statuses.
  Pending: "text-tertiary bg-tertiary/10",
  "In Progress": "text-on-tertiary-container bg-on-tertiary-container/10",
  Done: "text-green-400 bg-green-400/10",
  // Legacy Supabase inbound statuses.
  Arriving: "text-tertiary bg-tertiary/10",
  Unloading: "text-on-tertiary-container bg-on-tertiary-container/10",
  Inspecting: "text-secondary bg-secondary/10",
  Putaway: "text-yellow-400 bg-yellow-400/10",
  Completed: "text-green-400 bg-green-400/10",
};

export default function InboundPage() {
  const [shipments, setShipments] = useState<InboundShipment[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await warehouseApi.tasks("inbound");
        setShipments(data ?? []);
      } catch {
        setShipments([]);
      }
    })();
  }, []);

  const filtered = shipments.filter(
    (i) =>
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.supplier.toLowerCase().includes(search.toLowerCase()) ||
      i.status.toLowerCase().includes(search.toLowerCase())
  );

  const arriving = shipments.filter((i) => i.status === "Arriving" || i.status === "Pending").length;
  const inProgress = shipments.filter((i) => ["Unloading", "Inspecting", "Putaway", "In Progress"].includes(i.status)).length;
  const completed = shipments.filter((i) => i.status === "Completed" || i.status === "Done").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/warehouse" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Warehouse</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Inbound Shipments</h1>
        <p className="text-sm text-on-surface-variant mt-1">Track all incoming supplier deliveries.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <Clock className="h-8 w-8 text-tertiary" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{arriving}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Arriving Today</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <PackageOpen className="h-8 w-8 text-on-tertiary-container" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{inProgress}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">In Progress</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{completed}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Completed</p>
          </div>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search by ID, supplier or status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50"
        />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">ETA</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-tertiary">{s.id}</td>
                <td className="px-4 py-3 text-on-surface">{s.supplier}</td>
                <td className="px-4 py-3 font-mono text-on-surface">{s.items}</td>
                <td className="px-4 py-3 text-on-surface-variant">Zone {s.zone}</td>
                <td className="px-4 py-3 text-on-surface-variant">{s.date}</td>
                <td className="px-4 py-3 text-on-surface-variant">{s.eta}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[s.status] ?? ""}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant text-sm">
                  No shipments match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
