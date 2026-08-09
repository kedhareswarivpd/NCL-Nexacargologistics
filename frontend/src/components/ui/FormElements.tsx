"use client";

import { useState, FormEvent } from "react";
import { X } from "lucide-react";

const inputBase = "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50";
const inputDisabled = "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface-variant opacity-60 cursor-not-allowed";

interface TextFieldProps {
  id: string;
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  type?: string;
}

export function TextField({ id, label, value, defaultValue, onChange, disabled, placeholder, error, type = "text" }: TextFieldProps) {
  const cls = error ? `${inputBase} border-red-500` : disabled ? inputDisabled : `${inputBase} border-white/10`;
  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-widest text-on-surface-variant">{label}</label>
      <input id={id} type={type} value={value} defaultValue={defaultValue} onChange={onChange} disabled={disabled} placeholder={placeholder} className={cls} />
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  options: string[];
}

export function SelectField({ id, label, value, defaultValue, onChange, disabled, options }: SelectFieldProps) {
  const cls = disabled ? inputDisabled : `${inputBase} border-white/10`;
  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-widest text-on-surface-variant">{label}</label>
      <select id={id} value={value} defaultValue={defaultValue} onChange={onChange} disabled={disabled} className={cls}>
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

interface TextAreaFieldProps {
  id: string;
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}

export function TextAreaField({ id, label, value, defaultValue, onChange, placeholder, rows = 3 }: TextAreaFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-widest text-on-surface-variant">{label}</label>
      <textarea id={id} value={value} defaultValue={defaultValue} onChange={onChange} placeholder={placeholder} rows={rows} className={`${inputBase} border-white/10`} />
    </div>
  );
}

interface EditModalProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  children: React.ReactNode;
  saving?: boolean;
}

export function EditModal({ title, onClose, onSubmit, children, saving = false }: EditModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-container shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-base font-bold text-on-surface">{title}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant"><X className="h-4 w-4" /></button>
        </div>
        <form noValidate onSubmit={onSubmit} className="p-6 space-y-4">
          {children}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] disabled:opacity-50">{saving ? "Saving…" : "Save Changes"}</button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-on-surface-variant hover:bg-white/10">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PasswordChangeFormProps {
  onSubmit: (e: FormEvent) => void;
  form: { current: string; next: string; confirm?: string };
  onFormChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  saved: boolean;
  showConfirm?: boolean;
  updatePassword?: (newPassword: string) => Promise<{ error?: { message: string } }>;
}

export function PasswordChangeForm({ onSubmit, form, onFormChange, errors, saved, showConfirm, updatePassword }: PasswordChangeFormProps) {
  return (
    <>
      {saved && <p className="text-xs text-green-400 bg-green-400/10 rounded-lg px-3 py-2">Password updated successfully.</p>}
      <form noValidate onSubmit={onSubmit} className="space-y-4">
        <TextField id="field-current-password" label="Current Password" type="password" value={form.current} onChange={e => onFormChange("current", e.target.value)} placeholder="••••••••" error={errors.current} />
        <TextField id="field-new-password" label="New Password" type="password" value={form.next} onChange={e => onFormChange("next", e.target.value)} placeholder="••••••••" error={errors.next} />
        {showConfirm && <TextField id="field-confirm-password" label="Confirm Password" type="password" value={form.confirm || ""} onChange={e => onFormChange("confirm", e.target.value)} placeholder="••••••••" error={errors.confirm} />}
        <button type="submit" className="mt-2 px-4 py-2 rounded-lg bg-error/10 text-error text-sm font-semibold hover:bg-error/20 transition-colors">Update Password</button>
      </form>
    </>
  );
}
