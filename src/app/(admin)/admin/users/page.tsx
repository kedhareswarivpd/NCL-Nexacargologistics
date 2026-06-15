"use client";

import { useState } from "react";
import { Search, UserPlus, Edit, Ban, Trash2, CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const USERS = [
  { id: "USR-001", name: "Marcus Johnson", email: "driver@nexacargo.com", role: "Driver", status: "Active", joined: "2025-03-15", last: "Today" },
  { id: "USR-002", name: "Demo Customer", email: "customer@nexacargo.com", role: "Customer", status: "Active", joined: "2025-04-01", last: "Yesterday" },
  { id: "USR-003", name: "Demo Warehouse", email: "warehouse@nexacargo.com", role: "Warehouse", status: "Active", joined: "2025-02-10", last: "Today" },
  { id: "USR-004", name: "Demo Finance", email: "finance@nexacargo.com", role: "Finance", status: "Active", joined: "2025-01-20", last: "2 days ago" },
  { id: "USR-005", name: "Demo Logistics", email: "logistics@nexacargo.com", role: "Logistics", status: "Suspended", joined: "2025-05-05", last: "1 week ago" },
  { id: "USR-006", name: "Jane Smith", email: "jane.smith@example.com", role: "Customer", status: "Pending", joined: "2025-07-10", last: "Never" },
];

const ROLE_STYLES: Record<string, string> = {
  Driver: "text-tertiary bg-tertiary/10",
  Customer: "text-secondary bg-secondary/10",
  Warehouse: "text-on-tertiary-container bg-on-tertiary-container/10",
  Finance: "text-green-400 bg-green-400/10",
  Logistics: "text-yellow-400 bg-yellow-400/10",
  Admin: "text-error bg-error/10",
};

const STATUS_STYLES: Record<string, string> = {
  Active: "text-green-400 bg-green-400/10",
  Suspended: "text-error bg-error/10",
  Pending: "text-secondary bg-secondary/10",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  Active: CheckCircle2,
  Suspended: XCircle,
  Pending: Clock,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }
};

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered = USERS.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const active = USERS.filter((u) => u.status === "Active").length;
  const suspended = USERS.filter((u) => u.status === "Suspended").length;
  const pending = USERS.filter((u) => u.status === "Pending").length;

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
        <h1 className="text-3xl font-bold text-on-surface mt-1">User Management</h1>
        <p className="text-sm text-on-surface-variant mt-1">Control user access, roles and account status across the platform.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="p-5 flex items-center gap-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 transition-colors">
            <CheckCircle2 className="h-8 w-8 text-green-400 shrink-0" />
            <div>
              <p className="font-mono text-2xl font-bold text-on-surface">{active}</p>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">Active Users</p>
            </div>
          </Card>
        </motion.div>
        <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="p-5 flex items-center gap-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 transition-colors">
            <Clock className="h-8 w-8 text-secondary shrink-0" />
            <div>
              <p className="font-mono text-2xl font-bold text-on-surface">{pending}</p>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">Pending</p>
            </div>
          </Card>
        </motion.div>
        <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="p-5 flex items-center gap-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 transition-colors">
            <XCircle className="h-8 w-8 text-error shrink-0" />
            <div>
              <p className="font-mono text-2xl font-bold text-on-surface">{suspended}</p>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">Suspended</p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input type="text" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/55 transition-colors" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Customer", "Driver", "Warehouse", "Finance", "Logistics"].map((r) => {
            const isSelected = roleFilter === r;
            return (
              <button 
                key={r} 
                onClick={() => setRoleFilter(r)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold overflow-hidden transition-all duration-200`}
              >
                {isSelected && (
                  <motion.span 
                    layoutId="activeRoleFilter" 
                    className="absolute inset-0 bg-tertiary/20 border-b-2 border-tertiary rounded-lg -z-10" 
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className={isSelected ? "text-tertiary font-bold" : "text-on-surface-variant hover:text-on-surface"}>
                  {r}
                </span>
              </button>
            );
          })}
        </div>
        <Link href="/admin/users/new">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-tertiary/20 text-tertiary text-xs font-semibold hover:bg-tertiary/30 transition-colors ml-auto shadow-[0_4px_12px_rgba(153,203,255,0.1)]"
          >
            <UserPlus className="h-4 w-4" /> Add User
          </motion.button>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden bg-white/[0.01] border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant bg-white/[0.02]">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((u) => {
                  const StatusIcon = STATUS_ICONS[u.status];
                  return (
                    <motion.tr 
                      key={u.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-on-surface shrink-0">
                            {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{u.name}</p>
                            <p className="text-xs text-on-surface-variant">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_STYLES[u.role] ?? "text-on-surface-variant bg-white/5"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[u.status]}`}>
                          <StatusIcon className="h-3 w-3" /> {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant text-xs">{u.joined}</td>
                      <td className="px-4 py-3 text-on-surface-variant text-xs">{u.last}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg hover:bg-white/10 text-tertiary transition-colors" title="Edit"><Edit className="h-4 w-4" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant transition-colors" title="Suspend"><Ban className="h-4 w-4" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <motion.tr layout>
                  <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-sm">
                    No users match your search.
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </Card>
      </motion.div>
    </motion.div>
  );
}
