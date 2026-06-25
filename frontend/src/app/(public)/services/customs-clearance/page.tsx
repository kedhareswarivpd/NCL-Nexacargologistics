"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Shield, CheckCircle2, Clock, Package, Globe } from "lucide-react";

const STATS = [
  { value: "60+", label: "Countries Covered" },
  { value: "2 hours", label: "Avg Clearance" },
  { value: "100%", label: "Compliance Rate" },
  { value: "24/7", label: "Support Liaison" },
];

const FEATURES = [
  { icon: FileText,  title: "Import & Export Entry",  desc: "Electronic filing of declarations to speed up cargo release at borders." },
  { icon: Shield,    title: "Tariff Classification",  desc: "Accurate HS/HTS code determination to ensure duty compliance." },
  { icon: CheckCircle2, title: "Duty & Tax Management", desc: "Duty drawback, tax relief schemes, and customs bond coordination." },
  { icon: Clock,     title: "Fast-Track Clearance",   desc: "Pre-arrival clearance options and direct liaisons with CBP/customs hubs." },
  { icon: Package,   title: "Bonded Warehousing",     desc: "Storage solutions under customs bond to defer duty payments." },
  { icon: Globe,     title: "Trade Consulting",       desc: "Incoterms guidance, audits, and international trade compliance reviews." },
];

export default function CustomsClearancePage() {
  return (
    <main className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">

      {/* ── Animated Customs Hero ── */}
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
        <div className="absolute" style={{ top: "20%", animation: "cloud-drift-customs 35s linear infinite", animationDelay: "0s" }}>
          <div className="flex gap-1 opacity-15">
            <div className="w-24 h-9 bg-white rounded-full blur-lg" />
            <div className="w-14 h-6 bg-white rounded-full blur-md -ml-5 mt-2" />
            <div className="w-18 h-8 bg-white rounded-full blur-lg -ml-4" />
          </div>
        </div>

        {/* Desk / Surface */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 160 }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a2a4a] via-[#06192e] to-[#040e1c]" />
          {/* Surface border line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(79,163,255,0.4)] to-transparent" />
        </div>

        {/* ── STAMPING PRESS (centered, moving down) ── */}
        <div className="absolute left-1/2" style={{
          bottom: 150,
          marginLeft: -30,
          animation: "stamp-press 5s ease-in-out infinite",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
          zIndex: 20,
        }}>
          <svg width="60" height="100" viewBox="0 0 60 100" fill="none" aria-hidden="true">
            <path d="M25 0 L35 0 L35 60 L25 60 Z" fill="#475569" />
            <circle cx="30" cy="15" r="12" fill="#334155" />
            <rect x="10" y="60" width="40" height="20" rx="3" fill="#1e293b" />
            <rect x="5" y="80" width="50" height="8" rx="1" fill="#22c55e" />
          </svg>
        </div>

        {/* Stamp flash glow effect */}
        <div className="absolute left-1/2 rounded-full bg-green-500/20 blur-xl" style={{
          bottom: 120,
          width: 120,
          height: 60,
          marginLeft: -60,
          animation: "stamp-glow 5s ease-in-out infinite",
          zIndex: 10,
        }} />

        {/* ── FOLDER / DOCUMENTS (moving across) ── */}
        <div className="absolute" style={{
          bottom: 40,
          left: 0,
          animation: "document-flow 5s ease-in-out infinite",
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
          zIndex: 5,
        }}>
          <svg width="100" height="120" viewBox="0 0 100 120" fill="none" aria-hidden="true">
            {/* Folder tab & back */}
            <path d="M5 15 L40 15 L48 25 L95 25 L95 115 L5 115 Z" fill="#1e4a7a" />
            {/* Document sheet */}
            <rect x="10" y="30" width="80" height="80" rx="1" fill="#0d2444" />
            {/* Lines of text */}
            <rect x="20" y="45" width="60" height="3" rx="0.5" fill="#4fa3ff" opacity="0.6" />
            <rect x="20" y="55" width="45" height="3" rx="0.5" fill="#4fa3ff" opacity="0.6" />
            <rect x="20" y="65" width="55" height="3" rx="0.5" fill="#4fa3ff" opacity="0.6" />
            <rect x="20" y="75" width="35" height="3" rx="0.5" fill="#4fa3ff" opacity="0.6" />
            
            {/* Approved stamp (fades in as document is stamped) */}
            <g style={{ animation: "stamp-appear 5s ease-in-out infinite" }}>
              <circle cx="68" cy="90" r="14" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 1.5" />
              <path d="M62 90 L66 94 L74 84" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </div>

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center" style={{ bottom: 120 }}>
          <p className="text-xs uppercase tracking-[0.35em] text-[#4fa3ff] mb-3">Customs & Compliance</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] mb-4">
            Customs Clearance Support
          </h1>
          <p className="text-[#b8cce8] max-w-xl text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Duty classification, electronic declarations, and seamless border transit in 60+ countries.
          </p>
        </div>

        <style>{`
          @keyframes document-flow {
            0% { transform: translateX(-150px) rotate(-4deg); }
            35% { transform: translateX(calc(50vw - 50px)) rotate(0deg); }
            65% { transform: translateX(calc(50vw - 50px)) rotate(0deg); }
            100% { transform: translateX(110vw) rotate(4deg); }
          }
          @keyframes stamp-press {
            0%, 30%, 70%, 100% { transform: translateY(-120px); opacity: 0; }
            40% { transform: translateY(0px); opacity: 1; }
            46% { transform: translateY(-15px); opacity: 1; }
            60% { transform: translateY(-15px); opacity: 1; }
          }
          @keyframes stamp-appear {
            0%, 42% { opacity: 0; }
            43%, 100% { opacity: 1; }
          }
          @keyframes stamp-glow {
            0%, 42%, 50%, 100% { opacity: 0; transform: scale(0.5); }
            44% { opacity: 1; transform: scale(1.1); }
          }
          @keyframes cloud-drift-customs {
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
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Seamless Border Operations
              </h2>
              <p className="text-[#b8cce8] leading-relaxed">
                Navigating the complexities of international trade compliance is one of the 
                most critical steps in any logistics supply chain. NexaCargo's dedicated customs 
                brokerage team ensures your cargo complies with all local regulations, avoiding 
                unnecessary delays and expensive penalties. We handle classification, duty calculations, 
                governmental agency clearances, and customs bonds, keeping your imports and exports 
                moving without interruption.
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

        {/* Customs Hubs / Specialities */}
        <div className="rounded-2xl border border-[#2563eb]/30 bg-[#0d1e3a] p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Brokerage Specialities</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Automated Broker Interface (ABI) filings",
              "Harmonized System (HS) code classification",
              "Free Trade Agreement (FTA) validation",
              "Customs Bond underwriting & management",
              "Carnet TIR / transit manifest processing",
              "Post-summary corrections & duty drawback audit",
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
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Clear Customs?</h2>
          <p className="text-[#b8cce8] mb-6">Talk with our certified customs brokers and trade compliance experts today.</p>
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
