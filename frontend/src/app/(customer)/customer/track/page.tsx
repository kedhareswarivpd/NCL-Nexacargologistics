"use client";

import { useState, useEffect, Suspense } from "react";
import { Search, Package, Ship, Truck, CheckCircle2, MapPin, Clock, RefreshCw, Bell, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { trackingApi, shipmentsApi } from "@/lib/services";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const LiveMap = dynamic(() => import("@/components/ui/LiveMap"), { ssr: false });

const STATUS_STYLES: Record<string, string> = {
  "In Transit":        "text-tertiary bg-tertiary/10",
  "Delayed":           "text-error bg-error/10",
  "Awaiting Dispatch": "text-on-surface-variant bg-white/5",
  "Delivered":         "text-green-400 bg-green-400/10",
};

const TIMELINE_STEPS = [
  { key: "Awaiting Dispatch", label: "Order Received",       Icon: Package },
  { key: "In Transit",        label: "Departed Origin Port", Icon: Ship },
  { key: "In Transit",        label: "In Transit",           Icon: Ship },
  { key: "Delayed",           label: "Customs Clearance",    Icon: MapPin },
  { key: "Delivered",         label: "Delivered",            Icon: Truck },
];

function TrackShipmentsContent() {
  const searchParams = useSearchParams();
  const [query, setQuery]       = useState("");
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [notified, setNotified] = useState(false);
  const [all, setAll]           = useState<any[]>([]);
  const [validationError, setValidationError] = useState("");

  // Load all shipments on mount for the list
  useEffect(() => {
    (async () => {
      try {
        const data = await shipmentsApi.list();
        setAll(data ?? []);
      } catch {
        setAll([]);
      }
    })();
  }, []);

  // Load tracking_id query param if present
  useEffect(() => {
    const trackingIdParam = searchParams.get("tracking_id");
    if (trackingIdParam) {
      const trimmed = trackingIdParam.trim();
      setQuery(trimmed);
      
      // Validate tracking ID
      if (trimmed.length > 14) {
        setValidationError("Shipment ID must not exceed 14 characters.");
        return;
      }
      const regex = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
      if (!regex.test(trimmed) || !trimmed.includes('-')) {
        setValidationError("Shipment ID must only contain numbers, letters, and hyphens (-) in between.");
        return;
      }

      setValidationError("");
      (async () => {
        setLoading(true);
        setShipment(null);
        try {
          const result = await trackingApi.track(trimmed);
          setShipment(result?.shipment ?? null);
        } catch {
          setShipment(null);
        }
        setLoading(false);
      })();
    }
  }, [searchParams]);

  // NOTE: real-time Supabase subscription removed — the FastAPI tracking endpoint
  // is request/response only; status refreshes on each search.

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setValidationError("Please enter a tracking number.");
      return;
    }

    if (trimmed.length > 14) {
      setValidationError("Shipment ID must not exceed 14 characters.");
      return;
    }

    const regex = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
    if (!regex.test(trimmed) || !trimmed.includes('-')) {
      setValidationError("Shipment ID must only contain numbers, letters, and hyphens (-) in between.");
      return;
    }

    setValidationError("");
    setLoading(true);
    setShipment(null);
    try {
      const result = await trackingApi.track(trimmed);
      // trackingApi.track returns { shipment, events }; the JSX renders the
      // shipment fields directly.
      setShipment(result?.shipment ?? null);
    } catch {
      setShipment(null);
    }
    setLoading(false);
  }

  const currentStep = shipment
    ? TIMELINE_STEPS.findLastIndex((s) => s.key === shipment.status || s.label === "Order Received")
    : -1;

  return (
    <div className="space-y-6">
      <Link href="/customer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
        <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
        <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
      </Link>
      <div>
        <p className="text-xs uppercase tracking-widest text-tertiary">Customer Portal</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Track Shipments</h1>
        <p className="text-sm text-on-surface-variant mt-1">Live GPS tracking and real-time status updates for your cargo.</p>
      </div>

      {/* Search */}
      <form noValidate onSubmit={handleSearch} className="flex flex-col gap-2">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setValidationError("");
              }}
              placeholder="Enter tracking number (e.g. SHP-90421)"
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50"
            />
          </div>
          <button type="submit" disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#1E88E5] text-white text-sm font-bold hover:bg-[#1565C0] transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
            {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Searching…</> : <><Search className="h-4 w-4" /> Track Shipment</>}
          </button>
        </div>
        {validationError && (
          <p className="text-red-400 text-xs font-semibold mt-1">{validationError}</p>
        )}
      </form>

      {/* Tracked Shipment Result */}
      {shipment && (
        <div className="space-y-4 animate-fade-up">
          {/* Status Header */}
          <Card className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">Tracking #</p>
              <p className="font-mono text-xl font-bold text-tertiary mt-0.5">{shipment.tracking_id}</p>
              <p className="text-xs text-on-surface-variant mt-1">{shipment.origin} → {shipment.destination}</p>
            </div>
            <div className="flex items-center gap-3">
              {shipment.eta && (
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest">ETA</p>
                  <p className="text-sm font-semibold text-on-surface flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{shipment.eta}</p>
                </div>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[shipment.status] ?? ""}`}>
                {shipment.status}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </div>
            </div>
          </Card>

          {/* Live GPS Map */}
          <LiveMap
            lat={shipment.lat ?? 1.3521}
            lng={shipment.lng ?? 103.8198}
            label={`${shipment.tracking_id} — ${shipment.origin} → ${shipment.destination}`}
            height={300}
          />

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-6">Shipment Timeline</h2>
            <ol className="relative border-l border-white/10 space-y-6 pl-8">
              {TIMELINE_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full transition-all
                      ${done ? "bg-tertiary text-white" : "border border-white/20 bg-surface-container text-on-surface-variant"}`}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <step.Icon className="h-3.5 w-3.5" />}
                    </span>
                    <p className={`text-sm font-semibold ${active ? "text-tertiary" : done ? "text-on-surface" : "text-on-surface-variant"}`}>
                      {step.label}
                    </p>
                    {active && <p className="text-xs text-on-surface-variant mt-0.5">{shipment.origin} · Now</p>}
                  </li>
                );
              })}
            </ol>
          </Card>

          {/* Notification opt-in */}
          {!notified && (
            <Card className="p-4 flex items-center justify-between gap-4 border border-tertiary/20">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-tertiary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-on-surface">Get notified on status changes</p>
                  <p className="text-xs text-on-surface-variant">Receive SMS & email alerts automatically.</p>
                </div>
              </div>
              <button onClick={() => setNotified(true)}
                className="px-5 py-2.5 rounded-lg bg-[#1E88E5] text-white text-sm font-bold hover:bg-[#1565C0] transition-colors shrink-0 flex items-center gap-2">
                <Bell className="h-4 w-4" /> Enable SMS & Email Alerts
              </button>
            </Card>
          )}
          {notified && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4" /> Notifications enabled for {shipment.tracking_id}
            </div>
          )}
        </div>
      )}

      {!shipment && !loading && query && (
        <Card className="p-8 text-center text-on-surface-variant text-sm">No shipment found for "{query}".</Card>
      )}

      {/* All Shipments List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Your Shipments</h2>
        {all.length === 0 ? (
          <Card className="p-12 flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Package className="h-8 w-8 text-on-surface-variant/40" />
            </div>
            <p className="text-sm font-semibold text-on-surface">No shipments yet</p>
            <Link href="/customer/quotes"
              className="px-5 py-2 rounded-lg bg-tertiary/20 text-tertiary text-sm font-semibold hover:bg-tertiary/30 transition-colors">
              Request a Quote
            </Link>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
                  <th className="px-4 py-3">Tracking ID</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">ETA</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {all.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-tertiary">{s.tracking_id}</td>
                    <td className="px-4 py-3 text-on-surface">{s.origin} → {s.destination}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[s.status] ?? ""}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{s.eta ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setQuery(s.tracking_id); setShipment(s); }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 text-sm font-semibold text-white hover:bg-[#1E88E5] hover:text-white transition-colors whitespace-nowrap">
                        Track This
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function TrackShipmentsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-tertiary" /></div>}>
      <TrackShipmentsContent />
    </Suspense>
  );
}
