import Link from "next/link";
import { ArrowLeft, LineChart } from "lucide-react";

export default function ConsultingPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface pt-24 px-6 pb-16">
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-surface-container-lowest p-8 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Link>
        <div className="mt-8 flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary"><LineChart className="h-8 w-8" /></div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-tertiary">Consulting</p>
            <h1 className="mt-2 text-3xl font-semibold text-on-surface">Analytics-driven logistics consulting</h1>
            <p className="mt-4 text-on-surface-variant">This page is for optimization reviews, process redesign, KPI tracking, and roadmap planning to improve network efficiency and cost performance.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
