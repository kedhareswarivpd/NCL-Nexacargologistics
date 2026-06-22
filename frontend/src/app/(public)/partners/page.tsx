"use client";

import { motion } from "framer-motion";
import { Handshake, Globe, TrendingUp, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const PARTNER_TYPES = [
  {
    icon: Globe,
    title: "Carrier Partners",
    desc: "We work with 200+ certified air, sea, and road carriers globally to guarantee capacity and competitive pricing.",
    partners: ["Maersk Line", "MSC", "Emirates SkyCargo", "DHL Aviation", "FedEx Freight", "COSCO Shipping"],
  },
  {
    icon: TrendingUp,
    title: "Technology Partners",
    desc: "Integrated platform partners enabling seamless ERP, TMS, and WMS connectivity across your supply chain.",
    partners: ["SAP Logistics", "Oracle SCM", "Salesforce CRM", "Microsoft Azure", "AWS", "Trimble Maps"],
  },
  {
    icon: Shield,
    title: "Compliance Partners",
    desc: "Certified customs brokers, trade lawyers, and compliance consultants in 60+ jurisdictions.",
    partners: ["Deloitte Trade", "KPMG Customs", "PwC Trade", "Baker McKenzie", "Livingston Intl", "Flexport"],
  },
  {
    icon: Handshake,
    title: "Strategic Alliances",
    desc: "Long-term alliances with industry bodies, port authorities, and government trade agencies.",
    partners: ["WCO", "FIATA", "IATA", "BIMCO", "Dubai Customs", "Singapore Trade Authority"],
  },
];

const BENEFITS = [
  "Co-marketing and lead sharing opportunities",
  "Access to NexaCargo's API and platform integrations",
  "Dedicated partner success manager",
  "Revenue sharing on referred enterprise accounts",
  "Early access to new products and features",
  "Joint case studies and press releases",
];

export default function PartnersPage() {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">

      {/* Hero */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(30,136,229,0.08),transparent_70%)]" />
        {[...Array(10)].map((_,i)=>(
          <motion.span key={i} className="absolute rounded-full bg-tertiary/20 blur-sm pointer-events-none"
            style={{ left:`${(i*11+3)%96}%`, top:`${(i*17+5)%88}%`, width:`${6+(i%3)*3}px`, height:`${6+(i%3)*3}px` }}
            animate={{ y:[0,-14,0], opacity:[0.15,0.6,0.15] }}
            transition={{ duration:3+(i%4), repeat:Infinity, delay:i*0.2 }} />
        ))}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 inline-block tracking-[0.2em] uppercase">Ecosystem</motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-6xl font-bold mb-6">
            Our <span className="text-tertiary">Partners</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            NexaCargo's global reach is powered by a carefully curated network of carrier, technology, compliance, and strategic partners.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
            <a href="#become-partner">
              <motion.button whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.97 }}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(0,194,255,0.3)]">
                Become a Partner <ArrowRight className="w-4 h-4" />
              </motion.button>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Partner Types */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PARTNER_TYPES.map(({ icon:Icon, title, desc, partners }, i) => (
            <motion.div key={title} variants={fadeUp} transition={{ delay:i*0.08 }}
              whileHover={{ y:-6, boxShadow:"0 0 30px rgba(0,194,255,0.1)" }}
              className="glass rounded-xl p-8 space-y-5">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ rotate:10, scale:1.1 }}
                  className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-tertiary" />
                </motion.div>
                <h3 className="font-bold text-on-surface text-xl">{title}</h3>
              </div>
              <p className="text-sm text-on-surface-variant">{desc}</p>
              <div className="flex flex-wrap gap-2">
                {partners.map(p=>(
                  <span key={p} className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-on-surface-variant">{p}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Become a Partner */}
      <section id="become-partner" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-on-surface mb-4">Become a NexaCargo Partner</motion.h2>
            <motion.p variants={fadeUp} className="text-on-surface-variant mb-8">
              Join our partner ecosystem and unlock access to one of the world's largest logistics networks. We offer flexible partnership models for carriers, technology vendors, and consultancies.
            </motion.p>
            <motion.ul variants={stagger} className="space-y-3">
              {BENEFITS.map((b,i)=>(
                <motion.li key={i} variants={fadeUp} className="flex items-start gap-3 text-sm text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />{b}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div initial={{ opacity:0, scale:0.93 }} whileInView={{ opacity:1, scale:1 }}
            viewport={{ once:true }} transition={{ duration:0.7 }}
            className="glass rounded-2xl p-8 space-y-5">
            <h3 className="text-xl font-bold text-on-surface">Partner Application</h3>
            <div className="space-y-4">
              {[{ label:"Company Name", ph:"e.g. Acme Logistics" },{ label:"Contact Email", ph:"you@company.com" },{ label:"Partnership Type", ph:"Select..." }].map(({ label, ph })=>(
                <div key={label}>
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">{label}</label>
                  <input placeholder={ph} className="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50" />
                </div>
              ))}
              <div>
                <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">Message</label>
                <textarea rows={3} placeholder="Tell us about your company and how you'd like to partner..." className="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 resize-none" />
              </div>
              <motion.button whileHover={{ scale:1.03, y:-2 }} whileTap={{ scale:0.97 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold shadow-[0_0_25px_rgba(0,194,255,0.25)]">
                Submit Application
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
