"use client";

import Link from "next/link";
import { Rocket, CheckCircle2, ArrowRight, PackageOpen, RadioTower, Gavel, Shield, Code, LineChart, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";

export default function TechnologyProductsPage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 150]);

  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-16">
      <main className="pt-12 pb-24 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="relative min-h-[614px] flex items-center justify-center overflow-hidden mb-12 rounded-3xl">
          <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover opacity-20"
              alt="Futuristic dark-themed cargo terminal at night"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADg66LyLrB3n1V4rT-dWMa2jLrdsCCQSzRUOk0-T-y4zehmuzgqfjVdARjMiuITF_JoPD9dUSLR2gvvU7oP_uV6_cSzrLL9JGhCLPOK0BJAljqeEp85sUvp_p82zVPAOEhU8Yahmz9Gc7mnEa070LMv5yc88t4KElwM1re0wOV_nOStkhAmprINFKl8uPX6r0XdghSUvsGkNB7sVmfd8bfDcrsVlvkLI9xBd7vv1ey0aTjF06btCAtAHGspNtHRDsbg9yGI6JNhtg"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020D1F]/50 to-[#020D1F] z-0"></div>

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-tertiary/20 blur-sm pointer-events-none"
              style={{
                left: `${(i * 7 + 4) % 100}%`,
                top: `${(i * 11 + 5) % 100}%`,
                width: `${8 + (i % 3) * 4}px`,
                height: `${8 + (i % 3) * 4}px`,
              }}
              animate={{ y: [0, -18, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.1 }}
            />
          ))}

          <div className="relative z-10 max-w-4xl text-center px-6">
            <h1 className="font-display-lg text-5xl md:text-[64px] mb-6 leading-tight font-bold">Intelligent Logistics <br /><span className="text-tertiary">Product Suite</span></h1>
            <p className="font-body-lg text-lg text-on-surface-variant mb-12 max-w-2xl mx-auto">Enterprise-grade SaaS solutions designed to optimize every link in your global supply chain with real-time intelligence and seamless automation.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/products/demo"><Button size="lg" className="px-8 h-12 text-base">Request Demo</Button></Link>
              <Link href="/products/pricing"><Button size="lg" variant="secondary" className="px-8 h-12 text-base bg-white/5 border-transparent hover:bg-white/10">View Pricing</Button></Link>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="grid grid-cols-1 gap-12">
          {/* Product 1: Smart Cargo Pro */}
          <div className="glass rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 group hover:shadow-[0_0_20px_rgba(66,165,245,0.15)] transition-all duration-500 hover:border-tertiary/30">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-xs tracking-widest uppercase mb-6 w-fit">
                <Rocket className="w-4 h-4" /> FREIGHT MANAGEMENT
              </div>
              <h2 className="font-display-lg text-4xl font-bold text-on-surface mb-4">Smart Cargo Pro</h2>
              <p className="font-body-lg text-lg text-on-surface-variant mb-8">A comprehensive freight forwarding and brokerage platform that leverages AI to optimize route planning and carrier selection.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-tertiary w-6 h-6 flex-shrink-0" />
                  <span className="font-body-lg text-lg text-on-surface">AI-Powered Dynamic Routing Engine</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-tertiary w-6 h-6 flex-shrink-0" />
                  <span className="font-body-lg text-lg text-on-surface">Real-time Carrier Performance Scoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-tertiary w-6 h-6 flex-shrink-0" />
                  <span className="font-body-lg text-lg text-on-surface">Automated Multi-modal Documentation</span>
                </li>
              </ul>
              <Link href="/products/smart-cargo-pro" className="w-fit text-tertiary flex items-center gap-2 font-title-md text-lg font-semibold hover:gap-4 transition-all">
                Learn more <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative min-h-[400px] overflow-hidden bg-surface-container-low">
              <img
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Dark-mode software interface showing a world map"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-8dl2OtJpA_jdqNVzJhb8Gr4CkJobpVo9brfuNVTwrQ8DZ8oqRctIRUPgJgbq9hxKapengYDxfjHcWqLin0F_EHZpAYyfhCqzsK02nASXlXSJIo--7SPBA43qAl3yLxFCFaTo01HwsZcBnJF35ZXT1yuMKoIG8RNdO_IX1WIIDnR752U6LMLwFIS7yvJFLX3BTwSiU3y5kCoF4vrr8L7BuzhC1rwA7rpYoRTpAQ-97doIM4srx-uEnvK1jFFSbQRTqzsmwTtaTc4"
              />
            </div>
          </div>

          {/* Product 2: Warehouse Cloud */}
          <div className="glass rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 group hover:shadow-[0_0_20px_rgba(66,165,245,0.15)] transition-all duration-500 hover:border-tertiary/30">
            <div className="relative min-h-[400px] overflow-hidden bg-surface-container-low order-2 md:order-1">
              <img
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Modern warehouse interior with high-density shelving"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMhALOot442doE5Tslvx_gAmsw3BDZd4vtBnjogFLVrJwuOpj7lCadb0BxUK00R6-6XgUbGD8MBb32dUhSjbS37LVKgvu7W5yT70jcY2uOUiPOJVrvvPcevfh-bGMxK2GX2Q9yVyZhfxYyGSJnX_5nVquWJo5yS8ZgKQzD3flNWFJ9Ck1rNyfl9USHD8yOj7fj_LtbzQDILMYSviK8Bo2Cn3zX-DbrXUlEB98dk_BNJxL8zhw5eAcul9jvcHvhs_KXd1RPpn85XOc"
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-xs tracking-widest uppercase mb-6 w-fit">
                <PackageOpen className="w-4 h-4" /> WMS & INVENTORY
              </div>
              <h2 className="font-display-lg text-4xl font-bold text-on-surface mb-4">Warehouse Cloud</h2>
              <p className="font-body-lg text-lg text-on-surface-variant mb-8">Scalable, cloud-native warehouse management system that synchronizes physical inventory with digital workflows across global hubs.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-tertiary w-6 h-6 flex-shrink-0" />
                  <span className="font-body-lg text-lg text-on-surface">Cross-docking Optimization Modules</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-tertiary w-6 h-6 flex-shrink-0" />
                  <span className="font-body-lg text-lg text-on-surface">Voice-pick and RFID Native Integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-tertiary w-6 h-6 flex-shrink-0" />
                  <span className="font-body-lg text-lg text-on-surface">Predictive Slotting for High-velocity SKUs</span>
                </li>
              </ul>
              <Link href="/products/warehouse-cloud" className="w-fit text-tertiary flex items-center gap-2 font-title-md text-lg font-semibold hover:gap-4 transition-all">
                Learn more <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Product 3: Nexa Track & Customs Assist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Nexa Track */}
            <div className="glass rounded-3xl p-8 flex flex-col hover:border-tertiary/30 hover:shadow-[0_0_20px_rgba(66,165,245,0.15)] transition-all">
              <div className="aspect-video mb-8 rounded-2xl overflow-hidden bg-surface-container-low">
                <img
                  className="w-full h-full object-cover"
                  alt="Detailed dashboard screen featuring real-time GPS tracking data"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCibSSYTO4RLPPxGIX4T0w3wGPlpxxpbH6hNtHWoUw_H3X3eo2TCX--pJRqxRSaZWFw9RbjfBKK7e60pDuNERz-wUdXMTDsrSaWHrL-D98R9yPg7RalN3o_P9BUwNeSmFQDxyBCBO_6uAKF8KSHJcHFL7-Ff8_2nRnYrfC7hDNXvScnveDKOBdJlB4ZPHqArGUdap7c0sTcJW-t1ckxIUKAQxfzEWbanq-FALUbgzD0of36fRf4ynJt3tgvn94bOsaeBMjnL8Zs3Qc"
                />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4 w-fit">
                <RadioTower className="w-4 h-4" /> VISIBILITY
              </div>
              <h3 className="font-headline-lg text-3xl font-bold text-on-surface mb-4">Nexa Track</h3>
              <p className="font-body-lg text-lg text-on-surface-variant mb-8 flex-grow">Hyper-precise IoT tracking for high-value shipments with environmental telemetry monitoring.</p>
              <Link href="/products/nexa-track" className="w-full"><Button variant="secondary" className="w-full bg-white/5 border-transparent text-lg h-12 hover:bg-white/10">Explore Features</Button></Link>
            </div>

            {/* Customs Assist */}
            <div className="glass rounded-3xl p-8 flex flex-col hover:border-tertiary/30 hover:shadow-[0_0_20px_rgba(66,165,245,0.15)] transition-all">
              <div className="aspect-video mb-8 rounded-2xl overflow-hidden bg-surface-container-low">
                <img
                  className="w-full h-full object-cover"
                  alt="Digital representation of global compliance documents"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDa4ohYaj_a4KbQUGSaPuc7tnQ_UrkennPB2PgZBB-hClzUvPOx71mR0lHUtB7zToFDv4RScFsr5-On8ybpEPRhJADsAokKOIUGX0QaFulS9LsAWTJ3fKIwUDLBa-Cj3ZURUzbyMchsqJRX7kHg3EOzS7MtnsZabjWLBDi_VZl1xIo1eS06OsBtTBRmzhCaMlntgXE8x2rdXl83JOTBbCqWpRxRpcDoQUBkpgCromk-PUw8eSw1KKV-mPDwdmOjf1kLoL9w6aOD3Qs"
                />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-xs tracking-widest uppercase mb-4 w-fit">
                <Gavel className="w-4 h-4" /> COMPLIANCE
              </div>
              <h3 className="font-headline-lg text-3xl font-bold text-on-surface mb-4">Customs Assist</h3>
              <p className="font-body-lg text-lg text-on-surface-variant mb-8 flex-grow">Automated trade compliance and electronic filing across 180+ jurisdictions using Smart Ledger technology.</p>
              <Link href="/products/customs-assist" className="w-full"><Button variant="secondary" className="w-full bg-white/5 border-transparent text-lg h-12 hover:bg-white/10">Explore Features</Button></Link>
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="bg-surface-container-low/50 py-24 mt-24 rounded-3xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-4">Standard Enterprise Features</h2>
              <p className="font-body-lg text-lg text-on-surface-variant">Every NexaCargo product is built on our core high-performance infrastructure.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#1565C0]/10 flex items-center justify-center mx-auto mb-6">
                  <Shield className="text-primary w-8 h-8" />
                </div>
                <h4 className="font-title-md text-xl font-semibold text-on-surface mb-2">Bank-Grade Security</h4>
                <p className="font-body-sm text-sm text-on-surface-variant">SOC2 Type II compliant with end-to-end encryption.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#1565C0]/10 flex items-center justify-center mx-auto mb-6">
                  <Code className="text-primary w-8 h-8" />
                </div>
                <h4 className="font-title-md text-xl font-semibold text-on-surface mb-2">Extensible APIs</h4>
                <p className="font-body-sm text-sm text-on-surface-variant">Connect your existing ERP or CRM in minutes.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#1565C0]/10 flex items-center justify-center mx-auto mb-6">
                  <LineChart className="text-primary w-8 h-8" />
                </div>
                <h4 className="font-title-md text-xl font-semibold text-on-surface mb-2">Advanced Analytics</h4>
                <p className="font-body-sm text-sm text-on-surface-variant">Real-time BI dashboards and custom reporting.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#1565C0]/10 flex items-center justify-center mx-auto mb-6">
                  <Network className="text-primary w-8 h-8" />
                </div>
                <h4 className="font-title-md text-xl font-semibold text-on-surface mb-2">Global Hubs</h4>
                <p className="font-body-sm text-sm text-on-surface-variant">Low-latency performance across all continents.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 mb-12">
          <div className="glass rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-container/20 to-tertiary-container/20 -z-10"></div>
            <h2 className="font-display-lg text-4xl md:text-5xl font-bold text-on-surface mb-6">Ready to modernize your fleet?</h2>
            <p className="font-body-lg text-lg text-on-surface-variant mb-12 max-w-xl mx-auto">Join 5,000+ global enterprises scaling their logistics with NexaCargo technology.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/products/demo"><Button size="lg" className="px-8 h-14 text-lg">Get Started Today</Button></Link>
              <Link href="/industries/consultation"><Button size="lg" variant="secondary" className="px-8 h-14 text-lg bg-transparent border-white/10 hover:bg-white/5">Schedule a Consult</Button></Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
