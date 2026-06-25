"use client";

import Link from "next/link";
import { ArrowLeft, Truck, MapPin, Shield, Package, FileText, Clock, CheckCircle2 } from "lucide-react";

const STATS = [
  { value: "10,000+", label: "Active Fleet" },
  { value: "FTL/LTL", label: "Load Types" },
  { value: "2.5 days", label: "Avg Transit" },
  { value: "99.7%", label: "On-Time Rate" },
];

const FEATURES = [
  { icon: Truck,     title: "FTL & LTL Booking",      desc: "Full truckload and less-than-truckload options for any cargo volume." },
  { icon: MapPin,    title: "GPS Fleet Tracking",     desc: "Real-time location, temperature, and route progress updates." },
  { icon: Clock,     title: "Optimized Dispatch",     desc: "Dynamic routing software bypasses traffic, weather, and border delays." },
  { icon: Shield,    title: "Cargo Insurance",         desc: "Institute cargo clauses with options for comprehensive cover." },
  { icon: Package,   title: "Last-Mile Delivery",     desc: "Flexible final-mile services directly to commercial or residential addresses." },
  { icon: FileText,  title: "Cross-Border Support",   desc: "Customs transit documentation, Carnet TIR, and compliance managed." },
];

export default function RoadTransportPage() {
  return (
    <main className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">

      {/* ── Animated Highway Hero ── */}
      <section className="relative w-full overflow-hidden" style={{ height: 440 }}>

        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07111f] via-[#0d1e3a] to-[#0a2a4a]" />

        {/* Stars */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width: 1,
            height: 1,
            top:  `${(i * 19) % 40}%`,
            left: `${(i * 31) % 100}%`,
            opacity: 0.08 + (i % 4) * 0.06,
          }} />
        ))}

        {/* Moon */}
        <div className="absolute top-6 right-20 w-8 h-8 rounded-full opacity-60"
          style={{ background: "radial-gradient(circle at 35% 35%, #dce8ff, #8aaed4)", boxShadow: "0 0 20px 4px rgba(153,203,255,0.2)" }} />

        {/* Clouds */}
        <div className="absolute" style={{ top: "20%", animation: "cloud-drift-road 35s linear infinite", animationDelay: "0s" }}>
          <div className="flex gap-1 opacity-15">
            <div className="w-24 h-9 bg-white rounded-full blur-lg" />
            <div className="w-14 h-6 bg-white rounded-full blur-md -ml-5 mt-2" />
            <div className="w-18 h-8 bg-white rounded-full blur-lg -ml-4" />
          </div>
        </div>
        <div className="absolute" style={{ top: "12%", animation: "cloud-drift-road 50s linear infinite", animationDelay: "-20s" }}>
          <div className="flex gap-1 opacity-10">
            <div className="w-16 h-7 bg-white rounded-full blur-md" />
            <div className="w-10 h-5 bg-white rounded-full blur-md -ml-3 mt-1" />
          </div>
        </div>

        {/* Road surface */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 160 }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a2a4a] via-[#06192e] to-[#040e1c]" />
          {/* Asphalt layer */}
          <div className="absolute bottom-6 left-0 right-0 h-16 bg-[#13223f] border-y border-[#1e2d4a]" />
          {/* Lane dividers (dashes) */}
          <div className="absolute bottom-14 left-0 right-0 h-0.5 border-t border-dashed border-[#4fa3ff]/30" />
        </div>

        {/* Horizon divider */}
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(79,163,255,0.4)] to-transparent" style={{ bottom: 158 }} />

        {/* ── MAIN TRUCK (moving across) ── */}
        <div className="absolute" style={{
          bottom: 48,
          animation: "drive-across 18s linear infinite",
          animationDelay: "0s",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.65)) drop-shadow(0 0 4px rgba(79,163,255,0.25))",
        }}>
          <svg width="150" height="60" viewBox="0 0 150 60" fill="none" aria-hidden="true">
            {/* Truck Cabin */}
            <path d="M100 20 L125 20 L135 32 L135 48 L100 48 Z" fill="#2563eb" />
            <path d="M110 24 L123 24 L128 32 L110 32 Z" fill="rgba(153,220,255,0.65)" />
            {/* Cabin bumper/grill */}
            <rect x="131" y="40" width="5" height="6" rx="1" fill="#8aaed4" />
            
            {/* Truck Cargo Trailer */}
            <rect x="15" y="12" width="82" height="36" rx="3" fill="#1e4a7a" />
            <rect x="20" y="16" width="72" height="28" rx="1" fill="#0d2444" />
            {/* Connectors */}
            <rect x="94" y="40" width="8" height="4" fill="#334155" />
            
            {/* Wheels */}
            <circle cx="32" cy="46" r="7" fill="#090d16" stroke="#475569" strokeWidth="2" />
            <circle cx="48" cy="46" r="7" fill="#090d16" stroke="#475569" strokeWidth="2" />
            <circle cx="82" cy="46" r="7" fill="#090d16" stroke="#475569" strokeWidth="2" />
            <circle cx="118" cy="46" r="7" fill="#090d16" stroke="#475569" strokeWidth="2" />
            
            {/* Wheel centers */}
            <circle cx="32" cy="46" r="2.5" fill="#94a3b8" />
            <circle cx="48" cy="46" r="2.5" fill="#94a3b8" />
            <circle cx="82" cy="46" r="2.5" fill="#94a3b8" />
            <circle cx="118" cy="46" r="2.5" fill="#94a3b8" />
            
            {/* Headlight beam */}
            <path d="M135 42 L160 38 L160 48 Z" fill="rgba(253,224,71,0.15)" />
            <circle cx="134" cy="42" r="2" fill="#fde047" />
          </svg>
        </div>

        {/* ── SECOND SMALLER VEHICLE (distant / fast) ── */}
        <div className="absolute" style={{
          bottom: 54,
          opacity: 0.45,
          animation: "drive-across 12s linear infinite",
          animationDelay: "-7s",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
        }}>
          <svg width="60" height="25" viewBox="0 0 150 60" fill="none" aria-hidden="true">
            <rect x="20" y="18" width="110" height="30" rx="4" fill="#334155" />
            <path d="M90 18 L110 18 L125 32 L90 32 Z" fill="rgba(153,220,255,0.4)" />
            <circle cx="45" cy="48" r="9" fill="#090d16" />
            <circle cx="105" cy="48" r="9" fill="#090d16" />
          </svg>
        </div>

        {/* Birds */}
        {[
          { top: "22%", delay: "0s",   dur: "18s" },
          { top: "30%", delay: "-7s",  dur: "24s" },
          { top: "16%", delay: "-12s", dur: "30s" },
        ].map((g, i) => (
          <div key={i} className="absolute" style={{ top: g.top, opacity: 0.45, animation: `cloud-drift-road ${g.dur} linear infinite`, animationDelay: g.delay }}>
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
              <path d="M1 5 Q4.5 1 9 5 Q13.5 1 17 5" stroke="white" strokeWidth="1.2" fill="none" />
            </svg>
          </div>
        ))}

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center" style={{ bottom: 120 }}>
          <p className="text-xs uppercase tracking-[0.35em] text-[#4fa3ff] mb-3">Road Transportation</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] mb-4">
            Road Freight Solutions
          </h1>
          <p className="text-[#b8cce8] max-w-xl text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            FTL, LTL and express road logistics across continental highway networks.
          </p>
        </div>

        <style>{`
          @keyframes drive-across {
            from { transform: translateX(-200px); }
            to   { transform: translateX(110vw); }
          }
          @keyframes cloud-drift-road {
            from { transform: translateX(-300px); }
            to   { transform: translateX(110vw); }
          }
        `}</style>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-white/8 bg-[#0d1b35]">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="py-6 px-8 text-center">
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-[#4fa3ff]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Content ── */}
      <section className="mx-auto max-w-5xl px-6 py-16 space-y-12">

        <Link href="/services" className="inline-flex items-center gap-2 text-sm text-[#4fa3ff] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Link>

        {/* Intro */}
        <div className="rounded-2xl border border-white/10 bg-[#132244] p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-[#1a4a8a] p-3 text-[#4fa3ff] shrink-0">
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Reliable Road Transportation
              </h2>
              <p className="text-[#b8cce8] leading-relaxed">
                NexaCargo's road transport division operates an extensive network of modern, 
                GPS-tracked vehicles across major regional corridors. From full truckloads (FTL) 
                to consolidated partial shipments (LTL), we ensure your goods move efficiently 
                by land. Our dispatch teams combine smart routing technology and real-time fleet 
                coordination to navigate borders and traffic, delivering consistent transit times 
                right to your dock.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">What's Included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="rounded-xl border border-white/8 bg-[#0f1e38] p-6 hover:border-[#4fa3ff]/40 hover:bg-[#132244] transition-all duration-200 hover:-translate-y-1 group">
                <div className="w-10 h-10 rounded-lg bg-[#1a4a8a] flex items-center justify-center mb-4 group-hover:bg-[#2563eb] transition-colors">
                  <Icon className="w-5 h-5 text-[#4fa3ff]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#b8cce8] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key regions */}
        <div className="rounded-2xl border border-[#2563eb]/30 bg-[#0d1e3a] p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Key Freight Corridors</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Intra-European highway networks",
              "Interstate freight corridors (USA/Canada)",
              "Cross-border trucking (US-Mexico)",
              "Domestic express trunk routes",
              "Pan-Asian highway connectors",
              "Last-mile metropolitan distribution",
            ].map((route) => (
              <div key={route} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#4fa3ff] shrink-0 mt-0.5" />
                <p className="text-sm text-[#b8cce8]">{route}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-white/8 bg-gradient-to-br from-[#132244] to-[#0d1b35] p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Ship by Road?</h2>
          <p className="text-[#b8cce8] mb-6">Request a competitive road freight quote today.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <button className="px-8 py-3 rounded-full bg-[#2563eb] hover:bg-[#4fa3ff] text-white font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,99,235,0.45)]">
                Get a Quote
              </button>
            </Link>
            <Link href="/track">
              <button className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/5 text-white font-semibold transition-all hover:-translate-y-0.5">
                Track Shipment
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
