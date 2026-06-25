"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, FileText, CheckCircle2, Shirt, Syringe, ShoppingCart, Package, Globe, Truck, Zap, Building2 } from "lucide-react";
import Link from "next/link";

const BROCHURES = [
  {
    icon: Globe,
    industry: "Global Freight Overview",
    desc: "Complete overview of NexaCargo's end-to-end freight services across air, sea, and road.",
    pages: 24,
    size: "4.2 MB",
    color: "text-[#00C2FF] bg-[#00C2FF]/10 border-[#00C2FF]/20",
  },
  {
    icon: Shirt,
    industry: "Textile & Apparel",
    desc: "Fast-fashion supply chain solutions, seasonal velocity logistics, and garment handling standards.",
    pages: 18,
    size: "3.1 MB",
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  },
  {
    icon: Syringe,
    industry: "Pharma & Healthcare",
    desc: "Cold-chain mastery, GDP-compliant transport, temperature-monitoring and regulatory compliance.",
    pages: 22,
    size: "5.0 MB",
    color: "text-green-400 bg-green-400/10 border-green-400/20",
  },
  {
    icon: ShoppingCart,
    industry: "E-Commerce & Retail",
    desc: "Last-mile optimization, returns management, peak-season scalability and fulfillment SLAs.",
    pages: 16,
    size: "2.8 MB",
    color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  },
  {
    icon: Package,
    industry: "FMCG Distribution",
    desc: "Omnichannel distribution, ambient and chilled cargo, shelf-ready logistics and POS delivery.",
    pages: 20,
    size: "3.6 MB",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  },
  {
    icon: Truck,
    industry: "Road & Last-Mile",
    desc: "Smart trucking, GPS-tracked fleets, driver management and hyper-local delivery networks.",
    pages: 14,
    size: "2.4 MB",
    color: "text-[#1E88E5] bg-[#1E88E5]/10 border-[#1E88E5]/20",
  },
  {
    icon: Zap,
    industry: "Export & Manufacturing",
    desc: "Cross-border customs clearance, multi-modal freight and export compliance across 190+ countries.",
    pages: 19,
    size: "3.3 MB",
    color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  },
  {
    icon: Building2,
    industry: "Enterprise Solutions",
    desc: "Full-suite enterprise logistics, ERP integration, dedicated account management and SLA dashboards.",
    pages: 28,
    size: "6.1 MB",
    color: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function BrochurePage() {
  const [downloaded, setDownloaded] = useState<string[]>([]);

  const handleDownload = (industry: string, pages: number, size: string) => {
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(`NexaCargo — ${industry}`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Pages: ${pages}  |  File size: ${size}`, 14, 34);
      doc.text(BROCHURES.find(b => b.industry === industry)?.desc ?? "", 14, 46, { maxWidth: 180 });
      doc.text("Contact us: info@nexacargo.com", 14, 80);
      doc.text("Website: https://nexacargo.com", 14, 90);
      doc.save(`NexaCargo_${industry.replace(/[^a-z0-9]/gi, "_")}_Brochure.pdf`);
    });
    setDownloaded(p => [...p, industry]);
    setTimeout(() => setDownloaded(p => p.filter(i => i !== industry)), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0B1F3A] text-white pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/solutions" className="inline-flex items-center gap-2 text-blue-300/60 hover:text-[#00C2FF] text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Solutions
        </Link>

        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-[#00C2FF] mb-3 block">Resources</motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-3">Industry Brochures</motion.h1>
          <motion.p variants={fadeUp} className="text-blue-200/60 mb-10 text-lg max-w-2xl">
            Download detailed logistics guides tailored to your industry. Each brochure covers solutions, case studies, SLAs and pricing frameworks.
          </motion.p>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {BROCHURES.map(({ icon: Icon, industry, desc, pages, size, color }) => {
              const isDone = downloaded.includes(industry);
              return (
                <motion.div key={industry} variants={fadeUp}
                  whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,194,255,0.1)" }}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 flex flex-col gap-4 transition-all duration-300 hover:border-[#00C2FF]/25"
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm mb-1">{industry}</p>
                    <p className="text-xs text-blue-200/50 leading-relaxed">{desc}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-blue-200/40 font-mono border-t border-white/5 pt-3">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {pages} pages</span>
                    <span>{size}</span>
                  </div>
                  <button onClick={() => handleDownload(industry, pages, size)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                      isDone
                        ? "bg-green-500/15 border border-green-500/30 text-green-400"
                        : "bg-[#1E88E5]/90 hover:bg-[#1565C0] text-white shadow-[0_0_16px_rgba(30,136,229,0.25)]"
                    }`}
                  >
                    {isDone
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> Downloaded!</>
                      : <><Download className="w-3.5 h-3.5" /> Download PDF</>
                    }
                  </button>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Note */}
          <motion.p variants={fadeUp} className="text-center text-xs text-blue-200/30 mt-10">
            All brochures are free to download. For custom enterprise documentation, <Link href="/contact" className="text-[#00C2FF] hover:underline">contact our team</Link>.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
