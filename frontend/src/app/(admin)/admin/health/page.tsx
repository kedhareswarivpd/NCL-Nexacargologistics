"use client";

import { useEffect, useState } from "react";
import { Activity, Database, Key, Server, RefreshCw, CheckCircle2, AlertTriangle, XCircle, ArrowLeft, Cpu, Clock, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminHealthPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  async function fetchHealth() {
    try {
      setRefreshing(true);
      const res = await api.get("/health");
      setHealthData(res.data);
    } catch (err: any) {
      setHealthData({
        status: "error",
        system_status: "unhealthy",
        error: err.message || "Failed to reach health endpoint"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchHealth();
    if (!autoRefresh) return;
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  function renderStatusBadge(statusStr: string) {
    const s = statusStr?.toLowerCase();
    if (s === "up" || s === "healthy" || s === "ok") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
          Operational
        </span>
      );
    } else if (s === "degraded") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          Degraded
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          <XCircle className="h-3.5 w-3.5 text-red-400" />
          Service Down
        </span>
      );
    }
  }

  const formatUptime = (seconds: number) => {
    if (!seconds) return "Just started";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-tertiary hover:underline mb-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Super Admin
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-tertiary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">System Health & Services</h1>
              <p className="text-xs text-on-surface-variant">Live operational telemetry, service status & database diagnostics.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              autoRefresh ? "bg-tertiary/10 border-tertiary/30 text-tertiary" : "bg-surface-container border-white/10 text-on-surface-variant"
            }`}
          >
            Auto-refresh (15s): {autoRefresh ? "ON" : "OFF"}
          </button>
          <button
            onClick={fetchHealth}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary text-on-tertiary text-xs font-semibold hover:bg-tertiary/90 transition-all shadow-[0_4px_16px_rgba(0,194,255,0.25)] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-on-surface-variant space-y-3 border border-white/5">
          <RefreshCw className="h-8 w-8 text-tertiary animate-spin mx-auto" />
          <p className="text-sm font-medium">Checking live services health...</p>
        </Card>
      ) : (
        <>
          {/* Global System Status Card */}
          <Card className="p-6 border border-white/10 bg-surface-container/40">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Server className="h-6 w-6 text-tertiary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Overall System Status</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xl font-bold text-on-surface">
                      {healthData?.system_status === "healthy" ? "All Systems Operational" : "System Degraded"}
                    </span>
                    {renderStatusBadge(healthData?.system_status || "healthy")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-tertiary" />
                  <span>Uptime: <strong className="text-on-surface">{formatUptime(healthData?.uptime_seconds)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-tertiary" />
                  <span>Last Checked: <strong className="text-on-surface">{new Date().toLocaleTimeString()}</strong></span>
                </div>
              </div>
            </div>
          </Card>

          {/* Microservices Health Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Database Health Card */}
            <Card className="p-5 border border-white/10 bg-surface-container/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">PostgreSQL Database</h3>
                    <p className="text-[11px] text-on-surface-variant">Primary Relational Storage</p>
                  </div>
                </div>
                {renderStatusBadge(healthData?.services?.database?.status || "down")}
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Latency:</span>
                  <span className="text-tertiary font-bold">{healthData?.services?.database?.latency_ms || 0} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Message:</span>
                  <span className="text-on-surface truncate">{healthData?.services?.database?.message || "Active"}</span>
                </div>
              </div>
            </Card>

            {/* Supabase Auth Card */}
            <Card className="p-5 border border-white/10 bg-surface-container/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">Supabase Auth</h3>
                    <p className="text-[11px] text-on-surface-variant">JWT Authentication Provider</p>
                  </div>
                </div>
                {renderStatusBadge(healthData?.services?.auth_service?.status || "up")}
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Latency:</span>
                  <span className="text-emerald-400 font-bold">{healthData?.services?.auth_service?.latency_ms || 0} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Message:</span>
                  <span className="text-on-surface truncate">{healthData?.services?.auth_service?.message || "Operational"}</span>
                </div>
              </div>
            </Card>

            {/* System Resources Card */}
            <Card className="p-5 border border-white/10 bg-surface-container/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">Server Process Memory</h3>
                    <p className="text-[11px] text-on-surface-variant">Render Compute Instance</p>
                  </div>
                </div>
                {renderStatusBadge(healthData?.services?.system?.status || "up")}
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Memory Usage:</span>
                  <span className="text-purple-400 font-bold">{healthData?.services?.system?.memory_usage_mb || "N/A"} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Process ID:</span>
                  <span className="text-on-surface">{healthData?.services?.system?.pid || "N/A"}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Database Live Entity Metrics */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">Live Entity Row Counts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Total Users", val: healthData?.metrics?.users ?? 0 },
                { label: "Shipments", val: healthData?.metrics?.shipments ?? 0 },
                { label: "Quotes", val: healthData?.metrics?.quotes ?? 0 },
                { label: "Invoices", val: healthData?.metrics?.invoices ?? 0 },
                { label: "Support Tickets", val: healthData?.metrics?.support_tickets ?? 0 },
              ].map(({ label, val }) => (
                <Card key={label} className="p-4 border border-white/5 bg-surface-container/20 text-center space-y-1">
                  <p className="text-2xl font-bold font-mono text-tertiary">{val}</p>
                  <p className="text-[11px] text-on-surface-variant font-medium">{label}</p>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
