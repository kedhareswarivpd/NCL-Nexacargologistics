"use client";

import { FormEvent } from "react";
import { Card } from "@/components/ui/card";

interface SettingsCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

export function SettingsCard({ icon: Icon, title, children }: SettingsCardProps) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-4 w-4 text-tertiary" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

interface ToggleItem {
  key: string;
  label: string;
}

interface NotificationTogglesProps {
  items: ToggleItem[];
  state: Record<string, boolean>;
  onChange: (key: string) => void;
}

export function NotificationToggles({ items, state, onChange }: NotificationTogglesProps) {
  return (
    <>
      {items.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-sm text-on-surface">{label}</span>
          <button type="button"
            onClick={() => onChange(key)}
            className={`w-10 h-5 rounded-full transition-colors ${state[key] ? "bg-tertiary" : "bg-white/10"}`}
          >
            <span className={`block w-4 h-4 rounded-full bg-white mx-auto transition-transform ${state[key] ? "translate-x-2.5" : "-translate-x-2.5"}`} />
          </button>
        </div>
      ))}
    </>
  );
}

interface PasswordFormProps {
  onSubmit: (e: FormEvent) => void;
  form: { current: string; next: string; confirm?: string };
  onFormChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  saved: boolean;
  showConfirm?: boolean;
}

export function PasswordForm({ onSubmit, form, onFormChange, errors, saved, showConfirm }: PasswordFormProps) {
  const inputCls = (field: string) =>
    `mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50 ${errors[field] ? "border-red-500" : "border-white/10"}`;

  return (
    <>
      {saved && <p className="text-xs text-green-400 bg-green-400/10 rounded-lg px-3 py-2">Password updated successfully.</p>}
      <form noValidate onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="field-current-password" className="text-xs uppercase tracking-widest text-on-surface-variant">Current Password</label>
          <input id="field-current-password" type="password" value={form.current} onChange={e => { onFormChange("current", e.target.value); if (errors.current) onFormChange("current", e.target.value); }} placeholder="••••••••" className={inputCls("current")} />
          {errors.current && <p className="text-xs text-error mt-1">{errors.current}</p>}
        </div>
        <div>
          <label htmlFor="field-new-password" className="text-xs uppercase tracking-widest text-on-surface-variant">New Password</label>
          <input id="field-new-password" type="password" value={form.next} onChange={e => onFormChange("next", e.target.value)} placeholder="••••••••" className={inputCls("next")} />
          {errors.next && <p className="text-xs text-error mt-1">{errors.next}</p>}
        </div>
        {showConfirm && (
          <div>
            <label htmlFor="field-confirm-password" className="text-xs uppercase tracking-widest text-on-surface-variant">Confirm Password</label>
            <input id="field-confirm-password" type="password" value={form.confirm || ""} onChange={e => onFormChange("confirm", e.target.value)} placeholder="••••••••" className={inputCls("confirm")} />
            {errors.confirm && <p className="text-xs text-error mt-1">{errors.confirm}</p>}
          </div>
        )}
        <button type="submit" className="mt-2 px-4 py-2 rounded-lg bg-error/10 text-error text-sm font-semibold hover:bg-error/20 transition-colors">Update Password</button>
      </form>
    </>
  );
}
