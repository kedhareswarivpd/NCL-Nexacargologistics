"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Send, User, Mail, Phone, Building2, Monitor, Calendar, PlayCircle, Zap, Shield, BarChart2 } from "lucide-react";
import Link from "next/link";

const PRODUCTS = ["Smart Cargo Pro", "Warehouse Cloud", "Nexa Track", "Customs Assist", "Full Suite"];
const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];
const TIMES = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function RequestDemoPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", size: "", product: "", date: "", time: "", useCase: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name    = "Please fill out this field";
    if (!form.email.trim())   e.email   = "Please fill out this field";
    if (!form.company.trim()) e.company = "Please fill out this field";
    if (!form.product)        e.product = "Please select a product";
    if (!form.date)           e.date    = "Please select a date";
    if (!form.time)           e.time    = "Please select a time";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };

  const inputCls = (k: string) =>
    `w-full px-3 py-2.5 rounded-lg bg-[#0d2545] border text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00C2FF]/50 transition-colors ${errors[k] ? "border-red-500" : "border-white/10"}`;

  if (submitted) return (
    <div className="min-h-screen bg-[#0B1F3A] flex items-center justify-center px-6 pt-20">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-full bg-[#00C2FF]/10 border border-[#00C2FF]/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#00C2FF]" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Demo Booked!</h2>
        <p className="text-blue-200/70 mb-2">Thanks, <span className="text-white font-semibold">{form.name}</span>.</p>
        <p className="text-blue-200/70 mb-4">Your <span className="text-[#00C2FF] font-semibold">{form.product}</span> demo is scheduled for <span className="text-white font-semibold">{form.date} at {form.time}</span>.</p>
        <p className="text-blue-200/50 text-sm mb-8">A confirmation with the meeting link will be sent to <span className="text-white">{form.email}</span>.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E88E5] text-white font-bold hover:bg-[#1565C0] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <Link href="/" className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-colors">
            Go to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1F3A] text-white pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/products" className="inline-flex items-center gap-2 text-blue-300/60 hover:text-[#00C2FF] text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-[#00C2FF] mb-3 block">Live Product Demo</motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-3">See NexaCargo in Action</motion.h1>
          <motion.p variants={fadeUp} className="text-blue-200/60 mb-10 text-lg max-w-2xl">
            Book a free 30-minute live demo with one of our product specialists. We'll walk you through exactly how NexaCargo can work for your business.
          </motion.p>

          {/* What to expect */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: PlayCircle, title: "Live Walkthrough",   desc: "See the product live, not just slides." },
              { icon: Zap,        title: "Your Use Case",      desc: "We tailor the demo to your specific needs." },
              { icon: BarChart2,  title: "Q&A Included",       desc: "Ask anything — our team knows the product inside out." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1E88E5]/15 border border-[#1E88E5]/25 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#00C2FF]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-blue-200/50 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><User className="w-3 h-3" /> Full Name *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Smith" className={inputCls("name")} />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><Mail className="w-3 h-3" /> Work Email *</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="john@company.com" className={inputCls("email")} />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><Phone className="w-3 h-3" /> Phone</label>
                <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 234 567 8900" className={inputCls("phone")} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><Building2 className="w-3 h-3" /> Company *</label>
                <input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Acme Corp" className={inputCls("company")} />
                {errors.company && <p className="text-xs text-red-400 mt-1">{errors.company}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 mb-1 block">Company Size</label>
                <select value={form.size} onChange={e => set("size", e.target.value)} className={inputCls("size")}>
                  <option value="">Select size…</option>
                  {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><Monitor className="w-3 h-3" /> Product *</label>
                <select value={form.product} onChange={e => set("product", e.target.value)} className={inputCls("product")}>
                  <option value="">Select a product…</option>
                  {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.product && <p className="text-xs text-red-400 mt-1">{errors.product}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><Calendar className="w-3 h-3" /> Preferred Date *</label>
                <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className={inputCls("date")} />
                {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 mb-1 block">Preferred Time *</label>
                <select value={form.time} onChange={e => set("time", e.target.value)} className={inputCls("time")}>
                  <option value="">Select a time…</option>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.time && <p className="text-xs text-red-400 mt-1">{errors.time}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-blue-200/60 mb-1 block">What would you like to see in the demo?</label>
              <textarea value={form.useCase} onChange={e => set("useCase", e.target.value)} rows={3}
                placeholder="e.g. automated customs filing, warehouse inventory tracking, live shipment visibility…"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0d2545] border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00C2FF]/50 resize-none" />
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#00C2FF]/5 border border-[#00C2FF]/15">
              <Shield className="w-4 h-4 text-[#00C2FF] shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200/50">No obligation. We'll never share your details or spam you. Demos are free and last about 30 minutes.</p>
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-[0_0_24px_rgba(0,194,255,0.3)]">
              <Send className="w-4 h-4" /> Book My Free Demo
            </button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
