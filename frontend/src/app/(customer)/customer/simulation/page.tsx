"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/card";
import { quotesApi, shipmentsApi, financeApi } from "@/lib/services";
import { supabase } from "@/lib/supabase";
import { apiError } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Package, Truck, Receipt,
  CreditCard, Loader2, User, MapPin, BarChart3, Clock, Sparkles, ShieldCheck
} from "lucide-react";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("@/components/ui/LiveMap"), { ssr: false });

const STAGES = [
  { id: 1, label: "Register & Login", desc: "Customer signs up and logs into portal" },
  { id: 2, label: "Request Quote", desc: "Submit route, cargo and weight info" },
  { id: 3, label: "Quote Generated", desc: "Immediate price estimation" },
  { id: 4, label: "Book Shipment", desc: "Shipment created & Tracking ID generated" },
  { id: 5, label: "Assign Driver", desc: "Dispatcher links driver to shipment" },
  { id: 6, label: "Driver Receives Task", desc: "Task appears on driver dashboard" },
  { id: 7, label: "Driver Picks Shipment", desc: "Cargo loaded and departure updated" },
  { id: 8, label: "Driver Updates GPS", desc: "GPS coordinates send active telemetry" },
  { id: 9, label: "Delivered", desc: "Cargo arrives and marked delivered" },
  { id: 10, label: "Invoice Paid", desc: "Finance invoice settled by customer" },
  { id: 11, label: "Admin Views Reports", desc: "Completed workflow updates analytics" }
];

const formatDriverName = (name: string) => {
  if (!name) return "Unknown Driver";
  if (name.includes("@")) {
    if (name.startsWith("driver")) return "Marcus Johnson";
    return name.split("@")[0].charAt(0).toUpperCase() + name.split("@")[0].slice(1);
  }
  return name;
};

const POPULAR_LOCATIONS = [
  { name: "Singapore Port, SG", value: "Singapore Port, SG" },
  { name: "Rotterdam Gateway, NL", value: "Rotterdam Gateway, NL" },
  { name: "Shanghai Port, CN", value: "Shanghai Port, CN" },
  { name: "Tokyo Port, JP", value: "Tokyo Port, JP" },
  { name: "London Gateway, UK", value: "London Gateway, UK" },
  { name: "New York Port, US", value: "New York Port, US" },
  { name: "Sydney Port, AU", value: "Sydney Port, AU" },
  { name: "Mumbai Port, IN", value: "Mumbai Port, IN" },
  { name: "Hyderabad, IN", value: "Hyderabad, IN" },
  { name: "Kurnool, IN", value: "Kurnool, IN" },
  { name: "Zurich, CH (Landlocked)", value: "Zurich, CH" },
  { name: "Vienna, AT (Landlocked)", value: "Vienna, AT" }
];

export default function WorkflowSimulationPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [currentStage, setCurrentStage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Entities created during simulation
  const [quote, setQuote] = useState<any>(null);
  const [shipment, setShipment] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [driversList, setDriversList] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // Simulation inputs
  const [simForm, setSimForm] = useState({
    origin: "Singapore Port, SG",
    destination: "Rotterdam Gateway, NL",
    cargoType: "Electronics",
    weight: "3500",
    volume: "8.5",
    mode: "sea"
  });

  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const filteredOriginLocs = POPULAR_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(simForm.origin.toLowerCase())
  );
  const filteredDestLocs = POPULAR_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(simForm.destination.toLowerCase())
  );

  // Admin report summary for the last step
  const [reports, setReports] = useState<any>({ totalRevenue: 0, totalShipments: 0 });

  // Load active driver profiles for the simulation
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from("profiles").select("*").eq("role", "driver");
        if (data && data.length > 0) {
          setDriversList(data);
          setSelectedDriverId(data[0].id);
          setDriver(data[0]);
        } else {
          // Fallback static driver details if no driver exists
          const fallback = [
            { id: "bc1401f5-2cb5-44ba-b1d9-7cc962ed2159", name: "Marcus Johnson (driver@nexacargo.com)", role: "driver" },
            { id: "0f7341e7-5304-43e5-90eb-e935b89fb550", name: "Test Driver (drv_90671@nexacargo.com)", role: "driver" }
          ];
          setDriversList(fallback);
          setSelectedDriverId(fallback[0].id);
          setDriver(fallback[0]);
        }
      } catch {
        const fallback = [
          { id: "bc1401f5-2cb5-44ba-b1d9-7cc962ed2159", name: "Marcus Johnson (driver@nexacargo.com)", role: "driver" },
          { id: "0f7341e7-5304-43e5-90eb-e935b89fb550", name: "Test Driver (drv_90671@nexacargo.com)", role: "driver" }
        ];
        setDriversList(fallback);
        setSelectedDriverId(fallback[0].id);
        setDriver(fallback[0]);
      }
    })();
  }, []);

  const handleNext = () => {
    if (currentStage < STAGES.length) {
      setCurrentStage(prev => prev + 1);
    }
  };

  const resetDemo = () => {
    setCurrentStage(1);
    setQuote(null);
    setShipment(null);
    setDelivery(null);
    setInvoice(null);
    setPayment(null);
    setSimForm({
      origin: "Singapore Port, SG",
      destination: "Rotterdam Gateway, NL",
      cargoType: "Electronics",
      weight: "3500",
      volume: "8.5",
      mode: "sea"
    });
    toast.info("Simulation reset.");
  };

  const getSimBreakdown = () => {
    if (!quote) return null;
    const mode = (quote.mode || "sea").toLowerCase();
    const rates: Record<string, { base: number, per_kg: number, per_cbm: number }> = {
      air:  { base: 120.0, per_kg: 2.50, per_cbm: 90.0 },
      sea:  { base: 80.0,  per_kg: 0.40, per_cbm: 35.0 },
      road: { base: 60.0,  per_kg: 0.80, per_cbm: 50.0 }
    };
    const rate = rates[mode] || rates.sea;
    const base = rate.base;
    const perKg = (quote.weight || 0) * rate.per_kg;
    const perCbm = (quote.volume || 0) * rate.per_cbm;
    
    let total = base + perKg + perCbm;
    const cargoLower = (quote.cargo_type || "").toLowerCase();
    const isSpecial = cargoLower === "hazardous" || cargoLower === "perishable" || cargoLower === "fragile";
    if (isSpecial) {
      total *= 1.20;
    }
    
    return {
      base,
      perKg: Math.round(perKg * 100) / 100,
      perCbm: Math.round(perCbm * 100) / 100,
      surcharge: isSpecial ? Math.round((total - (base + perKg + perCbm)) * 100) / 100 : 0,
      total: Math.round(total * 100) / 100
    };
  };

  // Step 2: Request Quote
  const requestQuote = async () => {
    setLoading(true);
    try {
      // Create a quote request using standard endpoint
      const result = await quotesApi.create({
        origin: simForm.origin.trim(),
        destination: simForm.destination.trim(),
        mode: simForm.mode,
        cargo_type: simForm.cargoType,
        weight: Number(simForm.weight) || 3500,
        volume: Number(simForm.volume) || 8.5,
        notes: "Automated simulation quote request."
      });
      setQuote(result);
      toast.success("Quote requested successfully!");
      setCurrentStage(3); // Transition to Stage 3: Quote Generated
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Book Shipment (Generates Tracking ID and Invoice)
  const bookShipment = async () => {
    if (!quote) return;
    setLoading(true);
    try {
      const result = await shipmentsApi.create({
        quote_id: quote.id,
        origin: quote.origin,
        destination: quote.destination,
        mode: quote.mode,
        cargo_type: quote.cargo_type,
        weight: `${quote.weight} kg`,
        volume: `${quote.volume} m³`,
        description: "Standard container shipment containing electronics components.",
        incoterm: "CIF",
        eta: "Scheduled 14 days",
        value_amount: 75000,
        currency: "USD"
      });
      setShipment(result);
      toast.success("Shipment booked! Tracking ID generated.");

      // Find the invoice that was auto-created for this shipment
      // Wait 1.5 seconds for backend hooks to complete
      setTimeout(async () => {
        try {
          const invoicesList = await financeApi.invoices();
          const match = invoicesList.find((inv: any) => inv.shipment_id === result.id);
          if (match) setInvoice(match);
        } catch { /* ignore */ }
      }, 1500);

      setCurrentStage(5);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Admin/Dispatcher Assigns Driver
  const assignDriverAsAdmin = async () => {
    if (!shipment || !selectedDriverId) return;
    const targetDriver = driversList.find(d => d.id === selectedDriverId);
    if (!targetDriver) return;

    const displayName = formatDriverName(targetDriver.name);

    setLoading(true);
    try {
      const deliveryCode = `DLV-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data, error } = await supabase.from("deliveries").insert({
        delivery_code: deliveryCode,
        shipment_id: shipment.id,
        driver_id: targetDriver.id,
        status: "Pending",
        location: shipment.origin,
        progress: 0,
        eta: "12 days",
        lat: 1.3521,
        lng: 103.8198
      }).select().single();

      if (error) throw error;
      setDelivery(data);
      setDriver({ ...targetDriver, name: displayName });

      // Update shipment status to "In Transit"
      await supabase
        .from("shipments")
        .update({ status: "In Transit" })
        .eq("id", shipment.id);

      // Add status history
      await supabase.from("shipment_status_history").insert({
        shipment_id: shipment.id,
        status: "In Transit",
        note: `Admin/Dispatcher assigned driver ${displayName} to transport shipment.`,
        changed_by: user?.id
      });

      // Reload shipment state
      const updatedShipment = await shipmentsApi.get(shipment.id);
      setShipment(updatedShipment);

      toast.success(`Driver ${displayName} assigned successfully by Admin!`);
      setCurrentStage(6);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign driver.");
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Driver Picks Shipment
  const driverPickUp = async () => {
    if (!delivery || !shipment) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("deliveries")
        .update({ status: "Picked Up", progress: 15, location: "Malacca Strait" })
        .eq("id", delivery.id);
      if (error) throw error;

      await supabase.from("shipment_status_history").insert({
        shipment_id: shipment.id,
        status: "In Transit",
        note: "Driver picked up cargo. Shipment has departed origin port.",
        changed_by: driver.id
      });

      // Reload state
      const { data: updatedDel } = await supabase.from("deliveries").select("*").eq("id", delivery.id).single();
      setDelivery(updatedDel);

      toast.success("Shipment picked up by driver!");
      setCurrentStage(8);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed pick-up update.");
    } finally {
      setLoading(false);
    }
  };

  // Step 8: Driver Updates GPS
  const updateGPS = async () => {
    if (!delivery || !shipment) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("deliveries")
        .update({
          progress: 55,
          location: "Indian Ocean (Midway)",
          lat: 10.0,
          lng: 75.0
        })
        .eq("id", delivery.id);
      if (error) throw error;

      await supabase
        .from("shipments")
        .update({ lat: 10.0, lng: 75.0 })
        .eq("id", shipment.id);

      await supabase.from("shipment_status_history").insert({
        shipment_id: shipment.id,
        status: "In Transit",
        note: "GPS Telemetry: Vessel updated position in the Indian Ocean.",
        changed_by: driver.id
      });

      const { data: updatedDel } = await supabase.from("deliveries").select("*").eq("id", delivery.id).single();
      setDelivery(updatedDel);
      const updatedShipment = await shipmentsApi.get(shipment.id);
      setShipment(updatedShipment);

      toast.success("GPS Location updated mid-route!");
      setCurrentStage(9);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed GPS update.");
    } finally {
      setLoading(false);
    }
  };

  // Step 9: Driver Marks Delivered
  const markDelivered = async () => {
    if (!delivery || !shipment) return;
    setLoading(true);
    try {
      // Update delivery stop to Delivered
      const { error: delError } = await supabase
        .from("deliveries")
        .update({ status: "Delivered", progress: 100, location: shipment.destination, lat: 51.9244, lng: 4.4777 })
        .eq("id", delivery.id);
      if (delError) throw delError;

      // Update shipment to Delivered
      await supabase
        .from("shipments")
        .update({ status: "Delivered", lat: 51.9244, lng: 4.4777 })
        .eq("id", shipment.id);

      await supabase.from("shipment_status_history").insert({
        shipment_id: shipment.id,
        status: "Delivered",
        note: "Shipment arrived at destination port. Handover complete.",
        changed_by: driver.id
      });

      const { data: updatedDel } = await supabase.from("deliveries").select("*").eq("id", delivery.id).single();
      setDelivery(updatedDel);
      const updatedShipment = await shipmentsApi.get(shipment.id);
      setShipment(updatedShipment);

      // Verify or pull invoice
      try {
        const invoicesList = await financeApi.invoices();
        const match = invoicesList.find((inv: any) => inv.shipment_id === shipment.id);
        if (match) setInvoice(match);
      } catch { /* ignore */ }

      toast.success("Vessel arrived! Shipment marked as DELIVERED.");
      setCurrentStage(10);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed delivery status update.");
    } finally {
      setLoading(false);
    }
  };

  // Step 10: Invoice Paid
  const payInvoice = async () => {
    if (!invoice || !shipment) return;
    setLoading(true);
    try {
      // Simulate payment transaction
      const { data: payRecord, error: payError } = await supabase.from("payments").insert({
        payment_ref: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        invoice_id: invoice.id,
        customer_id: user?.id,
        amount: invoice.total || invoice.amount,
        currency: "USD",
        method: "card",
        status: "completed"
      }).select().single();

      if (payError) throw payError;
      setPayment(payRecord);

      // Mark invoice as paid
      await supabase
        .from("invoices")
        .update({ status: "Paid" })
        .eq("id", invoice.id);

      const { data: updatedInv } = await supabase.from("invoices").select("*").eq("id", invoice.id).single();
      setInvoice(updatedInv);

      // Fetch analytics totals to show admin updates
      try {
        const rev = await financeApi.revenue();
        const allShipments = await shipmentsApi.list();
        setReports({
          totalRevenue: rev || invoice.total,
          totalShipments: allShipments?.length || 1
        });
      } catch {
        setReports({ totalRevenue: invoice.total, totalShipments: 1 });
      }

      toast.success("Payment completed! Invoice marked as PAID.");
      setCurrentStage(11);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process payment.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-surface-container border text-sm text-on-surface border-white/10";

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/customer" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
            <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
            <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-tertiary font-bold">Simulation Center</p>
          <h1 className="text-3xl font-bold text-on-surface mt-1">End-to-End Workflow Simulator</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Experience and trigger the complete logistics pipeline from order placement to payment settlement.
          </p>
        </div>
        <button
          onClick={resetDemo}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-on-surface hover:bg-white/10 transition-colors"
        >
          Reset Simulation
        </button>
      </div>

      {/* Timeline Steps Tracker */}
      <Card className="p-5 overflow-x-auto scrollbar-thin">
        <div className="flex gap-4 min-w-[900px] justify-between relative">
          {STAGES.map((s) => {
            const isDone = s.id < currentStage;
            const isActive = s.id === currentStage;
            return (
              <div key={s.id} className="flex-1 flex flex-col items-center text-center relative z-10">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                  isDone
                    ? "bg-green-400 border-green-400 text-white"
                    : isActive
                    ? "bg-tertiary border-tertiary text-white shadow-[0_0_12px_rgba(66,165,245,0.4)]"
                    : "bg-surface-container border-white/10 text-on-surface-variant"
                }`}>
                  {isDone ? "✓" : s.id}
                </span>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mt-2 ${isActive ? "text-tertiary" : isDone ? "text-green-400" : "text-on-surface-variant"}`}>
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Simulator Action Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 border border-white/5 bg-white/[0.01] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-tertiary" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-tertiary" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface">
                  Stage {currentStage}: {STAGES[currentStage - 1].label}
                </h2>
              </div>
              <span className="text-xs text-on-surface-variant italic">
                {STAGES[currentStage - 1].desc}
              </span>
            </div>

            {/* Stage Action Forms */}
            <div className="py-4">
              {currentStage === 1 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-400/5 border border-green-400/20 text-green-400 text-sm flex gap-3 items-center">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <p className="font-semibold">Registered & Logged in as: {user?.name} ({user?.email})</p>
                  </div>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] transition-colors"
                  >
                    Proceed to Quote Request <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {currentStage === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-on-surface-variant">
                    Submit cargo parameters to obtain an immediate price quote calculated by our logistics algorithm.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    <div className="space-y-1 relative">
                      <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold">Origin Port / City</label>
                      <input 
                        type="text" 
                        value={simForm.origin} 
                        onChange={(e) => {
                          setSimForm({ ...simForm, origin: e.target.value });
                          setShowOriginSuggestions(true);
                        }}
                        onFocus={() => setShowOriginSuggestions(true)}
                        onBlur={() => setShowOriginSuggestions(false)}
                        className={inputCls} 
                        placeholder="e.g. Singapore Port, SG"
                      />
                      {showOriginSuggestions && filteredOriginLocs.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#16223f] shadow-xl z-50 divide-y divide-white/5">
                          {filteredOriginLocs.map((loc) => (
                            <div
                              key={loc.name}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSimForm(p => ({ ...p, origin: loc.value }));
                                setShowOriginSuggestions(false);
                              }}
                              className="px-3 py-2 text-xs text-on-surface hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              {loc.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 relative">
                      <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold">Destination Port / City</label>
                      <input 
                        type="text" 
                        value={simForm.destination} 
                        onChange={(e) => {
                          setSimForm({ ...simForm, destination: e.target.value });
                          setShowDestSuggestions(true);
                        }}
                        onFocus={() => setShowDestSuggestions(true)}
                        onBlur={() => setShowDestSuggestions(false)}
                        className={inputCls} 
                        placeholder="e.g. Rotterdam Gateway, NL"
                      />
                      {showDestSuggestions && filteredDestLocs.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#16223f] shadow-xl z-50 divide-y divide-white/5">
                          {filteredDestLocs.map((loc) => (
                            <div
                              key={loc.name}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSimForm(p => ({ ...p, destination: loc.value }));
                                setShowDestSuggestions(false);
                              }}
                              className="px-3 py-2 text-xs text-on-surface hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              {loc.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold">Cargo Type</label>
                      <input 
                        type="text" 
                        value={simForm.cargoType} 
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                          setSimForm({ ...simForm, cargoType: v });
                        }}
                        className={inputCls} 
                        placeholder="e.g. Electronics"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold">Shipping Mode</label>
                      <select 
                        value={simForm.mode} 
                        onChange={(e) => setSimForm({ ...simForm, mode: e.target.value })}
                        className={inputCls}
                      >
                        <option value="sea">Sea Freight</option>
                        <option value="air">Air Freight</option>
                        <option value="road">Road Freight</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold">Weight (kg)</label>
                      <input 
                        type="number" 
                        value={simForm.weight} 
                        onChange={(e) => setSimForm({ ...simForm, weight: e.target.value })}
                        className={inputCls} 
                        placeholder="e.g. 3500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold">Volume (m³)</label>
                      <input 
                        type="number" 
                        value={simForm.volume} 
                        onChange={(e) => setSimForm({ ...simForm, volume: e.target.value })}
                        className={inputCls} 
                        placeholder="e.g. 8.5"
                      />
                    </div>
                  </div>
                  <button
                    onClick={requestQuote}
                    disabled={loading || !simForm.origin.trim() || !simForm.destination.trim() || !simForm.weight.trim()}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl bg-tertiary text-white font-bold text-sm hover:bg-tertiary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Freight Quote"} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {currentStage === 3 && quote && (() => {
                const breakdown = getSimBreakdown();
                return (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-green-400/5 border border-green-400/20 text-green-400 text-sm">
                      <p className="font-bold">Quote Generated: {quote.quote_ref}</p>
                      <p className="text-xs mt-1 text-green-400/80">Estimated cargo transport pricing complete.</p>
                    </div>
                    {breakdown && (
                      <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
                        <div className="flex justify-between"><span>Base Rate ({quote.mode}):</span><span>${breakdown.base.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Weight Cost ({quote.weight} kg):</span><span>${breakdown.perKg.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Volume Cost ({quote.volume || 0} m³):</span><span>${breakdown.perCbm.toFixed(2)}</span></div>
                        {breakdown.surcharge > 0 && (
                          <div className="flex justify-between text-amber-400 font-bold"><span>Special Cargo Surcharge (20%):</span><span>${breakdown.surcharge.toFixed(2)}</span></div>
                        )}
                        <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-bold text-tertiary">
                          <span>Total Estimated Cost:</span>
                          <span>${breakdown.total.toFixed(2)} USD</span>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={bookShipment}
                      disabled={loading}
                      className="flex items-center gap-2 py-3 px-6 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] transition-colors"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book Shipment & Generate Tracking ID"} <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })()}

              {currentStage === 4 && shipment && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-400/5 border border-green-400/20 text-green-400 text-sm">
                    <p className="font-bold">Tracking ID Generated: {shipment.tracking_id}</p>
                    <p className="text-xs text-green-400/80 mt-1">Status: {shipment.status}</p>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Your cargo is now scheduled for pickup and listed in the logistics dashboard. An invoice has been automatically generated in pending state.
                  </p>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl bg-tertiary text-white font-bold text-sm hover:bg-tertiary/90 transition-colors"
                  >
                    Proceed to Driver Assignment <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {currentStage === 5 && (
                <div className="space-y-4">
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Assign a driver to transport this shipment. This represents the administrative task performed by the <strong>Logistics Dispatcher / Admin</strong>.
                  </p>
                  
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                    <div className="text-xs space-y-1">
                      <div>Active Shipment Tracking ID: <span className="font-mono text-tertiary font-bold">{shipment?.tracking_id}</span></div>
                      <div>Route: <span className="font-semibold text-on-surface">{shipment?.origin} → {shipment?.destination}</span></div>
                    </div>

                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                      <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold">Select Driver (Admin Action)</label>
                      <select
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-white/10 text-xs text-on-surface focus:outline-none focus:border-tertiary/50"
                      >
                        {driversList.map((d: any) => (
                          <option key={d.id} value={d.id}>
                            {formatDriverName(d.name)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={assignDriverAsAdmin}
                    disabled={loading || !selectedDriverId}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] text-[#0B1F3A] font-bold text-sm transition-colors shadow-[0_4px_16px_rgba(0,194,255,0.2)] active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#0B1F3A]" /> Assigning...
                      </>
                    ) : (
                      <>
                        Assign Selected Driver <ArrowRight className="h-4 w-4 text-[#0B1F3A]" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {currentStage === 6 && delivery && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-400/5 border border-green-400/20 text-green-400 text-sm">
                    <p className="font-bold">Driver Assigned: {driver.name}</p>
                    <p className="text-xs text-green-400/80 mt-1">Delivery task code: {delivery.delivery_code}</p>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    The task has been registered on the driver portal. The driver is preparing to pick up the cargo.
                  </p>
                  <button
                    onClick={driverPickUp}
                    disabled={loading}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl bg-tertiary text-white font-bold text-sm hover:bg-tertiary/90 transition-colors"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simulate Driver Cargo Pick-Up"} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {currentStage === 7 && delivery && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-400/5 border border-green-400/20 text-green-400 text-sm">
                    <p className="font-bold">Cargo Picked Up & In Transit</p>
                    <p className="text-xs text-green-400/80 mt-1">Vessel position: {delivery.location}</p>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    The driver/vessel has departed from the origin port and is moving towards the destination.
                  </p>
                  <button
                    onClick={updateGPS}
                    disabled={loading}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl bg-tertiary text-white font-bold text-sm hover:bg-tertiary/90 transition-colors"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simulate Driver GPS Update"} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {currentStage === 8 && delivery && (
                <div className="space-y-4">
                  <p className="text-sm text-on-surface-variant">
                    The driver updates their GPS coordinates midway. The customer can track the shipment live on their map.
                  </p>
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-xs space-y-1">
                    <div>Current Location: <span className="font-bold text-tertiary">{delivery.location}</span></div>
                    <div>Coordinates: <span className="font-mono text-on-surface-variant">{delivery.lat}, {delivery.lng}</span></div>
                    <div>Transit Progress: <span className="font-semibold text-on-surface">{delivery.progress}% completed</span></div>
                  </div>
                  <button
                    onClick={markDelivered}
                    disabled={loading}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl bg-tertiary text-white font-bold text-sm hover:bg-tertiary/90 transition-colors"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simulate Port Arrival & Delivery"} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {currentStage === 9 && shipment && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-400/5 border border-green-400/20 text-green-400 text-sm">
                    <p className="font-bold">Shipment Status: DELIVERED</p>
                    <p className="text-xs text-green-400/80 mt-1">Cargo delivered to: {shipment.destination}</p>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Cargo has arrived safely at destination gateway. Custom clearance handles handover. Invoice is now ready for customer payment.
                  </p>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl bg-tertiary text-white font-bold text-sm hover:bg-tertiary/90 transition-colors"
                  >
                    Review Invoice & Pay <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {currentStage === 10 && invoice && (
                <div className="space-y-4">
                  <p className="text-sm text-on-surface-variant">
                    Review billing records for tracking ID <span className="font-mono text-tertiary font-bold">{shipment.tracking_id}</span>.
                  </p>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between"><span>Invoice Ref:</span><span className="font-mono text-on-surface font-semibold">{invoice.invoice_no}</span></div>
                    <div className="flex justify-between"><span>Amount due:</span><span className="font-mono text-tertiary font-bold">${Number(invoice.total || invoice.amount).toLocaleString()} USD</span></div>
                    <div className="flex justify-between"><span>Status:</span><span className="rounded-full px-2 py-0.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold uppercase text-[9px]">{invoice.status}</span></div>
                  </div>
                  <button
                    onClick={payInvoice}
                    disabled={loading}
                    className="flex items-center gap-2 py-4 px-6 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors shadow-[0_0_20px_rgba(74,222,128,0.3)]"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CreditCard className="h-4 w-4" /> Pay Invoice Now</>}
                  </button>
                </div>
              )}

              {currentStage === 11 && (
                <div className="space-y-5">
                  <div className="p-5 rounded-xl border border-green-400/20 bg-green-400/5 text-green-400 text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" />
                      <p className="font-bold">Workflow Completed Successfully!</p>
                    </div>
                    <p className="text-xs text-green-400/80 leading-relaxed">
                      All databases have been updated. The customer has paid, the shipment status is marked Delivered, and revenue reports have been updated.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 border border-white/5 bg-white/[0.01]">
                      <BarChart3 className="h-5 w-5 text-tertiary mb-2" />
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest">Admin Revenue</p>
                      <p className="text-lg font-black text-tertiary font-mono mt-1">
                        ${reports.totalRevenue ? Number(reports.totalRevenue).toLocaleString() : "1,747"} USD
                      </p>
                    </Card>
                    <Card className="p-4 border border-white/5 bg-white/[0.01]">
                      <Package className="h-5 w-5 text-secondary mb-2" />
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest">Admin Shipment Count</p>
                      <p className="text-lg font-black text-on-surface font-mono mt-1">
                        {reports.totalShipments || 6} Shipments
                      </p>
                    </Card>
                  </div>

                  <button
                    onClick={resetDemo}
                    className="w-full py-3.5 rounded-xl bg-tertiary text-white font-bold text-sm hover:bg-tertiary/90 transition-colors shadow-[0_4px_16px_rgba(66,165,245,0.25)]"
                  >
                    Restart Workflow Simulation
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* GPS Map (shows up when shipment departs) */}
          {delivery && currentStage >= 7 && (
            <Card className="p-4 space-y-2 border border-white/5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-bold tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-tertiary" /> Live GPS tracking — {shipment?.tracking_id}
                </h3>
                <span className="text-[10px] bg-[#00C2FF]/10 text-[#00C2FF] px-2 py-0.5 rounded-full font-bold uppercase">
                  {delivery.location}
                </span>
              </div>
              <LiveMap lat={delivery.lat ?? 1.3521} lng={delivery.lng ?? 103.8198} label={delivery.location} height={250} />
            </Card>
          )}
        </div>

        {/* Database Inspectors (Live Side-Panel) */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Database State Inspectors</h2>

          {/* Quote Table */}
          <Card className="p-4 border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00C2FF] flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Quotes DB Table
            </h3>
            {quote ? (
              <div className="text-[11px] font-mono space-y-1 text-on-surface-variant">
                <div>id: <span className="text-on-surface">{quote.id.slice(0, 8)}...</span></div>
                <div>ref: <span className="text-on-surface">{quote.quote_ref}</span></div>
                <div>route: <span className="text-on-surface">{quote.origin.split(" ")[0]} → {quote.destination.split(" ")[0]}</span></div>
                <div>amount: <span className="text-tertiary">${quote.amount}</span></div>
                <div>status: <span className="text-green-400 font-bold uppercase text-[9px]">{quote.status}</span></div>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic">No active quote row.</p>
            )}
          </Card>

          {/* Shipment Table */}
          <Card className="p-4 border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00C2FF] flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" /> Shipments DB Table
            </h3>
            {shipment ? (
              <div className="text-[11px] font-mono space-y-1 text-on-surface-variant">
                <div>id: <span className="text-on-surface">{shipment.id.slice(0, 8)}...</span></div>
                <div>tracking_id: <span className="text-on-surface font-semibold">{shipment.tracking_id}</span></div>
                <div>status: <span className="text-tertiary font-bold">{shipment.status}</span></div>
                {shipment.lat && <div>lat/lng: <span className="text-on-surface">{shipment.lat}, {shipment.lng}</span></div>}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic">No active shipment row.</p>
            )}
          </Card>

          {/* Deliveries Table */}
          <Card className="p-4 border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00C2FF] flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" /> Deliveries DB Table
            </h3>
            {delivery ? (
              <div className="text-[11px] font-mono space-y-1 text-on-surface-variant">
                <div>id: <span className="text-on-surface">{delivery.id.slice(0, 8)}...</span></div>
                <div>code: <span className="text-on-surface">{delivery.delivery_code}</span></div>
                <div>driver: <span className="text-on-surface font-semibold">{delivery.driver || formatDriverName(driversList.find(d => d.id === delivery.driver_id)?.name || "Assigned Driver")}</span></div>
                <div>status: <span className="text-secondary font-semibold">{delivery.status}</span></div>
                <div>progress: <span className="text-on-surface">{delivery.progress}%</span></div>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic">No active delivery stop row.</p>
            )}
          </Card>

          {/* Invoice Table */}
          <Card className="p-4 border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00C2FF] flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5" /> Invoices DB Table
            </h3>
            {invoice ? (
              <div className="text-[11px] font-mono space-y-1 text-on-surface-variant">
                <div>id: <span className="text-on-surface">{invoice.id.slice(0, 8)}...</span></div>
                <div>invoice_no: <span className="text-on-surface">{invoice.invoice_no}</span></div>
                <div>total: <span className="text-tertiary">${invoice.total}</span></div>
                <div>status: <span className="text-amber-400 font-bold">{invoice.status}</span></div>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic">No active invoice row.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
