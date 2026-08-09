"use client";
import React from "react";

import { useState, FormEvent } from "react";
import { User, Bell, Shield, Warehouse, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { SettingsCard, NotificationToggles, PasswordForm } from "@/components/ui/SettingsCard";

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({ inbound: true, outbound: true, lowStock: true, taskAssigned: false });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSaved, setPwSaved] = useState(false);

  async function handlePasswordSave(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!pwForm.current.trim()) errs.current = "Current password is required.";
    if (!pwForm.next.trim()) errs.next = "New password is required.";
    else if (pwForm.next.length < 8) errs.next = "Must be at least 8 characters.";
    else if (!/[A-Za-z]/.test(pwForm.next)) errs.next = "Must include a letter.";
    else if (!/\d/.test(pwForm.next)) errs.next = "Must include a number.";
    if (pwForm.confirm !== pwForm.next) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    if (error) { setPwErrors({ next: error.message }); return; }
    setPwSaved(true);
    setPwForm({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 3000);
  }

  function handlePwChange(field: string, value: string) {
    setPwForm(p => ({ ...p, [field]: value }));
    if (pwErrors[field]) setPwErrors(p => ({ ...p, [field]: "" }));
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <Link href="/warehouse" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Warehouse</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your account and preferences.</p>
      </div>

      <SettingsCard icon={User} title="Profile">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field-full-name-2" className="text-xs uppercase tracking-widest text-on-surface-variant">Full Name</label>
            <input id="field-full-name-2" defaultValue={user?.name ?? ""} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" />
          </div>
          <div>
            <label htmlFor="field-email-3" className="text-xs uppercase tracking-widest text-on-surface-variant">Email</label>
            <input id="field-email-3" defaultValue={user?.email ?? ""} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" />
          </div>
        </div>
        <button type="button" className="mt-2 px-4 py-2 rounded-lg bg-tertiary/10 text-tertiary text-sm font-semibold hover:bg-tertiary/20 transition-colors">Save Changes</button>
      </SettingsCard>

      <SettingsCard icon={Bell} title="Notifications">
        <NotificationToggles
          state={notifications}
          onChange={key => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
          items={[
            { key: "inbound", label: "Inbound shipment alerts" },
            { key: "outbound", label: "Outbound dispatch alerts" },
            { key: "lowStock", label: "Low stock warnings" },
            { key: "taskAssigned", label: "Task assigned to me" },
          ]}
        />
      </SettingsCard>

      <SettingsCard icon={Warehouse} title="Warehouse Preferences">
        <div>
          <label htmlFor="field-default-zone-4" className="text-xs uppercase tracking-widest text-on-surface-variant">Default Zone</label>
          <select id="field-default-zone-4" className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
            <option>Zone A</option>
            <option>Zone B</option>
            <option>Zone C</option>
          </select>
        </div>
        <button type="button" className="mt-2 px-4 py-2 rounded-lg bg-tertiary/10 text-tertiary text-sm font-semibold hover:bg-tertiary/20 transition-colors">Save Preferences</button>
      </SettingsCard>

      <SettingsCard icon={Shield} title="Security">
        <PasswordForm
          onSubmit={handlePasswordSave}
          form={pwForm}
          onFormChange={handlePwChange}
          errors={pwErrors}
          saved={pwSaved}
          showConfirm
        />
      </SettingsCard>
    </div>
  );
}
