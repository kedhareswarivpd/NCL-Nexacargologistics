"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, GitBranch, Package, DollarSign, Download, FileText, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { adminApi } from "@/lib/services";

const MONTHLY = [
  { month: "Jan", users: 980, shipments: 210, revenue: 98000 },
  { month: "Feb", users: 1020, shipments: 240, revenue: 112000 },
  { month: "Mar", users: 1080, shipments: 225, revenue: 105000 },
  { month: "Apr", users: 1140, shipments: 280, revenue: 130000 },
  { month: "May", users: 1200, shipments: 260, revenue: 124000 },
  { month: "Jun", users: 1250, shipments: 310, revenue: 148000 },
  { month: "Jul", users: 1284, shipments: 290, revenue: 139000 },
];

const BRANCH_PERF = [
  { name: "Dubai HQ", shipments: 480, revenue: "$210k", growth: "+12%", positive: true },
  { name: "Shanghai Hub", shipments: 420, revenue: "$185k", growth: "+8%", positive: true },
  { name: "Rotterdam Port", shipments: 310, revenue: "$140k", growth: "-3%", positive: false },
  { name: "Singapore Depot", shipments: 280, revenue: "$125k", growth: "+15%", positive: true },
  { name: "Los Angeles Gateway", shipments: 240, revenue: "$108k", growth: "+5%", positive: true },
];

const REPORTS = [
  { name: "Q2 2025 Operations Summary", type: "Quarterly", date: "2025-07-01" },
  { name: "User Growth Report — July 2025", type: "Monthly", date: "2025-07-05" },
  { name: "Branch Performance H1 2025", type: "Semi-Annual", date: "2025-07-03" },
  { name: "Access Control Audit Log", type: "Security", date: "2025-07-10" },
  { name: "Revenue vs Expenses — Q2", type: "Financial", date: "2025-07-02" },
];

const TYPE_STYLES: Record<string, string> = {
  Quarterly: "text-tertiary bg-tertiary/10",
  Monthly: "text-secondary bg-secondary/10",
  "Semi-Annual": "text-green-400 bg-green-400/10",
  Security: "text-error bg-error/10",
  Financial: "text-on-tertiary-container bg-on-tertiary-container/10",
};

const maxRevenue = Math.max(...MONTHLY.map((m) => m.revenue));
const maxShipments = Math.max(...MONTHLY.map((m) => m.shipments));

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } }
} as const;

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    adminApi.dashboard().then(setStats).catch(() => setStats(null));
  }, []);

  const totalUsers = stats?.users ?? MONTHLY[MONTHLY.length - 1].users;
  const totalShipments = stats?.shipments ?? MONTHLY.reduce((s, m) => s + m.shipments, 0);
  const totalRevenue = stats?.revenue ?? MONTHLY.reduce((s, m) => s + m.revenue, 0);
  const totalBranches = stats?.branches ?? 6;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Link href="/admin" className="inline-flex items-center gap-2 mb-5 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Admin Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Admin Portal</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Analytics</h1>
        <p className="text-sm text-on-surface-variant mt-1">Comprehensive reports on platform operations, users and revenue.</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Users", value: totalUsers.toLocaleString(), change: "+4.2% this month", Icon: Users, color: "text-tertiary bg-tertiary/10", detailColor: "text-green-400" },
          { title: "Total Shipments", value: totalShipments.toLocaleString(), change: "+11% this quarter", Icon: Package, color: "text-secondary bg-secondary/10", detailColor: "text-green-400" },
          { title: "Total Revenue", value: `$${(totalRevenue / 1000).toFixed(0)}k`, change: "+12.5% vs last month", Icon: DollarSign, color: "text-green-400 bg-green-400/10", detailColor: "text-green-400" },
          { title: "Active Branches", value: totalBranches.toString(), change: "Across 5 regions", Icon: GitBranch, color: "text-on-tertiary-container bg-on-tertiary-container/10", detailColor: "text-on-surface-variant/60" }
        ].map(({ title, value, change, Icon, color, detailColor }) => (
          <motion.div
            key={title}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="p-5 h-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 transition-colors">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}><Icon className="h-5 w-5" /></span>
              <p className="mt-4 font-mono text-2xl font-bold text-on-surface">{value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-on-surface-variant">{title}</p>
              <p className={`mt-1 text-xs ${detailColor} flex items-center gap-1`}>
                {Icon !== GitBranch && <TrendingUp className="h-3 w-3" />} {change}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-white/[0.01] border border-white/5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-6">Monthly Revenue</h2>
            <div className="flex items-end justify-between gap-2 h-48 px-2">
              {MONTHLY.map((m, idx) => (
                <div key={m.month} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="relative w-full flex items-end justify-center h-40">
                    <motion.div 
                      className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-tertiary/40 to-tertiary/10 border-t border-tertiary/50 shadow-lg shadow-tertiary/10"
                      initial={{ height: "0%" }}
                      animate={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                      whileHover={{
                        scaleY: 1.05,
                        backgroundColor: "rgba(255, 215, 0, 0.3)"
                      }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                    />
                    <motion.span 
                      className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container/95 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-md text-[10px] font-mono text-tertiary shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 0 }}
                      whileHover={{ y: -20, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      ${(m.revenue / 1000).toFixed(0)}k
                    </motion.span>
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-on-surface-variant/70 font-medium -mt-2">{m.month}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Shipments Chart */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-white/[0.01] border border-white/5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-6">Monthly Shipments</h2>
            <div className="flex items-end justify-between gap-2 h-48 px-2">
              {MONTHLY.map((m, idx) => (
                <div key={m.month} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="relative w-full flex items-end justify-center h-40">
                    <motion.div 
                      className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-secondary/40 to-secondary/10 border-t border-secondary/50 shadow-lg shadow-secondary/10"
                      initial={{ height: "0%" }}
                      animate={{ height: `${(m.shipments / maxShipments) * 100}%` }}
                      whileHover={{
                        scaleY: 1.05,
                        backgroundColor: "rgba(255, 193, 7, 0.3)"
                      }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                    />
                    <motion.span 
                      className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container/95 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-md text-[10px] font-mono text-secondary shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 0 }}
                      whileHover={{ y: -20, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {m.shipments}
                    </motion.span>
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-on-surface-variant/70 font-medium -mt-2">{m.month}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Performance */}
        <motion.div variants={itemVariants}>
          <Card className="p-5 space-y-4 bg-white/[0.01] border border-white/5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Branch Performance</h2>
            <div className="space-y-3">
              {BRANCH_PERF.map((b, i) => (
                <motion.div 
                  key={b.name} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-4 w-4 text-on-surface-variant shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{b.name}</p>
                      <p className="text-xs text-on-surface-variant">{b.shipments} shipments · {b.revenue}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${b.positive ? "text-green-400" : "text-error"}`}>
                    {b.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {b.growth}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Reports */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Generated Reports</h2>
          <Card className="divide-y divide-white/5 overflow-hidden bg-white/[0.01] border border-white/5">
            {REPORTS.map((r, i) => (
              <motion.div 
                key={r.name} 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                className="flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-on-surface-variant shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-on-surface truncate">{r.name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{r.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_STYLES[r.type]}`}>{r.type}</span>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-tertiary/10 text-tertiary text-xs font-semibold hover:bg-tertiary/20 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
