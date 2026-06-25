"use client";

import { useState } from "react";
import { User, Bell, Shield, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function FinanceSettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    overdueInvoice: true,
    paymentReceived: true,
    reportReady: false,
    lowCashFlow: true,
  });

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSaved, setPwSaved] = useState(false);

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!pwForm.current.trim()) errs.current = "Current password is required.";
    if (!pwForm.next.trim()) errs.next = "New password is required.";
    else if (pwForm.next.length < 8) errs.next = "Must be at least 8 characters.";
    else if (!/[A-Za-z]/.test(pwForm.next)) errs.next = "Must include a letter.";
    else if (!/[0-9]/.test(pwForm.next)) errs.next = "Must include a number.";
    if (pwForm.confirm !== pwForm.next) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    // Update the password via Supabase Auth (session-authenticated).
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    if (error) { setPwErrors({ next: error.message }); return; }
    setPwSaved(true);
    setPwForm({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 3000);
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <Link href="/finance" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Finance</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your account and finance preferences.</p>
      </div>

      {/* Profile */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-4 w-4 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Profile</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Full Name</label>
            <input defaultValue={user?.name ?? ""} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Email</label>
            <input defaultValue={user?.email ?? ""} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" />
          </div>
        </div>
        <button className="mt-2 px-4 py-2 rounded-lg bg-tertiary/10 text-tertiary text-sm font-semibold hover:bg-tertiary/20 transition-colors">
          Save Changes
        </button>
      </Card>

      {/* Notifications */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-4 w-4 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Notifications</h2>
        </div>
        {[
          { key: "overdueInvoice", label: "Overdue invoice alerts" },
          { key: "paymentReceived", label: "Payment received alerts" },
          { key: "reportReady", label: "Report generation complete" },
          { key: "lowCashFlow", label: "Low cash flow warnings" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-on-surface">{label}</span>
            <button
              onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
              className={`w-10 h-5 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? "bg-tertiary" : "bg-white/10"}`}
            >
              <span className={`block w-4 h-4 rounded-full bg-white mx-auto transition-transform ${notifications[key as keyof typeof notifications] ? "translate-x-2.5" : "-translate-x-2.5"}`} />
            </button>
          </div>
        ))}
      </Card>

      {/* Finance Preferences */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="h-4 w-4 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Finance Preferences</h2>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-on-surface-variant">Default Currency</label>
          <select className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
            <option>USD — US Dollar</option>
            <option>EUR — Euro</option>
            <option>GBP — British Pound</option>
            <option>AED — UAE Dirham</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-on-surface-variant">Invoice Payment Terms (days)</label>
          <input type="number" defaultValue={30} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" />
        </div>
        <button className="mt-2 px-4 py-2 rounded-lg bg-tertiary/10 text-tertiary text-sm font-semibold hover:bg-tertiary/20 transition-colors">
          Save Preferences
        </button>
      </Card>

      {/* Security */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-4 w-4 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Security</h2>
        </div>
        {pwSaved && <p className="text-xs text-green-400 bg-green-400/10 rounded-lg px-3 py-2">Password updated successfully.</p>}
        <form noValidate onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Current Password</label>
            <input type="password" value={pwForm.current} onChange={e => { setPwForm(p => ({...p, current: e.target.value})); setPwErrors(p => ({...p, current: ""})); }} placeholder="••••••••" className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50 ${pwErrors.current ? "border-red-500" : "border-white/10"}`} />
            {pwErrors.current && <p className="text-xs text-error mt-1">{pwErrors.current}</p>}
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">New Password</label>
            <input type="password" value={pwForm.next} onChange={e => { setPwForm(p => ({...p, next: e.target.value})); setPwErrors(p => ({...p, next: ""})); }} placeholder="••••••••" className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50 ${pwErrors.next ? "border-red-500" : "border-white/10"}`} />
            {pwErrors.next && <p className="text-xs text-error mt-1">{pwErrors.next}</p>}
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Confirm New Password</label>
            <input type="password" value={pwForm.confirm} onChange={e => { setPwForm(p => ({...p, confirm: e.target.value})); setPwErrors(p => ({...p, confirm: ""})); }} placeholder="••••••••" className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50 ${pwErrors.confirm ? "border-red-500" : "border-white/10"}`} />
            {pwErrors.confirm && <p className="text-xs text-error mt-1">{pwErrors.confirm}</p>}
          </div>
          <button type="submit" className="mt-2 px-4 py-2 rounded-lg bg-error/10 text-error text-sm font-semibold hover:bg-error/20 transition-colors">Update Password</button>
        </form>
      </Card>
    </div>
  );
}
