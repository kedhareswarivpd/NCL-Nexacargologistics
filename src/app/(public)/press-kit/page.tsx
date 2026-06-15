"use client";

import { motion } from "framer-motion";
import { Download, FileText, Image, BookOpen, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

const ASSETS = [
  { icon: Image,    title: "Logo Pack",             desc: "SVG, PNG in light/dark variants + brand guidelines", tag: "ZIP · 4.2 MB" },
  { icon: FileText, title: "Company Fact Sheet",    desc: "Key stats, founding story, leadership bios (2026)", tag: "PDF · 1.1 MB" },
  { icon: BookOpen, title: "Brand Style Guide",     desc: "Colors, typography, tone of voice, imagery rules",   tag: "PDF · 8.4 MB" },
  { icon: FileText, title: "Executive Headshots",   desc: "High-res portraits of C-suite leadership team",      tag: "ZIP · 22 MB"  },
  { icon: Image,    title: "Product Screenshots",   desc: "NexaStream dashboard, tracking UI, mobile app",      tag: "ZIP · 15 MB"  },
  { icon: FileText, title: "Press Release Archive", desc: "All official announcements from 2020–2026",          tag: "ZIP · 3.8 MB" },
];

const STATS = [
  { val: "1998",   label: "Founded"           },
  { val: "150+",   label: "Countries Served"  },
  { val: "500K+",  label: "Annual Shipments"  },
  { val: "$2.4B",  label: "Revenue (2025)"    },
  { val: "12,000+",label: "Employees"         },
  { val: "400+",   label: "Global Hubs"       },
];

export default function PressKitPage() {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">

      {/* Hero */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(30,136,229,0.08),transparent_70%)]" />
        {[...Array(10)].map((_, i) => (
          <motion.span key={i} className="absolute rounded-full bg-tertiary/20 blur-sm pointer-events-none"
            style={{ left: `${(i*13+4)%96}%`, top: `${(i*19+6)%88}%`, width: `${6+(i%3)*3}px`, height: `${6+(i%3)*3}px` }}
            animate={{ y:[0,-14,0], opacity:[0.15,0.6,0.15] }}
            transition={{ duration: 3+(i%4), repeat: Infinity, delay: i*0.2 }} />
        ))}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 inline-block tracking-[0.2em] uppercase">Media & Press</motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-6xl font-bold mb-6">NexaCargo Press Kit</motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Everything journalists, analysts, and partners need to accurately represent NexaCargo in print, digital, and broadcast media.
          </motion.p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map(({ val, label }) => (
            <motion.div key={label} variants={fadeUp} whileHover={{ y: -4, scale: 1.04 }}
              className="glass rounded-xl p-5 text-center">
              <p className="text-2xl font-black text-tertiary">{val}</p>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Downloadable Assets */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-on-surface mb-2">Downloadable Assets</motion.h2>
          <motion.p variants={fadeUp} className="text-on-surface-variant mb-10">Official NexaCargo brand and media resources for press use.</motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ASSETS.map(({ icon: Icon, title, desc, tag }, i) => (
              <motion.div key={title} variants={fadeUp} transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6, boxShadow: "0 0 30px rgba(0,194,255,0.1)" }}
                className="glass rounded-xl p-6 flex flex-col justify-between gap-4">
                <div className="flex items-start gap-4">
                  <motion.div whileHover={{ rotate: 10 }}
                    className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-tertiary" />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-on-surface">{title}</p>
                    <p className="text-sm text-on-surface-variant mt-1">{desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant bg-white/5 px-2.5 py-1 rounded-full">{tag}</span>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-tertiary/15 border border-tertiary/30 text-tertiary text-sm font-semibold hover:bg-tertiary/25 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Media Contact */}
      <motion.section initial={{ opacity:0, y:60 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
        transition={{ duration:0.8 }} className="py-16 px-6 max-w-4xl mx-auto text-center">
        <div className="glass rounded-2xl p-12">
          <Mail className="w-12 h-12 text-tertiary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-on-surface mb-4">Media Enquiries</h2>
          <p className="text-on-surface-variant mb-4">For press releases, interviews, or media partnerships, contact our communications team.</p>
          <p className="text-tertiary font-semibold mb-8">press@nexacargo.com</p>
          <Link href="/contact">
            <motion.button whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.97 }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold shadow-[0_0_30px_rgba(0,194,255,0.25)] flex items-center gap-2 mx-auto">
              Contact PR Team <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
