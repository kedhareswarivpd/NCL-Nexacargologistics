"use client";

import {
  Users, GitBranch, ShieldCheck, BarChart2, ChevronRight,
  Activity, Truck, Warehouse,
  Navigation, TrendingUp, Package, Globe, Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { quotesApi, adminApi } from "@/lib/services";

type Quote = {
  id: string;
  origin: string;
  destination: string;
  cargo_type: string;
  weight: number;
  service?: string;
  mode?: string;
  total?: number;
  amount?: number;
  status: string;
  created_at: string;
};

const STATS = [
  { label: "Total Users",     value: "1,284", delta: "+24 this week",     Icon: Users,       color: "text-tertiary bg-tertiary/10", href: "/admin/users" },
  { label: "Active Branches", value: "12",    delta: "3 countries",       Icon: GitBranch,   color: "text-secondary bg-secondary/10", href: "/admin/branches" },
  { label: "Active Shipments",value: "348",   delta: "+12 today",         Icon: Package,     color: "text-green-400 bg-green-400/10", href: "/admin/logistics" },
  { label: "System Health",   value: "99.8%", delta: "Uptime this month", Icon: Activity,    color: "text-on-tertiary-container bg-on-tertiary-container/10", href: "/admin" },
];

type Analytics = {
  users?: number;
  shipments_in_transit?: number;
  branches?: number;
};

const ADMIN_CONTROLS = [
  { icon: Users,       label: "User Management",   desc: "Control user access and roles",       href: "/admin/users",    color: "text-tertiary bg-tertiary/10" },
  { icon: GitBranch,   label: "Branch Management", desc: "Oversee multiple business locations", href: "/admin/branches", color: "text-secondary bg-secondary/10" },
  { icon: ShieldCheck, label: "Access Control",    desc: "Manage role permissions",             href: "/admin/access",   color: "text-green-400 bg-green-400/10" },
  { icon: BarChart2,   label: "Analytics",         desc: "Comprehensive operational reports",   href: "/admin/analytics",color: "text-on-tertiary-container bg-on-tertiary-container/10" },
];

const PORTAL_LINKS = [
  { icon: Truck,      label: "Logistics",  desc: "Shipments, routes & containers", href: "/admin/logistics", color: "text-secondary bg-secondary/10" },
  { icon: Warehouse,  label: "Warehouse",  desc: "Inventory, zones & tasks",       href: "/admin/warehouse", color: "text-on-tertiary-container bg-on-tertiary-container/10" },
  { icon: Navigation, label: "Driver App", desc: "Routes, deliveries & GPS",       href: "/admin/driver",    color: "text-green-400 bg-green-400/10" },
  { icon: TrendingUp, label: "Finance",    desc: "Invoices, payments & reports",   href: "/admin/finance",   color: "text-tertiary bg-tertiary/10" },
];

const PLATFORM_STATUS = [
  { label: "API Gateway",       status: "Operational", icon: Globe },
  { label: "Auth Service",      status: "Operational", icon: ShieldCheck },
  { label: "Shipment Tracking", status: "Operational", icon: Package },
  { label: "Scheduled Jobs",    status: "Degraded",    icon: Clock },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  },
} as const;

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState(STATS);

  useEffect(() => {
    (async () => {
      try {
        const data: Quote[] = await quotesApi.list();
        setQuotes((data ?? []).slice(0, 10));
      } catch {
        setQuotes([]);
      }
      try {
        const a: Analytics = await adminApi.analytics();
        setStats([
          { ...STATS[0], value: String(a.users ?? "—"),                delta: "Registered users" },
          { ...STATS[1], value: String(a.branches ?? "—"),             delta: "Active locations" },
          { ...STATS[2], value: String(a.shipments_in_transit ?? "—"), delta: "In transit" },
          { ...STATS[3] },
        ]);
      } catch {
        /* keep template stats */
      }
    })();
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-tertiary">Admin Portal</p>
          <h1 className="text-3xl font-bold text-on-surface mt-1">
            Welcome back, {user?.name.split(" ")[0]}.
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Full platform overview and administrative controls.
          </p>
        </div>

        {/* Animated Shipping Globe Visual with Count */}
        <div className="hidden lg:flex items-center gap-6 mr-8">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-semibold whitespace-nowrap">Active Shipments</p>
            <div className="flex items-center justify-end gap-2 mt-0.5">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-2xl font-bold text-on-surface">348</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center w-28 h-28">
            <div className="absolute inset-0 bg-tertiary/5 rounded-full blur-2xl animate-pulse" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="relative z-10 text-on-surface/10"
            >
              <Globe className="w-14 h-14" strokeWidth={1} />
            </motion.div>

            {/* Cargo (Package) Orbit */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 z-20"
            >
              <Package className="w-3.5 h-3.5 text-green-400 absolute -bottom-1 left-1/2 -translate-x-1/2" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, delta, Icon, color, href }: any, i) => (
          <motion.div
            key={label}
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, delay: i * 0.03 } }
            }}
            whileHover={{ y: -5, scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Link href={href ?? "#"} className="block h-full">
              <Card className="p-5 h-full cursor-pointer border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-tertiary/20 transition-colors">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-mono text-2xl font-bold text-on-surface">{value}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
                <p className="mt-1 text-xs text-on-surface-variant/60">{delta}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Admin Controls + Platform Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Controls */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 space-y-3"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Admin Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ADMIN_CONTROLS.map(({ icon: Icon, label, desc, href, color }) => (
              <motion.div key={label} whileHover={{ y: -3, scale: 1.01 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
                <Link
                  href={href}
                  className="flex items-center justify-between gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{label}</p>
                      <p className="text-xs text-on-surface-variant">{desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Platform Status */}
        <motion.div
          variants={itemVariants}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Platform Status</h2>
          <Card className="divide-y divide-white/5 bg-white/[0.01]">
            {PLATFORM_STATUS.map(({ label, status, icon: Icon }, index) => (
              <motion.div
                key={label}
                variants={{
                  hidden: { opacity: 0, x: 10 },
                  show: { opacity: 1, x: 0, transition: { delay: index * 0.05 } }
                }}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-on-surface-variant" />
                  <p className="text-sm text-on-surface">{label}</p>
                </div>
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${
                  status === "Operational"
                    ? "text-green-400 bg-green-400/10"
                    : "text-on-tertiary-container bg-on-tertiary-container/10"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status === "Operational" ? "bg-green-400" : "bg-on-tertiary-container"} ${status === "Operational" ? "animate-pulse" : ""}`} />
                  {status}
                </span>
              </motion.div>
            ))}
          </Card>
        </motion.div>
      </div>

      {/* Quote Requests */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Recent Quote Requests</h2>
        <Card className="bg-white/[0.01] overflow-hidden">
          {quotes.length === 0 ? (
            <p className="text-sm text-on-surface-variant p-6">No quote requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[11px] uppercase tracking-widest text-on-surface-variant border-b border-white/10">
                  <tr>
                    <th className="px-5 py-3">Origin</th>
                    <th className="px-5 py-3">Destination</th>
                    <th className="px-5 py-3">Cargo</th>
                    <th className="px-5 py-3">Weight</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-on-surface">{q.origin}</td>
                      <td className="px-5 py-3 text-on-surface">{q.destination}</td>
                      <td className="px-5 py-3 text-on-surface-variant">{q.cargo_type}</td>
                      <td className="px-5 py-3 text-on-surface-variant">{q.weight} kg</td>
                      <td className="px-5 py-3 text-on-surface-variant">{q.service ?? q.mode ?? "—"}</td>
                      <td className="px-5 py-3 font-mono font-bold text-on-surface">${Number(q.total ?? q.amount ?? 0).toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-400/10 text-yellow-400 capitalize">{q.status}</span>
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">{new Date(q.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Portal Dashboards */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Portal Dashboards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PORTAL_LINKS.map(({ icon: Icon, label, desc, href, color }, i) => (
            <motion.div
              key={label}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: i * 0.04 } }
              }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Link
                href={href}
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{label}</p>
                    <p className="text-xs text-on-surface-variant">{desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
