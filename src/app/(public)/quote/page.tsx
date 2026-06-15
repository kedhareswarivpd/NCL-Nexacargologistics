"use client";

import { useState } from "react";
import { MapPin, Flag, ArrowRight, Zap, Clock, Leaf, CheckCircle, Plane, Ship, Truck, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FreightQuoteCalculatorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [service, setService] = useState("Standard");
  const [weight, setWeight] = useState(0);

  const handleNext = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getBaseCost = () => {
    if (service === "Express") return 1200;
    if (service === "Standard") return 720;
    return 450;
  };

  const weightPremium = weight * 0.85;
  const total = getBaseCost() + weightPremium + 42;

  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-16 text-center md:text-left">
        <h1 className="font-display-lg text-5xl font-bold text-on-surface mb-4">
          Freight Quote <span className="text-tertiary">Calculator</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl">
          Get instant, transparent pricing for your global logistics needs. Accurate estimates across air, sea, and land networks.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Stepper Form */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass rounded-xl p-8 border border-white/10">
            {/* Stepper Indicators */}
            <div className="flex items-center justify-between mb-12 px-6">
              <div className="flex flex-col items-center gap-2">
                <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all", currentStep >= 1 ? "text-tertiary border-tertiary" : "border-white/20 text-on-surface-variant")}>1</div>
                <span className={cn("font-label-caps text-xs tracking-widest uppercase", currentStep >= 1 ? "text-tertiary font-bold" : "text-on-surface-variant")}>Route</span>
              </div>
              <div className="flex-grow h-px bg-white/10 mx-6"></div>
              <div className="flex flex-col items-center gap-2">
                <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all", currentStep >= 2 ? "text-tertiary border-tertiary" : "border-white/20 text-on-surface-variant")}>2</div>
                <span className={cn("font-label-caps text-xs tracking-widest uppercase", currentStep >= 2 ? "text-tertiary font-bold" : "text-on-surface-variant")}>Cargo</span>
              </div>
              <div className="flex-grow h-px bg-white/10 mx-6"></div>
              <div className="flex flex-col items-center gap-2">
                <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all", currentStep >= 3 ? "text-tertiary border-tertiary" : "border-white/20 text-on-surface-variant")}>3</div>
                <span className={cn("font-label-caps text-xs tracking-widest uppercase", currentStep >= 3 ? "text-tertiary font-bold" : "text-on-surface-variant")}>Service</span>
              </div>
            </div>

            {/* Step Content: 1 Origin/Destination */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant ml-2">Origin City/Port</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary w-5 h-5" />
                      <input className="w-full h-14 pl-12 pr-6 rounded-lg bg-black/20 border border-white/10 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface" placeholder="e.g. Shanghai, China" type="text" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant ml-2">Destination City/Port</label>
                    <div className="relative">
                      <Flag className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary w-5 h-5" />
                      <input className="w-full h-14 pl-12 pr-6 rounded-lg bg-black/20 border border-white/10 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface" placeholder="e.g. Los Angeles, USA" type="text" />
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

            {/* Step Content: 2 Cargo Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant ml-2">Cargo Type</label>
                    <select className="w-full h-14 px-6 rounded-lg bg-black/20 border border-white/10 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface appearance-none">
                      <option className="bg-surface">General Cargo</option>
                      <option className="bg-surface">Hazardous Materials</option>
                      <option className="bg-surface">Perishables</option>
                      <option className="bg-surface">Oversized/Project</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant ml-2">Weight (KG)</label>
                    <input
                      className="w-full h-14 px-6 rounded-lg bg-black/20 border border-white/10 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface"
                      placeholder="0"
                      type="number"
                      value={weight || ""}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant ml-2">Volume (m³)</label>
                    <input className="w-full h-14 px-6 rounded-lg bg-black/20 border border-white/10 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface" placeholder="0" type="number" />
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

            {/* Step Content: 3 Service Level */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={() => setService("Express")}
                    className={cn(
                      "group glass p-6 rounded-xl text-left transition-all border-2 relative overflow-hidden",
                      service === "Express" ? "border-tertiary bg-white/5" : "border-transparent hover:border-tertiary/50"
                    )}
                  >
                    <Zap className="text-tertiary mb-2 w-8 h-8" />
                    <h4 className="font-title-md text-lg font-semibold text-on-surface">Express</h4>
                    <p className="font-body-sm text-sm text-on-surface-variant mt-1">2-4 Business Days</p>
                    <div className={cn("mt-6 text-tertiary font-label-caps text-xs tracking-widest uppercase transition-opacity flex items-center gap-2 font-bold", service === "Express" ? "opacity-100" : "opacity-0")}>
                      <CheckCircle className="w-4 h-4" /> Selected
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setService("Standard")}
                    className={cn(
                      "group glass p-6 rounded-xl text-left transition-all border-2 relative overflow-hidden",
                      service === "Standard" ? "border-tertiary bg-white/5" : "border-transparent hover:border-tertiary/50"
                    )}
                  >
                    <Clock className="text-tertiary mb-2 w-8 h-8" />
                    <h4 className="font-title-md text-lg font-semibold text-on-surface">Standard</h4>
                    <p className="font-body-sm text-sm text-on-surface-variant mt-1">7-12 Business Days</p>
                    <div className={cn("mt-6 text-tertiary font-label-caps text-xs tracking-widest uppercase transition-opacity flex items-center gap-2 font-bold", service === "Standard" ? "opacity-100" : "opacity-0")}>
                      <CheckCircle className="w-4 h-4" /> Selected
                    </div>
                  </button>

                  <button
                    onClick={() => setService("Eco")}
                    className={cn(
                      "group glass p-6 rounded-xl text-left transition-all border-2 relative overflow-hidden",
                      service === "Eco" ? "border-tertiary bg-white/5" : "border-transparent hover:border-tertiary/50"
                    )}
                  >
                    <Leaf className="text-tertiary mb-2 w-8 h-8" />
                    <h4 className="font-title-md text-lg font-semibold text-on-surface">Eco-Freight</h4>
                    <p className="font-body-sm text-sm text-on-surface-variant mt-1">20-35 Business Days</p>
                    <div className={cn("mt-6 text-tertiary font-label-caps text-xs tracking-widest uppercase transition-opacity flex items-center gap-2 font-bold", service === "Eco" ? "opacity-100" : "opacity-0")}>
                      <CheckCircle className="w-4 h-4" /> Selected
                    </div>
                  </button>
                </div>
                <div className="pt-6 flex justify-between">
                  <button onClick={() => handleNext(2)} className="px-8 h-14 glass text-on-surface rounded-lg font-title-md text-lg hover:bg-white/10 transition-all border border-white/10">Back</button>
                  <button className="px-8 h-14 bg-tertiary text-[#001d34] rounded-lg font-title-md text-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(153,203,255,0.4)] font-bold">
                    Finalize Quote
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
                    <td className="p-6 flex items-center gap-3 text-on-surface font-semibold font-sans">
                      <Plane className="text-secondary w-5 h-5" /> Air Freight
                    </td>
                    <td className="p-6 font-bold text-on-surface">${(total * 2.1).toFixed(2)}</td>
                    <td className="p-6 font-sans text-on-surface-variant">3 - 5 Days</td>
                    <td className="p-6 font-sans"><span className="w-2.5 h-2.5 rounded-full bg-error inline-block mr-3 shadow-[0_0_8px_rgba(255,180,171,0.5)]"></span> High</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors bg-white/5">
                    <td className="p-6 flex items-center gap-3 text-on-surface font-semibold font-sans">
                      <Ship className="text-secondary w-5 h-5" /> Ocean Freight
                    </td>
                    <td className="p-6 font-bold text-on-surface">${(total * 0.4).toFixed(2)}</td>
                    <td className="p-6 font-sans text-on-surface-variant">28 - 35 Days</td>
                    <td className="p-6 font-sans"><span className="w-2.5 h-2.5 rounded-full bg-tertiary inline-block mr-3 shadow-[0_0_8px_rgba(153,203,255,0.5)]"></span> Low</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-6 flex items-center gap-3 text-on-surface font-semibold font-sans">
                      <Truck className="text-secondary w-5 h-5" /> Road Freight
                    </td>
                    <td className="p-6 font-bold text-on-surface">${(total * 0.85).toFixed(2)}</td>
                    <td className="p-6 font-sans text-on-surface-variant">10 - 14 Days</td>
                    <td className="p-6 font-sans"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block mr-3"></span> Medium</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Live Cost Estimate Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-8">
            <div className="glass rounded-xl p-8 border border-tertiary/30 relative overflow-hidden">
              {/* Atmospheric Glow */}
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

              <button className="w-full h-16 bg-[#1565C0] text-[#E8F0FE] rounded-lg font-title-md text-lg hover:bg-[#42A5F5] transition-all flex items-center justify-center gap-3 group shadow-lg font-bold">
                Ship Now
                <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <p className="text-center font-label-caps text-[10px] tracking-widest uppercase text-on-surface-variant mt-6">Requires NexaCargo Account</p>
            </div>

            {/* Map/Visual Insight */}
            <div className="glass rounded-xl aspect-video relative overflow-hidden group border border-white/10">
              <img
                alt="Logistics Map"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 grayscale-[0.3]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxhQRNayeSKC78ha9goyoyLhzynb69dsJuWfUbPw8JUPatHX4wgQBRgQYG9as1MHSu7Tkk8ezOb9m5YGyVAqoEU9RVetP71zUCldhkAO5ZHiLxBgZlaHuKsxRMrtop5Py6f2Xz0BVK3V2qw4_dbINJGi0x-dMoQWK2XEDTsepiOElvX16bxAB8bQNoO1kRU7qLtXjTFNHtJ1qY7rG7iG3o-Zd1QecqRG38T5xCUitb1O8syt8QI8bVbBA5hZpIm5Ho2Oh3nGlRuLA"
              />
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
