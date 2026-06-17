"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, CheckCircle2, Send, User, Mail, Phone, Building2, Globe, Clock } from "lucide-react";
import Link from "next/link";

const INDUSTRIES = ["Textile & Apparel", "Pharma & Healthcare", "E-Commerce", "FMCG", "Export / Manufacturing", "Automotive", "Technology", "Other"];
const TIMES = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function ConsultationPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", industry: "", date: "", time: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())     e.name     = "Please fill out this field";
    if (!form.email.trim())    e.email    = "Please fill out this field";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (!form.company.trim())  e.company  = "Please fill out this field";
    if (!form.industry)        e.industry = "Please select an industry";
    if (!form.date)            e.date     = "Please select a date";
    else if (new Date(form.date) < new Date(new Date().toDateString())) e.date = "Date must be today or in the future.";
    if (!form.time)            e.time     = "Please select a time";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };

  const set = (key: string, val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: "" }));
  };

  if (submitted) return (
    <div className="min-h-screen bg-[#0B1F3A] flex items-center justify-center px-6 pt-20">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#00C2FF]/10 border border-[#00C2FF]/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#00C2FF]" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Consultation Booked!</h2>
        <p className="text-blue-200/70 mb-2">Thank you, <span className="text-white font-semibold">{form.name}</span>.</p>
        <p className="text-blue-200/70 mb-8">Our industry specialist will confirm your slot on <span className="text-[#00C2FF] font-semibold">{form.date} at {form.time}</span> via <span className="text-white">{form.email}</span>.</p>
        <Link href="/solutions" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E88E5] text-white font-bold hover:bg-[#1565C0] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Solutions
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1F3A] text-white pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/solutions" className="inline-flex items-center gap-2 text-blue-300/60 hover:text-[#00C2FF] text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Solutions
        </Link>

        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-[#00C2FF] mb-3 block">Industry Specialists</motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-3">Schedule a Consultation</motion.h1>
          <motion.p variants={fadeUp} className="text-blue-200/60 mb-10 text-lg">Our logistics experts will design a supply chain roadmap tailored to your industry.</motion.p>

          {/* Why consult */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: User,   title: "Dedicated Specialist", desc: "1-on-1 with an industry-specific logistics expert" },
              { icon: Clock,  title: "45-Minute Session",    desc: "Focused deep-dive into your logistics challenges" },
              { icon: Globe,  title: "Global Coverage",      desc: "Insights across 190+ countries and trade lanes" },
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

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><User className="w-3 h-3" /> Full Name *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Smith"
                  className={`w-full px-3 py-2.5 rounded-lg bg-[#0d2545] border text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00C2FF]/50 ${errors.name ? "border-red-500" : "border-white/10"}`} />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>
              {/* Email */}
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><Mail className="w-3 h-3" /> Email *</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="john@company.com"
                  className={`w-full px-3 py-2.5 rounded-lg bg-[#0d2545] border text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00C2FF]/50 ${errors.email ? "border-red-500" : "border-white/10"}`} />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              {/* Phone */}
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><Phone className="w-3 h-3" /> Phone</label>
                <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 234 567 8900"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0d2545] border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00C2FF]/50" />
              </div>
              {/* Company */}
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><Building2 className="w-3 h-3" /> Company *</label>
                <input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Acme Corp"
                  className={`w-full px-3 py-2.5 rounded-lg bg-[#0d2545] border text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00C2FF]/50 ${errors.company ? "border-red-500" : "border-white/10"}`} />
                {errors.company && <p className="text-xs text-red-400 mt-1">{errors.company}</p>}
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="text-xs uppercase tracking-widest text-blue-200/60 mb-1 block">Industry *</label>
              <select value={form.industry} onChange={e => set("industry", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg bg-[#0d2545] border text-sm text-white focus:outline-none focus:border-[#00C2FF]/50 ${errors.industry ? "border-red-500" : "border-white/10"}`}>
                <option value="">Select your industry…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.industry && <p className="text-xs text-red-400 mt-1">{errors.industry}</p>}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><Calendar className="w-3 h-3" /> Preferred Date *</label>
                <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg bg-[#0d2545] border text-sm text-white focus:outline-none focus:border-[#00C2FF]/50 ${errors.date ? "border-red-500" : "border-white/10"}`} />
                {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-blue-200/60 flex items-center gap-1.5 mb-1"><Clock className="w-3 h-3" /> Preferred Time *</label>
                <select value={form.time} onChange={e => set("time", e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg bg-[#0d2545] border text-sm text-white focus:outline-none focus:border-[#00C2FF]/50 ${errors.time ? "border-red-500" : "border-white/10"}`}>
                  <option value="">Select a time…</option>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.time && <p className="text-xs text-red-400 mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs uppercase tracking-widest text-blue-200/60 mb-1 block">Tell us about your logistics challenge</label>
              <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={3}
                placeholder="Describe your current supply chain pain points, volumes, routes…"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0d2545] border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00C2FF]/50 resize-none" />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-[0_0_24px_rgba(0,194,255,0.3)]">
              <Send className="w-4 h-4" /> Confirm Consultation
            </button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
