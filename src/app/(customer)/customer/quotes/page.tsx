"use client";

import { useState, useEffect } from "react";
import { FileSignature, CheckCircle2, Clock, Send, Zap, Ship, Plane, Package, ArrowRight, Shield, ShieldCheck, ShieldAlert, ShieldX, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const SERVICES = [
  { icon: Ship, label: "Sea Freight", desc: "FCL & LCL container shipping worldwide" },
  { icon: Plane, label: "Air Freight", desc: "Express air cargo for time-sensitive goods" },
  { icon: Package, label: "Bulk Cargo", desc: "Cost-effective bulk and breakbulk shipping" },
];

const INSURANCE_PLANS = [
  {
    id: "None",
    name: "No Insurance",
    desc: "Carrier liability only",
    rate: "0.00%",
    icon: ShieldX,
    color: "text-on-surface-variant bg-white/5 border-white/10"
  },
  {
    id: "Basic",
    name: "Basic Cover",
    desc: "Up to $50,000 cargo value",
    rate: "0.35%",
    icon: Shield,
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20"
  },
  {
    id: "Standard",
    name: "Standard Cover",
    desc: "Up to $150,000 cargo value",
    rate: "0.45%",
    icon: ShieldCheck,
    color: "text-tertiary bg-tertiary/10 border-tertiary/30",
    recommended: true
  },
  {
    id: "Premium",
    name: "Premium Cover",
    desc: "Up to $500,000 cargo value",
    rate: "0.60%",
    icon: ShieldAlert,
    color: "text-secondary bg-secondary/10 border-secondary/20"
  }
];

export default function RequestQuotesPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ origin: "", destination: "", type: "FCL 20FT", weight: "", date: "", insurance: "No Insurance", notes: "" });
  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`quotes_${user.id}`);
      if (stored) {
        setQuotes(JSON.parse(stored));
      }
    }
  }, [user?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newQuote = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      origin: form.origin,
      destination: form.destination,
      type: form.type,
      weight: form.weight,
      date: form.date,
      insurance: form.insurance,
      notes: form.notes,
      status: "Pending Review",
      createdAt: new Date().toISOString(),
    };

    const updated = [newQuote, ...quotes];
    setQuotes(updated);
    if (user?.id) {
      localStorage.setItem(`quotes_${user.id}`, JSON.stringify(updated));
    }

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setForm({ origin: "", destination: "", type: "FCL 20FT", weight: "", date: "", insurance: "No Insurance", notes: "" });
  };

  return (
    <div className="space-y-6 page-enter">
      <Link href="/customer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
        <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
        <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
      </Link>
      <div>
        <p className="text-xs uppercase tracking-widest text-tertiary">Customer Portal</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Request a Quote</h1>
        <p className="text-sm text-on-surface-variant mt-1">Instant quotes for shipping services — get pricing within 24 hours.</p>
      </div>

      {/* Service highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SERVICES.map(({ icon: Icon, label, desc }) => (
          <Card key={label} className="p-4 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tertiary/10">
              <Icon className="h-4 w-4 text-tertiary" />
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">{label}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quote Form */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <Zap className="h-5 w-5 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Get an Instant Quote</h2>
        </div>

        {submitted && (
          <div className="flex items-center gap-2 mb-5 p-4 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 text-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Quote request submitted!</p>
              <p className="text-xs text-green-400/80 mt-0.5">Our team will respond within 24 business hours.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Origin Port / City</label>
              <input required value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="e.g. Shanghai" className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Destination Port / City</label>
              <input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}
                placeholder="e.g. Rotterdam" className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Cargo Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
                <option>FCL 20FT</option>
                <option>FCL 40FT</option>
                <option>FCL 40HQ</option>
                <option>LCL</option>
                <option>Air Freight</option>
                <option>Bulk</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Cargo Weight (kg)</label>
              <input required type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="e.g. 5000" className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50" />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Preferred Shipment Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-on-surface-variant block mb-1">
              Select Cargo Insurance Policy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {INSURANCE_PLANS.map((plan) => {
                const Icon = plan.icon;
                const isSelected = form.insurance === plan.name;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setForm({ ...form, insurance: plan.name })}
                    className={`relative p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "bg-tertiary/5 border-tertiary/50 shadow-[0_0_15px_rgba(66,165,245,0.15)]"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    {plan.recommended && (
                      <span className="absolute top-2.5 right-2.5 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-tertiary/20 text-tertiary">
                        Rec
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${plan.color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-on-surface text-xs">{plan.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{plan.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1 border-t border-white/5 mt-1 w-full">
                      <span className="text-[10px] text-on-surface-variant font-mono">Rate:</span>
                      <span className="font-mono text-xs font-bold text-tertiary">{plan.rate}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Additional Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              placeholder="Hazardous goods, temperature requirements, special handling…"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 resize-none" />
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] transition-colors shadow-[0_0_20px_rgba(30,136,229,0.3)]">
            <Send className="h-4 w-4" /> Submit Quote Request
          </button>
        </form>
      </Card>

      {/* Past quotes */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Past Quotes</h2>
        {quotes.length === 0 ? (
          <Card className="p-10 flex flex-col items-center text-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <FileSignature className="h-7 w-7 text-on-surface-variant/40" />
            </div>
            <p className="text-sm font-semibold text-on-surface">No quotes yet</p>
            <p className="text-xs text-on-surface-variant max-w-xs">Your submitted quote requests will appear here once processed.</p>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1">
              <Clock className="h-3.5 w-3.5" /> Responses within 24 business hours
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {quotes.map((q) => (
              <Card key={q.id} className="p-5 hover:bg-white/2 transition-colors border border-white/5 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-tertiary/60" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-tertiary">{q.id}</span>
                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-on-surface-variant font-semibold">
                        {q.type}
                      </span>
                      {q.insurance && q.insurance !== "No Insurance" && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 font-bold">
                          🛡️ {q.insurance}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm font-semibold text-on-surface">
                      <span>{q.origin}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-on-surface-variant/40" />
                      <span>{q.destination}</span>
                    </div>

                    <p className="text-xs text-on-surface-variant">
                      Weight: <span className="font-medium text-on-surface">{q.weight} kg</span>
                      {q.date && (
                        <>
                          <span className="mx-2">•</span>
                          Ship Date: <span className="font-medium text-on-surface">{q.date}</span>
                        </>
                      )}
                    </p>

                    {q.notes && (
                      <p className="text-xs text-on-surface-variant italic max-w-xl bg-white/[0.01] p-2 rounded border border-white/5">
                        Notes: {q.notes}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
                      <Clock className="h-3 w-3 animate-pulse" /> Pending Review
                    </span>
                    <span className="text-[10px] text-on-surface-variant/50 font-mono">
                      Requested: {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
