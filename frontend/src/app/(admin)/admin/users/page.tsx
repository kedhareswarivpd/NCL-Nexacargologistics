"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Ban, Trash2, CheckCircle2, Clock, XCircle, ArrowLeft, Edit, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import { usersApi, adminApi } from "@/lib/services";
import { useToast } from "@/context/ToastContext";
import { apiError } from "@/lib/api";

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
// Account status for display. Driver duty-states (on_trip/on_duty/off_duty) are
// active accounts, so anything that isn't suspended/invited maps to "Active".
function accountStatus(raw?: string): "Active" | "Suspended" | "Pending" {
  if (raw === "suspended") return "Suspended";
  if (raw === "invited") return "Pending";
  return "Active";
}

function mapUser(u: any) {
  return {
    id: u.id,
    name: u.name ?? u.email ?? "User",
    email: u.email ?? "",
    role: cap(u.role ?? ""),
    status: accountStatus(u.status),
    joined: u.created_at ? String(u.created_at).slice(0, 10) : "—",
    last: u.last_login_at ? String(u.last_login_at).slice(0, 10) : "—",
  };
}

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }
};

export default function UserManagementPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [users, setUsers] = useState<ReturnType<typeof mapUser>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<ReturnType<typeof mapUser> | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", status: "" });
  const [editSaving, setEditSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.list();
      setUsers((data ?? []).map(mapUser));
    } catch (err) {
      const errMsg = apiError(err);
      setError(errMsg);
      toast.error(`Failed to load users: ${errMsg}`);
      setUsers([]);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openEdit(u: ReturnType<typeof mapUser>) {
    setEditTarget(u);
    setEditForm({ name: u.name, role: u.role.toLowerCase(), status: u.status.toLowerCase() });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await usersApi.update(editTarget.id, { name: editForm.name, role: editForm.role, status: editForm.status });
      toast.success("User updated.");
      setEditTarget(null);
      load();
    } catch (err) { toast.error(apiError(err)); }
    setEditSaving(false);
  }

  async function toggleSuspend(u: ReturnType<typeof mapUser>) {
    try {
      const newStatus = u.status === "Active" ? "suspended" : "active";
      await adminApi.setUserStatus(u.id, newStatus);
      toast.success(`User status updated to ${newStatus}.`);
      load();
    } catch (err) {
      toast.error(`Failed to update user status: ${apiError(err)}`);
    }
  }

  async function removeUser(id: string) {
    try {
      await usersApi.remove(id);
      toast.success("User deleted successfully.");
      load();
    } catch (err) {
      toast.error(`Failed to delete user: ${apiError(err)}`);
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const active = users.filter((u) => u.status === "Active").length;
  const suspended = users.filter((u) => u.status === "Suspended").length;
  const pending = users.filter((u) => u.status === "Pending").length;

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
          <span className="text-sm font-bold text-[#0B1F3A]">Back to Admin Dashboard</span>
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
                  const IconComponent = STATUS_ICONS[u.status] || Clock;
                  const StatusIcon = (typeof IconComponent === "function" || (IconComponent && typeof IconComponent === "object")) ? IconComponent : () => null;
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
                            {u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
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
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-tertiary/10 text-tertiary transition-colors" title="Edit"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => toggleSuspend(u)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant transition-colors" title={u.status === "Active" ? "Suspend" : "Reactivate"}><Ban className="h-4 w-4" /></button>
                          <button onClick={() => removeUser(u.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <motion.tr layout>
                  <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-sm">
                    {loading ? (
                      "Loading…"
                    ) : error ? (
                      <span className="text-error font-medium">{error}</span>
                    ) : (
                      "No users match your search."
                    )}
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </Card>
      </motion.div>
      {/* Edit User Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-container shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="text-base font-bold text-on-surface">Edit User</h2>
              <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant"><X className="h-4 w-4" /></button>
            </div>
            <form noValidate onSubmit={saveEdit} className="p-6 space-y-4">
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Name</label><input value={editForm.name} onChange={e => { const filtered = e.target.value.replace(/[0-9]/g, ''); setEditForm(p => ({...p, name: filtered})); }} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Role</label>
                <select value={editForm.role} onChange={e => setEditForm(p => ({...p, role: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
                  {["customer","admin","logistics","finance","warehouse","driver","support","customs"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Status</label>
                <select value={editForm.status} onChange={e => setEditForm(p => ({...p, status: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
                  <option value="active">Active</option><option value="suspended">Suspended</option><option value="invited">Pending</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editSaving} className="flex-1 py-2.5 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] disabled:opacity-50">{editSaving ? "Saving…" : "Save Changes"}</button>
                <button type="button" onClick={() => setEditTarget(null)} className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-on-surface-variant hover:bg-white/10">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
