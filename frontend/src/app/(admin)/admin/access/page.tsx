"use client";

import { ShieldCheck, Lock, Eye, Edit, Trash2, Plus, AlertTriangle, CheckCircle2, ShieldX, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { adminApi, usersApi } from "@/lib/services";

const ROLES = [
  {
    role: "Admin",
    color: "text-error bg-error/10 border-error/20",
    users: 1,
    permissions: ["Full system access", "User management", "Branch management", "Access control", "Analytics", "All portals"],
  },
  {
    role: "Finance",
    color: "text-green-400 bg-green-400/10 border-green-400/20",
    users: 3,
    permissions: ["Finance dashboard", "View invoices", "Manage payments", "Revenue reports", "Export billing"],
  },
  {
    role: "Warehouse",
    color: "text-on-tertiary-container bg-on-tertiary-container/10 border-on-tertiary-container/20",
    users: 8,
    permissions: ["Warehouse dashboard", "Inventory management", "Inbound/Outbound", "Task management"],
  },
  {
    role: "Driver",
    color: "text-tertiary bg-tertiary/10 border-tertiary/20",
    users: 24,
    permissions: ["Driver dashboard", "View assigned routes", "Update delivery status", "Task queue"],
  },
  {
    role: "Logistics",
    color: "text-secondary bg-secondary/10 border-secondary/20",
    users: 6,
    permissions: ["Logistics dashboard", "Manage shipments", "Route planning", "Fleet overview"],
  },
  {
    role: "Customer",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    users: 1240,
    permissions: ["Customer portal", "Track shipments", "Request quotes", "View invoices", "Cargo insurance", "Support tickets"],
  },
];

const SECURITY_LOGS = [
  { type: "error", msg: "Multiple failed logins — IP: 192.168.1.1", time: "5 min ago" },
  { type: "success", msg: "Admin password changed successfully", time: "1 hour ago" },
  { type: "warning", msg: "Finance role — new permission added: export invoices", time: "3 hours ago" },
  { type: "success", msg: "New customer account verified", time: "Yesterday" },
  { type: "error", msg: "Unauthorized access attempt — /admin route", time: "Yesterday" },
];

const LOG_STYLES: Record<string, string> = {
  error: "text-error bg-error/10",
  success: "text-green-400 bg-green-400/10",
  warning: "text-on-tertiary-container bg-on-tertiary-container/10",
};

const LOG_ICONS: Record<string, React.ElementType> = {
  error: ShieldX,
  success: CheckCircle2,
  warning: AlertTriangle,
};

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

export default function AccessControlPage() {
  const [selected, setSelected] = useState("Admin");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<typeof SECURITY_LOGS>(SECURITY_LOGS);

  useEffect(() => {
    // Real per-role user counts.
    usersApi.list().then((users: any[]) => {
      const c: Record<string, number> = {};
      (users ?? []).forEach((u) => {
        const role = (u.role ?? "").charAt(0).toUpperCase() + (u.role ?? "").slice(1);
        c[role] = (c[role] ?? 0) + 1;
      });
      setCounts(c);
    }).catch(() => {});
    // Real audit/security logs (fall back to sample data if none yet).
    adminApi.auditLogs().then((rows: any[]) => {
      if (rows && rows.length) {
        setLogs(rows.slice(0, 6).map((r) => ({
          type: r.action?.toLowerCase().includes("delete") || r.action?.toLowerCase().includes("fail") ? "error" : "success",
          msg: `${r.action ?? "Action"}${r.entity_type ? ` · ${r.entity_type}` : ""}${r.actor_email ? ` by ${r.actor_email}` : ""}`,
          time: r.created_at ? new Date(r.created_at).toLocaleString() : "",
        })));
      }
    }).catch(() => {});
  }, []);

  const roles = ROLES.map((r) => ({ ...r, users: counts[r.role] ?? r.users }));
  const selectedRole = roles.find((r) => r.role === selected)!;

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
        <h1 className="text-3xl font-bold text-on-surface mt-1">Access Control</h1>
        <p className="text-sm text-on-surface-variant mt-1">Secure sensitive information by managing role-based permissions.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role List */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Roles</h2>
          <Card className="divide-y divide-white/5 overflow-hidden bg-white/[0.01] border border-white/5">
            {roles.map((r) => {
              const isSelected = selected === r.role;
              return (
                <button 
                  key={r.role} 
                  onClick={() => setSelected(r.role)}
                  className={`relative w-full flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors text-left focus:outline-none`}
                >
                  {isSelected && (
                    <motion.span 
                      layoutId="activeRoleBackground"
                      className="absolute inset-0 bg-white/5 border-l-2 border-tertiary shadow-[0_0_15px_rgba(153,203,255,0.08)]"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-transform duration-200 ${isSelected ? "scale-105" : ""} ${r.color}`}>
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <p className={`text-sm font-semibold transition-colors ${isSelected ? "text-tertiary" : "text-on-surface"}`}>{r.role}</p>
                      <p className="text-xs text-on-surface-variant">{r.users} {r.users === 1 ? "user" : "users"}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div 
                      layoutId="activeRoleDot"
                      className="w-1.5 h-1.5 rounded-full bg-tertiary relative z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                </button>
              );
            })}
          </Card>
        </motion.div>

        {/* Permissions */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
            Permissions — {selectedRole.role}
          </h2>
          <Card className="p-5 space-y-3 bg-white/[0.01] border border-white/5">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-3"
                >
                  {selectedRole.permissions.map((perm, index) => (
                    <motion.div 
                      key={perm} 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/[0.08] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                        <span className="text-sm text-on-surface truncate">{perm}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button className="p-1 rounded hover:bg-white/10 text-tertiary transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                        <button className="p-1 rounded hover:bg-white/10 text-on-surface-variant transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                        <button className="p-1 rounded hover:bg-error/10 text-error transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-white/10 text-on-surface-variant text-xs hover:bg-white/5 hover:border-white/20 transition-all duration-200"
            >
              <Plus className="h-4 w-4" /> Add Permission
            </motion.button>
          </Card>
        </motion.div>

        {/* Security Logs */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Security Logs</h2>
          <Card className="divide-y divide-white/5 overflow-hidden bg-white/[0.01] border border-white/5">
            {logs.map((log, i) => {
              const Icon = LOG_ICONS[log.type];
              return (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 200 }}
                  className="flex items-start gap-3 p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${LOG_STYLES[log.type]}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-on-surface leading-relaxed">{log.msg}</p>
                    <p className="text-[11px] text-on-surface-variant/60 mt-0.5">{log.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </Card>

          <Card className="p-4 flex items-start gap-3 border-tertiary/20 bg-tertiary/5">
            <Lock className="h-4 w-4 text-tertiary shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs text-on-surface-variant">All sensitive routes are protected by role-based access. Unauthorized access attempts are logged automatically.</p>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
