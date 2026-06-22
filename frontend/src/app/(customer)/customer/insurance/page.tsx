"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle2, Send, FileText, ShieldCheck, ShieldAlert, ShieldX, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { insuranceApi } from "@/lib/services";
import { apiError } from "@/lib/api";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const POLICY_STATUS_STYLES: Record<string, string> = {
  requested: "text-amber-400 bg-amber-400/10",
  approved: "text-tertiary bg-tertiary/10",
  active: "text-green-400 bg-green-400/10",
  rejected: "text-error bg-error/10",
  expired: "text-on-surface-variant bg-white/5",
};

const PLANS = [
  {
    name: "Basic Cover",
    coverage: "Up to $50,000",
    rate: "0.35%",
    icon: Shield,
    color: "text-on-surface-variant bg-white/5 border-white/10",
    features: ["Total loss coverage", "General average", "Email support"],
  },
  {
    name: "Standard Cover",
    coverage: "Up to $150,000",
    rate: "0.45%",
    icon: ShieldCheck,
    color: "text-tertiary bg-tertiary/10 border-tertiary/30",
    features: ["All Basic features", "Partial loss coverage", "Theft & piracy", "Priority support"],
    recommended: true,
  },
  {
    name: "Premium Cover",
    coverage: "Up to $500,000",
    rate: "0.60%",
    icon: ShieldAlert,
    color: "text-secondary bg-secondary/10 border-secondary/20",
    features: ["All Standard features", "Refrigeration breakdown", "War & strikes", "24/7 dedicated support"],
  },
];

const WHAT_IS_COVERED = [
  { icon: ShieldCheck, label: "Total Loss", desc: "Full compensation if cargo is completely lost." },
  { icon: ShieldCheck, label: "Partial Damage", desc: "Covers damage to part of your shipment." },
  { icon: ShieldCheck, label: "Theft & Piracy", desc: "Protection against theft during transit." },
  { icon: ShieldX, label: "Improper Packing", desc: "Not covered — ensure correct packaging." },
];

export default function CargoInsurancePage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Standard Cover");
  const [form, setForm] = useState({ shipment: "", value: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try { setPolicies((await insuranceApi.policies()) ?? []); } catch { setPolicies([]); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.shipment.trim()) e.shipment = "Shipment ID is required.";
    if (!form.value.trim()) e.value = "Cargo value is required.";
    else if (isNaN(Number(form.value)) || Number(form.value) <= 0) e.value = "Enter a valid positive amount.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    const ref = form.shipment.trim();
    try {
      await insuranceApi.request({
        // Only send a real UUID as shipment_id; otherwise keep the reference in notes.
        shipment_id: UUID_RE.test(ref) ? ref : undefined,
        coverage_amount: Number(form.value),
        notes: `${selectedPlan}${UUID_RE.test(ref) ? "" : ` · Shipment ref: ${ref}`}`,
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setForm({ shipment: "", value: "" });
      load();
    } catch (err) {
      setErrors({ shipment: apiError(err) });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Link href="/customer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
        <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
        <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
      </Link>
      <div>
        <p className="text-xs uppercase tracking-widest text-tertiary">Customer Portal</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Cargo Insurance</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage and request insurance for your shipments — simple, fast and reliable.</p>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Choose a Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map(({ name, coverage, rate, icon: Icon, color, features, recommended }) => (
            <button
              key={name}
              onClick={() => setSelectedPlan(name)}
              className={`relative p-5 rounded-xl border text-left transition-all space-y-3 ${
                selectedPlan === name ? "bg-tertiary/5 border-tertiary/40" : "bg-white/[0.02] border-white/5 hover:bg-white/5"
              }`}
            >
              {recommended && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary">
                  Recommended
                </span>
              )}
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-on-surface text-sm">{name}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{coverage}</p>
                <p className="font-mono text-base font-bold text-tertiary mt-1">
                  {rate} <span className="text-xs text-on-surface-variant font-normal">of cargo value</span>
                </p>
              </div>
              <ul className="space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              {selectedPlan === name && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1E88E5] px-3 py-1.5 rounded-lg mt-1 justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Plan Selected
                </div>
              )}
              {selectedPlan !== name && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant border border-white/10 px-3 py-1.5 rounded-lg mt-1 justify-center hover:border-white/25 transition-colors">
                  Select This Plan
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apply Form */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <FileText className="h-5 w-5 text-tertiary" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Request Insurance</h2>
          </div>

          {submitted && (
            <div className="flex items-start gap-3 mb-5 p-4 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Application submitted!</p>
                <p className="text-xs text-green-400/80 mt-0.5">Your insurance policy will be activated within 24 hours.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Shipment ID</label>
              <input value={form.shipment} onChange={(e) => { setForm({ ...form, shipment: e.target.value }); setErrors(p => ({ ...p, shipment: "" })); }}
                placeholder="e.g. NX-8842-HK"
                className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${errors.shipment ? "border-red-500" : "border-white/10"}`} />
              {errors.shipment && <p className="text-xs text-error mt-1">{errors.shipment}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Declared Cargo Value (USD)</label>
              <input type="number" value={form.value} onChange={(e) => { setForm({ ...form, value: e.target.value }); setErrors(p => ({ ...p, value: "" })); }}
                placeholder="e.g. 80000"
                className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${errors.value ? "border-red-500" : "border-white/10"}`} />
              {errors.value && <p className="text-xs text-error mt-1">{errors.value}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Selected Plan</label>
              <input readOnly value={selectedPlan}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-tertiary/30 text-sm text-tertiary cursor-default" />
            </div>
            <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] transition-colors shadow-[0_0_20px_rgba(30,136,229,0.3)] disabled:opacity-50">
              <Send className="h-4 w-4" /> {saving ? "Submitting…" : "Submit Insurance Application"}
            </button>
          </form>
        </Card>

        {/* What's covered + empty policies */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3">What's Covered</h2>
            <Card className="divide-y divide-white/5">
              {WHAT_IS_COVERED.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 p-4">
                  <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${label === "Improper Packing" ? "text-error" : "text-green-400"}`} />
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{label}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Your Policies</h2>
            {loading ? (
              <Card className="p-8 text-center text-sm text-on-surface-variant">Loading your policies…</Card>
            ) : policies.length === 0 ? (
              <Card className="p-8 flex flex-col items-center text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                  <Shield className="h-6 w-6 text-on-surface-variant/40" />
                </div>
                <p className="text-sm font-semibold text-on-surface">No active policies</p>
                <p className="text-xs text-on-surface-variant max-w-xs">Submit an application above to insure your first shipment.</p>
              </Card>
            ) : (
              <Card className="divide-y divide-white/5">
                {policies.map((p) => (
                  <div key={p.id} className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-tertiary">{p.policy_ref}</span>
                        <p className="text-sm font-semibold text-on-surface">
                          ${Number(p.coverage_amount ?? 0).toLocaleString()} cover
                        </p>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Premium ${Number(p.premium ?? 0).toLocaleString()} {p.currency ?? "USD"}
                      </p>
                      {p.notes && <p className="text-[11px] text-on-surface-variant/70 mt-1 truncate">{p.notes}</p>}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${POLICY_STATUS_STYLES[p.status] ?? "bg-white/5"}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
