"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle2, Clock, AlertTriangle, ClipboardList, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { DriverTask } from "@/lib/types";

const PRIORITY_STYLES: Record<string, string> = {
  High: "text-error bg-error/10",
  Medium: "text-on-tertiary-container bg-on-tertiary-container/10",
  Low: "text-on-surface-variant bg-white/5",
};

const STATUS_STYLES: Record<string, string> = {
  Pending: "text-secondary bg-secondary/10",
  Completed: "text-green-400 bg-green-400/10",
};

export default function DriverTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DriverTask[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("driver_tasks")
      .select("*")
      .eq("driver_id", user.id)
      .order("due")
      .then(({ data }) => data && setTasks(data));
  }, [user]);

  const filtered = tasks.filter(
    (t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.status.toLowerCase().includes(search.toLowerCase())
  );

  const pending = tasks.filter((t) => t.status === "Pending").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const high = tasks.filter((t) => t.priority === "High" && t.status === "Pending").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/driver" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Driver</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Tasks</h1>
        <p className="text-sm text-on-surface-variant mt-1">Your assigned tasks and action items for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <Clock className="h-8 w-8 text-secondary" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{pending}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Pending</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{completed}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Completed</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-error" />
          <div>
            <p className="font-mono text-2xl font-bold text-on-surface">{high}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">High Priority</p>
          </div>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50"
        />
      </div>

      <Card className="divide-y divide-white/5">
        {filtered.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-4 p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-4 w-4 shrink-0 text-on-surface-variant" />
              <div>
                <span className="font-mono text-xs text-tertiary mr-2">{t.id}</span>
                <span className="text-sm text-on-surface">{t.description}</span>
                <p className="text-xs text-on-surface-variant mt-0.5">Due: {t.due}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[t.status]}`}>
                {t.status}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[t.priority]}`}>
                {t.priority}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-on-surface-variant text-sm">No tasks match your search.</p>
        )}
      </Card>
    </div>
  );
}
