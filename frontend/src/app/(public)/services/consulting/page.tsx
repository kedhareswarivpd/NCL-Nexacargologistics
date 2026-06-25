"use client";

import Link from "next/link";
import { ArrowLeft, LineChart, Clock, Shield, Globe, FileText, CheckCircle2 } from "lucide-react";

const STATS = [
  { value: "+24%", label: "Avg Efficiency Gain" },
  { value: "150+", label: "Audits Completed" },
  { value: "$12M+", label: "Client Savings" },
  { value: "15+", label: "Years Experience" },
];

const FEATURES = [
  { icon: LineChart,  title: "Supply Chain Audit",     desc: "End-to-end evaluation of your logistics nodes, inventory levels, and transport modes." },
  { icon: Clock,      title: "Lead Time Reduction",    desc: "Process mapping to identify bottlenecks and accelerate transit and fulfillment cycles." },
  { icon: Shield,     title: "Risk Management",        desc: "Mitigation planning for supplier delays, customs regulations, and market disruptions." },
  { icon: Globe,      title: "Network Optimization",   desc: "Mathematical modeling of warehouse locations and distribution channels." },
  { icon: FileText,   title: "Procurement Advisory",   desc: "Strategic sourcing of carriers and negotiating contracts for freight savings." },
  { icon: CheckCircle2, title: "KPI Dashboard Setup",  desc: "Implementation of operational metrics and real-time business intelligence." },
];

export default function ConsultingPage() {
  return (
    <main className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">

      {/* ── Animated Chart Hero ── */}
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
        <div className="absolute" style={{ top: "20%", animation: "cloud-drift-consulting 35s linear infinite", animationDelay: "0s" }}>
          <div className="flex gap-1 opacity-15">
            <div className="w-24 h-9 bg-white rounded-full blur-lg" />
            <div className="w-14 h-6 bg-white rounded-full blur-md -ml-5 mt-2" />
            <div className="w-18 h-8 bg-white rounded-full blur-lg -ml-4" />
          </div>
        </div>

        {/* Grid and dashboard surface */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 160 }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a2a4a] via-[#06192e] to-[#040e1c]" />
          {/* Surface border line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(79,163,255,0.4)] to-transparent" />
          {/* Grid lines overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(to right, #4fa3ff 1px, transparent 1px), linear-gradient(to bottom, #4fa3ff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        </div>

        {/* ── ANIMATED CHART WIDGET ── */}
        <div className="absolute left-1/2" style={{
          bottom: 40,
          marginLeft: -120,
          filter: "drop-shadow(0 8px 32px rgba(0,194,255,0.25))",
          zIndex: 10,
        }}>
          <svg width="240" height="120" viewBox="0 0 240 120" fill="none" aria-hidden="true">
            {/* Axis */}
            <line x1="10" y1="10" x2="10" y2="110" stroke="rgba(153,203,255,0.3)" strokeWidth="2" />
            <line x1="10" y1="110" x2="230" y2="110" stroke="rgba(153,203,255,0.3)" strokeWidth="2" />
            
            {/* Grid dashed lines */}
            <line x1="10" y1="30" x2="230" y2="30" stroke="rgba(153,203,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="10" y1="60" x2="230" y2="60" stroke="rgba(153,203,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="10" y1="90" x2="230" y2="90" stroke="rgba(153,203,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* The line path drawing itself */}
            <path d="M10 100 L50 85 L90 90 L130 60 L170 45 L210 15" 
                  stroke="#00c2ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: "draw-chart 6s ease-in-out infinite" }} />
            
            {/* Glow under the line */}
            <path d="M10 100 L50 85 L90 90 L130 60 L170 45 L210 15 L210 110 L10 110 Z" 
                  fill="url(#chart-glow)"
                  style={{ opacity: 0.15, animation: "fade-glow 6s ease-in-out infinite" }} />

            {/* Glowing vertices popping up */}
            <circle cx="10" cy="100" r="4" fill="#00c2ff" style={{ animation: "pop-dot 6s ease-in-out infinite", animationDelay: "0s" }} />
            <circle cx="50" cy="85" r="4" fill="#00c2ff" style={{ animation: "pop-dot 6s ease-in-out infinite", animationDelay: "1s" }} />
            <circle cx="90" cy="90" r="4" fill="#00c2ff" style={{ animation: "pop-dot 6s ease-in-out infinite", animationDelay: "2s" }} />
            <circle cx="130" cy="60" r="4" fill="#00c2ff" style={{ animation: "pop-dot 6s ease-in-out infinite", animationDelay: "3s" }} />
            <circle cx="170" cy="45" r="4" fill="#00c2ff" style={{ animation: "pop-dot 6s ease-in-out infinite", animationDelay: "4s" }} />
            
            <circle cx="210" cy="15" r="5" fill="#22c55e" style={{ animation: "pop-dot 6s ease-in-out infinite", animationDelay: "5s" }} />
            <circle cx="210" cy="15" r="10" stroke="#22c55e" strokeWidth="1.5" fill="none" style={{ animation: "pulse-dot 2s infinite" }} />

            <defs>
              <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00c2ff" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center" style={{ bottom: 120 }}>
          <p className="text-xs uppercase tracking-[0.35em] text-[#4fa3ff] mb-3">Strategy & Advisory</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] mb-4">
            Logistics Strategy Consulting
          </h1>
          <p className="text-[#b8cce8] max-w-xl text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            End-to-end supply chain evaluations, efficiency mapping, and data-driven savings roadmaps.
          </p>
        </div>

        <style>{`
          @keyframes draw-chart {
            0% { stroke-dashoffset: 300; }
            70%, 100% { stroke-dashoffset: 0; }
          }
          @keyframes fade-glow {
            0%, 15% { opacity: 0; }
            70%, 100% { opacity: 0.25; }
          }
          @keyframes pop-dot {
            0%, 20% { opacity: 0; transform: scale(0.5); }
            30%, 100% { opacity: 1; transform: scale(1); }
          }
          @keyframes pulse-dot {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.6); opacity: 0.4; }
          }
          @keyframes cloud-drift-consulting {
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
              <LineChart className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Unlock Network Efficiencies
              </h2>
              <p className="text-[#b8cce8] leading-relaxed">
                Modern supply chains are highly complex, with savings opportunities often hidden 
                in routing, carrier configurations, or inventory positions. NexaCargo's strategy consulting 
                division works closely with your executives to audit your current shipping footprint. 
                Using advanced mathematical modeling and data analytics, we structure action plans to reduce 
                lead times, optimize warehouse networks, and lower freight spends while boosting operational resilience.
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

        {/* Consulting focus areas */}
        <div className="rounded-2xl border border-[#2563eb]/30 bg-[#0d1e3a] p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Key Advisory Focuses</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "End-to-end supply chain audit and mapping",
              "Freight spending classification and carrier reviews",
              "Green logistics and carbon footprint reduction planning",
              "Inventory positioning and safety stock optimization",
              "Warehouse design, layout, and WMS integration advisory",
              "Vendor compliance programs and SLA drafting support",
            ].map((speciality) => (
              <div key={speciality} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#4fa3ff] shrink-0 mt-0.5" />
                <p className="text-sm text-[#b8cce8]">{speciality}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-white/8 bg-gradient-to-br from-[#132244] to-[#0d1b35] p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Optimize Your Logistics?</h2>
          <p className="text-[#b8cce8] mb-6">Book a consulting session with our supply chain specialists today.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <button className="px-8 py-3 rounded-full bg-[#2563eb] hover:bg-[#4fa3ff] text-white font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,99,235,0.45)]">
                Book Session
              </button>
            </Link>
            <Link href="/services">
              <button className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/5 text-white font-semibold transition-all hover:-translate-y-0.5">
                Explore Services
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
