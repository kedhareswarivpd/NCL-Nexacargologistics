"use client";

import { Shirt, Syringe, ShoppingCart, Package, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15 } },
};
const scaleReveal = {
  hidden: { opacity: 0, scale: 0.92 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.65 } },
};

export default function IndustrySolutionsPage() {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24">

        {/* Hero */}
        <motion.header
          initial="hidden" animate="show" variants={stagger}
          className="mb-16"
        >
          <div className="max-w-3xl">
            <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 block tracking-[0.2em] uppercase">
              Industry Solutions
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-6xl font-bold text-on-surface mb-6 leading-tight">
              Industries <span className="text-tertiary">We Serve</span>.
            </motion.h1>
            <motion.p variants={fadeUp} className="font-body-lg text-lg text-on-surface-variant leading-relaxed">
              Every industry ships differently. What works for a fashion brand won't work for a pharmaceutical company. That's why we've built solutions around the specific needs of each sector we serve.
            </motion.p>
          </div>
        </motion.header>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Textile */}
          <Link href="/solutions/textile">
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={scaleReveal}
            className="h-[420px] relative group overflow-hidden rounded-xl glass cursor-pointer"
            whileHover={{ y: -6, boxShadow: "0 0 50px rgba(66,165,245,0.2)" }}
          >
            <motion.div className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80')" }}
              whileHover={{ scale: 1.06 }} transition={{ duration: 0.7 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4">
                <Shirt className="w-4 h-4" /> TEXTILE & APPAREL
              </span>
              <h3 className="font-headline-lg text-2xl font-bold text-white mb-3">Fashion Moves Fast. So Do We.</h3>
              <p className="text-sm text-on-surface-variant mb-4">Seasonal collections have tight windows. We get your garments to market on time, every season.</p>
              <span className="inline-flex items-center gap-2 text-tertiary text-sm font-semibold group-hover:gap-4 transition-all">
                Explore Solutions <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </motion.section>
          </Link>

          {/* Pharma */}
          <Link href="/solutions/pharma">
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}
            className="h-[420px] relative group overflow-hidden rounded-xl glass cursor-pointer"
            whileHover={{ y: -6, boxShadow: "0 0 50px rgba(66,165,245,0.2)" }}
          >
            <motion.div className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80')" }}
              whileHover={{ scale: 1.06 }} transition={{ duration: 0.7 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4">
                <Syringe className="w-4 h-4" /> PHARMA
              </span>
              <h3 className="font-headline-lg text-2xl font-bold text-white mb-3">Temperature Control You Can Trust.</h3>
              <p className="text-sm text-on-surface-variant mb-4">GDP-compliant cold-chain from pickup to delivery with full regulatory documentation.</p>
              <span className="inline-flex items-center gap-2 text-tertiary text-sm font-semibold group-hover:gap-4 transition-all">
                Explore Solutions <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </motion.section>
          </Link>

          {/* E-commerce */}
          <Link href="/solutions/ecommerce">
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={scaleReveal}
            className="h-[420px] relative group overflow-hidden rounded-xl glass cursor-pointer"
            whileHover={{ y: -6, boxShadow: "0 0 50px rgba(66,165,245,0.2)" }}
          >
            <motion.div className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80')" }}
              whileHover={{ scale: 1.06 }} transition={{ duration: 0.7 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4">
                <ShoppingCart className="w-4 h-4" /> E-COMMERCE
              </span>
              <h3 className="font-headline-lg text-2xl font-bold text-white mb-3">Deliveries That Keep Up With Orders.</h3>
              <p className="text-sm text-on-surface-variant mb-4">Scalable fulfilment and last-mile network for peak-season demand spikes.</p>
              <span className="inline-flex items-center gap-2 text-tertiary text-sm font-semibold group-hover:gap-4 transition-all">
                Explore Solutions <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </motion.section>
          </Link>

          {/* FMCG */}
          <Link href="/solutions/fmcg">
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={scaleReveal}
            className="h-[420px] relative group overflow-hidden rounded-xl glass cursor-pointer"
            whileHover={{ y: -6, boxShadow: "0 0 50px rgba(66,165,245,0.2)" }}
          >
            <motion.div className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80')" }}
              whileHover={{ scale: 1.06 }} transition={{ duration: 0.7 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4">
                <Package className="w-4 h-4" /> FMCG
              </span>
              <h3 className="font-headline-lg text-2xl font-bold text-white mb-3">From the Factory to the Shelf.</h3>
              <p className="text-sm text-on-surface-variant mb-4">Connect your production line to retail points with reliable omnichannel distribution.</p>
              <span className="inline-flex items-center gap-2 text-tertiary text-sm font-semibold group-hover:gap-4 transition-all">
                Explore Solutions <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </motion.section>
          </Link>

          {/* Export */}
          <Link href="/solutions/export">
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}
            className="h-[420px] relative group overflow-hidden rounded-xl glass cursor-pointer"
            whileHover={{ y: -6, boxShadow: "0 0 50px rgba(66,165,245,0.2)" }}
          >
            <motion.div className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80')" }}
              whileHover={{ scale: 1.06 }} transition={{ duration: 0.7 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4">
                <Globe className="w-4 h-4" /> EXPORT SECTOR
              </span>
              <h3 className="font-headline-lg text-2xl font-bold text-white mb-3">Selling Abroad Shouldn't Be This Hard.</h3>
              <p className="text-sm text-on-surface-variant mb-4">Customs, documentation and multi-modal shipping for regional manufacturers going global.</p>
              <span className="inline-flex items-center gap-2 text-tertiary text-sm font-semibold group-hover:gap-4 transition-all">
                Explore Solutions <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </motion.section>
          </Link>

        </div>

        {/* Stats */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center py-12 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl"
        >
          {[
            { val: "98%",  label: "On-Time Delivery" },
            { val: "200+", label: "Global Hubs" },
            { val: "15M+", label: "Annual Shipments" },
            { val: "24/7", label: "Active Monitoring" },
          ].map(({ val, label }) => (
            <motion.div key={label} variants={fadeUp} whileHover={{ scale: 1.08, y: -4 }}>
              <div className="font-display-lg text-5xl font-black text-white">{val}</div>
              <div className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant mt-2">{label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="mt-16 p-12 rounded-xl glass flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-[#005db7]/20 to-transparent"
          whileHover={{ boxShadow: "0 0 40px rgba(66,165,245,0.15)" }}
        >
          <div className="max-w-xl">
            <h2 className="font-headline-lg text-3xl font-bold text-white mb-2">Want to talk about your sector?</h2>
            <p className="font-body-lg text-lg text-on-surface-variant">Tell us what you ship, where it's going, and what's been giving you trouble. We'll put together a plan that actually fits.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link href="/solutions/consultation">
                <Button size="lg" className="text-base px-8">Schedule Consultation</Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link href="/solutions/brochure">
                <Button size="lg" variant="secondary" className="text-base px-8 bg-white/5">Download Brochure</Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
