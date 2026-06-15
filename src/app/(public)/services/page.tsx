"use client";

import { PlaneTakeoff, Ship, Truck, FileText, LineChart, Activity, Network, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
  show:   { opacity: 1, scale: 1,   transition: { duration: 0.6 } },
};

export default function ServicesPage() {
  const router = useRouter();
  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">

      {/* Hero */}
      <header className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#1565C0] rounded-full mix-blend-screen filter blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#42A5F5] rounded-full mix-blend-screen filter blur-[120px]" />
        </div>
        <motion.div
          initial="hidden" animate="show" variants={stagger}
          className="relative z-10 max-w-7xl mx-auto text-center"
        >
          <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 inline-block tracking-[0.2em] uppercase">
            PRECISION LOGISTICS
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-[64px] mb-6 leading-tight">
            Comprehensive Global<br /><span className="text-primary">Supply Chain Solutions</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
            Harness the power of advanced global freight management with NexaCargo. We orchestrate complex movements across air, sea, and land with surgical precision.
          </motion.p>
        </motion.div>
      </header>

      {/* Services Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Air Freight */}
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={scaleReveal}
            className="md:col-span-8 group relative glass rounded-xl p-8 overflow-hidden flex flex-col justify-between min-h-[400px]"
            whileHover={{ y: -6, boxShadow: "0 0 40px rgba(66,165,245,0.2)" }}
          >
            <div className="absolute inset-0 -z-10 opacity-30 group-hover:opacity-50 transition-opacity">
              <img alt="Air Cargo Aircraft" className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIRCCd9i4uw3FAlui7tIrF0PnEopj9NCgfFs7iyBCqMWFh3zrxSYcDi2o2YihHjo4CVgjpvbD-skj1L4tndJfXJattT9x1oU82dy5hCVcPLuk98H0dPc18rKQu82XsEh2wLNjeYeB_AXq3Dp2s8yVh0enYFd4T7yQqW3Yts2IkvZShoqIGf_OUlG_zPG2IvmWyvVHGEc4CYPrWaLBsXbVDPnrOE4wYYC42oMHS4oIrV71lr9vEUJTn5bgg5iiYX1cI583_7QZzbhA" />
            </div>
            <div>
              <motion.div className="flex items-center gap-4 mb-6" whileHover={{ x: 4 }}>
                <PlaneTakeoff className="text-tertiary w-10 h-10 transition-transform group-hover:scale-110 group-hover:-rotate-6" />
                <h2 className="font-title-md text-2xl font-semibold">Air Freight</h2>
              </motion.div>
              <p className="font-body-lg text-lg text-on-surface-variant max-w-md">
                Next-day and time-definite delivery solutions. We manage high-priority shipments through our global hub network with full real-time visibility and climate-controlled options.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-12">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button className="flex items-center gap-2" onClick={() => router.push("/services/air-freight")}>
                  Explore Air Freight Plans <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
              <span className="font-mono text-sm text-tertiary">99.8% On-Time Performance</span>
            </div>
          </motion.section>

          {/* Sea Freight */}
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
            className="md:col-span-4 group glass rounded-xl p-8 flex flex-col justify-between min-h-[400px]"
            whileHover={{ y: -6, boxShadow: "0 0 40px rgba(66,165,245,0.2)" }}
          >
            <div>
              <motion.div whileHover={{ rotate: 10 }}>
                <Ship className="text-tertiary w-10 h-10 mb-6 transition-transform group-hover:scale-110 group-hover:-rotate-6" />
              </motion.div>
              <h2 className="font-title-md text-2xl font-semibold mb-4">Sea Freight</h2>
              <p className="font-body-sm text-sm text-on-surface-variant">
                Cost-effective LCL and FCL shipping for global trade. We manage complex maritime routes including oversized project cargo and bulk transport.
              </p>
            </div>
            <div className="mt-8">
              <motion.div className="h-24 w-full rounded-lg overflow-hidden mb-6 opacity-60 group-hover:opacity-100 transition-opacity" whileHover={{ scale: 1.04 }}>
                <img alt="Container Terminal" className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf7JrlDtjtmw8UBMjccE02sa0M2wgQZiSWJj4IcDbJFVP_YSz70KIHNgZ6B6c-sxUGiCcEO1bqH6QQw1q2rAWVe28G4-I6rp8Uujl4j4uCDHM2z_2DL8V0ozzs4dZlHVMNc38hsIilfME0uPVQH5KEJ2D8DPJtHDUaonv8dzKpM17rxc1NOzMjCkjHIngmlUJM5e-KfC71v5w5ZKbL3M33g94ueUUYiOntmclvmZEtaBQYSgIY8iZUBj8jh-eYQ26A2ba-OuF6dbI" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" className="w-full text-xs font-label-caps tracking-widest uppercase" onClick={() => router.push("/services/sea-freight")}>
                  View Sea Freight Routes
                </Button>
              </motion.div>
            </div>
          </motion.section>

          {/* Road */}
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 group glass rounded-xl p-8 flex flex-col justify-between min-h-[360px]"
            whileHover={{ y: -6, boxShadow: "0 0 40px rgba(66,165,245,0.2)" }}
          >
            <div>
              <motion.div whileHover={{ rotate: 10 }}>
                <Truck className="text-tertiary w-10 h-10 mb-6 transition-transform group-hover:scale-110" />
              </motion.div>
              <h2 className="font-title-md text-2xl font-semibold mb-4">Road Transportation</h2>
              <p className="font-body-sm text-sm text-on-surface-variant">
                Smart trucking and last-mile solutions. Integrated GPS tracking and automated dispatch ensure your cargo stays on schedule across entire continents.
              </p>
            </div>
            <div className="mt-8">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" className="w-full text-xs font-label-caps tracking-widest uppercase" onClick={() => router.push("/services/road-transport")}>
                  See Road Fleet Options
                </Button>
              </motion.div>
            </div>
          </motion.section>

          {/* Customs */}
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
            transition={{ delay: 0.15 }}
            className="md:col-span-4 group glass rounded-xl p-8 flex flex-col justify-between min-h-[360px] relative"
            whileHover={{ y: -6, boxShadow: "0 0 40px rgba(66,165,245,0.2)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent pointer-events-none rounded-xl" />
            <div className="relative z-10">
              <motion.div whileHover={{ rotate: 10 }}>
                <FileText className="text-tertiary w-10 h-10 mb-6 transition-transform group-hover:scale-110" />
              </motion.div>
              <h2 className="font-title-md text-2xl font-semibold mb-4">Customs Clearance</h2>
              <p className="font-body-sm text-sm text-on-surface-variant">
                Navigating the complexities of international trade law. Our expert team ensures compliance and minimizes delays through digitized documentation processing.
              </p>
            </div>
            <div className="mt-8 relative z-10">
              <ul className="font-body-sm text-sm text-on-surface-variant space-y-2 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="text-primary w-4 h-4" /> Duty Drawback</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-primary w-4 h-4" /> Tariff Classification</li>
              </ul>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" className="w-full text-xs font-label-caps tracking-widest uppercase" onClick={() => router.push("/services/customs-clearance")}>
                  Review Customs Support
                </Button>
              </motion.div>
            </div>
          </motion.section>

          {/* Consulting */}
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 group glass rounded-xl p-8 flex flex-col justify-between min-h-[360px] bg-primary-container"
            whileHover={{ y: -6, boxShadow: "0 0 40px rgba(66,165,245,0.2)" }}
          >
            <div>
              <motion.div whileHover={{ rotate: 10 }}>
                <LineChart className="text-tertiary w-10 h-10 mb-6 transition-transform group-hover:scale-110" />
              </motion.div>
              <h2 className="font-title-md text-2xl font-semibold mb-4">Consulting</h2>
              <p className="font-body-sm text-sm text-on-surface-variant">
                Strategic optimization of your logistics network. We leverage AI-driven analytics to identify bottlenecks and reduce operational overhead.
              </p>
            </div>
            <div className="mt-8">
              <div className="bg-black/20 p-4 rounded-lg border border-white/5 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-label-caps text-[10px] tracking-widest uppercase">EFFICIENCY GAIN</span>
                  <span className="font-mono text-sm text-tertiary">+24%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div className="bg-tertiary h-full rounded-full"
                    initial={{ width: 0 }} whileInView={{ width: "74%" }}
                    transition={{ duration: 1.2, ease: "easeOut" }} viewport={{ once: true }} />
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button className="w-full text-xs font-label-caps tracking-widest uppercase" onClick={() => router.push("/services/consulting")}>
                  Book Consulting Session
                </Button>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Stats Strip */}
      <section className="bg-surface-container-lowest py-24 border-y border-white/5">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { val: "190+", label: "Countries Served" },
            { val: "2.4M", label: "Metric Tons Annually" },
            { val: "12k+", label: "Fleet Units" },
            { val: "0.02%", label: "Damage Rate" },
          ].map(({ val, label }) => (
            <motion.div key={label} variants={fadeUp} whileHover={{ scale: 1.06, y: -4 }}>
              <p className="font-display-lg text-5xl md:text-6xl font-black text-on-surface">{val}</p>
              <p className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest mt-2">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Visibility Ecosystem */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="flex-1 space-y-6"
          >
            <motion.h2 variants={fadeUp} className="font-headline-lg text-3xl font-semibold text-on-surface">Advanced Visibility Ecosystem</motion.h2>
            <motion.p variants={fadeUp} className="font-body-lg text-lg text-on-surface-variant">
              Every service we offer is powered by our proprietary <span className="text-tertiary font-semibold">NexaStream</span> platform. Real-time IoT sensors provide telemetry data directly to your dashboard.
            </motion.p>
            <motion.div variants={stagger} className="grid grid-cols-2 gap-6 mt-8">
              {[
                { Icon: Activity, title: "Live Telemetry", desc: "Real-time condition monitoring." },
                { Icon: Network, title: "API Integration", desc: "Connect to your existing ERP." },
              ].map(({ Icon, title, desc }) => (
                <motion.div key={title} variants={fadeUp}
                  whileHover={{ y: -6, scale: 1.03, boxShadow: "0 0 30px rgba(66,165,245,0.25)" }}
                  className="p-6 glass rounded-lg"
                >
                  <Icon className="text-primary mb-4 w-6 h-6" />
                  <h4 className="font-label-caps text-xs tracking-widest uppercase mb-2">{title}</h4>
                  <p className="font-body-sm text-sm text-on-surface-variant">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={scaleReveal}
            className="flex-1 relative w-full mt-8 md:mt-0"
            whileHover={{ scale: 1.02 }}
          >
            <div className="glass rounded-xl p-2 border-primary/20 shadow-[0_0_30px_rgba(66,165,245,0.1)]">
              <img alt="Logistics Dashboard" className="rounded-lg w-full object-cover aspect-video"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjpX8rSKMsaEppJ3h_tdIsgaYmQXhkPV0E-4lv9VnZk7j7JqXkedCNaxMgS9_IxN-EI9vumHfgTt-WkPIu2U3OMiUz0JQ8kul8r0xpjqkrIzT0j_79V5WIk-P30Jv8njmdKR9gYm-2aObx5ujU6F9bJg9b0YvmJyxjzQWRAE0HGaO7__wDQVaNjyBot8V2o6-195Q8WtmYwNNitccYn7TBnGw7TOq73P2ygH0OVUkTdOywhSFhUaUWLQxS8EJd6OelILPwfLXNIhk" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
