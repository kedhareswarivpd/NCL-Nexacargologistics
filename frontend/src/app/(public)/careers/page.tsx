"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, ArrowRight, Users, TrendingUp, Heart, Globe } from "lucide-react";
import Link from "next/link";
import { JobApplicationModal } from "@/components/shared/JobApplicationModal";

const fadeUp = { hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

interface Job {
  title: string;
  dept: string;
  location: string;
  type: string;
  level: string;
}

const JOBS: Job[] = [
  { title: "Senior Logistics Engineer",     dept: "Engineering",  location: "Dubai, UAE",       type: "Full-time", level: "Senior"    },
  { title: "Supply Chain Data Analyst",     dept: "Analytics",    location: "Singapore",         type: "Full-time", level: "Mid-level" },
  { title: "Global Freight Manager",        dept: "Operations",   location: "Rotterdam, NL",     type: "Full-time", level: "Senior"    },
  { title: "Customs Compliance Specialist", dept: "Legal",        location: "Chicago, IL",       type: "Full-time", level: "Mid-level" },
  { title: "Full-Stack Developer",          dept: "Engineering",  location: "Remote",            type: "Full-time", level: "Senior"    },
  { title: "Warehouse Automation Lead",     dept: "Operations",   location: "Shanghai, CN",      type: "Full-time", level: "Lead"      },
  { title: "Business Development Manager",  dept: "Sales",        location: "London, UK",        type: "Full-time", level: "Senior"    },
  { title: "UX/UI Designer",               dept: "Design",       location: "Remote",            type: "Full-time", level: "Mid-level" },
];

const PERKS = [
  { icon: Globe,      title: "Global Exposure",      desc: "Work across 6 continents with teams in 40+ countries." },
  { icon: TrendingUp, title: "Career Growth",         desc: "Structured mentorship, L&D budget, and fast-track promotions." },
  { icon: Heart,      title: "Health & Wellness",     desc: "Comprehensive medical, dental, vision + wellness allowance." },
  { icon: Users,      title: "Diverse Team",          desc: "80+ nationalities united by a shared passion for logistics." },
];

const DEPT_COLORS: Record<string, string> = {
  Engineering: "text-[#00C2FF] bg-[#00C2FF]/10",
  Analytics:   "text-purple-400 bg-purple-400/10",
  Operations:  "text-green-400 bg-green-400/10",
  Legal:       "text-yellow-400 bg-yellow-400/10",
  Sales:       "text-[#1E88E5] bg-[#1E88E5]/10",
  Design:      "text-pink-400 bg-pink-400/10",
};

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">



      {/* Hero */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(0,194,255,0.08),transparent_70%)]" />
        {[...Array(12)].map((_, i) => (
          <motion.span key={i} className="absolute rounded-full bg-tertiary/20 blur-sm pointer-events-none"
            style={{ left: `${(i*11+3)%96}%`, top: `${(i*17+5)%88}%`, width: `${6+(i%3)*3}px`, height: `${6+(i%3)*3}px` }}
            animate={{ y: [0,-14,0], opacity: [0.15,0.6,0.15] }}
            transition={{ duration: 3+(i%4), repeat: Infinity, delay: i*0.2 }} />
        ))}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 inline-block tracking-[0.2em] uppercase">Join Our Team</motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-6xl font-bold mb-6">
            Build the Future of <span className="text-tertiary">Global Logistics</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            We're a team of engineers, operators, and innovators reimagining how the world moves goods. Join us and make a real impact on global trade.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById("openings")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-base shadow-[0_0_30px_rgba(0,194,255,0.3)] flex items-center gap-2">
              View Open Roles <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Perks */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUp}
              whileHover={{ y: -6, boxShadow: "0 0 30px rgba(0,194,255,0.1)" }}
              className="glass rounded-xl p-6 text-center">
              <motion.div whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-tertiary" />
              </motion.div>
              <h3 className="font-semibold text-on-surface mb-2">{title}</h3>
              <p className="text-sm text-on-surface-variant">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Open Roles */}
      <section id="openings" className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-on-surface mb-2">Open Positions</motion.h2>
          <motion.p variants={fadeUp} className="text-on-surface-variant mb-10">Explore opportunities across all departments and locations.</motion.p>
          <div className="space-y-4">
            {JOBS.map((job, i) => (
              <motion.div key={job.title} variants={fadeUp} transition={{ delay: i * 0.05 }}
                animate={selectedIndex === i ? { y: -12, boxShadow: "0 0 40px rgba(0,194,255,0.25)" } : { y: 0 }}
                whileHover={selectedIndex !== i ? { x: 6, boxShadow: "0 0 24px rgba(0,194,255,0.08)" } : {}}
                className={`glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${selectedIndex === i ? "border border-[#00C2FF]/40" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Briefcase className="w-5 h-5 text-tertiary" />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{job.title}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${DEPT_COLORS[job.dept] ?? "text-on-surface-variant bg-white/5"}`}>{job.dept}</span>
                      <span className="flex items-center gap-1 text-xs text-on-surface-variant"><MapPin className="w-3 h-3" />{job.location}</span>
                      <span className="flex items-center gap-1 text-xs text-on-surface-variant"><Clock className="w-3 h-3" />{job.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-on-surface-variant bg-white/5 px-3 py-1 rounded-full">{job.level}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedJob(job);
                      setSelectedIndex(i);
                      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-tertiary/15 border border-tertiary/30 text-tertiary text-sm font-semibold hover:bg-tertiary/25 transition-colors"
                  >
                    Apply <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Inline Application Form */}
      <div ref={formRef}>
        <JobApplicationModal
          job={selectedJob}
          onClose={() => { setSelectedJob(null); setSelectedIndex(null); }}
        />
      </div>

      {/* CTA */}
      <motion.section initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }} className="py-20 px-6 max-w-4xl mx-auto text-center">
        <div className="glass rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-tertiary/5 blur-[80px]" />
          <h2 className="text-3xl font-bold text-on-surface mb-4">Don't see your role?</h2>
          <p className="text-on-surface-variant mb-8">Send us your CV and we'll reach out when a matching opportunity opens up.</p>
          <Link href="/contact">
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-base shadow-[0_0_30px_rgba(0,194,255,0.25)]">
              Get in Touch
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
