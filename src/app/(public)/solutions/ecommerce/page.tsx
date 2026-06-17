"use client";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ShoppingCart, Zap, RotateCcw, Package } from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function EcommercePage() {
  return (
    <div className="min-h-screen bg-[#0B1F3A] text-white pt-24 pb-16">
      <div className="relative h-72 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80" alt="E-Commerce" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B1F3A]" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center w-full px-6">
          <span className="text-xs uppercase tracking-widest text-[#00C2FF]">Industry Solutions</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2">E-Commerce & Retail</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10">
        <Link href="/solutions" className="inline-flex items-center gap-2 text-blue-300/60 hover:text-[#00C2FF] text-sm mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Industries
        </Link>

        <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-10">
          <motion.p variants={fadeUp} className="text-lg text-blue-200/70 max-w-3xl">
            E-commerce volumes spike without warning. Our fulfilment and last-mile network scales with your demand so customers always get their orders on time — even during peak seasons.
          </motion.p>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Zap,          title: "Same-Day Dispatch",  desc: "Orders picked, packed and shipped within hours." },
              { icon: Package,      title: "Scalable Storage",   desc: "Warehouse space that grows with your order volume." },
              { icon: RotateCcw,    title: "Easy Returns",       desc: "Hassle-free returns handling for your customers." },
              { icon: ShoppingCart, title: "Peak Season Ready",  desc: "We scale up for Black Friday and holiday surges." },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="w-10 h-10 rounded-xl bg-[#1E88E5]/15 border border-[#1E88E5]/25 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#00C2FF]" />
                </div>
                <p className="font-semibold text-white mb-1">{title}</p>
                <p className="text-xs text-blue-200/50">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-2xl font-bold mb-6">What We Cover</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["B2C last-mile delivery","Fulfilment centre management","Cross-border e-commerce shipping","Marketplace seller logistics","Returns & reverse logistics","Real-time order tracking","Express courier integration","Packaging and kitting services"].map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-blue-200/70">
                  <CheckCircle2 className="w-4 h-4 text-[#00C2FF] shrink-0" /> {f}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl border border-[#00C2FF]/20 bg-[#00C2FF]/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Ready to scale your deliveries?</h3>
              <p className="text-blue-200/60 text-sm">Talk to our e-commerce logistics team today.</p>
            </div>
            <Link href="/solutions/consultation" className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap">
              Book a Consultation
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
