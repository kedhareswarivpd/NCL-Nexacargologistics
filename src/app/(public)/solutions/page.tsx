"use client";

import { Shirt, Syringe, ShoppingCart, Package, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  hidden: { opacity: 0, scale: 0.92 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.65 } },
};

export default function IndustrySolutionsPage() {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24">

        {/* Hero */}
        <motion.header
          initial="hidden" animate="show" variants={stagger}
          className="mb-16"
        >
          <div className="max-w-3xl">
            <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 block tracking-[0.2em] uppercase">
              Industry Excellence
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-6xl font-bold text-on-surface mb-6 leading-tight">
              Tailored Logistics for <span className="text-tertiary">Global Leaders</span>.
            </motion.h1>
            <motion.p variants={fadeUp} className="font-body-lg text-lg text-on-surface-variant leading-relaxed">
              NexaCargo provides mission-critical logistics solutions designed for the unique demands of specialized sectors. From temperature-controlled pharma to high-velocity e-commerce, we power the supply chains that move the world.
            </motion.p>
          </div>
        </motion.header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Textile */}
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={scaleReveal}
            className="col-span-12 md:col-span-8 h-[500px] relative group overflow-hidden rounded-xl glass"
            whileHover={{ y: -6, boxShadow: "0 0 50px rgba(66,165,245,0.2)" }}
          >
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwN4iXbmY5UUXq1JCZhPAyjGfJNszzlShqEC3QeGx06jNEs5vrWAsjbYctpDabVNPgVZ2VppRlPLn18fw_2l5c6WGxX6sujputSNyOwQoHYMYpVw71f80UpZx4XmGZX6dnMLMTp33REnldTb3g9ukgq_Mv-KpvCe-q6OpNwXdbSB6BF_6ViAc3WWBfIpSS4n_nyP9xbWgAv-emu2nRc6cunipjVp4Jv4Q0qsA9VqxUsrfYfgY1F-kkz55bD2GWFcXKWWZzJ2CL6QI')" }}
              whileHover={{ scale: 1.06 }} transition={{ duration: 0.7 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3">
              <motion.span initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4">
                <Shirt className="w-4 h-4" /> TEXTILE & APPAREL
              </motion.span>
              <motion.h3 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="font-headline-lg text-3xl font-bold text-white mb-4">Fast-Fashion Velocity.</motion.h3>
              <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="font-body-lg text-lg text-on-surface-variant mb-6">
                Agile global supply chains for the fashion industry, ensuring seasonal collections reach global markets with 99.9% transit precision.
              </motion.p>
              <button className="flex items-center gap-2 text-tertiary font-title-md text-lg font-semibold hover:underline group-hover:gap-4 transition-all">
                Explore Textile Solutions <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.section>

          {/* Pharma */}
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}
            className="col-span-12 md:col-span-4 h-[500px] relative group overflow-hidden rounded-xl glass"
            whileHover={{ y: -6, boxShadow: "0 0 50px rgba(66,165,245,0.2)" }}
          >
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDDcKK7FvsRQCzSpwzUNyMlRPHlWX5rqcBfA3Hixh9uCQAp4KNXy4UGla6WdCFGeMgiG9yLCBLBjKGq_cAyfeBbIcgDgyX_jyGv7TCVQe7Zp7H5h2-P7amEfxtkFcRzIYrurk9osMpcy4aMTNCzPeujT4sZmTc8E9yCwruCjLQBAej1Z71g6Ugvvb1TpyO0zoGgXyVg1APshwzzxUj3syzZvLBFxbhisT7K6HG1fygnAgdudt81k0NSO_kXPvMghRh5TBQuLxpzRAM')" }}
              whileHover={{ scale: 1.06 }} transition={{ duration: 0.7 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4">
                <Syringe className="w-4 h-4" /> PHARMA
              </span>
              <h3 className="font-headline-lg text-3xl font-bold text-white mb-4">Cold-Chain Mastery.</h3>
              <p className="font-body-lg text-lg text-on-surface-variant">Validated temperature control and regulatory compliance for life-saving therapeutics.</p>
            </div>
          </motion.section>

          {/* E-commerce */}
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={scaleReveal}
            transition={{ delay: 0.05 }}
            className="col-span-12 md:col-span-5 h-[400px] relative group overflow-hidden rounded-xl glass"
            whileHover={{ y: -6, boxShadow: "0 0 50px rgba(66,165,245,0.2)" }}
          >
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBjgVxtlWLw1L3ZqGcLzNwiqVz7zkkrFkmcbddcxGw93bMcsYyWK4XBUt_EAL__BPQ9TN10HM3RRj_PrzUT5Z_XIMDTZTuUHV9N54yR-LDruiZM0HwjXRCV0lVE8djtLLe6CY0fJ8SRzaOxjhWXj_HllS-5l9RZ0jdXoV_qJ8JoXuS10iFHHPaWI_D7W39-P8g28ud2266oSx3_AC2W6gBJNfc4OpwshmoqTw2czKFLQNTmz8z_7sfiLDI_n170IiM02D9IqpQkGFw')" }}
              whileHover={{ scale: 1.06 }} transition={{ duration: 0.7 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4">
                <ShoppingCart className="w-4 h-4" /> E-COMMERCE
              </span>
              <h3 className="font-headline-lg text-3xl font-bold text-white mb-4">Last-Mile Optimization.</h3>
              <p className="font-body-lg text-lg text-on-surface-variant">Scalable warehousing and hyper-local delivery networks for peak-season demand.</p>
            </div>
          </motion.section>

          {/* FMCG */}
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={scaleReveal}
            transition={{ delay: 0.1 }}
            className="col-span-12 md:col-span-7 h-[400px] relative group overflow-hidden rounded-xl glass"
            whileHover={{ y: -6, boxShadow: "0 0 50px rgba(66,165,245,0.2)" }}
          >
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDiP_uYFEDTXo2YzkS1I0oOIMGoQCAN9gwDbZ_gpI-XecxfNpAdfjFoDXEQs5j1VoLgTyxI1SDW5Dzs6YpDWGxOO1QIXPnSoiOPrrDSYiSC90uAkr-TQ2fQLGqdrK7fsGlIe0ex6jzKFvJsCzJspV7ssikbc9YpQS2wZzE9zAPKc1feFoTmRIVugWdFD9Cb-fhOdfnhNS61j64xnBnpQAWaFIADMchSbakLoANhxt4MaF7CgI2qjEPxDx-yPWkkVlUoWnsQwttqAEw')" }}
              whileHover={{ scale: 1.06 }} transition={{ duration: 0.7 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4">
                <Package className="w-4 h-4" /> FMCG
              </span>
              <h3 className="font-headline-lg text-3xl font-bold text-white mb-4">Omnichannel Distribution.</h3>
              <p className="font-body-lg text-lg text-on-surface-variant">Integrated logistics bridging the gap between factory floor and retail shelf.</p>
            </div>
          </motion.section>

          {/* Export */}
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}
            className="col-span-12 h-[350px] relative group overflow-hidden rounded-xl glass"
            whileHover={{ y: -4, boxShadow: "0 0 50px rgba(66,165,245,0.2)" }}
          >
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAc-365Hu-ZPtPSyX0YJVeuupSwzgeHrSMZCb5vEtCixXCayvO_6__SuerqV2VLGUaiVOSAud9pqR5JywtHxWpDRUOHz7ItKk4CXNh0qaqZdKXM_QCmXDiNxtzKlO3BxnovgX9qprzpBN4xrgTTmRh-Ch1vV1un7r_P7kJQX24HaWW8FTprdnWI0RlZYJeufg5-VSMAAIxzRotQYXFexcPv3P-tDO-FgqrUOKqb_TjiaspDNMWiQmyyFUwjSNYGyepwCIZAoZeyCfI')" }}
              whileHover={{ scale: 1.04 }} transition={{ duration: 0.7 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:px-16">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4">
                  <Globe className="w-4 h-4" /> EXPORT SECTOR
                </span>
                <h3 className="font-headline-lg text-3xl font-bold text-white mb-4">Cross-Border Command.</h3>
                <p className="font-body-lg text-lg text-on-surface-variant mb-6">Navigating complex international customs and multi-modal transit to unlock global markets for regional manufacturers.</p>
                <div className="flex flex-wrap gap-6">
                  {["Customs Clearance", "Compliance Tracking", "Multi-modal Freight"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="text-tertiary w-5 h-5" />
                      <span className="font-body-sm text-sm text-on-surface">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Stats */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center py-12 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl"
        >
          {[
            { val: "98%",  label: "On-Time Delivery" },
            { val: "200+", label: "Global Hubs" },
            { val: "15M+", label: "Annual Shipments" },
            { val: "24/7", label: "Active Monitoring" },
          ].map(({ val, label }) => (
            <motion.div key={label} variants={fadeUp} whileHover={{ scale: 1.08, y: -4 }}>
              <div className="font-display-lg text-5xl font-black text-tertiary">{val}</div>
              <div className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant mt-2">{label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="mt-16 p-12 rounded-xl glass flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-[#005db7]/20 to-transparent"
          whileHover={{ boxShadow: "0 0 40px rgba(66,165,245,0.15)" }}
        >
          <div className="max-w-xl">
            <h2 className="font-headline-lg text-3xl font-bold text-white mb-2">Ready to optimize your sector?</h2>
            <p className="font-body-lg text-lg text-on-surface-variant">Consult with our industry specialists to design a logistics roadmap tailored to your specific operational constraints.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="text-base px-8">Schedule Consultation</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="secondary" className="text-base px-8 bg-white/5">Download Brochure</Button>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
