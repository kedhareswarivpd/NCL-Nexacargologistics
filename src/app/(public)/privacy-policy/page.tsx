"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Mail, ChevronRight } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

const SECTIONS = [
  {
    icon: Database,
    title: "Information We Collect",
    body: `We collect information you provide directly to us, such as when you create an account, request a quote, track a shipment, or contact us for support. This includes:
    
• Full name, email address, phone number, and company details
• Shipment data including origin, destination, cargo type, and weight
• Payment and billing information processed through secure third-party providers
• Device and usage data collected automatically when you use our platform (IP address, browser type, pages visited, time spent)
• Location data when you use our tracking features`,
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    body: `NexaCargo uses collected information to:

• Provide, operate, and improve our logistics services
• Process shipments and deliver tracking updates in real time
• Send transactional emails and SMS notifications about your cargo
• Respond to your inquiries and provide customer support
• Generate analytics and reports to optimize our operations
• Comply with legal obligations and enforce our Terms of Service
• Prevent fraud, unauthorized access, and other illegal activities`,
  },
  {
    icon: Shield,
    title: "Data Security",
    body: `We implement industry-standard security measures to protect your personal information:

• All data is encrypted in transit using TLS 1.3 and at rest using AES-256
• Access to personal data is restricted to authorized personnel only
• We conduct regular security audits and penetration testing
• Our infrastructure is ISO 27001 certified and hosted on SOC 2 compliant cloud providers
• We maintain a comprehensive incident response plan in the event of a data breach`,
  },
  {
    icon: Lock,
    title: "Data Sharing & Third Parties",
    body: `We do not sell your personal information. We may share your data with:

• Logistics partners, carriers, and customs authorities to fulfil your shipments
• Payment processors and financial institutions to handle transactions
• Cloud infrastructure providers (e.g., database, storage, hosting) under strict data processing agreements
• Analytics providers to help us understand platform usage (data is anonymized)
• Law enforcement or regulatory bodies when legally required

All third-party partners are contractually obligated to protect your data and use it only for the specified purpose.`,
  },
  {
    icon: Mail,
    title: "Your Rights & Choices",
    body: `Depending on your jurisdiction, you may have the following rights:

• Access — Request a copy of the personal data we hold about you
• Rectification — Ask us to correct inaccurate or incomplete information
• Erasure — Request deletion of your personal data ("right to be forgotten")
• Portability — Receive your data in a structured, machine-readable format
• Objection — Object to processing for direct marketing or profiling purposes
• Withdrawal of consent — Opt out of non-essential communications at any time

To exercise any of these rights, contact us at privacy@nexacargo.com`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">

      {/* Hero */}
      <section className="relative py-24 px-6 max-w-4xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(0,194,255,0.07),transparent_70%)]" />
        {[...Array(10)].map((_, i) => (
          <motion.span key={i}
            className="absolute rounded-full bg-tertiary/20 blur-sm pointer-events-none"
            style={{ left: `${(i * 11 + 4) % 96}%`, top: `${(i * 17 + 5) % 88}%`, width: `${6 + (i % 3) * 3}px`, height: `${6 + (i % 3) * 3}px` }}
            animate={{ y: [0, -14, 0], opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 inline-block tracking-[0.2em] uppercase">
            Legal · Privacy
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-6xl font-bold mb-6">
            Privacy Policy
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-4">
            Last updated: January 1, 2026
          </motion.p>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            NexaCargo Global Logistics is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our platform and services.
          </motion.p>
        </motion.div>
      </section>

      {/* Sections */}
      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-8">
        {SECTIONS.map(({ icon: Icon, title, body }, i) => (
          <motion.div key={title}
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
            variants={fadeUp} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, boxShadow: "0 0 30px rgba(0,194,255,0.08)" }}
            className="glass rounded-xl p-8 transition-all"
          >
            <div className="flex items-center gap-4 mb-5">
              <motion.div
                className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center shrink-0"
                whileHover={{ rotate: 10, scale: 1.1 }}
              >
                <Icon className="w-6 h-6 text-tertiary" />
              </motion.div>
              <h2 className="font-title-md text-xl font-semibold text-on-surface">{title}</h2>
            </div>
            <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{body}</p>
          </motion.div>
        ))}

        {/* Contact + nav */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="glass rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <p className="font-semibold text-on-surface mb-1">Questions about this policy?</p>
            <p className="text-sm text-on-surface-variant">Email us at <span className="text-tertiary">privacy@nexacargo.com</span></p>
          </div>
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-tertiary/15 border border-tertiary/30 text-tertiary text-sm font-semibold hover:bg-tertiary/25 transition-colors"
            >
              Contact Us <ChevronRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex flex-wrap gap-4 text-sm text-on-surface-variant"
        >
          <Link href="/terms-of-service" className="hover:text-tertiary transition-colors underline underline-offset-4">Terms of Service</Link>
          <span>·</span>
          <Link href="/track" className="hover:text-tertiary transition-colors underline underline-offset-4">Track Status</Link>
          <span>·</span>
          <Link href="/" className="hover:text-tertiary transition-colors underline underline-offset-4">Back to Home</Link>
        </motion.div>
      </section>
    </div>
  );
}
