"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Truck, User, Package, MapPin, CheckCircle2,
  Loader2, RefreshCw, ArrowRight, AlertTriangle, Search,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { shipmentsApi, dispatchApi } from "@/lib/services";
import { apiError } from "@/lib/api";

interface Shipment {
  id: string;
  tracking_id: string;
  origin: string;
  destination: string;
  status: string;
  mode: string;
  driver_id?: string;
}

interface Driver {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
}

const STATUS_STYLES: Record<string, string> = {
  "Awaiting Dispatch": "text-on-surface-variant bg-white/5",
  "In Transit": "text-tertiary bg-tertiary/10",
  "Delivered": "text-green-400 bg-green-400/10",
  "Delayed": "text-error bg-error/10",
  "Customs Hold": "text-amber-400 bg-amber-400/10",
};

const DRIVER_STATUS_STYLES: Record<string, string> = {
  active: "text-green-400 bg-green-400/10",
  on_duty: "text-tertiary bg-tertiary/10",
  on_trip: "text-amber-400 bg-amber-400/10",
  off_duty: "text-on-surface-variant bg-white/5",
};

export default function DispatchPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [shipmentsData, driversData] = await Promise.all([
        shipmentsApi.list(),
        dispatchApi.availableDrivers(),
      ]);
      setShipments((shipmentsData ?? []) as Shipment[]);
      setDrivers((driversData ?? []) as Driver[]);
    } catch (err) {
      setError(apiError(err, "Failed to load data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unassignedShipments = shipments.filter(
    (s) => s.status === "Awaiting Dispatch" || !s.driver_id
  );

  const availableDrivers = drivers.filter(
    (d) => d.status === "active" || d.status === "on_duty"
  );

  const filteredShipments = searchQuery
    ? unassignedShipments.filter(
        (s) =>
          s.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.destination.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : unassignedShipments;

  const handleAssign = async () => {
    if (!selectedShipment || !selectedDriver) {
      setError("Please select both a shipment and a driver");
      return;
    }

    const shipment = shipments.find((s) => s.id === selectedShipment);
    const driver = drivers.find((d) => d.id === selectedDriver);

    if (!shipment || !driver) {
      setError("Invalid selection");
      return;
    }

    setAssigning(selectedShipment);
    setError(null);
    setSuccess(null);

    try {
      await dispatchApi.assignDriver({
        shipment_id: selectedShipment,
        driver_id: selectedDriver,
        eta: "5 days",
      });

      setSuccess(`Driver ${driver.name} assigned to shipment ${shipment.tracking_id}`);
      setSelectedShipment("");
      setSelectedDriver("");
      await loadData();
    } catch (err) {
      setError(apiError(err, "Failed to assign driver"));
    } finally {
      setAssigning(null);
    }
  };

  const handleQuickAssign = async (shipmentId: string, driverId: string) => {
    const shipment = shipments.find((s) => s.id === shipmentId);
    const driver = drivers.find((d) => d.id === driverId);

    if (!shipment || !driver) return;

    setAssigning(shipmentId);
    setError(null);
    setSuccess(null);

    try {
      await dispatchApi.assignDriver({
        shipment_id: shipmentId,
        driver_id: driverId,
        eta: "5 days",
      });

      setSuccess(`Driver ${driver.name} assigned to shipment ${shipment.tracking_id}`);
      await loadData();
    } catch (err) {
      setError(apiError(err, "Failed to assign driver"));
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]"
          >
            <ArrowRight className="h-4 w-4 text-[#0B1F3A] rotate-180" />
            <span className="text-sm font-bold text-[#0B1F3A]">Back to Admin</span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-tertiary">Admin Portal</p>
          <h1 className="text-3xl font-bold text-on-surface mt-1">Dispatch Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Assign drivers to shipments and manage delivery operations
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-on-surface-variant text-xs font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-error/40 bg-error/10 text-error"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-green-400/40 bg-green-400/10 text-green-400"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Unassigned", value: unassignedShipments.length, icon: Package, color: "text-amber-400 bg-amber-400/10" },
          { label: "Available Drivers", value: availableDrivers.length, icon: User, color: "text-green-400 bg-green-400/10" },
          { label: "Total Shipments", value: shipments.length, icon: Truck, color: "text-tertiary bg-tertiary/10" },
          { label: "Active Drivers", value: drivers.filter((d) => d.status === "on_trip").length, icon: MapPin, color: "text-secondary bg-secondary/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5 flex items-center gap-4">
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-2xl font-bold text-on-surface">{loading ? "—" : value}</p>
              <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-on-surface">Assign Driver to Shipment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Select Shipment</label>
            <div className="mt-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search shipments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50"
              />
            </div>
            <select
              value={selectedShipment}
              onChange={(e) => setSelectedShipment(e.target.value)}
              className="mt-2 w-full px-3 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50"
            >
              <option value="">-- Select Shipment --</option>
              {filteredShipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tracking_id} ({s.origin} → {s.destination})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Select Driver</label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50"
            >
              <option value="">-- Select Driver --</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.status})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAssign}
              disabled={assigning !== null || !selectedShipment || !selectedDriver}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-tertiary/20 text-tertiary text-sm font-semibold hover:bg-tertiary/30 transition-colors disabled:opacity-50"
            >
              {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Truck className="h-4 w-4" /> Assign Driver</>}
            </button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-on-surface">Unassigned Shipments</h2>
        </div>
        {loading ? (
          <div className="p-6 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-tertiary" />
          </div>
        ) : filteredShipments.length === 0 ? (
          <p className="p-6 text-sm text-on-surface-variant text-center">No unassigned shipments found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant bg-white/[0.02]">
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Quick Assign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 font-mono text-tertiary">{shipment.tracking_id}</td>
                  <td className="px-4 py-3">{shipment.origin} → {shipment.destination}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[shipment.status] || "text-on-surface-variant bg-white/5"}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {availableDrivers.length > 0 && (
                      <button
                        onClick={() => handleQuickAssign(shipment.id, availableDrivers[0].id)}
                        disabled={assigning === shipment.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-tertiary/10 text-tertiary text-xs font-semibold hover:bg-tertiary/20 transition-colors disabled:opacity-50"
                      >
                        {assigning === shipment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                        Assign to {availableDrivers[0]?.name?.split(" ")[0] || "Driver"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-on-surface">Available Drivers</h2>
        </div>
        {loading ? (
          <div className="p-6 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-tertiary" />
          </div>
        ) : availableDrivers.length === 0 ? (
          <p className="p-6 text-sm text-on-surface-variant text-center">No available drivers found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant bg-white/[0.02]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {availableDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 text-on-surface font-medium">{driver.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{driver.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${DRIVER_STATUS_STYLES[driver.status] || "text-on-surface-variant bg-white/5"}`}>
                      {driver.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
