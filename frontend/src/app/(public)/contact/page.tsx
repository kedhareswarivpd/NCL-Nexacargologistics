"use client";

import { Headset, Phone, Mail, ChevronRight } from "lucide-react";
import { ContactForm } from "@/components/shared/ContactForm";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15 } },
};
const scaleReveal = {
  hidden: { opacity: 0, scale: 0.93 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.65 } },
};

export default function ContactPage() {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">

      {/* Hero */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(21,101,192,0.12),transparent_70%)]" />
        {[...Array(16)].map((_, i) => (
          <motion.span key={i}
            className="absolute rounded-full bg-tertiary/20 blur-sm pointer-events-none"
            style={{ left: `${(i * 9 + 3) % 100}%`, top: `${(i * 13 + 6) % 100}%`, width: `${8 + (i % 3) * 4}px`, height: `${8 + (i % 3) * 4}px` }}
            animate={{ y: [0, -16, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 inline-block tracking-[0.2em] uppercase">
            Get in Touch
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-6xl font-bold text-on-surface mb-6">
            Connect with Our Global Network
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Whether you're shipping across borders or looking for enterprise supply chain solutions, NexaCargo's experts are ready to assist you.
          </motion.p>
        </motion.div>
      </section>

      {/* Bento Layout */}
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Form */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={scaleReveal}
            className="lg:col-span-7 glass p-12 rounded-xl flex flex-col gap-8"
            whileHover={{ boxShadow: "0 0 40px rgba(66,165,245,0.12)" }}
          >
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-title-md text-2xl font-semibold text-on-surface">
              Start a Partnership
            </motion.h2>
            <ContactForm />
          </motion.div>

          {/* Right column */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}
            className="lg:col-span-5 flex flex-col gap-12"
          >
            {/* Support */}
            <motion.div variants={scaleReveal}
              whileHover={{ y: -6, boxShadow: "0 0 30px rgba(66,165,245,0.18)" }}
              className="glass p-8 rounded-xl transition-all"
            >
              <motion.h3 whileHover={{ x: 4 }} className="font-title-md text-2xl font-semibold text-on-surface mb-8 flex items-center gap-4">
                <motion.div whileHover={{ rotate: 15 }}>
                  <Headset className="text-tertiary w-8 h-8" />
                </motion.div>
                24/7 Global Support
              </motion.h3>
              <div className="flex flex-col gap-6">
                {[
                  { Icon: Phone, label: "Phone", value: "+1 (800) NEXA-LOG" },
                  { Icon: Mail,  label: "Email", value: "support@nexacargo.com" },
                ].map(({ Icon, label, value }) => (
                  <motion.div key={label} className="flex items-center gap-6"
                    whileHover={{ x: 6 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Icon className="text-tertiary w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
                      <p className="font-title-md text-xl font-semibold text-on-surface">{value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hubs */}
            <motion.div variants={fadeUp} className="glass p-8 rounded-xl flex-grow"
              whileHover={{ boxShadow: "0 0 30px rgba(66,165,245,0.12)" }}>
              <h3 className="font-title-md text-2xl font-semibold text-on-surface mb-6">Regional Hubs</h3>
              <ul className="flex flex-col gap-4">
                {[
                  { region: "North America", city: "Chicago, IL" },
                  { region: "Europe",        city: "Rotterdam, NL" },
                  { region: "Asia Pacific",  city: "Singapore" },
                ].map((hub, i) => (
                  <motion.li key={i}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.1)" }}
                    className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-body-lg text-lg text-on-surface font-medium">{hub.region}</p>
                      <p className="font-body-sm text-sm text-on-surface-variant">{hub.city}</p>
                    </div>
                    <ChevronRight className="text-tertiary w-5 h-5" />
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
