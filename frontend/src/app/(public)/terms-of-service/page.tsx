"use client";

import { motion } from "framer-motion";
import { FileText, AlertTriangle, Truck, CreditCard, Scale, Ban, ChevronRight } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

const SECTIONS = [
  {
    icon: FileText,
    title: "Acceptance of Terms",
    body: `By accessing or using any NexaCargo service, website, or application, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.

These terms apply to all users of the NexaCargo platform, including customers, partners, logistics service providers, and administrative users. NexaCargo reserves the right to update these terms at any time, with changes effective immediately upon posting.`,
  },
  {
    icon: Truck,
    title: "Service Description & Limitations",
    body: `NexaCargo provides digital logistics management services including shipment tracking, freight brokerage, warehouse management, customs clearance assistance, and supply chain analytics.

Our platform acts as a technology intermediary. While we coordinate logistics operations, the actual transportation services are performed by independent carriers and logistics partners. NexaCargo is not liable for:

• Delays caused by customs authorities, weather, strikes, or force majeure events
• Loss or damage to shipments beyond carrier liability limits
• Incorrect information provided by users during booking
• Third-party service interruptions beyond our reasonable control`,
  },
  {
    icon: CreditCard,
    title: "Payment Terms & Billing",
    body: `All services rendered by NexaCargo are subject to the pricing agreed upon at the time of booking. Payment terms are as follows:

• Invoices are due within 30 days of issuance unless otherwise agreed in writing
• Late payments incur a 1.5% monthly interest charge on outstanding balances
• NexaCargo reserves the right to suspend services for accounts with overdue balances exceeding 45 days
• Disputed charges must be notified in writing within 14 days of the invoice date
• Refunds are processed within 10–14 business days where applicable and subject to carrier policies`,
  },
  {
    icon: Scale,
    title: "Intellectual Property",
    body: `All content on the NexaCargo platform — including but not limited to software, text, graphics, logos, icons, images, data compilations, and code — is the property of NexaCargo Global Logistics or its content suppliers and is protected by international copyright laws.

You may not reproduce, distribute, modify, create derivative works from, publicly display, or commercially exploit any content from our platform without our express written permission.

The NexaCargo name, logo, and all related product names are trademarks of NexaCargo Global Logistics. Unauthorized use is strictly prohibited.`,
  },
  {
    icon: AlertTriangle,
    title: "Liability & Disclaimer",
    body: `NexaCargo's services are provided "as is" and "as available" without warranties of any kind, either express or implied. To the fullest extent permitted by law:

• We disclaim all warranties including merchantability, fitness for a particular purpose, and non-infringement
• Our total aggregate liability for any claims arising from use of our services shall not exceed the fees paid by you in the 3 months preceding the claim
• We are not liable for indirect, incidental, special, consequential, or punitive damages
• We do not guarantee uninterrupted, error-free, or completely secure platform access`,
  },
  {
    icon: Ban,
    title: "Prohibited Activities",
    body: `You agree not to use NexaCargo services to:

• Ship prohibited, illegal, or restricted goods including narcotics, weapons, or counterfeit items
• Provide false or misleading information about cargo contents, weight, or destination
• Attempt to gain unauthorized access to our systems or other users' accounts
• Engage in any activity that disrupts or interferes with the platform's normal operations
• Scrape, crawl, or harvest data from our platform without prior written consent
• Violate any applicable local, national, or international laws or regulations

Violation of these terms may result in immediate account suspension and legal action.`,
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">

      {/* Hero */}
      <section className="relative py-24 px-6 max-w-4xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(30,136,229,0.08),transparent_70%)]" />
        {[...Array(10)].map((_, i) => (
          <motion.span key={i}
            className="absolute rounded-full bg-tertiary/20 blur-sm pointer-events-none"
            style={{ left: `${(i * 13 + 3) % 96}%`, top: `${(i * 19 + 4) % 88}%`, width: `${6 + (i % 3) * 3}px`, height: `${6 + (i % 3) * 3}px` }}
            animate={{ y: [0, -14, 0], opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 inline-block tracking-[0.2em] uppercase">
            Legal · Terms
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-6xl font-bold mb-6">
            Terms of Service
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-4">
            Last updated: January 1, 2026
          </motion.p>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Please read these Terms of Service carefully before using NexaCargo's platform or services. By accessing or using our services, you agree to be bound by these terms.
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

        {/* Governing Law */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="glass rounded-xl p-8 border border-tertiary/15"
        >
          <h2 className="font-title-md text-xl font-semibold text-on-surface mb-3">Governing Law</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE, unless otherwise mandated by local consumer protection laws in your jurisdiction.
          </p>
        </motion.div>

        {/* Contact + nav */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="glass rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <p className="font-semibold text-on-surface mb-1">Have questions about these terms?</p>
            <p className="text-sm text-on-surface-variant">Email us at <span className="text-tertiary">legal@nexacargo.com</span></p>
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
          <Link href="/privacy-policy" className="hover:text-tertiary transition-colors underline underline-offset-4">Privacy Policy</Link>
          <span>·</span>
          <Link href="/track" className="hover:text-tertiary transition-colors underline underline-offset-4">Track Status</Link>
          <span>·</span>
          <Link href="/" className="hover:text-tertiary transition-colors underline underline-offset-4">Back to Home</Link>
        </motion.div>
      </section>
    </div>
  );
}
