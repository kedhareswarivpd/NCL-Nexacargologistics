"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, Package, Navigation, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { driverApi } from "@/lib/services";

// Map a delivery status onto the stop visual states.
const STOP_STATUS: Record<string, "pending" | "active" | "done"> = {
  Pending: "pending",
  "Picked Up": "active",
  "In Transit": "active",
  "Out for Delivery": "active",
  Delivered: "done",
  Failed: "pending",
};

export default function RoutesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driverApi.deliveries()
      .then((d) => setDeliveries(d ?? []))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);

  const stops = deliveries.map((d, i) => ({
    id: d.id,
    stop_num: i + 1,
    label: d.delivery_code ?? `Delivery ${i + 1}`,
    address: d.location ?? "—",
    scheduled_time: d.eta ?? "—",
    status: STOP_STATUS[d.status] ?? "pending",
  }));

  const total = deliveries.length;
  const completed = deliveries.filter((d) => d.status === "Delivered").length;
  const nextEta = deliveries.find((d) => d.status !== "Delivered")?.eta ?? "—";
  const completedList = deliveries.filter((d) => d.status === "Delivered");

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/driver" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Driver</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Routes</h1>
        <p className="text-sm text-on-surface-variant mt-1">Your assigned deliveries and stop navigation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <Navigation className="h-8 w-8 text-tertiary" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{total}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Assigned Stops</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <Package className="h-8 w-8 text-secondary" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{completed} / {total}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Stops Completed</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <Clock className="h-8 w-8 text-on-surface-variant" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{nextEta}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Next ETA</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stop list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Today's Stops</h2>
          <Card className="divide-y divide-white/5">
            {loading ? (
              <p className="px-4 py-8 text-center text-on-surface-variant text-sm">Loading your deliveries…</p>
            ) : stops.length === 0 ? (
              <p className="px-4 py-8 text-center text-on-surface-variant text-sm">No deliveries assigned to you yet.</p>
            ) : (
              stops.map((stop) => (
                <div
                  key={stop.id}
                  className={`flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors
                    ${stop.status === "active" ? "border-l-4 border-l-tertiary" : ""}
                    ${stop.status === "done" ? "border-l-4 border-l-secondary/40 opacity-60" : ""}
                    ${stop.status === "pending" ? "border-l-4 border-l-transparent opacity-80" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                      ${stop.status === "active" ? "bg-tertiary/10" : stop.status === "done" ? "bg-secondary/10" : "bg-white/5"}`}
                    >
                      {stop.status === "done"
                        ? <CheckCircle2 className="text-secondary w-5 h-5" />
                        : <span className={`font-semibold text-sm ${stop.status === "active" ? "text-tertiary" : "text-on-surface-variant"}`}>{stop.stop_num}</span>
                      }
                    </div>
                    <div>
                      <p className={`text-sm font-semibold text-on-surface ${stop.status === "done" ? "line-through" : ""}`}>{stop.label}</p>
                      <p className="text-xs text-on-surface-variant">{stop.address} · {stop.scheduled_time}</p>
                    </div>
                  </div>
                  <MapPin className={`w-4 h-4 shrink-0 ${stop.status === "active" ? "text-tertiary" : "text-on-surface-variant"}`} />
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Completed history */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Completed</h2>
          <Card className="divide-y divide-white/5">
            {completedList.map((r) => (
              <div key={r.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-tertiary">{r.delivery_code}</span>
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-green-400 bg-green-400/10">Delivered</span>
                </div>
                <p className="text-xs text-on-surface-variant">{r.location ?? "—"}</p>
              </div>
            ))}
            {completedList.length === 0 && (
              <p className="px-4 py-8 text-center text-on-surface-variant text-sm">No completed deliveries yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
