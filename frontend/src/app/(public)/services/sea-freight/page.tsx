"use client";

import Link from "next/link";
import { ArrowLeft, Ship, Anchor, Globe, FileText, Truck, Shield, Clock, CheckCircle2 } from "lucide-react";

const STATS = [
  { value: "150+", label: "Port Coverage" },
  { value: "FCL/LCL", label: "Load Types" },
  { value: "18 days", label: "Avg Transit" },
  { value: "99.2%", label: "Safe Delivery" },
];

const FEATURES = [
  { icon: Ship,     title: "FCL & LCL Booking",      desc: "Full container load and less-than-container-load options for any cargo volume." },
  { icon: Anchor,   title: "Port-to-Port / DDP",      desc: "Flexible incoterms from ex-works to delivered duty paid across all major trade lanes." },
  { icon: Globe,    title: "150+ Global Ports",       desc: "Direct and transshipment connections to every major seaport on every continent." },
  { icon: FileText, title: "Documentation Support",   desc: "Bill of lading, certificate of origin, customs declarations — fully managed." },
  { icon: Truck,    title: "Multimodal Handoff",      desc: "Seamless inland transport connecting ports to final warehouse destinations." },
  { icon: Shield,   title: "Cargo Insurance",         desc: "Institute cargo clauses A, B & C with option for war risk and strike cover." },
];

export default function SeaFreightPage() {
  return (
    <main className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">

      {/* ── Animated Ocean Hero ── */}
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
        <div className="absolute" style={{ top: "20%", animation: "cloud-drift-sea 35s linear infinite", animationDelay: "0s" }}>
          <div className="flex gap-1 opacity-15">
            <div className="w-24 h-9 bg-white rounded-full blur-lg" />
            <div className="w-14 h-6 bg-white rounded-full blur-md -ml-5 mt-2" />
            <div className="w-18 h-8 bg-white rounded-full blur-lg -ml-4" />
          </div>
        </div>
        <div className="absolute" style={{ top: "12%", animation: "cloud-drift-sea 50s linear infinite", animationDelay: "-20s" }}>
          <div className="flex gap-1 opacity-10">
            <div className="w-16 h-7 bg-white rounded-full blur-md" />
            <div className="w-10 h-5 bg-white rounded-full blur-md -ml-3 mt-1" />
          </div>
        </div>

        {/* Sea surface */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 160 }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a2a4a] via-[#06192e] to-[#040e1c]" />
          {/* Wave lines */}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="absolute left-0 right-0 h-px"
              style={{
                bottom: 30 + i * 22,
                background: `linear-gradient(to right, transparent, rgba(79,163,255,${0.08 + i * 0.04}), transparent)`,
                animation: `wave-move ${3 + i * 0.8}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.4}s`,
              }} />
          ))}
        </div>

        {/* Horizon divider */}
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(79,163,255,0.4)] to-transparent" style={{ bottom: 158 }} />

        {/* ── MAIN CARGO SHIP ── */}
        <div className="absolute" style={{
          bottom: 120,
          animation: "sail-across 24s linear infinite",
          animationDelay: "0s",
          filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.6)) drop-shadow(0 0 8px rgba(79,163,255,0.3))",
        }}>
          {/* Wake trail */}
          <div style={{
            position: "absolute", bottom: -8, left: -90,
            width: 90, height: 10,
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.18))",
            borderRadius: "0 6px 6px 0",
          }} />
          <svg width="160" height="70" viewBox="0 0 160 70" fill="none" aria-hidden="true">
            {/* Hull */}
            <path d="M10 50 Q16 62 26 64 L134 64 Q144 64 150 50 Z" fill="#1a3a5c" />
            <path d="M15 56 Q20 62 28 63 L132 63 Q140 63 145 56 Z" fill="#0d2444" />
            {/* Red waterline stripe */}
            <path d="M18 58 Q22 62 30 62 L130 62 Q138 62 142 58 Z" fill="#7f1c1c" />
            {/* Deck */}
            <rect x="24" y="38" width="112" height="14" rx="2" fill="#1e4a7a" />
            {/* Containers row 1 */}
            <rect x="28" y="26" width="18" height="14" rx="1.5" fill="#c0392b" />
            <rect x="48" y="26" width="18" height="14" rx="1.5" fill="#e67e22" />
            <rect x="68" y="26" width="18" height="14" rx="1.5" fill="#2980b9" />
            <rect x="88" y="26" width="18" height="14" rx="1.5" fill="#27ae60" />
            <rect x="108" y="26" width="18" height="14" rx="1.5" fill="#8e44ad" />
            {/* Containers row 2 */}
            <rect x="38" y="14" width="18" height="13" rx="1.5" fill="#e74c3c" />
            <rect x="58" y="14" width="18" height="13" rx="1.5" fill="#f39c12" />
            <rect x="78" y="14" width="18" height="13" rx="1.5" fill="#3498db" />
            <rect x="98" y="14" width="18" height="13" rx="1.5" fill="#1abc9c" />
            {/* Bridge / wheelhouse */}
            <rect x="20" y="20" width="16" height="20" rx="2" fill="#0d2c4e" />
            <rect x="22" y="22" width="5" height="4" rx="0.5" fill="rgba(153,220,255,0.65)" />
            <rect x="29" y="22" width="4" height="4" rx="0.5" fill="rgba(153,220,255,0.55)" />
            {/* Mast / crane */}
            <rect x="124" y="10" width="3" height="30" rx="1" fill="#8aaed4" />
            <line x1="125.5" y1="10" x2="110" y2="18" stroke="rgba(153,203,255,0.4)" strokeWidth="1" />
            {/* Smoke stack */}
            <rect x="22" y="12" width="6" height="10" rx="1" fill="#152d50" />
            {/* Smoke puffs */}
            <circle cx="25" cy="9" r="3" fill="rgba(180,180,200,0.18)" />
            <circle cx="27" cy="5" r="2.5" fill="rgba(180,180,200,0.12)" />
            {/* Wake ripples */}
            <path d="M4 64 Q14 60 22 64 Q32 68 40 64 Q50 60 58 64"
              stroke="rgba(79,163,255,0.35)" strokeWidth="1.5" fill="none" />
            <path d="M2 67 Q12 63 22 67 Q32 71 42 67"
              stroke="rgba(79,163,255,0.2)" strokeWidth="1" fill="none" />
          </svg>
        </div>

        {/* ── SECOND SMALLER SHIP (distant) ── */}
        <div className="absolute" style={{
          bottom: 138,
          opacity: 0.35,
          animation: "sail-across 42s linear infinite",
          animationDelay: "-18s",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
        }}>
          <svg width="72" height="32" viewBox="0 0 160 70" fill="none" aria-hidden="true">
            <path d="M10 50 Q16 62 26 64 L134 64 Q144 64 150 50 Z" fill="#1a3a5c" />
            <rect x="24" y="38" width="112" height="14" rx="2" fill="#1e4a7a" />
            <rect x="28" y="26" width="18" height="14" rx="1.5" fill="#c0392b" />
            <rect x="48" y="26" width="18" height="14" rx="1.5" fill="#2980b9" />
            <rect x="68" y="26" width="18" height="14" rx="1.5" fill="#27ae60" />
            <rect x="20" y="20" width="16" height="20" rx="2" fill="#0d2c4e" />
          </svg>
        </div>

        {/* Seagulls */}
        {[
          { top: "22%", delay: "0s",   dur: "18s" },
          { top: "30%", delay: "-7s",  dur: "24s" },
          { top: "16%", delay: "-12s", dur: "30s" },
        ].map((g, i) => (
          <div key={i} className="absolute" style={{ top: g.top, opacity: 0.45, animation: `cloud-drift-sea ${g.dur} linear infinite`, animationDelay: g.delay }}>
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
              <path d="M1 5 Q4.5 1 9 5 Q13.5 1 17 5" stroke="white" strokeWidth="1.2" fill="none" />
            </svg>
          </div>
        ))}

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center" style={{ bottom: 120 }}>
          <p className="text-xs uppercase tracking-[0.35em] text-[#4fa3ff] mb-3">Sea Freight</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] mb-4">
            Ocean Freight Solutions
          </h1>
          <p className="text-[#b8cce8] max-w-xl text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            FCL, LCL and bulk cargo across 150+ global ports.
          </p>
        </div>

        <style>{`
          @keyframes sail-across {
            from { transform: translateX(-220px); }
            to   { transform: translateX(110vw); }
          }
          @keyframes cloud-drift-sea {
            from { transform: translateX(-300px); }
            to   { transform: translateX(110vw); }
          }
          @keyframes wave-move {
            from { transform: scaleX(0.96) translateX(-4px); }
            to   { transform: scaleX(1.04) translateX(4px); }
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
              <Ship className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                World-Class Ocean Freight
              </h2>
              <p className="text-[#b8cce8] leading-relaxed">
                NexaCargo's sea freight division handles millions of TEUs annually across
                all major global trade corridors. From Asia-Pacific to transatlantic routes,
                our port-to-port and door-to-door solutions are backed by deep carrier
                relationships, real-time container tracking, and a dedicated documentation team
                that ensures compliance in every jurisdiction.
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

        {/* Trade lanes */}
        <div className="rounded-2xl border border-[#2563eb]/30 bg-[#0d1e3a] p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Key Trade Lanes</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Asia–Europe (FAR EAST → EMEA)",
              "Transpacific (Asia → North America)",
              "Transatlantic (Europe → Americas)",
              "Intra-Asia (China, SE Asia, India)",
              "Africa & Middle East corridors",
              "Latin America NVOCC services",
            ].map((lane) => (
              <div key={lane} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#4fa3ff] shrink-0 mt-0.5" />
                <p className="text-sm text-[#b8cce8]">{lane}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-white/8 bg-gradient-to-br from-[#132244] to-[#0d1b35] p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Ship by Sea?</h2>
          <p className="text-[#b8cce8] mb-6">Request a competitive ocean freight quote today.</p>
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
