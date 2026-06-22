"use client";

import { motion } from "framer-motion";
import { Warehouse, Thermometer, Package, Zap, MapPin, ArrowRight, BarChart2 } from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const WAREHOUSES = [
  { name: "Dubai Mega Warehouse",       location: "Jebel Ali FEZ, UAE",      size: "280,000 m²", capacity: "2.4M units", features: ["Cold Chain","Hazmat","Bonded"], flag:"🇦🇪" },
  { name: "Shanghai Logistics Park",    location: "Pudong, Shanghai, China",  size: "195,000 m²", capacity: "1.8M units", features: ["Automation","24/7 Ops","RFID"],  flag:"🇨🇳" },
  { name: "Rotterdam Distribution Hub", location: "Waalhaven, Netherlands",   size: "160,000 m²", capacity: "1.4M units", features: ["Port Access","Bonded","Cold"],   flag:"🇳🇱" },
  { name: "Singapore Depot",            location: "Tuas, Singapore",          size: "120,000 m²", capacity: "1.1M units", features: ["Smart Zones","Cold Chain","RFID"],flag:"🇸🇬" },
  { name: "Chicago Gateway",            location: "Elk Grove, IL, USA",       size: "145,000 m²", capacity: "1.3M units", features: ["Cross-Dock","Automation","24/7"], flag:"🇺🇸" },
  { name: "Dhaka Export Centre",        location: "Narayanganj, Bangladesh",  size: "65,000 m²",  capacity: "0.5M units", features: ["Garment Ready","Bonded","Fast Track"],flag:"🇧🇩" },
];

const CAPABILITIES = [
  { icon: Thermometer, title: "Cold Chain",       desc: "-25°C to +15°C controlled environments for pharma, food & biotech cargo." },
  { icon: Zap,         title: "Smart Automation", desc: "Robotic picking, automated sortation and AI-driven inventory management." },
  { icon: Package,     title: "Bonded Storage",   desc: "Customs-bonded zones enabling duty-deferred storage across key hubs." },
  { icon: BarChart2,   title: "3D Inventory",     desc: "Real-time 3D stock visualisation with ERP integration and live alerts." },
];

export default function WarehouseNetworkPage() {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">

      {/* Hero */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(30,136,229,0.07),transparent_70%)]" />
        {[...Array(10)].map((_,i)=>(
          <motion.span key={i} className="absolute rounded-full bg-tertiary/20 blur-sm pointer-events-none"
            style={{ left:`${(i*11+3)%96}%`, top:`${(i*17+5)%88}%`, width:`${6+(i%3)*3}px`, height:`${6+(i%3)*3}px` }}
            animate={{ y:[0,-14,0], opacity:[0.15,0.6,0.15] }}
            transition={{ duration:3+(i%4), repeat:Infinity, delay:i*0.2 }} />
        ))}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 inline-block tracking-[0.2em] uppercase">Infrastructure</motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-6xl font-bold mb-6">
            Warehouse <span className="text-tertiary">Network</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Over 1 million square metres of strategically located, technology-enabled warehousing facilities across the globe.
          </motion.p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-8 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{ val:"1M+", label:"sq metres" },{ val:"6", label:"Mega Hubs" },{ val:"8.5M", label:"Unit Capacity" },{ val:"99.8%", label:"Accuracy Rate" }].map(({val,label})=>(
            <motion.div key={label} variants={fadeUp} whileHover={{ y:-4, scale:1.04 }} className="glass rounded-xl p-5 text-center">
              <p className="text-3xl font-black text-tertiary">{val}</p>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Capabilities */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-on-surface mb-10 text-center">Warehouse Capabilities</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CAPABILITIES.map(({ icon:Icon, title, desc })=>(
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

      {/* Warehouse List */}
      <section className="py-8 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-on-surface mb-10">Our Facilities</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WAREHOUSES.map((w,i)=>(
              <motion.div key={w.name} variants={fadeUp} transition={{ delay:i*0.05 }}
                whileHover={{ y:-6, boxShadow:"0 0 30px rgba(0,194,255,0.1)" }}
                className="glass rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{w.flag}</span>
                  <div>
                    <p className="font-bold text-on-surface">{w.name}</p>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-tertiary" />{w.location}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div><p className="text-xs text-on-surface-variant">Floor Area</p><p className="font-semibold text-on-surface text-sm">{w.size}</p></div>
                  <div><p className="text-xs text-on-surface-variant">Capacity</p><p className="font-semibold text-on-surface text-sm">{w.capacity}</p></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {w.features.map(f=>(
                    <span key={f} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-tertiary bg-tertiary/10 border border-tertiary/20">{f}</span>
                  ))}
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
          <Warehouse className="w-12 h-12 text-tertiary mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-on-surface mb-3">Need warehousing solutions?</h2>
          <p className="text-on-surface-variant mb-6">Talk to our team about storage, fulfilment, and distribution options near your market.</p>
          <Link href="/contact">
            <motion.button whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.97 }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold flex items-center gap-2 mx-auto shadow-[0_0_25px_rgba(0,194,255,0.25)]">
              Request a Quote <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
