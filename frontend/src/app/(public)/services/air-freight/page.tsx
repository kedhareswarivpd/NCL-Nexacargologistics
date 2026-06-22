"use client";

import Link from "next/link";
import { ArrowLeft, PlaneTakeoff, Clock, Shield, Thermometer, Globe, Package, Zap, CheckCircle2 } from "lucide-react";

const STATS = [
  { value: "180+", label: "Destinations" },
  { value: "4h",   label: "Min Transit" },
  { value: "99.6%", label: "On-Time Rate" },
  { value: "24/7", label: "Live Support" },
];

const FEATURES = [
  { icon: Zap,         title: "Express Booking",         desc: "Book in under 2 minutes with instant rate confirmation and AWB generation." },
  { icon: Globe,       title: "Global Hub Network",      desc: "Direct connections through 40+ major air cargo hubs across 6 continents." },
  { icon: Thermometer, title: "Climate Controlled",      desc: "Pharma-grade temperature monitoring for sensitive and perishable cargo." },
  { icon: Shield,      title: "Full Cargo Insurance",    desc: "Comprehensive cover from pick-up to final delivery, door to door." },
  { icon: Clock,       title: "Real-Time Tracking",      desc: "Live flight status, customs clearance updates, and ETA notifications." },
  { icon: Package,     title: "Charter & OOG Cargo",     desc: "Oversized and out-of-gauge solutions including full charter arrangements." },
];

export default function AirFreightPage() {
  return (
    <main className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">

      {/* ── Animated Sky Hero ── */}
      <section className="relative w-full overflow-hidden" style={{ height: 420 }}>

        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060f22] via-[#0d1e40] to-[#132244]" />

        {/* Stars */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width:  i % 7 === 0 ? 2 : 1,
            height: i % 7 === 0 ? 2 : 1,
            top:    `${(i * 17) % 55}%`,
            left:   `${(i * 29) % 100}%`,
            opacity: 0.1 + (i % 5) * 0.08,
          }} />
        ))}

        {/* Clouds */}
        <div className="absolute" style={{ top: "28%", animation: "cloud-drift 28s linear infinite", animationDelay: "0s" }}>
          <div className="flex gap-1 opacity-20">
            <div className="w-20 h-8 bg-white rounded-full blur-md" />
            <div className="w-12 h-6 bg-white rounded-full blur-md -ml-4 mt-1" />
            <div className="w-16 h-7 bg-white rounded-full blur-md -ml-3" />
          </div>
        </div>
        <div className="absolute" style={{ top: "18%", animation: "cloud-drift 38s linear infinite", animationDelay: "-14s" }}>
          <div className="flex gap-1 opacity-12">
            <div className="w-14 h-6 bg-white rounded-full blur-md" />
            <div className="w-10 h-5 bg-white rounded-full blur-md -ml-3 mt-1" />
          </div>
        </div>
        <div className="absolute" style={{ top: "42%", animation: "cloud-drift 50s linear infinite", animationDelay: "-22s" }}>
          <div className="flex gap-1 opacity-10">
            <div className="w-24 h-9 bg-white rounded-full blur-lg" />
            <div className="w-16 h-7 bg-white rounded-full blur-lg -ml-5 mt-2" />
            <div className="w-10 h-5 bg-white rounded-full blur-md -ml-4" />
          </div>
        </div>

        {/* ── MAIN PLANE ── */}
        <div className="absolute flex items-center" style={{
          top: "30%",
          animation: "fly-across 12s linear infinite",
          animationDelay: "0s",
          filter: "drop-shadow(0 0 12px rgba(79,163,255,0.8))",
        }}>
          {/* Engine contrail */}
          <div style={{
            width: 120, height: 3,
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.6))",
            borderRadius: 4,
            marginRight: -2,
          }} />
          <svg width="80" height="38" viewBox="0 0 80 38" fill="none" aria-hidden="true">
            {/* fuselage */}
            <ellipse cx="42" cy="19" rx="30" ry="7" fill="#dce8ff" />
            {/* nose cone */}
            <path d="M72 19 Q80 19 78 16 L72 13 Z" fill="#eef4ff" />
            {/* main wings */}
            <path d="M34 19 L16 4 L22 19 L16 34 L34 19Z" fill="#a8c4f0" />
            {/* tail fin vertical */}
            <path d="M12 19 L6 8 L14 14 Z" fill="#8aaed4" />
            {/* tail stabilizer */}
            <path d="M12 19 L6 30 L14 24 Z" fill="#8aaed4" />
            {/* cockpit windows */}
            <ellipse cx="66" cy="15.5" rx="4.5" ry="2.5" fill="rgba(153,220,255,0.75)" />
            {/* engine pods */}
            <ellipse cx="28" cy="23" rx="6" ry="3" fill="#8aaed4" />
            <ellipse cx="24" cy="15" rx="5" ry="2.5" fill="#8aaed4" />
            {/* engine exhaust glow */}
            <ellipse cx="22" cy="23" rx="3" ry="2" fill="rgba(79,163,255,0.55)" />
            {/* fuselage stripe */}
            <line x1="14" y1="17" x2="68" y2="17" stroke="rgba(79,163,255,0.5)" strokeWidth="1" />
            {/* NexaCargo livery strip */}
            <rect x="30" y="19" width="28" height="3" rx="1" fill="rgba(37,99,235,0.6)" />
          </svg>
          {/* Nav light */}
          <div style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 8px 3px rgba(74,222,128,0.8)",
            position: "absolute", top: 12, right: -8,
            animation: "blink-light 1.4s ease-in-out infinite",
          }} />
        </div>

        {/* ── SECOND PLANE (smaller, higher, slower) ── */}
        <div className="absolute" style={{
          top: "14%",
          opacity: 0.5,
          animation: "fly-across 20s linear infinite",
          animationDelay: "-9s",
          filter: "drop-shadow(0 0 6px rgba(79,163,255,0.5))",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 70, height: 2, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.4))", marginRight: -1 }} />
            <svg width="48" height="24" viewBox="0 0 80 38" fill="none" aria-hidden="true">
              <ellipse cx="42" cy="19" rx="30" ry="7" fill="#dce8ff" />
              <path d="M72 19 Q80 19 78 16 L72 13 Z" fill="#eef4ff" />
              <path d="M34 19 L16 4 L22 19 L16 34 L34 19Z" fill="#a8c4f0" />
              <path d="M12 19 L6 8 L14 14 Z" fill="#8aaed4" />
            </svg>
          </div>
        </div>

        {/* ── THIRD PLANE (distant, very slow) ── */}
        <div className="absolute" style={{
          top: "8%",
          opacity: 0.25,
          animation: "fly-across 32s linear infinite",
          animationDelay: "-18s",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 40, height: 1, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.3))", marginRight: -1 }} />
            <svg width="28" height="14" viewBox="0 0 80 38" fill="none" aria-hidden="true">
              <ellipse cx="42" cy="19" rx="30" ry="7" fill="#c8d8f0" />
              <path d="M34 19 L16 4 L22 19 L16 34 L34 19Z" fill="#8aaed4" />
            </svg>
          </div>
        </div>

        {/* Horizon glow */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a1628] via-[rgba(37,99,235,0.08)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(79,163,255,0.5)] to-transparent" />

        {/* Hero text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#4fa3ff] mb-3">Air Freight</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] mb-4">
            Express Air Cargo
          </h1>
          <p className="text-[#b8cce8] max-w-xl text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Real-time visibility. Global reach. Urgent delivery guaranteed.
          </p>
        </div>

        <style>{`
          @keyframes fly-across {
            from { transform: translateX(-220px); }
            to   { transform: translateX(110vw); }
          }
          @keyframes cloud-drift {
            from { transform: translateX(-300px); }
            to   { transform: translateX(110vw); }
          }
          @keyframes blink-light {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.1; }
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

        {/* Back link */}
        <Link href="/services" className="inline-flex items-center gap-2 text-sm text-[#4fa3ff] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Link>

        {/* Intro */}
        <div className="rounded-2xl border border-white/10 bg-[#132244] p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-[#1a4a8a] p-3 text-[#4fa3ff] shrink-0">
              <PlaneTakeoff className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Global Air Freight Solutions
              </h2>
              <p className="text-[#b8cce8] leading-relaxed">
                NexaCargo's air freight network spans 180+ destinations across six continents.
                Whether you need next-flight-out urgency or scheduled consolidated cargo,
                our dedicated air operations team ensures every shipment arrives on time,
                every time — with full chain-of-custody visibility from pick-up to delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Features grid */}
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

        {/* Why choose us */}
        <div className="rounded-2xl border border-[#2563eb]/30 bg-[#0d1e3a] p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Why NexaCargo Air Freight?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "IATA certified cargo handling at all major hubs",
              "Dangerous goods (DG) trained specialists on every route",
              "Consolidated LCL air freight for cost-efficient smaller loads",
              "Customs pre-clearance in 60+ countries",
              "White-glove service for pharmaceuticals & electronics",
              "Dedicated charter operations for time-critical events",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#4fa3ff] shrink-0 mt-0.5" />
                <p className="text-sm text-[#b8cce8]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-white/8 bg-gradient-to-br from-[#132244] to-[#0d1b35] p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Ship by Air?</h2>
          <p className="text-[#b8cce8] mb-6">Get a quote in under 60 seconds. No commitment required.</p>
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
