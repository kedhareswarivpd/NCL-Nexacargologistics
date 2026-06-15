"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, Star, Navigation, PlayCircle, MapPin,
  ScanBarcode, UploadCloud, CheckCircle2,
  Fuel, Clock, Package, AlertTriangle, ChevronRight, ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { DriverRoute, DeliveryStop, DriverTask, DriverProfile } from "@/lib/types";
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
  const [profile,      setProfile]      = useState<DriverProfile | null>(null);
  const [activeRoute,  setActiveRoute]  = useState<DriverRoute | null>(null);
  const [stops,        setStops]        = useState<DeliveryStop[]>([]);
  const [tasks,        setTasks]        = useState<DriverTask[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("driver_profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => data && setProfile(data));

    supabase.from("driver_routes").select("*").eq("status", "Active")
      .order("date", { ascending: false }).limit(1).single()
      .then(({ data }) => {
        if (!data) return;
        setActiveRoute(data);
        supabase.from("delivery_stops").select("*").eq("route_id", data.id).order("stop_num")
          .then(({ data: s }) => s && setStops(s));
      });

    supabase.from("driver_tasks").select("*").eq("driver_id", user.id)
      .eq("status", "Pending").order("due").limit(4)
      .then(({ data }) => data && setTasks(data));
  }, [user]);

  const currentStop    = stops.find((s) => s.status === "active");
  const completedCount = stops.filter((s) => s.status === "done").length;

  const STATS = [
    { label: "On-Time %",   value: profile ? `${profile.on_time_rate}` : "—", Icon: TrendingUp, color: "text-tertiary",          bg: "bg-tertiary/10" },
    { label: "Rating",      value: profile ? `${profile.avg_rating}`   : "—", Icon: Star,       color: "text-secondary",         bg: "bg-secondary/10" },
    { label: "Stops Today", value: activeRoute ? `${completedCount} / ${activeRoute.total_stops}` : "—", Icon: Package, color: "text-on-surface", bg: "bg-white/5" },
    { label: "Status",      value: profile?.status ?? "—",                    Icon: Fuel,       color: "text-on-surface",         bg: "bg-white/5" },
  ];

  const ACTIONS = [
    { Icon: PlayCircle,  label: "Start Delivery", color: "text-tertiary",          glow: true },
    { Icon: MapPin,      label: "Mark Arrived",   color: "text-secondary",         glow: false },
    { Icon: ScanBarcode, label: "Scan Package",   color: "text-primary",           glow: false },
    { Icon: UploadCloud, label: "Upload POD",     color: "text-on-surface-variant",glow: false },
  ];

  return (
    <div className="p-6 space-y-6 page-enter">

      {/* Header */}
      <div className="animate-fade-up">
        <Link href="/admin" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Admin</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Driver Dashboard</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">
          Hey, {user?.name.split(" ")[0]} 👋
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
            {ACTIONS.map(({ Icon, label, color, glow }, i) => (
              <button
                key={label}
                style={{ animationDelay: `${0.44 + i * 0.07}s` }}
                className={`animate-fade-up flex flex-col items-center justify-center gap-3 py-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all duration-200 active:scale-95 hover:-translate-y-1 ${glow ? "shadow-[0_0_15px_rgba(66,165,245,0.2)]" : ""}`}
              >
                <Icon className={`${color} w-7 h-7 transition-transform duration-200 group-hover:scale-110`} />
                <span className="text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Deliveries */}
        <div className="animate-slide-right" style={{ animationDelay: "0.2s" }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Today's Deliveries</h2>
            {activeRoute && (
              <span className="text-sm text-tertiary font-medium">
                {completedCount} / {activeRoute.total_stops} Stops
              </span>
            )}
          </div>
          <Card className="divide-y divide-white/5">
            {stops.map((stop, i) => (
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
            ))}
            {stops.length === 0 && (
              <p className="px-4 py-8 text-center text-on-surface-variant text-sm">No stops assigned today.</p>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
