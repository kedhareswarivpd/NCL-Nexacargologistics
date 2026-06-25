"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, Star, Navigation, PlayCircle, MapPin,
  ScanBarcode, UploadCloud, CheckCircle2,
  Fuel, Clock, Package, AlertTriangle, ChevronRight, ArrowLeft, Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { driverApi } from "@/lib/services";
import type { DriverRoute, DeliveryStop, DriverTask } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import Link from "next/link";

const LiveMap = dynamic(() => import("@/components/ui/LiveMap"), { ssr: false });

const STOP_STYLES: Record<string, string> = {
  active:  "border-l-4 border-l-tertiary",
  done:    "border-l-4 border-l-secondary/40 opacity-60",
  pending: "border-l-4 border-l-transparent opacity-80",
};

export default function DriverDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [profile,      setProfile]      = useState<any | null>(null);
  const [activeRoute] = useState<DriverRoute | null>(null);
  const [stops,        setStops]        = useState<DeliveryStop[]>([]);
  const [tasks,        setTasks]        = useState<DriverTask[]>([]);
  
  // Unassigned shipments for self-assignment
  const [unassignedShipments, setUnassignedShipments] = useState<any[]>([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [loadingStops, setLoadingStops] = useState(true);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoadingStops(true);
    try {
      const p = await driverApi.profile();
      setProfile(p ?? null);
    } catch {
      setProfile(null);
    }

    try {
      const deliveries = await driverApi.deliveries();
      
      const STOP_STATUS: Record<string, "pending" | "active" | "done"> = {
        Pending: "pending",
        "Picked Up": "active",
        "In Transit": "active",
        "Out for Delivery": "active",
        Delivered: "done",
        Failed: "pending",
      };

      const mappedStops: DeliveryStop[] = (deliveries ?? []).map((d: any, i: number) => ({
        id: d.id,
        route_id: d.route_id || "",
        stop_num: i + 1,
        label: d.delivery_code ?? `Delivery ${i + 1}`,
        address: d.location ?? "—",
        scheduled_time: d.eta ?? "—",
        status: STOP_STATUS[d.status] ?? "pending",
        lat: d.lat ?? undefined,
        lng: d.lng ?? undefined,
      }));
      setStops(mappedStops);

      const pending: DriverTask[] = (deliveries ?? [])
        .filter((d: any) => d.status !== "Delivered")
        .slice(0, 4)
        .map((d: any) => ({
          id: d.delivery_code ?? d.id,
          driver_id: d.driver_id ?? user.id,
          description: d.location ? `Deliver to ${d.location}` : "Delivery",
          due: d.eta ?? "—",
          status: "Pending",
          priority: "Medium",
        }));
      setTasks(pending);
    } catch {
      setStops([]);
      setTasks([]);
    } finally {
      setLoadingStops(false);
    }

    // Load available unassigned shipments
    try {
      const { data } = await supabase
        .from("shipments")
        .select("*")
        .eq("status", "Awaiting Dispatch");
      if (data) setUnassignedShipments(data);
    } catch {
      setUnassignedShipments([]);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const handleSelfAssign = async () => {
    if (!selectedShipmentId || !user) return;
    const targetShipment = unassignedShipments.find(s => s.id === selectedShipmentId);
    if (!targetShipment) return;

    const formattedDriverName = user.name && user.name.includes("@")
      ? (user.name.startsWith("driver") ? "Marcus Johnson" : user.name.split("@")[0].charAt(0).toUpperCase() + user.name.split("@")[0].slice(1))
      : user.name;

    setAssigning(true);
    try {
      // 1. Insert into deliveries table
      const { error: delError } = await supabase.from("deliveries").insert({
        delivery_code: `DEL-${Math.floor(1000 + Math.random() * 9000)}`,
        shipment_id: targetShipment.id,
        driver_id: user.id,
        status: "Pending",
        location: targetShipment.origin,
        progress: 0,
        eta: targetShipment.eta || "3 days",
      });
      if (delError) throw delError;

      // 2. Update shipments table status
      const { error: shpError } = await supabase
        .from("shipments")
        .update({ status: "In Transit" })
        .eq("id", targetShipment.id);
      if (shpError) throw shpError;

      // 3. Update profiles table driver status
      await supabase
        .from("profiles")
        .update({ status: "on_trip" })
        .eq("id", user.id);

      // 4. Add to status history
      await supabase.from("shipment_status_history").insert({
        shipment_id: targetShipment.id,
        status: "In Transit",
        note: `Self-assigned by driver ${formattedDriverName} for transporting`,
        changed_by: user.id,
      });

      toast.success("Shipment successfully assigned to you! Transit started.");
      setSelectedShipmentId("");
      await loadDashboardData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to self-assign shipment.");
    } finally {
      setAssigning(false);
    }
  };

  const currentStop    = stops.find((s) => s.status === "active");
  const completedCount = stops.filter((s) => s.status === "done").length;

  const STATS = [
    { label: "On-Time %",   value: profile?.on_time_rate != null ? `${profile.on_time_rate}` : "—", Icon: TrendingUp, color: "text-tertiary",          bg: "bg-tertiary/10" },
    { label: "Rating",      value: profile?.avg_rating != null ? `${profile.avg_rating}`   : "—", Icon: Star,       color: "text-secondary",         bg: "bg-secondary/10" },
    { label: "Stops Today", value: activeRoute ? `${completedCount} / ${activeRoute.total_stops}` : "—", Icon: Package, color: "text-on-surface", bg: "bg-white/5" },
    { label: "Status",      value: profile?.status ?? "—",                    Icon: Fuel,       color: "text-on-surface",         bg: "bg-white/5" },
  ];

  const ACTIONS = [
    { Icon: PlayCircle,  label: "Start Delivery", color: "text-tertiary",          glow: true,  href: "/driver/routes" },
    { Icon: MapPin,      label: "Mark Arrived",   color: "text-secondary",         glow: false, href: "/driver/routes" },
    { Icon: ScanBarcode, label: "Scan Package",   color: "text-primary",           glow: false, href: "/driver/tasks"  },
    { Icon: UploadCloud, label: "Upload POD",     color: "text-on-surface-variant",glow: false, href: "/driver/tasks"  },
  ];

  return (
    <div className="p-6 space-y-6 page-enter">

      {/* Header */}
      <div className="animate-fade-up">
        <Link href={user?.role === "admin" ? "/admin" : "/"} className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">
            {user?.role === "admin" ? "Back to Admin" : "Back to Home"}
          </span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Driver Dashboard</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">
          Hey, {user?.name && user.name.includes("@") ? (user.name.startsWith("driver") ? "Marcus" : user.name.split("@")[0].charAt(0).toUpperCase() + user.name.split("@")[0].slice(1)) : user?.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">Here's your route and delivery status for today.</p>
      </div>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, Icon, color, bg }, i) => (
          <Card key={label} className="p-5 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg} ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-mono text-2xl font-bold text-on-surface">{value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
          </Card>
        ))}
      </section>

      {/* Traffic Alert */}
      <div className="animate-fade-up flex items-start gap-3 rounded-xl border border-error/20 bg-error/5 p-4" style={{ animationDelay: "0.32s" }}>
        <AlertTriangle className="h-4 w-4 shrink-0 text-error mt-0.5 animate-pulse" />
        <p className="text-sm text-on-surface">Traffic incident on I-280 S — consider alternate via US-101. +8 min delay.</p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* GPS Map + Action Center */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant animate-fade-up" style={{ animationDelay: "0.36s" }}>
            Live Route Map
          </h2>
          <div className="animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <LiveMap
              lat={currentStop?.lat ?? 1.3521}
              lng={currentStop?.lng ?? 103.8198}
              label={currentStop ? `Stop ${currentStop.stop_num} — ${currentStop.address}` : "GPS Active"}
              height={320}
            />
          </div>

          {/* Action Center */}
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Action Center</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ACTIONS.map(({ Icon, label, color, glow, href }, i) => (
              <Link href={href} key={label} className="block w-full">
                <button
                  style={{ animationDelay: `${0.44 + i * 0.07}s` }}
                  className={`w-full animate-fade-up flex flex-col items-center justify-center gap-3 py-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all duration-200 active:scale-95 hover:-translate-y-1 ${glow ? "shadow-[0_0_15px_rgba(66,165,245,0.2)]" : ""}`}
                >
                  <Icon className={`${color} w-7 h-7 transition-transform duration-200 group-hover:scale-110`} />
                  <span className="text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Deliveries and Self-Assign Console */}
        <div className="animate-slide-right space-y-6" style={{ animationDelay: "0.2s" }}>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Today's Deliveries</h2>
              {activeRoute && (
                <span className="text-sm text-tertiary font-medium">
                  {completedCount} / {activeRoute.total_stops} Stops
                </span>
              )}
            </div>
            <Card className="divide-y divide-white/5 overflow-hidden">
              {loadingStops ? (
                <p className="px-4 py-8 text-center text-on-surface-variant text-sm flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-tertiary" /> Loading stops…
                </p>
              ) : stops.length === 0 ? (
                <div className="p-5">
                  <p className="text-center text-on-surface-variant text-sm">No stops assigned today.</p>
                </div>
              ) : (
                stops.map((stop, i) => (
                  <div
                    key={stop.id}
                    style={{ animationDelay: `${i * 0.06}s` }}
                    className={`animate-fade-up flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-all duration-200 cursor-pointer hover:translate-x-1 ${STOP_STYLES[stop.status]}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200
                        ${stop.status === "active" ? "bg-tertiary/10 scale-110" : stop.status === "done" ? "bg-secondary/10" : "bg-white/5"}`}
                      >
                        {stop.status === "done"
                          ? <CheckCircle2 className="text-secondary w-5 h-5" />
                          : <span className={`font-semibold text-sm ${stop.status === "active" ? "text-tertiary" : "text-on-surface-variant"}`}>{stop.stop_num}</span>
                        }
                      </div>
                      <div>
                        <p className={`text-sm font-semibold text-on-surface ${stop.status === "done" ? "line-through" : ""}`}>{stop.label}</p>
                        <p className="text-xs text-on-surface-variant">{stop.address}{stop.scheduled_time ? ` · ${stop.scheduled_time}` : ""}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${stop.status === "active" ? "text-tertiary" : "text-on-surface-variant"}`} />
                  </div>
                ))
              )}
            </Card>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Self-Assign Shipment</h2>
            <Card className="p-5 space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Need to pick up a new delivery job? Select an unassigned shipment below to self-assign and start the transit.
              </p>
              {unassignedShipments.length === 0 ? (
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center">
                  <p className="text-xs text-on-surface-variant italic">No shipments currently awaiting dispatch.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <select
                    onChange={(e) => setSelectedShipmentId(e.target.value)}
                    value={selectedShipmentId}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-white/10 text-xs text-on-surface focus:outline-none focus:border-tertiary/50"
                  >
                    <option value="">-- Choose a Shipment to Transport --</option>
                    {unassignedShipments.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.tracking_id} ({s.origin} → {s.destination})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSelfAssign}
                    disabled={!selectedShipmentId || assigning}
                    className="w-full py-2.5 rounded-lg bg-[#00C2FF] hover:bg-[#00a8e0] text-[#0B1F3A] text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(0,194,255,0.2)] active:scale-[0.98]"
                  >
                    {assigning ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>Assign Myself for Transporting</>
                    )}
                  </button>
                </div>
              )}
            </Card>
          </div>

        </div>
      </section>
    </div>
  );
}
