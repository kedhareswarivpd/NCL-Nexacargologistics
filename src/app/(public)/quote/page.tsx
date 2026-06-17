"use client";

import { useState } from "react";
import { MapPin, Flag, ArrowRight, Zap, Clock, Leaf, CheckCircle, Plane, Ship, Truck, Rocket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function FreightQuoteCalculatorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [service, setService] = useState("Standard");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState({
    origin: "",
    destination: "",
    cargoType: "General Cargo",
    weight: 0,
    volume: 0,
  });

  const set = (key: keyof typeof fields, value: string | number) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleNext = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getBaseCost = () => {
    if (service === "Express") return 1200;
    if (service === "Standard") return 720;
    return 450;
  };

  const weightPremium = fields.weight * 0.85;
  const total = getBaseCost() + weightPremium + 42;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { error: err } = await supabase.from("quotes").insert({
        origin:      fields.origin || "Not specified",
        destination: fields.destination || "Not specified",
        cargo_type:  fields.cargoType,
        weight:      fields.weight,
        volume:      fields.volume || null,
        service,
        total,
        status:      "pending",
      });
      if (err) throw new Error(err.message);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit quote.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CheckCircle className="w-16 h-16 text-tertiary mb-6" />
        <h2 className="text-3xl font-bold text-on-surface mb-3">Quote Submitted!</h2>
        <p className="text-on-surface-variant max-w-md">
          Your freight quote has been received. Our team will review it and get back to you shortly.
        </p>
        <button
          onClick={() => { setSubmitted(false); setCurrentStep(1); setFields({ origin: "", destination: "", cargoType: "General Cargo", weight: 0, volume: 0 }); setService("Standard"); }}
          className="mt-8 px-8 h-12 bg-[#1565C0] text-[#E8F0FE] rounded-lg font-semibold hover:bg-[#42A5F5] transition-all"
        >
          Submit Another Quote
        </button>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <header className="mb-16 text-center md:text-left">
        <h1 className="font-display-lg text-5xl font-bold text-on-surface mb-4">
          Freight Quote <span className="text-tertiary">Calculator</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl">
          Get instant, transparent pricing for your global logistics needs. Accurate estimates across air, sea, and land networks.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="glass rounded-xl p-8 border border-white/10">
            {/* Stepper */}
            <div className="flex items-center justify-between mb-12 px-6">
              {[["1", "Route"], ["2", "Cargo"], ["3", "Service"]].map(([num, label], i) => (
                <div key={num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all", currentStep >= +num ? "text-tertiary border-tertiary" : "border-white/20 text-on-surface-variant")}>{num}</div>
                    <span className={cn("font-label-caps text-xs tracking-widest uppercase", currentStep >= +num ? "text-tertiary font-bold" : "text-on-surface-variant")}>{label}</span>
                  </div>
                  {i < 2 && <div className="flex-grow h-px bg-white/10 mx-6" />}
                </div>
              ))}
            </div>

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant ml-2">Origin City/Port</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary w-5 h-5" />
                      <input value={fields.origin} onChange={e => set("origin", e.target.value)} className="w-full h-14 pl-12 pr-6 rounded-lg bg-black/20 border border-white/10 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface" placeholder="e.g. Shanghai, China" type="text" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant ml-2">Destination City/Port</label>
                    <div className="relative">
                      <Flag className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary w-5 h-5" />
                      <input value={fields.destination} onChange={e => set("destination", e.target.value)} className="w-full h-14 pl-12 pr-6 rounded-lg bg-black/20 border border-white/10 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface" placeholder="e.g. Los Angeles, USA" type="text" />
                    </div>
                  </div>
                </div>
                <div className="pt-6 flex justify-end">
                  <button onClick={() => handleNext(2)} className="px-8 h-14 bg-[#1565C0] text-[#E8F0FE] rounded-lg font-title-md text-lg hover:bg-[#42A5F5] transition-all flex items-center gap-2 shadow-lg">
                    Next Step <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant ml-2">Cargo Type</label>
                    <select value={fields.cargoType} onChange={e => set("cargoType", e.target.value)} className="w-full h-14 px-6 rounded-lg bg-black/20 border border-white/10 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface appearance-none">
                      <option className="bg-surface">General Cargo</option>
                      <option className="bg-surface">Hazardous Materials</option>
                      <option className="bg-surface">Perishables</option>
                      <option className="bg-surface">Oversized/Project</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant ml-2">Weight (KG)</label>
                    <input value={fields.weight || ""} onChange={e => set("weight", parseFloat(e.target.value) || 0)} className="w-full h-14 px-6 rounded-lg bg-black/20 border border-white/10 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant ml-2">Volume (m³)</label>
                    <input value={fields.volume || ""} onChange={e => set("volume", parseFloat(e.target.value) || 0)} className="w-full h-14 px-6 rounded-lg bg-black/20 border border-white/10 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface" placeholder="0" type="number" />
                  </div>
                </div>
                <div className="pt-6 flex justify-between">
                  <button onClick={() => handleNext(1)} className="px-8 h-14 glass text-on-surface rounded-lg font-title-md text-lg hover:bg-white/10 transition-all border border-white/10">Back</button>
                  <button onClick={() => handleNext(3)} className="px-8 h-14 bg-[#1565C0] text-[#E8F0FE] rounded-lg font-title-md text-lg hover:bg-[#42A5F5] transition-all flex items-center gap-2 shadow-lg">
                    Service Options <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { key: "Express", icon: Zap, time: "2-4 Business Days" },
                    { key: "Standard", icon: Clock, time: "7-12 Business Days" },
                    { key: "Eco", icon: Leaf, label: "Eco-Freight", time: "20-35 Business Days" },
                  ].map(({ key, icon: Icon, label, time }) => (
                    <button key={key} onClick={() => setService(key)}
                      className={cn("group glass p-6 rounded-xl text-left transition-all border-2 relative overflow-hidden", service === key ? "border-tertiary bg-white/5" : "border-transparent hover:border-tertiary/50")}
                    >
                      <Icon className="text-tertiary mb-2 w-8 h-8" />
                      <h4 className="font-title-md text-lg font-semibold text-on-surface">{label ?? key}</h4>
                      <p className="font-body-sm text-sm text-on-surface-variant mt-1">{time}</p>
                      <div className={cn("mt-6 text-tertiary font-label-caps text-xs tracking-widest uppercase transition-opacity flex items-center gap-2 font-bold", service === key ? "opacity-100" : "opacity-0")}>
                        <CheckCircle className="w-4 h-4" /> Selected
                      </div>
                    </button>
                  ))}
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="pt-6 flex justify-between">
                  <button onClick={() => handleNext(2)} className="px-8 h-14 glass text-on-surface rounded-lg font-title-md text-lg hover:bg-white/10 transition-all border border-white/10">Back</button>
                  <button onClick={handleSubmit} disabled={submitting}
                    className="px-8 h-14 bg-tertiary text-[#001d34] rounded-lg font-title-md text-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(153,203,255,0.4)] font-bold flex items-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : "Finalize Quote"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comparison Matrix */}
          <div className="glass rounded-xl p-8 overflow-hidden relative border border-white/10">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="font-title-md text-xl font-semibold text-on-surface">Comparison Matrix</h3>
                <p className="font-body-sm text-sm text-on-surface-variant">Modality performance benchmarks</p>
              </div>
              <span className="font-label-caps text-[10px] tracking-widest uppercase text-tertiary bg-tertiary/10 px-3 py-1.5 rounded font-bold">Live Data</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 font-label-caps text-[10px] tracking-widest uppercase text-on-surface-variant border-b border-white/10">
                  <tr>
                    <th className="p-6 font-semibold">Transport Mode</th>
                    <th className="p-6 font-semibold">Est. Price</th>
                    <th className="p-6 font-semibold">Lead Time</th>
                    <th className="p-6 font-semibold">CO2 Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-sm">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-6 flex items-center gap-3 text-on-surface font-semibold font-sans"><Plane className="text-secondary w-5 h-5" /> Air Freight</td>
                    <td className="p-6 font-bold text-on-surface">${(total * 2.1).toFixed(2)}</td>
                    <td className="p-6 font-sans text-on-surface-variant">3 - 5 Days</td>
                    <td className="p-6 font-sans"><span className="w-2.5 h-2.5 rounded-full bg-error inline-block mr-3 shadow-[0_0_8px_rgba(255,180,171,0.5)]"></span> High</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors bg-white/5">
                    <td className="p-6 flex items-center gap-3 text-on-surface font-semibold font-sans"><Ship className="text-secondary w-5 h-5" /> Ocean Freight</td>
                    <td className="p-6 font-bold text-on-surface">${(total * 0.4).toFixed(2)}</td>
                    <td className="p-6 font-sans text-on-surface-variant">28 - 35 Days</td>
                    <td className="p-6 font-sans"><span className="w-2.5 h-2.5 rounded-full bg-tertiary inline-block mr-3 shadow-[0_0_8px_rgba(153,203,255,0.5)]"></span> Low</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-6 flex items-center gap-3 text-on-surface font-semibold font-sans"><Truck className="text-secondary w-5 h-5" /> Road Freight</td>
                    <td className="p-6 font-bold text-on-surface">${(total * 0.85).toFixed(2)}</td>
                    <td className="p-6 font-sans text-on-surface-variant">10 - 14 Days</td>
                    <td className="p-6 font-sans"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block mr-3"></span> Medium</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Cost Estimate */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-8">
            <div className="glass rounded-xl p-8 border border-tertiary/30 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-tertiary/10 blur-[80px] rounded-full pointer-events-none"></div>
              <h3 className="font-label-caps text-[10px] tracking-widest uppercase text-on-surface-variant mb-6 font-bold">Current Estimate</h3>
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-on-surface-variant font-display-lg text-4xl">$</span>
                  <span className="font-display-lg text-5xl font-bold text-on-surface tracking-tight">
                    {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="font-body-sm text-sm text-on-surface-variant mt-3">Including fuel surcharge and terminal fees.</p>
              </div>
              <div className="space-y-4 mb-10 border-t border-white/10 pt-8">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Base Rate</span>
                  <span className="text-on-surface font-mono font-bold">${getBaseCost().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Weight Premium</span>
                  <span className="text-on-surface font-mono font-bold">${weightPremium.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Insurance (Est.)</span>
                  <span className="text-on-surface font-mono font-bold">$42.00</span>
                </div>
              </div>
              <button onClick={currentStep === 3 ? handleSubmit : () => handleNext(3)} disabled={submitting}
                className="w-full h-16 bg-[#1565C0] text-[#E8F0FE] rounded-lg font-title-md text-lg hover:bg-[#42A5F5] transition-all flex items-center justify-center gap-3 group shadow-lg font-bold disabled:opacity-60"
              >
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : <>{currentStep === 3 ? "Submit Quote" : "Ship Now"}<Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
              </button>
              <p className="text-center font-label-caps text-[10px] tracking-widest uppercase text-on-surface-variant mt-6">Requires NexaCargo Account</p>
            </div>

            <div className="glass rounded-xl aspect-video relative overflow-hidden group border border-white/10">
              <img alt="Logistics Map" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 grayscale-[0.3]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxhQRNayeSKC78ha9goyoyLhzynb69dsJuWfUbPw8JUPatHX4wgQBRgQYG9as1MHSu7Tkk8ezOb9m5YGyVAqoEU9RVetP71zUCldhkAO5ZHiLxBgZlaHuKsxRMrtop5Py6f2Xz0BVK3V2qw4_dbINJGi0x-dMoQWK2XEDTsepiOElvX16bxAB8bQNoO1kRU7qLtXjTFNHtJ1qY7rG7iG3o-Zd1QecqRG38T5xCUitb1O8syt8QI8bVbBA5hZpIm5Ho2Oh3nGlRuLA" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c141d] via-transparent to-transparent flex flex-col justify-end p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 bg-tertiary rounded-full animate-pulse shadow-[0_0_8px_rgba(153,203,255,0.6)]"></span>
                  <span className="font-label-caps text-[10px] tracking-widest uppercase text-on-surface font-bold">Optimal Route Identified</span>
                </div>
                <h4 className="font-title-md text-lg font-semibold text-on-surface">Trans-Pacific Corridor</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
