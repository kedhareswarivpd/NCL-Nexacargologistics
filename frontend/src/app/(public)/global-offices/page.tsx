"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const OFFICES = [
  { city: "Dubai",      country: "UAE",           region: "Middle East",   address: "NexaCargo Tower, DIFC, Dubai 00971", phone: "+971 4 000 0000", email: "dubai@nexacargo.com",     hours: "Sun–Thu 08:00–18:00", type: "Global HQ",    flag: "🇦🇪" },
  { city: "Shanghai",   country: "China",         region: "Asia Pacific",  address: "Pudong New Area, Shanghai 200120",   phone: "+86 21 0000 0000",email: "shanghai@nexacargo.com",  hours: "Mon–Fri 09:00–18:00", type: "Regional HQ",  flag: "🇨🇳" },
  { city: "Rotterdam",  country: "Netherlands",   region: "Europe",        address: "Waalhaven, 3087 Rotterdam",          phone: "+31 10 000 0000", email: "rotterdam@nexacargo.com", hours: "Mon–Fri 08:00–17:00", type: "Port Office",  flag: "🇳🇱" },
  { city: "Singapore",  country: "Singapore",     region: "Southeast Asia",address: "Marina Bay Financial Centre, 018982",phone: "+65 6000 0000",   email: "singapore@nexacargo.com",hours: "Mon–Fri 09:00–18:00", type: "Regional HQ",  flag: "🇸🇬" },
  { city: "Chicago",    country: "USA",           region: "North America", address: "100 N Riverside Plaza, IL 60606",    phone: "+1 312 000 0000", email: "chicago@nexacargo.com",   hours: "Mon–Fri 08:00–17:00", type: "Regional HQ",  flag: "🇺🇸" },
  { city: "Mumbai",     country: "India",         region: "South Asia",    address: "BKC, Bandra East, Mumbai 400051",    phone: "+91 22 0000 0000",email: "mumbai@nexacargo.com",    hours: "Mon–Sat 09:00–18:00", type: "Branch Office",flag: "🇮🇳" },
  { city: "Dhaka",      country: "Bangladesh",    region: "South Asia",    address: "Gulshan-2, Dhaka 1212",              phone: "+880 2 000 0000", email: "dhaka@nexacargo.com",     hours: "Sun–Thu 09:00–18:00", type: "Branch Office",flag: "🇧🇩" },
  { city: "Tokyo",      country: "Japan",         region: "Asia Pacific",  address: "Shinjuku Park Tower, Tokyo 163-1032",phone: "+81 3 0000 0000", email: "tokyo@nexacargo.com",     hours: "Mon–Fri 09:00–18:00", type: "Branch Office",flag: "🇯🇵" },
  { city: "London",     country: "United Kingdom",region: "Europe",        address: "Canary Wharf, London E14 5AB",       phone: "+44 20 0000 0000",email: "london@nexacargo.com",    hours: "Mon–Fri 09:00–17:30", type: "Branch Office",flag: "🇬🇧" },
];

const TYPE_COLORS: Record<string, string> = {
  "Global HQ":    "text-[#00C2FF] bg-[#00C2FF]/10 border-[#00C2FF]/20",
  "Regional HQ":  "text-[#1E88E5] bg-[#1E88E5]/10 border-[#1E88E5]/20",
  "Port Office":  "text-green-400 bg-green-400/10 border-green-400/20",
  "Branch Office":"text-on-surface-variant bg-white/5 border-white/10",
};

export default function GlobalOfficesPage() {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">

      {/* Hero */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(0,194,255,0.07),transparent_70%)]" />
        {[...Array(10)].map((_, i) => (
          <motion.span key={i} className="absolute rounded-full bg-tertiary/20 blur-sm pointer-events-none"
            style={{ left:`${(i*11+3)%96}%`, top:`${(i*17+5)%88}%`, width:`${6+(i%3)*3}px`, height:`${6+(i%3)*3}px` }}
            animate={{ y:[0,-14,0], opacity:[0.15,0.6,0.15] }}
            transition={{ duration:3+(i%4), repeat:Infinity, delay:i*0.2 }} />
        ))}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 inline-block tracking-[0.2em] uppercase">Our Network</motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-6xl font-bold mb-6">
            Global <span className="text-tertiary">Offices</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            With offices across 6 continents, NexaCargo is always close to where your business needs us most.
          </motion.p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-8 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true, amount:0.2 }} variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{ val:"9", label:"Office Locations" },{ val:"6", label:"Continents" },{ val:"40+", label:"Countries" },{ val:"24/7", label:"Support" }].map(({val,label})=>(
            <motion.div key={label} variants={fadeUp} whileHover={{ y:-4, scale:1.04 }} className="glass rounded-xl p-5 text-center">
              <p className="text-3xl font-black text-tertiary">{val}</p>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Offices Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true, amount:0.1 }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OFFICES.map((o, i) => (
            <motion.div key={o.city} variants={fadeUp} transition={{ delay:i*0.05 }}
              whileHover={{ y:-6, boxShadow:"0 0 30px rgba(0,194,255,0.1)" }}
              className="glass rounded-xl p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{o.flag}</span>
                  <div>
                    <p className="font-bold text-on-surface text-lg">{o.city}</p>
                    <p className="text-sm text-on-surface-variant">{o.country}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${TYPE_COLORS[o.type]}`}>{o.type}</span>
              </div>
              <div className="space-y-2 text-sm text-on-surface-variant border-t border-white/5 pt-4">
                <p className="flex items-start gap-2"><MapPin className="w-4 h-4 shrink-0 text-tertiary mt-0.5" />{o.address}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0 text-tertiary" />{o.phone}</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0 text-tertiary" />{o.email}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0 text-tertiary" />{o.hours}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <motion.section initial={{ opacity:0, y:60 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
        className="py-16 px-6 max-w-3xl mx-auto text-center">
        <div className="glass rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-on-surface mb-3">Need to visit us?</h2>
          <p className="text-on-surface-variant mb-6">Reach out and our local team will arrange a meeting at the nearest office.</p>
          <Link href="/contact">
            <motion.button whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.97 }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold flex items-center gap-2 mx-auto shadow-[0_0_25px_rgba(0,194,255,0.25)]">
              Contact Nearest Office <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
