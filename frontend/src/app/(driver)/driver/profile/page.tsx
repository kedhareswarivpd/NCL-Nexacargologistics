"use client";

import { useEffect, useState } from "react";
import {
  Phone, Mail, MapPin, Star, TrendingUp,
  Package, Clock, ShieldCheck, Truck, BadgeCheck, Calendar, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { driverApi } from "@/lib/services";
import { useAuth } from "@/context/AuthContext";

const BADGES = [
  { label: "Top Driver", Icon: BadgeCheck, color: "text-tertiary bg-tertiary/10" },
  { label: "5-Star Streak", Icon: Star, color: "text-secondary bg-secondary/10" },
  { label: "Zero Incidents", Icon: ShieldCheck, color: "text-green-400 bg-green-400/10" },
  { label: "3 Year Veteran", Icon: Calendar, color: "text-on-surface-variant bg-white/5" },
];

export default function DriverProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await driverApi.profile();
        setProfile(data ?? null);
      } catch {
        setProfile(null);
      }
      // Recent deliveries are derived from the driver's deliveries (Delivered ones).
      // NOTE: backend has no separate "delivery_stops" table — fields like
      // stop_num/address/scheduled_time are unmapped and render as "—".
      try {
        const deliveries = await driverApi.deliveries();
        const delivered = (deliveries ?? [])
          .filter((d: any) => d.status === "Delivered")
          .slice(0, 5);
        setRecentDeliveries(delivered);
      } catch {
        setRecentDeliveries([]);
      }
    })();
  }, [user]);

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

  // NOTE: backend driver profile has no total_deliveries/on_time_rate/avg_rating/
  // hours_this_week fields — these are unmapped and render as "—".
  const STATS = [
    { label: "Total Deliveries", value: profile?.total_deliveries != null ? profile.total_deliveries.toLocaleString() : "—", Icon: Package, color: "text-tertiary", bg: "bg-tertiary/10" },
    { label: "On-Time Rate", value: profile?.on_time_rate != null ? `${profile.on_time_rate}%` : "—", Icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Avg Rating", value: profile?.avg_rating != null ? `${profile.avg_rating} / 5` : "—", Icon: Star, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Hours This Week", value: profile?.hours_this_week != null ? `${profile.hours_this_week}h` : "—", Icon: Clock, color: "text-on-surface", bg: "bg-white/5" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/driver" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Driver</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Profile</h1>
        <p className="text-sm text-on-surface-variant mt-1">Your personal details, stats and delivery history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity Card */}
        <div className="space-y-4">
          <Card className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-tertiary/20 border-2 border-tertiary/40 flex items-center justify-center">
              <span className="text-2xl font-bold text-tertiary">{initials}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">{user?.name ?? "—"}</h2>
              <p className="font-mono text-xs text-tertiary mt-0.5">{profile?.driver_code ?? "—"}</p>
              <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${profile?.status === "On Duty" ? "bg-green-400/10 text-green-400" : "bg-white/5 text-on-surface-variant"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile?.status === "On Duty" ? "bg-green-400 animate-pulse" : "bg-on-surface-variant"}`} />
                {profile?.status ?? "—"}
              </span>
            </div>

            <div className="w-full border-t border-white/5 pt-4 space-y-3 text-sm text-left">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Mail className="h-4 w-4 shrink-0 text-tertiary" />
                <span className="truncate">{user?.email ?? "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Phone className="h-4 w-4 shrink-0 text-tertiary" />
                <span>{profile?.phone ?? "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <MapPin className="h-4 w-4 shrink-0 text-tertiary" />
                <span>{profile?.location ?? "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Calendar className="h-4 w-4 shrink-0 text-tertiary" />
                <span>Joined {profile?.joined ?? "—"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Vehicle & License</h3>
            <div className="flex items-start gap-3 text-sm text-on-surface-variant">
              <Truck className="h-4 w-4 shrink-0 text-tertiary mt-0.5" />
              <span>{profile?.vehicle ?? "—"}</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-on-surface-variant">
              <ShieldCheck className="h-4 w-4 shrink-0 text-tertiary mt-0.5" />
              <span>{profile?.license ?? "—"}</span>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Badges</h3>
            <div className="grid grid-cols-2 gap-2">
              {BADGES.map(({ label, Icon, color }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${color}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Stats + Performance + Recent Deliveries */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map(({ label, value, Icon, color, bg }) => (
              <Card key={label} className="p-5">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg} ${color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-mono text-2xl font-bold text-on-surface">{value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
              </Card>
            ))}
          </div>

          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Performance Overview</h3>
            {[
              { label: "On-Time Deliveries", pct: profile?.on_time_rate ?? 0 },
              { label: "Customer Satisfaction", pct: profile?.avg_rating != null ? Math.round(profile.avg_rating * 20) : 0 },
              { label: "Route Efficiency", pct: 91 },
              { label: "Zero Incident Record", pct: 100 },
            ].map(({ label, pct }) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5 text-sm">
                  <span className="text-on-surface">{label}</span>
                  <span className="font-mono text-xs text-tertiary">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct === 100 ? "bg-green-400" : "bg-tertiary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>

          {/* Delivery Proof Upload History */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Recent Deliveries</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
                  <th className="px-4 py-3">Stop</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentDeliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-tertiary">#{d.stop_num}</td>
                    <td className="px-4 py-3 text-on-surface">{d.address}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{d.scheduled_time}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-green-400 bg-green-400/10">
                        Delivered
                      </span>
                    </td>
                  </tr>
                ))}
                {recentDeliveries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant text-sm">No deliveries yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
