"use client";

import { useState } from "react";
import { User, Bell, Shield, Warehouse } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    inbound: true,
    outbound: true,
    lowStock: true,
    taskAssigned: false,
  });

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-tertiary">Warehouse</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your account and preferences.</p>
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
            <input
              defaultValue={user?.name ?? ""}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Email</label>
            <input
              defaultValue={user?.email ?? ""}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50"
            />
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
          { key: "inbound", label: "Inbound shipment alerts" },
          { key: "outbound", label: "Outbound dispatch alerts" },
          { key: "lowStock", label: "Low stock warnings" },
          { key: "taskAssigned", label: "Task assigned to me" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-on-surface">{label}</span>
            <button
              onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
              className={`w-10 h-5 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? "bg-tertiary" : "bg-white/10"}`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white mx-auto transition-transform ${notifications[key as keyof typeof notifications] ? "translate-x-2.5" : "-translate-x-2.5"}`}
              />
            </button>
          </div>
        ))}
      </Card>

      {/* Warehouse Preferences */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Warehouse className="h-4 w-4 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Warehouse Preferences</h2>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-on-surface-variant">Default Zone View</label>
          <select className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
            <option>All Zones</option>
            <option>Zone A — Dry Goods</option>
            <option>Zone B — Electronics</option>
            <option>Zone C — Cold Storage</option>
            <option>Zone D — Hazmat</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-on-surface-variant">Low Stock Threshold (%)</label>
          <input
            type="number"
            defaultValue={20}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50"
          />
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
        <div>
          <label className="text-xs uppercase tracking-widest text-on-surface-variant">Current Password</label>
          <input type="password" placeholder="••••••••" className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-on-surface-variant">New Password</label>
          <input type="password" placeholder="••••••••" className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" />
        </div>
        <button className="mt-2 px-4 py-2 rounded-lg bg-error/10 text-error text-sm font-semibold hover:bg-error/20 transition-colors">
          Update Password
        </button>
      </Card>
    </div>
  );
}
