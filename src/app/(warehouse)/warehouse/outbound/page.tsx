"use client";

import { useState } from "react";
import { Search, Truck, PackageCheck, Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

const OUTBOUND = [
  { id: "OUT-7701", customer: "Amazon EU", items: 320, carrier: "DHL Express", status: "Dispatched", date: "2025-07-14", tracking: "DHL-928341" },
  { id: "OUT-7698", customer: "Walmart MENA", items: 145, carrier: "FedEx", status: "Loading", date: "2025-07-14", tracking: "—" },
  { id: "OUT-7695", customer: "Carrefour KSA", items: 90, carrier: "Aramex", status: "Picking", date: "2025-07-14", tracking: "—" },
  { id: "OUT-7690", customer: "Jumia Nigeria", items: 410, carrier: "DHL Freight", status: "Dispatched", date: "2025-07-13", tracking: "DHL-928100" },
  { id: "OUT-7685", customer: "Noon UAE", items: 55, carrier: "UPS", status: "Delivered", date: "2025-07-12", tracking: "UPS-441892" },
  { id: "OUT-7680", customer: "Otto Germany", items: 230, carrier: "DB Schenker", status: "Delivered", date: "2025-07-11", tracking: "SCH-773012" },
  { id: "OUT-7675", customer: "Lazada SEA", items: 180, carrier: "Kerry Logistics", status: "Picking", date: "2025-07-14", tracking: "—" },
  { id: "OUT-7670", customer: "Flipkart India", items: 500, carrier: "Blue Dart", status: "Delayed", date: "2025-07-13", tracking: "BD-550234" },
];

const STATUS_STYLES: Record<string, string> = {
  Picking: "text-secondary bg-secondary/10",
  Loading: "text-on-tertiary-container bg-on-tertiary-container/10",
  Dispatched: "text-tertiary bg-tertiary/10",
  Delivered: "text-green-400 bg-green-400/10",
  Delayed: "text-error bg-error/10",
};

export default function OutboundPage() {
  const [search, setSearch] = useState("");

  const filtered = OUTBOUND.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.status.toLowerCase().includes(search.toLowerCase()) ||
      o.carrier.toLowerCase().includes(search.toLowerCase())
  );

  const dispatched = OUTBOUND.filter((o) => o.status === "Dispatched").length;
  const inProgress = OUTBOUND.filter((o) => ["Picking", "Loading"].includes(o.status)).length;
  const delayed = OUTBOUND.filter((o) => o.status === "Delayed").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-tertiary">Warehouse</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Outbound Shipments</h1>
        <p className="text-sm text-on-surface-variant mt-1">Track all outgoing customer orders.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <Truck className="h-8 w-8 text-tertiary" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{dispatched}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Dispatched Today</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <PackageCheck className="h-8 w-8 text-on-tertiary-container" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{inProgress}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">In Progress</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-error" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{delayed}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Delayed</p>
          </div>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search by ID, customer, carrier or status…"
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
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Carrier</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Tracking</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-tertiary">{o.id}</td>
                <td className="px-4 py-3 text-on-surface">{o.customer}</td>
                <td className="px-4 py-3 font-mono text-on-surface">{o.items}</td>
                <td className="px-4 py-3 text-on-surface-variant">{o.carrier}</td>
                <td className="px-4 py-3 text-on-surface-variant">{o.date}</td>
                <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{o.tracking}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[o.status] ?? ""}`}>
                    {o.status}
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
