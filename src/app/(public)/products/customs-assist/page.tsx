import Link from "next/link";
import { ArrowLeft, Gavel } from "lucide-react";

export default function CustomsAssistPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface pt-24 px-6 pb-16">
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-surface-container-lowest p-8 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <div className="mt-8 flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary"><Gavel className="h-8 w-8" /></div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-tertiary">Customs Assist</p>
            <h1 className="mt-2 text-3xl font-semibold text-on-surface">Automated customs compliance and filing</h1>
            <p className="mt-4 text-on-surface-variant">This page is for Customs Assist workflows including trade compliance, digital filing, and global regulatory support.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
