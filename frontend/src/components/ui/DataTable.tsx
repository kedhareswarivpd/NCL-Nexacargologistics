"use client";

import { Card } from "@/components/ui/card";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  rowClassName?: string;
  onRowClick?: (item: T) => void;
}

const defaultRowClass = "hover:bg-white/5 transition-all duration-150 hover:translate-x-0.5";

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = "No data found.",
  loading = false,
  loadingMessage = "Loading…",
  rowClassName = defaultRowClass,
  onRowClick,
}: DataTableProps<T>) {
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
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-on-surface-variant text-sm">
                {loadingMessage}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-on-surface-variant text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr
                key={item.id ?? i}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={`${rowClassName} ${onRowClick ? "cursor-pointer" : ""}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                    {col.render ? col.render(item, i) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}

interface StatusBadgeProps {
  status: string;
  styles: Record<string, string>;
  fallback?: string;
}

export function StatusBadge({ status, styles, fallback = "" }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[status] ?? fallback}`}>
      {status}
    </span>
  );
}
