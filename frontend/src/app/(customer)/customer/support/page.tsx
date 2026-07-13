"use client";

import { useState, useEffect } from "react";
import { HeadphonesIcon, Send, CheckCircle2, MessageSquare, Clock, Zap, Phone, Mail, BookOpen, ArrowLeft, Edit, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { supportApi } from "@/lib/services";
import { apiError } from "@/lib/api";

const TICKET_STATUS_STYLES: Record<string, string> = {
  open: "text-tertiary bg-tertiary/10",
  in_progress: "text-amber-400 bg-amber-400/10",
  resolved: "text-green-400 bg-green-400/10",
  closed: "text-on-surface-variant bg-white/5",
};

const SUPPORT_CHANNELS = [
  { icon: MessageSquare, label: "Live Chat",     desc: "Chat with our team in real-time",  availability: "24/7",            color: "text-tertiary bg-tertiary/10",                         action: "Start Chat" },
  { icon: Mail,          label: "Email Support", desc: "info@nexacargo.com",            availability: "< 24h response",  color: "text-secondary bg-secondary/10",                       action: "Send Email" },
  { icon: Phone,         label: "Phone Support", desc: "+8801711456789",               availability: "Mon–Fri 9am–6pm", color: "text-green-400 bg-green-400/10",                        action: "Call Now" },
  { icon: BookOpen,      label: "Help Center",   desc: "Browse FAQs and guides",          availability: "Always available", color: "text-on-tertiary-container bg-on-tertiary-container/10", action: "Browse Guides" },
];

const FAQS = [
  { q: "How do I track my shipment?", a: "Go to Track Shipments in the sidebar. Enter your tracking ID to see real-time status and milestone updates." },
  { q: "How long does it take to get a quote?", a: "Quote requests are typically responded to within 24 business hours by our logistics team." },
  { q: "How do I download my invoices?", a: "Navigate to the Invoices section. Once your shipment is confirmed, invoices will appear there for download." },
  { q: "What does cargo insurance cover?", a: "Our insurance covers total loss, partial damage, and theft. Improper packaging is not covered." },
];

export default function SupportTicketsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: "", category: "Shipment Issue", priority: "Medium", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ subject: "", priority: "", category: "" });
  const [editSaving, setEditSaving] = useState(false);

  function openEdit(t: any) {
    setEditTarget(t);
    setEditForm({ subject: t.subject ?? "", priority: t.priority ?? "medium", category: t.category ?? "" });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSaving(true);
    try { await supportApi.update(editTarget.id, editForm); setEditTarget(null); load(); } catch { /* ignore */ }
    setEditSaving(false);
  }

  async function load() {
    setLoading(true);
    try { setTickets((await supportApi.tickets()) ?? []); } catch { setTickets([]); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.message.trim()) e.message = "Message is required.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      await supportApi.create({
        subject: form.subject.trim(),
        category: form.category.toLowerCase().split(" ")[0],
        priority: form.priority.toLowerCase(),
        description: form.message.trim(),
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setForm({ subject: "", category: "Shipment Issue", priority: "Medium", message: "" });
      load();
    } catch (err) {
      setErrors({ subject: apiError(err) });
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
        <h1 className="text-3xl font-bold text-on-surface mt-1">Support</h1>
        <p className="text-sm text-on-surface-variant mt-1">Comprehensive customer support — we're here to help at every step.</p>
      </div>

      {/* Support Channels */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Contact Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SUPPORT_CHANNELS.map(({ icon: Icon, label, desc, availability, color, action }) => (
            <Card key={label} className="p-4 flex items-start gap-4 hover:bg-white/5 transition-colors">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface">{label}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Zap className="h-3 w-3 text-tertiary" />
                  <span className="text-[11px] text-tertiary">{availability}</span>
                </div>
              </div>
              <button className="shrink-0 px-3 py-1.5 rounded-lg bg-white/8 border border-white/10 text-xs font-bold text-on-surface hover:bg-[#1E88E5] hover:text-white hover:border-[#1E88E5] transition-all whitespace-nowrap">
                {action}
              </button>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Form */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <HeadphonesIcon className="h-5 w-5 text-tertiary" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Raise a Ticket</h2>
          </div>

          {submitted && (
            <div className="flex items-start gap-3 mb-5 p-4 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Ticket submitted!</p>
                <p className="text-xs text-green-400/80 mt-0.5">Our team will respond within 24 hours.</p>
              </div>
            </div>
          )}

          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Subject</label>
              <input value={form.subject} onChange={(e) => { const v = e.target.value.replace(/[^a-zA-Z\s]/g, ""); setForm({ ...form, subject: v }); setErrors(p => ({ ...p, subject: "" })); }}
                placeholder="Brief description of your issue"
                className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${errors.subject ? "border-red-500" : "border-white/10"}`} />
              {errors.subject && <p className="text-xs text-error mt-1">{errors.subject}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-on-surface-variant">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
                  <option>Shipment Issue</option>
                  <option>Billing</option>
                  <option>Documentation</option>
                  <option>Insurance</option>
                  <option>General Inquiry</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-on-surface-variant">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Message</label>
              <textarea value={form.message} onChange={(e) => { const v = e.target.value.replace(/[^a-zA-Z\s]/g, ""); setForm({ ...form, message: v }); setErrors(p => ({ ...p, message: "" })); }} rows={4}
                placeholder="Describe your issue in detail…"
                className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 resize-none ${errors.message ? "border-red-500" : "border-white/10"}`} />
              {errors.message && <p className="text-xs text-error mt-1">{errors.message}</p>}
            </div>
            <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] transition-colors shadow-[0_0_20px_rgba(30,136,229,0.3)] disabled:opacity-50">
              <Send className="h-4 w-4" /> {saving ? "Submitting…" : "Submit Support Ticket"}
            </button>
          </form>
        </Card>

        {/* FAQ + Empty tickets */}
        <div className="space-y-4">
          {/* FAQ */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3">FAQs</h2>
            <Card className="divide-y divide-white/5">
              {FAQS.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                    aria-expanded={openFaq === i}
                  >
                    <p className="text-sm font-semibold text-on-surface">{faq.q}</p>
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-white/8 border border-white/10 text-xs font-bold text-on-surface-variant">
                      {openFaq === i ? "Hide Answer" : "Show Answer"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="px-4 pb-4 text-xs text-on-surface-variant leading-relaxed">{faq.a}</p>
                  )}
                </div>
              ))}
            </Card>
          </div>

          {/* Tickets */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Your Tickets</h2>
            {loading ? (
              <Card className="p-8 text-center text-sm text-on-surface-variant">Loading your tickets…</Card>
            ) : tickets.length === 0 ? (
              <Card className="p-8 flex flex-col items-center text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                  <MessageSquare className="h-6 w-6 text-on-surface-variant/40" />
                </div>
                <p className="text-sm font-semibold text-on-surface">No tickets yet</p>
                <p className="text-xs text-on-surface-variant max-w-xs">Submit a ticket above and track its resolution here.</p>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1">
                  <Clock className="h-3.5 w-3.5" /> Responses within 24 hours
                </div>
              </Card>
            ) : (
              <Card className="divide-y divide-white/5">
                {tickets.map((t) => (
                    <div key={t.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-tertiary">{t.ticket_ref}</span>
                          <p className="text-sm font-semibold text-on-surface truncate">{t.subject}</p>
                        </div>
                        {t.description && <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{t.description}</p>}
                        <p className="text-[11px] text-on-surface-variant/70 mt-1 capitalize">{t.category} · {t.priority} priority</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${TICKET_STATUS_STYLES[t.status] ?? "bg-white/5"}`}>
                          {String(t.status).replace("_", " ")}
                        </span>
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-tertiary/10 text-tertiary transition-colors" title="Edit"><Edit className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-container shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="text-base font-bold text-on-surface">Edit Ticket</h2>
              <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant"><X className="h-4 w-4" /></button>
            </div>
            <form noValidate onSubmit={saveEdit} className="p-6 space-y-4">
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Subject</label><input value={editForm.subject} onChange={e => setEditForm(p => ({...p, subject: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
              <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Priority</label>
                <select value={editForm.priority} onChange={e => setEditForm(p => ({...p, priority: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editSaving} className="flex-1 py-2.5 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] disabled:opacity-50">{editSaving ? "Saving…" : "Save Changes"}</button>
                <button type="button" onClick={() => setEditTarget(null)} className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-on-surface-variant hover:bg-white/10">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
