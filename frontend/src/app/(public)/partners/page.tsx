"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Handshake, Globe, TrendingUp, Shield, CheckCircle2 } from "lucide-react";
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

const PARTNERSHIP_TYPES = ["Carrier Partner", "Technology Partner", "Compliance Partner", "Strategic Alliance", "Other"];

export default function PartnersPage() {
  const [form, setForm] = useState({ company: "", email: "", type: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string, val: string) => {
    if (key === "company") val = val.replace(/[^a-zA-Z0-9\s&.\-]/g, "");
    if (key === "message") val = val.replace(/[^a-zA-Z\s]/g, "");
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.company.trim())  e.company = "Company name is required.";
    if (!form.email.trim())    e.email   = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.com$/i.test(form.email.trim())) e.email = "Email must contain @ and end with .com";
    if (!form.type)            e.type    = "Please select a partnership type.";
    if (form.message.trim() && form.message.trim().length < 10) e.message = "Message must be at least 10 characters.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };

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
            {submitted ? (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-tertiary/10 border border-tertiary/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-tertiary" />
                </div>
                <h4 className="text-lg font-bold text-on-surface">Application Submitted!</h4>
                <p className="text-sm text-on-surface-variant">Thank you, <span className="text-white font-semibold">{form.company}</span>. We'll reach out to <span className="text-tertiary">{form.email}</span> shortly.</p>
                <button onClick={() => { setForm({ company:"", email:"", type:"", message:"" }); setSubmitted(false); }}
                  className="mt-2 px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-on-surface-variant hover:bg-white/10 transition-colors">
                  Submit Another
                </button>
              </motion.div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">Company Name *</label>
                <input value={form.company} onChange={e => set("company", e.target.value)} placeholder="e.g. Acme Logistics"
                  className={`w-full px-4 py-2.5 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${errors.company ? "border-red-500" : "border-white/10"}`} />
                {errors.company && <p className="text-xs text-red-400 mt-1">{errors.company}</p>}
              </div>
              {/* Contact Email */}
              <div>
                <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">Contact Email *</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@company.com"
                  className={`w-full px-4 py-2.5 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${errors.email ? "border-red-500" : "border-white/10"}`} />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              {/* Partnership Type */}
              <div>
                <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">Partnership Type *</label>
                <select value={form.type} onChange={e => set("type", e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50 ${errors.type ? "border-red-500" : "border-white/10"}`}>
                  <option value="">Select...</option>
                  {PARTNERSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="text-xs text-red-400 mt-1">{errors.type}</p>}
              </div>
              {/* Message */}
              <div>
                <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">Message</label>
                <textarea rows={3} value={form.message} onChange={e => set("message", e.target.value)}
                  placeholder="Tell us about your company and how you'd like to partner..."
                  className={`w-full px-4 py-2.5 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 resize-none ${errors.message ? "border-red-500" : "border-white/10"}`} />
                {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
              </div>
              <motion.button type="submit" whileHover={{ scale:1.03, y:-2 }} whileTap={{ scale:0.97 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold shadow-[0_0_25px_rgba(0,194,255,0.25)]">
                Submit Application
              </motion.button>
            </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
