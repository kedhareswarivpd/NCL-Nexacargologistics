"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plane, Ship, Truck, Globe, Zap, Shield,
  ArrowRight, MapPin, BarChart2, Headset, CheckCircle2,
  TrendingUp, Warehouse, FileText, ChevronRight, Star, Package,
  LayoutDashboard, Receipt, ShieldCheck, MessageSquare, Search,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";
const GlobeAnimation = dynamic(
  () => import("@/components/shared/GlobeAnimation").then((m) => m.GlobeAnimation),
  { ssr: false }
);
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

/* ── Animated Counter ── */
function Counter({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const SERVICES = [
  { icon: Globe,    title: "Global Freight Management",  desc: "We handle your shipments door to door — across road, rail, air and sea — with live tracking the whole way.",  color: "#1E88E5", href: "/services" },
  { icon: Plane,    title: "Air Cargo Solutions",         desc: "Need it there fast? Our air freight network gets your cargo where it needs to go, on time, every time.",        color: "#00C2FF", href: "/services/air-freight" },
  { icon: Ship,     title: "Ocean Freight Services",      desc: "Whether it's a full container or a shared load, we move ocean cargo reliably across 150+ ports worldwide.",     color: "#0B5EA8", href: "/services/sea-freight" },
  { icon: Warehouse,title: "Warehousing & Distribution",  desc: "Store, manage and dispatch your inventory from our smart warehouses — exactly when and where you need it.",   color: "#1E88E5", href: "/services" },
  { icon: FileText, title: "Customs Clearance",           desc: "Customs paperwork is a headache. We take care of all documentation and compliance so your goods move freely.", color: "#00C2FF", href: "/services/customs-clearance" },
  { icon: TrendingUp,title:"Supply Chain Optimization",   desc: "We look at how your supply chain actually works and find ways to make it faster and less expensive.",          color: "#0B5EA8", href: "/services/consulting" },
];

const INDUSTRIES = [
  { name: "Manufacturing",       icon: "🏭" },
  { name: "Retail & E-Commerce", icon: "🛍️" },
  { name: "Automotive",          icon: "🚗" },
  { name: "Healthcare",          icon: "💊" },
  { name: "Food & Beverage",     icon: "🍱" },
  { name: "Technology",          icon: "💻" },
  { name: "Government & Defence",icon: "🏛️" },
  { name: "Energy & Utilities",  icon: "⚡" },
];

const TESTIMONIALS = [
  { name: "Sarah Chen",    role: "VP Supply Chain, TechNova",    text: "Switching to NexaCargo was one of the best decisions we made. Our deliveries are faster, costs are down, and we can actually see where our cargo is at any moment.", rating: 5 },
  { name: "David Müller",  role: "Head of Logistics, AutoPrime", text: "The warehouse tools are genuinely impressive. We used to struggle with pick errors — that's pretty much gone now. The team was also very helpful during onboarding.",    rating: 5 },
  { name: "Priya Sharma",  role: "COO, MedSupply Asia",          text: "For pharmaceutical shipments, you can't afford mistakes. NexaCargo gave us the temperature monitoring and documentation we needed to stay compliant without the stress.",   rating: 5 },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleTrack = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login first to track your shipment.");
      return;
    }

    const trimmed = trackingId.trim();
    if (!trimmed) {
      setValidationError("Please enter a tracking ID.");
      return;
    }

    if (trimmed.length > 14) {
      setValidationError("Shipment ID must not exceed 14 characters.");
      return;
    }

    const regex = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
    if (!regex.test(trimmed) || !trimmed.includes('-')) {
      setValidationError("Shipment ID must only contain numbers, letters, and hyphens (-) in between.");
      return;
    }

    setValidationError("");
    router.push(`/customer/track?tracking_id=${encodeURIComponent(trimmed)}`);
  };
  return (
    <div className="bg-[#0B1F3A] text-white overflow-x-hidden">

      {/* ════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 overflow-hidden">

        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A] via-[#0d2545] to-[#061422]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_40%,rgba(30,136,229,0.18),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_20%_60%,rgba(0,194,255,0.08),transparent)]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(rgba(0,194,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,194,255,1) 1px,transparent 1px)",
            backgroundSize: "60px 60px"
          }} />

          {/* ── Live shipment vehicles behind heading ── */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Ground line */}
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1E88E5]/30 to-transparent" style={{ bottom: "22%" }} />
            {/* Sea strip */}
            <div className="absolute left-0 right-0" style={{ bottom: 0, height: "22%", background: "linear-gradient(to bottom,transparent,rgba(6,24,48,0.35))" }} />
            {/* Plane 1 */}
            <div className="absolute" style={{ top: "12%", animation: "runway-slide 12s linear infinite" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: 80, height: 2, background: "linear-gradient(to right,transparent,rgba(0,194,255,0.5))", marginRight: -2 }} />
                <svg width="60" height="28" viewBox="0 0 80 38" fill="none"><ellipse cx="42" cy="19" rx="30" ry="7" fill="#b0c8f0" /><path d="M72 19 Q80 19 78 16 L72 13 Z" fill="#e0eeff" /><path d="M34 19 L16 4 L22 19 L16 34 L34 19Z" fill="#7aaee8" /><path d="M12 19 L6 8 L14 14 Z" fill="#6090c8" /></svg>
              </div>
            </div>
            {/* Plane 2 small */}
            <div className="absolute" style={{ top: "6%", opacity: 0.35, animation: "runway-slide 20s linear infinite", animationDelay: "-8s" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: 50, height: 1, background: "linear-gradient(to right,transparent,rgba(0,194,255,0.35))", marginRight: -1 }} />
                <svg width="36" height="17" viewBox="0 0 80 38" fill="none"><ellipse cx="42" cy="19" rx="30" ry="7" fill="#c0d8f8" /><path d="M34 19 L16 4 L22 19 L16 34 L34 19Z" fill="#8aaee8" /></svg>
              </div>
            </div>
            {/* Truck */}
            <div className="absolute flex items-center" style={{ bottom: "23%", animation: "runway-slide 15s linear infinite", animationDelay: "-4s" }}>
              <div style={{ width: 36, height: 2, background: "linear-gradient(to right,transparent,rgba(30,136,229,0.3))", marginRight: -2 }} />
              <svg width="88" height="40" viewBox="0 0 88 42" fill="none"><rect x="2" y="10" width="54" height="24" rx="2" fill="#1a3a5c" /><rect x="4" y="12" width="50" height="20" rx="1" fill="#0d2a48" /><rect x="8" y="16" width="30" height="6" rx="1" fill="rgba(0,194,255,0.3)" /><path d="M56 18 L56 34 L82 34 L82 22 Q82 16 76 14 L60 14 Q56 14 56 18Z" fill="#1a3a5c" /><path d="M60 16 Q60 14 64 14 L74 14 Q79 14 80 18 L80 22 L60 22 Z" fill="rgba(0,194,255,0.5)" /><rect x="80" y="24" width="4" height="3" rx="1" fill="rgba(255,240,160,0.9)" /><circle cx="16" cy="36" r="5" fill="#061422" stroke="#3a6a9a" strokeWidth="1.5" /><circle cx="36" cy="36" r="5" fill="#061422" stroke="#3a6a9a" strokeWidth="1.5" /><circle cx="64" cy="36" r="5" fill="#061422" stroke="#3a6a9a" strokeWidth="1.5" /><circle cx="76" cy="36" r="5" fill="#061422" stroke="#3a6a9a" strokeWidth="1.5" /></svg>
            </div>
            {/* Ship */}
            <div className="absolute flex items-center" style={{ bottom: "4%", animation: "runway-slide 28s linear infinite", animationDelay: "-12s" }}>
              <div style={{ width: 90, height: 5, background: "linear-gradient(to right,transparent,rgba(0,194,255,0.15))", marginRight: -4, alignSelf: "flex-end", marginBottom: 8 }} />
              <svg width="120" height="52" viewBox="0 0 110 48" fill="none"><path d="M8 34 Q12 42 20 44 L90 44 Q98 44 102 34 Z" fill="#1a3a5c" /><rect x="18" y="26" width="74" height="10" rx="2" fill="#1e4a7a" /><rect x="22" y="18" width="14" height="10" rx="1" fill="#c0392b" /><rect x="38" y="18" width="14" height="10" rx="1" fill="#e67e22" /><rect x="54" y="18" width="14" height="10" rx="1" fill="#2980b9" /><rect x="70" y="18" width="14" height="10" rx="1" fill="#e74c3c" /><rect x="30" y="10" width="14" height="9" rx="1" fill="#f39c12" /><rect x="46" y="10" width="14" height="9" rx="1" fill="#3498db" /><rect x="62" y="10" width="14" height="9" rx="1" fill="#2ecc71" /><rect x="16" y="14" width="12" height="14" rx="2" fill="#0d2c4e" /></svg>
            </div>
            {/* Live label */}
            <div className="absolute right-6 bottom-[24%] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-blue-300/40">Live Shipments</span>
            </div>
          </div>
        </div>

        {/* Orbiting glow rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[700px] h-[700px] rounded-full border border-[#00C2FF]/6 animate-spin" style={{ animationDuration: "40s" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-[#1E88E5]/8 animate-spin" style={{ animationDuration: "25s", animationDirection: "reverse" }} />
          <div className="absolute w-[320px] h-[320px] rounded-full border border-[#00C2FF]/5 animate-spin" style={{ animationDuration: "15s" }} />
        </div>

        {/* Floating particles */}
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: i % 5 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
            height: i % 5 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
            background: i % 4 === 0 ? "#00C2FF" : i % 4 === 1 ? "#1E88E5" : i % 4 === 2 ? "#7dd3fc" : "#38bdf8",
            top: `${(i * 17 + 5) % 92}%`,
            left: `${(i * 31 + 3) % 96}%`,
            opacity: 0.25 + (i % 5) * 0.12,
            animation: `float-up ${3 + (i % 6)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.35) % 5}s`,
            boxShadow: i % 5 === 0 ? "0 0 6px rgba(0,194,255,0.8)" : "none",
          }} />
        ))}

        {/* Moving plane across hero */}
        <div className="absolute pointer-events-none" style={{ top: "18%", animation: "hero-fly 18s linear infinite" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 100, height: 2, background: "linear-gradient(to right,transparent,rgba(0,194,255,0.5))", marginRight: -2 }} />
            <svg width="72" height="34" viewBox="0 0 80 38" fill="none" aria-hidden="true">
              <ellipse cx="42" cy="19" rx="30" ry="7" fill="#b0c8f0" />
              <path d="M72 19 Q80 19 78 16 L72 13 Z" fill="#e0eeff" />
              <path d="M34 19 L16 4 L22 19 L16 34 L34 19Z" fill="#7aaee8" />
              <path d="M12 19 L6 8 L14 14 Z" fill="#6090c8" />
              <path d="M12 19 L6 30 L14 24 Z" fill="#6090c8" />
              <ellipse cx="66" cy="15" rx="4" ry="2.5" fill="rgba(0,194,255,0.7)" />
            </svg>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00C2FF]/30 bg-[#00C2FF]/10 text-[#00C2FF] text-xs uppercase tracking-widest mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C2FF] animate-pulse" />
                  Trusted by Businesses Across the Globe
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              >
                Move Cargo{" "}
                <span className="bg-gradient-to-r from-[#1E88E5] via-[#00C2FF] to-[#1E88E5] bg-clip-text text-transparent bg-[length:200%] animate-gradient">
                  Smarter
                </span>
                <br />Not Harder
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-blue-200/80 max-w-xl mb-10 leading-relaxed"
              >
                We help businesses ship goods across the world — faster, cheaper and with full visibility at every step. From a single parcel to full container loads, we've got it covered.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col gap-4 max-w-xl mx-auto lg:mx-0 mb-12"
              >
                <form
                  onSubmit={handleTrack}
                  className="flex flex-col sm:flex-row gap-3 items-stretch w-full"
                >
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300 pointer-events-none" />
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => {
                        setTrackingId(e.target.value);
                        setValidationError("");
                      }}
                      placeholder="Enter Shipment ID (e.g. SHP-90421)"
                      className="w-full min-w-[260px] pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-blue-200/50 focus:outline-none focus:border-[#00C2FF]/60 focus:bg-white/10 transition-all font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white shadow-[0_0_30px_rgba(0,194,255,0.35)] hover:shadow-[0_0_50px_rgba(0,194,255,0.55)] hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                  >
                    Track Shipment
                  </button>
                  <Link href={isAuthenticated ? "/customer/quotes" : "/contact"} className="flex">
                    <button
                      type="button"
                      className="px-6 py-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur text-white font-semibold text-base hover:bg-white/10 hover:border-[#00C2FF]/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                    >
                      Need a quote? Request Quote <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </form>

                {validationError && (
                  <div className="text-red-400 text-sm font-semibold text-center lg:text-left">
                    {validationError}
                  </div>
                )}

              </motion.div>

              {/* Hero stats */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  { val: 500, suffix: "K+", label: "Shipments Completed" },
                  { val: 120,  suffix: "+",  label: "Countries Covered" },
                  { val: 98,   suffix: "%",  label: "On-Time Rate" },
                  { val: 24,   suffix: "/7", label: "Always Available" },
                ].map(({ val, suffix, label }) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur p-4 text-center">
                    <p className="text-2xl font-bold text-white">
                      <Counter to={val} suffix={suffix} />
                    </p>
                    <p className="text-xs text-blue-200/60 mt-1 uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Globe Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="flex-1 w-full max-w-lg"
            >
              <GlobeAnimation />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-90 z-20">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00C2FF]">Scroll</span>
          <div className="w-px h-6 bg-gradient-to-b from-[#00C2FF] to-transparent animate-pulse" />
        </div>

        <style>{`
          @keyframes hero-fly { from { transform: translateX(-200px); } to { transform: translateX(105vw); } }
          @keyframes runway-slide { from { transform: translateX(-200px); } to { transform: translateX(110vw); } }
          @keyframes float-up { 0%,100% { transform: translateY(0) scale(1); opacity: 0.4; } 50% { transform: translateY(-22px) scale(1.3); opacity: 1; } }
          @keyframes animate-gradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
          .animate-gradient { animation: animate-gradient 4s ease infinite; }
          @keyframes beacon-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(2.2); opacity: 0; } }
          @keyframes card-glow { 0%,100% { box-shadow: 0 0 0px rgba(0,194,255,0); } 50% { box-shadow: 0 0 24px rgba(0,194,255,0.18); } }
        `}</style>
      </section>

      {/* ════════════════════════════════════════════
          CUSTOMER PORTAL ACCESS (logged-in only)
      ════════════════════════════════════════════ */}
      {isAuthenticated && user?.role === "customer" && (
        <section className="py-14 bg-gradient-to-r from-[#0d2545] to-[#0B1F3A] border-y border-[#00C2FF]/10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-[#00C2FF] text-xs uppercase tracking-widest mb-1">Welcome back, {user.name.split(" ")[0]}</p>
                <h2 className="text-2xl font-bold text-white">Your Customer Portal</h2>
              </div>
              <Link href="/customer">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E88E5]/20 border border-[#1E88E5]/30 text-[#00C2FF] text-sm font-semibold hover:bg-[#1E88E5]/30 transition-all">
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Search,       label: "Track Shipment",  href: "/customer/track",    color: "text-[#00C2FF]",  bg: "bg-[#00C2FF]/10",  border: "border-[#00C2FF]/20" },
                { icon: FileText,     label: "Request Quote",   href: "/customer/quotes",   color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20" },
                { icon: Receipt,      label: "My Invoices",     href: "/customer/invoices", color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20" },
                { icon: ShieldCheck,  label: "Insurance",       href: "/customer/insurance",color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20" },
                { icon: Receipt,      label: "Payments",        href: "/customer/payment",  color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
                { icon: MessageSquare,label: "Support",         href: "/customer/support",  color: "text-pink-400",   bg: "bg-pink-400/10",   border: "border-pink-400/20" },
              ].map(({ icon: Icon, label, href, color, bg, border }) => (
                <Link key={label} href={href}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.03 }}
                    className={`rounded-xl border ${border} ${bg} p-4 flex flex-col items-center gap-3 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,194,255,0.1)]`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${bg} border ${border} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <p className="text-xs font-semibold text-white text-center">{label}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          SERVICES
      ════════════════════════════════════════════ */}
      <section className="py-24 bg-[#0d2040]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#00C2FF]/30 bg-[#00C2FF]/10 text-[#00C2FF] text-sm font-bold uppercase tracking-widest mb-4">
              What We Offer
            </span>
            <h2 className="text-4xl font-bold text-white mt-3 mb-4">Everything You Need to Ship Globally</h2>
            <p className="text-blue-200/60 max-w-xl mx-auto">From air freight to customs clearance, we handle every part of your shipment so you don't have to worry about it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, desc, color, href }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.08 }}
                whileHover={{ y: -10, scale: 1.03, boxShadow: "0 20px 40px rgba(0, 194, 255, 0.15)", borderColor: "rgba(0, 194, 255, 0.35)" }}
                className="group rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur p-7 cursor-pointer transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-[#00C2FF] transition-colors">{title}</h3>
                <p className="text-sm text-blue-200/60 leading-relaxed">{desc}</p>
                <Link href={href} className="flex items-center gap-2 mt-5 text-[#1E88E5] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#00C2FF]">
                  Learn more <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STATS COUNTER BAND
      ════════════════════════════════════════════ */}
      <section className="py-16 border-y border-white/5 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0d2545,#0B1F3A)" }}>
        {/* Sweeping shimmer */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg,transparent 30%,rgba(0,194,255,0.04) 50%,transparent 70%)", animation: "shimmer-sweep 4s ease-in-out infinite" }} />
        <style>{`@keyframes shimmer-sweep { 0%,100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }`}</style>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: 500000, suffix: "+", label: "Shipments Delivered", icon: Package },
              { val: 120,    suffix: "+", label: "Global Locations",    icon: Globe },
              { val: 98,     suffix: "%", label: "On-Time Delivery",    icon: CheckCircle2 },
              { val: 10000,  suffix: "+", label: "Active Fleet",        icon: Truck },
            ].map(({ val, suffix, label, icon: Icon }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.08 }}
                whileHover={{ y: -8, scale: 1.05, boxShadow: "0 15px 30px rgba(0,194,255,0.15)", borderColor: "rgba(0,194,255,0.3)" }}
                className="group rounded-2xl border border-white/8 bg-white/[0.03] p-6 cursor-default transition-all duration-300"
                style={{ animation: "card-glow 4s ease-in-out infinite" }}
              >
                <div className="flex justify-center mb-3">
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-[#1E88E5]/15 border border-[#1E88E5]/25 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"
                    animate={{ boxShadow: ["0 0 0px rgba(0,194,255,0)", "0 0 18px rgba(0,194,255,0.4)", "0 0 0px rgba(0,194,255,0)"] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: Math.random() * 2 }}
                  >
                    <Icon className="w-5 h-5 text-[#00C2FF]" />
                  </motion.div>
                </div>
                <p className="text-4xl font-bold text-white mb-1" style={{ textShadow: "0 0 20px rgba(0,194,255,0.4)" }}>
                  <Counter to={val} suffix={suffix} />
                </p>
                <p className="text-sm text-blue-200/50 uppercase tracking-widest">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="py-24 bg-[#0B1F3A]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#00C2FF]/30 bg-[#00C2FF]/10 text-[#00C2FF] text-sm font-bold uppercase tracking-widest mb-4">
              Industries
            </span>
            <h2 className="text-4xl font-bold text-white mt-3 mb-4 text-center mx-auto">Industries We Serve</h2>
            <p className="text-blue-200/60 max-w-lg mx-auto text-center">Different industries have different shipping needs. We know them all and have built solutions that actually fit.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {INDUSTRIES.map(({ name, icon }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -6, scale: 1.05, borderColor: "rgba(30,136,229,0.5)", backgroundColor: "rgba(30,136,229,0.1)" }}
                className="w-full sm:w-[calc(33.333%-12px)] rounded-xl border border-white/8 bg-white/[0.03] p-6 text-center cursor-pointer transition-all duration-200 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">{icon}</div>
                <p className="text-base font-bold text-white group-hover:text-[#00C2FF] transition-colors">{name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════ */}
      <section className="py-24 bg-[#0d2040]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#00C2FF]/30 bg-[#00C2FF]/10 text-[#00C2FF] text-sm font-bold uppercase tracking-widest mb-4">
              Real Feedback
            </span>
            <h2 className="text-4xl font-bold text-white mt-3">What Our Clients Actually Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, rating }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.1 }}
                whileHover={{ y: -12, scale: 1.03, boxShadow: "0 25px 50px rgba(0,194,255,0.15)", borderColor: "rgba(0,194,255,0.3)" }}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 transition-all duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#00C2FF] text-[#00C2FF]" />
                  ))}
                </div>
                <p className="text-blue-100/80 leading-relaxed mb-6 text-sm">"{text}"</p>
                <div>
                  <p className="font-bold text-white text-sm">{name}</p>
                  <p className="text-xs text-[#00C2FF] mt-0.5">{role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0d2545 0%,#0B1F3A 50%,#061830 100%)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(0,194,255,0.08),transparent)]" />
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] rounded-full border border-[#00C2FF]/5 animate-spin" style={{ animationDuration: "30s" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-[#1E88E5]/8 animate-spin" style={{ animationDuration: "20s", animationDirection: "reverse" }} />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-[#00C2FF]/6 animate-spin" style={{ animationDuration: "12s" }} />
          {/* Beacon dots on ring */}
          {[0, 90, 180, 270].map((deg) => (
            <div key={deg} className="absolute w-2 h-2" style={{ transform: `rotate(${deg}deg) translateX(250px)` }}>
              <div className="w-2 h-2 rounded-full bg-[#00C2FF] opacity-70" style={{ animation: "beacon-pulse 2s ease-in-out infinite", animationDelay: `${deg / 90 * 0.5}s` }} />
            </div>
          ))}
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#00C2FF]/30 bg-[#00C2FF]/10 text-[#00C2FF] text-sm font-bold uppercase tracking-widest mb-6">Let's Get Moving</span>
            <h2 className="text-5xl font-bold text-white mb-6">Ready to Ship<br />Without the Hassle?</h2>
            <p className="text-blue-200/60 max-w-xl mx-auto mb-10 text-lg">Over 500 businesses already trust NexaCargo to handle their logistics. Come see why.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register">
                <button className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-lg shadow-[0_0_40px_rgba(0,194,255,0.3)] hover:shadow-[0_0_60px_rgba(0,194,255,0.5)] hover:-translate-y-1 transition-all duration-200">
                  Start Your Journey
                </button>
              </Link>
              {/* <Link href="/contact">
                <button className="px-10 py-4 rounded-xl border border-white/20 bg-white/5 text-white font-bold text-lg hover:bg-white/10 hover:-translate-y-1 transition-all duration-200 flex items-center gap-2">
                  <Headset className="w-5 h-5" /> 
                </button>
              </Link> */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links Bar */}
      <section className="border-t border-white/5 bg-[#061422] py-5 px-6">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-16">
          {[
            { label: "Privacy Policy",   href: "/privacy-policy",   icon: "🔒" },
            { label: "Terms of Service", href: "/terms-of-service", icon: "📄" },
            { label: "Track Status",     href: "/track",            icon: "📦" },
          ].map(({ label, href, icon }) => (
            <Link key={label} href={href}
              className="flex items-center gap-2 text-sm text-white hover:text-[#00C2FF] transition-colors duration-200 group"
            >
              <span className="text-base group-hover:scale-110 transition-transform duration-200">{icon}</span>
              <span className="font-medium tracking-wide">{label}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
