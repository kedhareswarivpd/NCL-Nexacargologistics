"use client";

import { useState } from "react";
import { ArrowLeft, UserPlus, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/services";
import { apiError } from "@/lib/api";

const ROLES = ["Customer", "Driver", "Warehouse", "Finance", "Logistics", "Admin"];
const STATUSES = ["Active", "Pending", "Suspended"];

const inputCls =
  "mt-1 w-full px-3 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 transition-colors";
const labelCls = "text-xs uppercase tracking-widest text-on-surface-variant";

export default function AddUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Customer",
    status: "Active",
    department: "",
    location: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((p) => ({ ...p, [field]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSaving(true);
    // status / location / notes have no backend mapping and are omitted.
    try {
      await usersApi.create({
        name: form.name,
        email: form.email,
        password: Math.random().toString(36).slice(2) + "Aa1!",
        role: form.role.toLowerCase(),
        phone: form.phone || undefined,
        department: form.department || undefined,
      });
      setSaving(false);
      setSuccess(true);
      setTimeout(() => router.push("/admin/users"), 1500);
    } catch (err) {
      setSaving(false);
      setError(apiError(err));
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6 max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 mb-5 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]"
        >
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">Back to User Management</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Admin Portal</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Add New User</h1>
        <p className="text-sm text-on-surface-variant mt-1">Fill in the details below to create a new user account.</p>
      </div>

      {/* Form */}
      <Card className="p-6 border border-white/5 bg-white/[0.01]">
        <form noValidate onSubmit={handleSubmit} className="space-y-5">

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input value={form.name} onChange={(e) => { const filtered = e.target.value.replace(/[0-9]/g, ''); set("name", filtered); }}
                placeholder="e.g. Marcus Johnson"
                className={`${inputCls} ${fieldErrors.name ? "border-red-500" : ""}`} />
              {fieldErrors.name && <p className="text-xs text-error mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className={labelCls}>Email Address *</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="e.g. user@nexacargo.com"
                className={`${inputCls} ${fieldErrors.email ? "border-red-500" : ""}`} />
              {fieldErrors.email && <p className="text-xs text-error mt-1">{fieldErrors.email}</p>}
            </div>
          </div>

          {/* Phone + Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Phone Number</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="e.g. +1 555 000 0000"
                className={`${inputCls} ${fieldErrors.phone ? "border-red-500" : ""}`} />
              {fieldErrors.phone && <p className="text-xs text-error mt-1">{fieldErrors.phone}</p>}
            </div>
            <div>
              <label className={labelCls}>Department</label>
              <input value={form.department} onChange={(e) => set("department", e.target.value)}
                placeholder="e.g. Operations" className={inputCls} />
            </div>
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Role *</label>
              <select required value={form.role} onChange={(e) => set("role", e.target.value)} className={inputCls}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status *</label>
              <select required value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={labelCls}>Location</label>
            <input value={form.location} onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. New York, USA" className={inputCls} />
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              placeholder="Any additional information…"
              className={`${inputCls} resize-none`} />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-error bg-error/10 rounded-lg px-4 py-2.5">{error}</p>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 rounded-lg px-4 py-2.5"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              User created successfully! Redirecting…
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <motion.button
              type="submit"
              disabled={saving || success}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-tertiary/20 text-tertiary text-sm font-semibold hover:bg-tertiary/30 transition-colors disabled:opacity-50 shadow-[0_4px_12px_rgba(153,203,255,0.1)]"
            >
              <UserPlus className="h-4 w-4" />
              {saving ? "Saving…" : "Submit"}
            </motion.button>
            <Link href="/admin/users">
              <button type="button"
                className="px-6 py-2.5 rounded-lg bg-white/5 text-on-surface-variant text-sm font-semibold hover:bg-white/10 transition-colors">
                Cancel
              </button>
            </Link>
          </div>

        </form>
      </Card>
    </motion.div>
  );
}
