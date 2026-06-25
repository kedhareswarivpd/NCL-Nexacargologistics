"use client";

import { useState, useEffect, useRef } from "react";
import { PlaneTakeoff, Ship, Truck, FileText, LineChart, Activity, Network, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, useInView, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
};
const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.55, ease: "easeOut" } },
};
const slideRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const slideLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
function Counter({ to, suffix = "", decimals = 0, duration = 2 }: { to: number; suffix?: string; decimals?: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) {
        setVal(to);
        clearInterval(timer);
      } else {
        setVal(start);
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

export default function ServicesPage() {
  const router = useRouter();
  return (
    <div className="bg-[#0B1F3A] text-on-surface overflow-x-hidden pt-20">

      {/* ── Shared background: animated grid + particles + radial glow ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Deep gradient base */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#0d2545 0%,#0B1F3A 50%,#061830 100%)" }} />
        {/* Radial glow top-left */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-20" style={{ background: "radial-gradient(circle,#1E88E5 0%,transparent 70%)" }} />
        {/* Radial glow bottom-right */}
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15" style={{ background: "radial-gradient(circle,#00C2FF 0%,transparent 70%)" }} />
        {/* Subtle animated grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(0,194,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(0,194,255,0.6) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Floating particles */}
        {[...Array(18)].map((_, i) => (
          <div key={i}
            className="absolute rounded-full"
            style={{
              width:  `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: i % 3 === 0 ? "#00C2FF" : i % 3 === 1 ? "#1E88E5" : "#fff",
              opacity: 0.12 + (i % 5) * 0.06,
              top:  `${(i * 17 + 5) % 95}%`,
              left: `${(i * 23 + 3) % 95}%`,
              animation: `float ${4 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.4) % 3}s`,
            }}
          />
        ))}
      </div>

      {/* Hero */}
      <header className="relative pt-40 pb-20 px-6 overflow-hidden">
        <motion.div
          initial="hidden" animate="show" variants={stagger}
          className="relative z-10 max-w-7xl mx-auto text-center"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block px-4 py-1.5 rounded-full border border-[#00C2FF]/30 bg-[#00C2FF]/10 text-[#00C2FF] text-sm font-bold uppercase tracking-widest mb-4"
          >
            Precision Logistics
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-[64px] mb-6 leading-tight">
            Shipping Services<br /><span className="text-primary">That Actually Work</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
            Whether you're moving a small batch or a full shipment across continents, NexaCargo handles it. Air, sea or road — we keep things simple and on time.
          </motion.p>
        </motion.div>
      </header>

      {/* Services Grid — products-style alternating rows */}
      <main className="max-w-7xl mx-auto px-6 pb-24 space-y-12">

        {/* Air Freight */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="glass rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 group hover:shadow-[0_0_30px_rgba(0,194,255,0.15)] transition-all duration-500 hover:border-tertiary/30"
        >
          <motion.div variants={slideLeft} className="p-8 md:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-xs tracking-widest uppercase mb-6 w-fit">
              <PlaneTakeoff className="w-4 h-4" /> AIR FREIGHT
            </div>
            <h2 className="font-display-lg text-4xl font-bold text-on-surface mb-4">Air Freight</h2>
            <p className="font-body-lg text-lg text-on-surface-variant mb-8">When your shipment can't wait, our air freight service delivers. We handle time-sensitive cargo through our global hub network with real-time updates and temperature-controlled options where needed.</p>
            <ul className="space-y-3 mb-8">
              {["Priority & deferred air cargo options", "99.8% On-Time Performance", "Temperature-controlled handling"].map(f => (
                <li key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="text-tertiary w-5 h-5 shrink-0" />
                  <span className="text-on-surface">{f}</span>
                </li>
              ))}
            </ul>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-fit">
              <Button className="flex items-center gap-2 px-6 h-11" onClick={() => router.push("/services/air-freight")}>
                See Air Fleet Options <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
          <motion.div variants={slideRight} className="relative min-h-[380px] overflow-hidden bg-surface-container-low">
            <img alt="Air Cargo Aircraft" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          </motion.div>
        </motion.div>

        {/* Sea Freight */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="glass rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 group hover:shadow-[0_0_30px_rgba(0,194,255,0.15)] transition-all duration-500 hover:border-tertiary/30"
        >
          <motion.div variants={slideLeft} className="relative min-h-[380px] overflow-hidden bg-surface-container-low order-2 md:order-1">
            <img alt="Container Ship at Sea" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=800&q=80" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent" />
          </motion.div>
          <motion.div variants={slideRight} className="p-8 md:p-12 flex flex-col justify-center order-1 md:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-xs tracking-widest uppercase mb-6 w-fit">
              <Ship className="w-4 h-4" /> SEA FREIGHT
            </div>
            <h2 className="font-display-lg text-4xl font-bold text-on-surface mb-4">Sea Freight</h2>
            <p className="font-body-lg text-lg text-on-surface-variant mb-8">Whether you need a full container or just want to share one, we make ocean shipping straightforward. We handle routes, paperwork and tricky stuff like oversized cargo.</p>
            <ul className="space-y-3 mb-8">
              {["FCL & LCL container options", "28–35 day transit times", "Oversized & project cargo"].map(f => (
                <li key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="text-tertiary w-5 h-5 shrink-0" />
                  <span className="text-on-surface">{f}</span>
                </li>
              ))}
            </ul>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-fit">
              <Button variant="outline" className="flex items-center gap-2 px-6 h-11" onClick={() => router.push("/services/sea-freight")}>
                View Sea Routes <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Road + Customs — side by side like products Nexa Track / Customs Assist */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Road */}
          <motion.div
            variants={scaleReveal}
            whileHover={{ y: -6, boxShadow: "0 0 30px rgba(0,194,255,0.15)" }}
            className="glass rounded-3xl overflow-hidden flex flex-col group hover:border-tertiary/30 transition-all duration-500"
          >
            <div className="relative h-56 overflow-hidden">
              <img alt="Cargo Trucks on Highway" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4 w-fit">
                <Truck className="w-4 h-4" /> ROAD TRANSPORT
              </div>
              <h3 className="font-headline-lg text-2xl font-bold text-on-surface mb-3">Road Transportation</h3>
              <p className="font-body-lg text-on-surface-variant mb-6 flex-1">Our truck network covers roads across continents. Every vehicle is GPS-tracked and our dispatch team keeps things moving even when the unexpected happens.</p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" className="w-full h-11" onClick={() => router.push("/services/road-transport")}>
                  See Road Fleet Options
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Customs */}
          <motion.div
            variants={scaleReveal}
            whileHover={{ y: -6, boxShadow: "0 0 30px rgba(0,194,255,0.15)" }}
            className="glass rounded-3xl overflow-hidden flex flex-col group hover:border-tertiary/30 transition-all duration-500"
          >
            <div className="relative h-56 overflow-hidden">
              <img alt="Customs Documents" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4 w-fit">
                <FileText className="w-4 h-4" /> CUSTOMS
              </div>
              <h3 className="font-headline-lg text-2xl font-bold text-on-surface mb-3">Customs Clearance</h3>
              <p className="font-body-lg text-on-surface-variant mb-6 flex-1">Our team knows the rules across 60+ countries. Duty drawback, tariff classification, documentation — we take care of it so your goods move without delays.</p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" className="w-full h-11" onClick={() => router.push("/services/customs-clearance")}>
                  Review Customs Support
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Consulting — full-width like products CTA */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="glass rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 group hover:shadow-[0_0_30px_rgba(0,194,255,0.15)] transition-all duration-500 hover:border-tertiary/30"
        >
          <motion.div variants={slideLeft} className="p-8 md:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-xs tracking-widest uppercase mb-6 w-fit">
              <LineChart className="w-4 h-4" /> CONSULTING
            </div>
            <h2 className="font-display-lg text-4xl font-bold text-on-surface mb-4">Logistics Consulting</h2>
            <p className="font-body-lg text-lg text-on-surface-variant mb-8">We look at your supply chain honestly and tell you what's slowing it down. Then we help you fix it with practical changes backed by data.</p>
            <div className="glass rounded-xl p-5 mb-8 border border-tertiary/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-label-caps text-[10px] tracking-widest uppercase text-on-surface-variant">Avg Efficiency Gain</span>
                <span className="font-mono text-sm text-tertiary font-bold">+24%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <motion.div className="bg-tertiary h-full rounded-full"
                  initial={{ width: 0 }} whileInView={{ width: "74%" }}
                  transition={{ duration: 1.2, ease: "easeOut" }} viewport={{ once: true }} />
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-fit">
              <Button className="flex items-center gap-2 px-6 h-11" onClick={() => router.push("/services/consulting")}>
                Book Consulting Session <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
          <motion.div variants={slideRight} className="relative min-h-[380px] overflow-hidden bg-surface-container-low">
            <img alt="Logistics Strategy Consulting" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          </motion.div>
        </motion.div>
      </main>

      {/* Stats Strip — products-style features comparison */}
      <section className="py-24 border-y border-white/5" style={{ background: "linear-gradient(135deg,#0d2545 0%,#0B1F3A 50%,#061830 100%)" }}>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          className="max-w-7xl mx-auto px-6"
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold text-on-surface mb-4">Every Service, One Standard</h2>
            <p className="text-lg text-on-surface-variant">Built on our core high-performance infrastructure across every freight mode.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { to: 190,  decimals: 0, suffix: "+",  label: "Countries Served",    icon: "🌍" },
              { to: 2.4,  decimals: 1, suffix: "M",  label: "Metric Tons Annually", icon: "📦" },
              { to: 12,   decimals: 0, suffix: "k+", label: "Fleet Units",          icon: "🚛" },
              { to: 0.02, decimals: 2, suffix: "%",  label: "Damage Rate",          icon: "🛡️" },
            ].map(({ to, decimals, suffix, label, icon }) => (
              <motion.div key={label} variants={fadeUp} whileHover={{ scale: 1.06, y: -4 }} className="text-center">
                <div className="text-4xl mb-3">{icon}</div>
                <p className="font-display-lg text-5xl md:text-6xl font-black text-on-surface">
                  <Counter to={to} decimals={decimals} suffix={suffix} />
                </p>
                <p className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest mt-2">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Visibility Ecosystem — products-style feature cards */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-on-surface mb-4">You'll Always Know What's Happening</motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Every service runs through our <span className="text-tertiary font-semibold">NexaStream</span> platform — live sensor data feeds straight into your dashboard.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {[
            { Icon: Activity, title: "Live Updates",         desc: "Track conditions in real time as your cargo moves across every mode." },
            { Icon: Network,  title: "Works With Your Tools", desc: "Plugs directly into your existing ERP, WMS, or CRM system." },
          ].map(({ Icon, title, desc }) => (
            <motion.div key={title} variants={scaleReveal}
              whileHover={{ y: -6, boxShadow: "0 0 30px rgba(0,194,255,0.15)" }}
              className="glass rounded-3xl p-8 hover:border-tertiary/30 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-6">
                <Icon className="text-tertiary w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-on-surface mb-3">{title}</h4>
              <p className="text-on-surface-variant">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA — matches products page CTA section */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
          className="mt-16 glass rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden hover:border-tertiary/30 transition-all duration-500"
          whileHover={{ boxShadow: "0 0 40px rgba(0,194,255,0.12)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-container/20 to-tertiary-container/20 -z-10" />
          <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-6">Ready to Move Your Cargo?</h2>
          <p className="text-lg text-on-surface-variant mb-12 max-w-xl mx-auto">Join 500+ global businesses that trust NexaCargo to handle their freight — air, sea or road.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" className="px-8 h-14 text-lg" onClick={() => router.push("/quote")}>Get a Free Quote</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" variant="secondary" className="px-8 h-14 text-lg bg-transparent border-white/10 hover:bg-white/5" onClick={() => router.push("/contact")}>Talk to an Expert</Button>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
