"use client";

import { motion } from "framer-motion";
import { FileCheck, Globe, Shield, Zap, MapPin, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const HUBS = [
  { name: "Dubai Customs Gateway",    location: "Jebel Ali Port, UAE",       clearanceTime: "2–4 hrs",  volume: "1.2M/year", speciality: "Air & Sea",    flag:"🇦🇪" },
  { name: "Rotterdam Customs Centre", location: "Port of Rotterdam, NL",     clearanceTime: "3–6 hrs",  volume: "980K/year", speciality: "Sea Freight",  flag:"🇳🇱" },
  { name: "Shanghai Customs Hub",     location: "Pudong Free Trade Zone, CN",clearanceTime: "4–8 hrs",  volume: "1.5M/year", speciality: "Export Heavy", flag:"🇨🇳" },
  { name: "Singapore Customs Depot",  location: "Tuas Port, Singapore",      clearanceTime: "1–3 hrs",  volume: "780K/year", speciality: "Transshipment",flag:"🇸🇬" },
  { name: "Chicago CBP Liaison",      location: "O'Hare International, USA", clearanceTime: "2–5 hrs",  volume: "620K/year", speciality: "Air Freight",  flag:"🇺🇸" },
  { name: "Dhaka EPZ Hub",            location: "Chittagong Port, Bangladesh",clearanceTime:"6–12 hrs", volume: "340K/year", speciality: "RMG Export",   flag:"🇧🇩" },
];

const SERVICES = [
  { icon: FileCheck, title: "Pre-Clearance",     desc: "Submit documentation before cargo arrives to eliminate port delays." },
  { icon: Shield,    title: "Compliance Audit",  desc: "Regular audits to keep your imports aligned with changing regulations." },
  { icon: Globe,     title: "Multi-Country",     desc: "Unified customs management across 60+ countries with local expertise." },
  { icon: Zap,       title: "Fast-Track Lane",   desc: "Priority clearance channels for time-sensitive pharma and perishables." },
];

export default function CustomsHubsPage() {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">

      {/* Hero */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(0,194,255,0.07),transparent_70%)]" />
        {[...Array(10)].map((_,i)=>(
          <motion.span key={i} className="absolute rounded-full bg-tertiary/20 blur-sm pointer-events-none"
            style={{ left:`${(i*11+3)%96}%`, top:`${(i*17+5)%88}%`, width:`${6+(i%3)*3}px`, height:`${6+(i%3)*3}px` }}
            animate={{ y:[0,-14,0], opacity:[0.15,0.6,0.15] }}
            transition={{ duration:3+(i%4), repeat:Infinity, delay:i*0.2 }} />
        ))}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 inline-block tracking-[0.2em] uppercase">Customs & Compliance</motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-6xl font-bold mb-6">
            Customs <span className="text-tertiary">Hubs</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Strategic customs clearance centres at the world's busiest trade gateways, staffed by certified trade compliance specialists.
          </motion.p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-8 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{ val:"6", label:"Clearance Hubs" },{ val:"60+", label:"Countries" },{ val:"5.4M+", label:"Clearances/Year" },{ val:"99.2%", label:"First-Try Rate" }].map(({val,label})=>(
            <motion.div key={label} variants={fadeUp} whileHover={{ y:-4, scale:1.04 }} className="glass rounded-xl p-5 text-center">
              <p className="text-3xl font-black text-tertiary">{val}</p>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Services */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-on-surface mb-10 text-center">Clearance Services</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map(({ icon:Icon, title, desc })=>(
              <motion.div key={title} variants={fadeUp} whileHover={{ y:-6, boxShadow:"0 0 30px rgba(0,194,255,0.1)" }}
                className="glass rounded-xl p-6 text-center">
                <motion.div whileHover={{ rotate:10, scale:1.1 }}
                  className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-tertiary" />
                </motion.div>
                <h3 className="font-semibold text-on-surface mb-2">{title}</h3>
                <p className="text-sm text-on-surface-variant">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Hub Cards */}
      <section className="py-8 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-on-surface mb-10">Our Customs Hubs</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HUBS.map((h,i)=>(
              <motion.div key={h.name} variants={fadeUp} transition={{ delay:i*0.05 }}
                whileHover={{ y:-6, boxShadow:"0 0 30px rgba(0,194,255,0.1)" }}
                className="glass rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{h.flag}</span>
                  <div>
                    <p className="font-bold text-on-surface">{h.name}</p>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-tertiary" />{h.location}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                  <div><p className="text-[10px] text-on-surface-variant">Clearance</p><p className="font-semibold text-on-surface text-xs mt-0.5">{h.clearanceTime}</p></div>
                  <div><p className="text-[10px] text-on-surface-variant">Volume</p><p className="font-semibold text-on-surface text-xs mt-0.5">{h.volume}</p></div>
                  <div><p className="text-[10px] text-on-surface-variant">Speciality</p><p className="font-semibold text-tertiary text-xs mt-0.5">{h.speciality}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <motion.section initial={{ opacity:0, y:60 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
        className="py-16 px-6 max-w-3xl mx-auto text-center">
        <div className="glass rounded-2xl p-10">
          <Clock className="w-12 h-12 text-tertiary mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-on-surface mb-3">Speed up your clearances</h2>
          <p className="text-on-surface-variant mb-6">Our customs specialists are available 24/7 to handle documentation and expedite your shipments.</p>
          <Link href="/contact">
            <motion.button whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.97 }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold flex items-center gap-2 mx-auto shadow-[0_0_25px_rgba(0,194,255,0.25)]">
              Talk to Customs Team <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
