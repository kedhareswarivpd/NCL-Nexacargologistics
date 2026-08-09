"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label = "← Back to Dashboard" }: BackButtonProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
      <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
      <span className="text-sm font-bold text-[#0B1F3A]">{label}</span>
    </Link>
  );
}

interface PageHeaderProps {
  department: string;
  title: string;
  description: string;
  textColor?: string;
}

export function PageHeader({ department, title, description, textColor = "text-tertiary" }: PageHeaderProps) {
  return (
    <div>
      <p className={`text-xs uppercase tracking-widest ${textColor}`}>{department}</p>
      <h1 className="text-3xl font-bold text-on-surface mt-1">{title}</h1>
      <p className="text-sm text-on-surface-variant mt-1">{description}</p>
    </div>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  options?: string[];
}

const inputBaseCls = "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50";
const inputDisabledCls = "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface-variant opacity-60 cursor-not-allowed";

export function FormField({ id, label, type = "text", value, defaultValue, onChange, disabled, placeholder, error, options }: FormFieldProps) {
  const cls = error ? `${inputBaseCls} border-red-500` : disabled ? inputDisabledCls : `${inputBaseCls} border-white/10`;

  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-widest text-on-surface-variant">{label}</label>
      {type === "select" && options ? (
        <select id={id} value={value} defaultValue={defaultValue} onChange={onChange} disabled={disabled} className={cls}>
          {options.map(opt => <option key={opt}>{opt}</option>)}
        </select>
      ) : (
        <input id={id} type={type} value={value} defaultValue={defaultValue} onChange={onChange} disabled={disabled} placeholder={placeholder} className={cls} />
      )}
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}

interface FieldGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
}

export function FieldGrid({ children, columns = 2 }: FieldGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-${columns} gap-4`}>
      {children}
    </div>
  );
}

interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({ columns, data, emptyMessage = "No data found." }: DataTableProps<T>) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant">
            {columns.map(col => (
              <th key={col.key} className={`px-4 py-3 ${col.className || ""}`}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item, i) => (
            <tr key={item.id} className="hover:bg-white/5 transition-all duration-150 hover:translate-x-0.5 animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              {columns.map(col => (
                <td key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-on-surface-variant text-sm">{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

interface ActionButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}

export function ActionButton({ onClick, children, variant = "primary", className = "" }: ActionButtonProps) {
  const variants = {
    primary: "bg-tertiary/10 text-tertiary hover:bg-tertiary/20",
    secondary: "bg-white/5 text-on-surface-variant hover:bg-white/10",
    danger: "bg-error/10 text-error hover:bg-error/20",
  };
  return (
    <button type="button" onClick={onClick} className={`mt-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
