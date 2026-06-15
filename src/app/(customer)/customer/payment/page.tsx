"use client";

import { useState } from "react";
import {
  CreditCard, Building2, Wallet, CheckCircle2, Lock,
  ArrowLeft, Shield, Loader2, ChevronRight, Receipt,
  AlertCircle, Copy, Check, Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";

/* ── Dummy invoices ── */
const INVOICES = [
  { id: "INV-2025-0091", shipment: "SHIP-A1B2C3", route: "Shanghai → Rotterdam", amount: 4280.00,  due: "2025-07-28", status: "Pending"  },
  { id: "INV-2025-0087", shipment: "SHIP-D4E5F6", route: "Dubai → Singapore",    amount: 1950.50,  due: "2025-07-22", status: "Overdue"  },
  { id: "INV-2025-0074", shipment: "SHIP-G7H8I9", route: "New York → London",    amount: 3100.00,  due: "2025-07-10", status: "Paid"     },
  { id: "INV-2025-0068", shipment: "SHIP-J1K2L3", route: "Mumbai → Sydney",      amount: 2640.75,  due: "2025-07-05", status: "Paid"     },
];

const STATUS_STYLE: Record<string, string> = {
  Pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Overdue: "text-red-400 bg-red-400/10 border-red-400/20",
  Paid:    "text-green-400 bg-green-400/10 border-green-400/20",
};

type PayMethod = "card" | "bank" | "wallet";

const PAY_METHODS = [
  { id: "card"   as PayMethod, label: "Credit / Debit Card", icon: CreditCard,  desc: "Visa, Mastercard, Amex"       },
  { id: "bank"   as PayMethod, label: "Bank Transfer",       icon: Building2,   desc: "SWIFT / IBAN wire transfer"   },
  { id: "wallet" as PayMethod, label: "Digital Wallet",      icon: Wallet,      desc: "PayPal, Apple Pay, Google Pay"},
];

type Stage = "list" | "method" | "details" | "processing" | "success";

function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 4);
  return n.length > 2 ? n.slice(0, 2) + "/" + n.slice(2) : n;
}

export default function PaymentPage() {
  const [stage,     setStage]     = useState<Stage>("list");
  const [invoice,   setInvoice]   = useState<typeof INVOICES[0] | null>(null);
  const [method,    setMethod]    = useState<PayMethod>("card");
  const [copied,    setCopied]    = useState(false);
  const [txRef]     = useState(() => "TXN-" + Math.random().toString(36).slice(2,10).toUpperCase());

  /* Card form */
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  /* Bank form */
  const [bank, setBank] = useState({ name: "", account: "", routing: "" });
  /* Wallet */
  const [wallet, setWallet] = useState<"paypal"|"apple"|"google">("paypal");

  function startPay(inv: typeof INVOICES[0]) {
    setInvoice(inv);
    setStage("method");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStage("processing");
    setTimeout(() => setStage("success"), 3000);
  }

  function copyRef() {
    navigator.clipboard.writeText(txRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const inputCls = "mt-1 w-full px-4 py-3 rounded-xl bg-[#0d1e38] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00C2FF]/60 transition-colors";
  const labelCls = "text-xs font-semibold uppercase tracking-widest text-white/50";

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <Link href="/customer" className="inline-flex items-center gap-2 text-sm text-[#00C2FF] hover:text-white transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <p className="text-xs uppercase tracking-widest text-[#00C2FF]">Customer Portal</p>
        <h1 className="text-3xl font-bold text-white mt-1">Payments</h1>
        <p className="text-sm text-white/50 mt-1">Securely pay your outstanding invoices.</p>
      </div>

      {/* ── STAGE: Invoice List ── */}
      <AnimatePresence mode="wait">
        {stage === "list" && (
          <motion.div key="list" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">

            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Outstanding",  val: `$${INVOICES.filter(i=>i.status!=="Paid").reduce((a,i)=>a+i.amount,0).toLocaleString("en-US",{minimumFractionDigits:2})}`, color: "text-amber-400" },
                { label: "Overdue",      val: `$${INVOICES.filter(i=>i.status==="Overdue").reduce((a,i)=>a+i.amount,0).toLocaleString("en-US",{minimumFractionDigits:2})}`, color: "text-red-400"   },
                { label: "Paid to Date", val: `$${INVOICES.filter(i=>i.status==="Paid").reduce((a,i)=>a+i.amount,0).toLocaleString("en-US",{minimumFractionDigits:2})}`, color: "text-green-400" },
              ].map(({ label, val, color }) => (
                <Card key={label} className="p-4 text-center bg-white/[0.03] border border-white/8">
                  <p className={`text-xl font-bold font-mono ${color}`}>{val}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{label}</p>
                </Card>
              ))}
            </div>

            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">Invoices</h2>

            {INVOICES.map((inv) => (
              <Card key={inv.id} className="p-5 border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-[#00C2FF]">{inv.id}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[inv.status]}`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/70">{inv.shipment} · {inv.route}</p>
                    <p className="text-xs text-white/40">Due: {inv.due}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <p className="font-mono text-xl font-bold text-white">
                      ${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    {inv.status !== "Paid" ? (
                      <button onClick={() => startPay(inv)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-[0_0_16px_rgba(0,194,255,0.25)]">
                        <CreditCard className="h-4 w-4" /> Pay Now
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4" /> Paid
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Security note */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/[0.02]">
              <Lock className="h-4 w-4 text-[#00C2FF] shrink-0" />
              <p className="text-xs text-white/40">
                All payments are encrypted with 256-bit SSL. NexaCargo never stores your full card details.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── STAGE: Choose Payment Method ── */}
        {stage === "method" && invoice && (
          <motion.div key="method" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-5">

            <button onClick={() => setStage("list")}
              className="flex items-center gap-2 text-sm text-[#00C2FF] hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Invoices
            </button>

            {/* Invoice summary */}
            <Card className="p-5 border border-[#1E88E5]/30 bg-[#0d1e38]/60">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest">Paying Invoice</p>
                  <p className="font-mono text-lg font-bold text-[#00C2FF] mt-1">{invoice.id}</p>
                  <p className="text-sm text-white/60 mt-0.5">{invoice.route}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 uppercase tracking-widest">Total Due</p>
                  <p className="font-mono text-3xl font-bold text-white mt-1">
                    ${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">USD</p>
                </div>
              </div>
            </Card>

            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">Select Payment Method</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PAY_METHODS.map(({ id, label, icon: Icon, desc }) => (
                <button key={id} onClick={() => setMethod(id)}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    method === id
                      ? "border-[#00C2FF]/60 bg-[#00C2FF]/10 shadow-[0_0_20px_rgba(0,194,255,0.15)]"
                      : "border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15"
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${method===id ? "bg-[#00C2FF]/20" : "bg-white/5"}`}>
                    <Icon className={`h-5 w-5 ${method===id ? "text-[#00C2FF]" : "text-white/40"}`} />
                  </div>
                  <p className={`text-sm font-bold ${method===id ? "text-white" : "text-white/60"}`}>{label}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{desc}</p>
                  {method === id && (
                    <div className="flex items-center gap-1 mt-2 text-[#00C2FF] text-[10px] font-semibold uppercase tracking-wider">
                      <CheckCircle2 className="h-3 w-3" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button onClick={() => setStage("details")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-sm shadow-[0_0_24px_rgba(0,194,255,0.25)] hover:opacity-90 transition-opacity">
              Continue to Payment Details <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* ── STAGE: Payment Details ── */}
        {stage === "details" && invoice && (
          <motion.div key="details" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-5">

            <button onClick={() => setStage("method")}
              className="flex items-center gap-2 text-sm text-[#00C2FF] hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {/* Amount header */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0d1e38] border border-white/8">
              <div className="flex items-center gap-3">
                {method === "card"   && <CreditCard className="h-5 w-5 text-[#00C2FF]" />}
                {method === "bank"   && <Building2  className="h-5 w-5 text-[#00C2FF]" />}
                {method === "wallet" && <Wallet     className="h-5 w-5 text-[#00C2FF]" />}
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    {PAY_METHODS.find(m=>m.id===method)?.label}
                  </p>
                  <p className="text-sm text-white/70 font-medium">{invoice.id}</p>
                </div>
              </div>
              <p className="font-mono text-xl font-bold text-white">
                ${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── CARD FORM ── */}
              {method === "card" && (
                <Card className="p-6 space-y-4 bg-white/[0.02] border border-white/8">
                  <h3 className="text-sm font-bold text-white">Card Details</h3>
                  <div>
                    <label className={labelCls}>Cardholder Name</label>
                    <input required value={card.name}
                      onChange={e => setCard({...card, name: e.target.value})}
                      placeholder="John Smith" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Card Number</label>
                    <div className="relative">
                      <input required value={card.number}
                        onChange={e => setCard({...card, number: formatCard(e.target.value)})}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19} className={inputCls + " pr-12"} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <div className="w-6 h-4 rounded bg-[#1a1f6b] opacity-80" />
                        <div className="w-6 h-4 rounded bg-[#eb001b] opacity-80" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Expiry (MM/YY)</label>
                      <input required value={card.expiry}
                        onChange={e => setCard({...card, expiry: formatExpiry(e.target.value)})}
                        placeholder="08/27" maxLength={5} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>CVV</label>
                      <input required type="password" value={card.cvv}
                        onChange={e => setCard({...card, cvv: e.target.value.slice(0,4)})}
                        placeholder="•••" maxLength={4} className={inputCls} />
                    </div>
                  </div>
                  {/* Accepted cards */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">Accepted:</span>
                    {["VISA","MC","AMEX","Discover"].map(c=>(
                      <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/8 text-white/50">{c}</span>
                    ))}
                  </div>
                </Card>
              )}

              {/* ── BANK TRANSFER FORM ── */}
              {method === "bank" && (
                <Card className="p-6 space-y-4 bg-white/[0.02] border border-white/8">
                  <h3 className="text-sm font-bold text-white">Bank Transfer Details</h3>
                  <div className="p-4 rounded-xl bg-[#00C2FF]/5 border border-[#00C2FF]/20 space-y-2">
                    <p className="text-xs text-white/40 uppercase tracking-widest">NexaCargo Bank Account</p>
                    {[
                      ["Bank Name",   "NexaBank International"],
                      ["Account No.", "GB29 NWBK 6016 1331 9268 19"],
                      ["SWIFT / BIC", "NEXAGB2LXXX"],
                      ["Reference",   invoice.id],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center">
                        <span className="text-xs text-white/40">{k}</span>
                        <span className="text-xs font-mono font-bold text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className={labelCls}>Your Bank / Account Name</label>
                    <input required value={bank.name}
                      onChange={e => setBank({...bank, name: e.target.value})}
                      placeholder="Acme Corp Ltd." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Your Account Number</label>
                    <input required value={bank.account}
                      onChange={e => setBank({...bank, account: e.target.value})}
                      placeholder="IBAN or account number" className={inputCls} />
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-400/5 border border-amber-400/20">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-400/80">Bank transfers may take 1–3 business days to clear. Use the invoice number as your payment reference.</p>
                  </div>
                </Card>
              )}

              {/* ── DIGITAL WALLET ── */}
              {method === "wallet" && (
                <Card className="p-6 space-y-4 bg-white/[0.02] border border-white/8">
                  <h3 className="text-sm font-bold text-white">Choose Wallet</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "paypal" as const, label: "PayPal",     emoji: "🅿️", color: "#003087" },
                      { id: "apple"  as const, label: "Apple Pay",  emoji: "🍎", color: "#1c1c1e" },
                      { id: "google" as const, label: "Google Pay", emoji: "G",  color: "#4285f4" },
                    ].map(({ id, label, emoji, color }) => (
                      <button key={id} type="button"
                        onClick={() => setWallet(id)}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          wallet===id
                            ? "border-[#00C2FF]/50 bg-[#00C2FF]/10"
                            : "border-white/8 bg-white/[0.02] hover:bg-white/5"
                        }`}>
                        <div className="text-2xl mb-1.5">{emoji}</div>
                        <p className={`text-xs font-bold ${wallet===id ? "text-white" : "text-white/50"}`}>{label}</p>
                      </button>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8 text-center">
                    <p className="text-sm text-white/60">
                      You will be redirected to <span className="font-bold text-white capitalize">{wallet}</span> to complete the payment securely.
                    </p>
                  </div>
                </Card>
              )}

              {/* Order summary */}
              <Card className="p-5 bg-white/[0.02] border border-white/8 space-y-3">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Order Summary</h3>
                {[
                  ["Invoice",       invoice.id],
                  ["Shipment",      invoice.shipment],
                  ["Route",         invoice.route],
                  ["Subtotal",      `$${invoice.amount.toLocaleString("en-US",{minimumFractionDigits:2})}`],
                  ["Processing Fee","$0.00"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-white/40">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
                <div className="border-t border-white/8 pt-3 flex justify-between">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-mono font-bold text-[#00C2FF] text-lg">
                    ${invoice.amount.toLocaleString("en-US",{minimumFractionDigits:2})} USD
                  </span>
                </div>
              </Card>

              {/* Security row */}
              <div className="flex items-center gap-3 text-xs text-white/30">
                <Shield className="h-4 w-4 text-[#00C2FF]/60 shrink-0" />
                Secured by 256-bit SSL encryption · PCI DSS Compliant · NexaCargo Payment Gateway v3.1
              </div>

              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-base shadow-[0_0_30px_rgba(0,194,255,0.3)] hover:opacity-90 transition-opacity">
                <Lock className="h-4 w-4" />
                Pay ${invoice.amount.toLocaleString("en-US",{minimumFractionDigits:2})} Securely
              </button>
            </form>
          </motion.div>
        )}

        {/* ── STAGE: Processing ── */}
        {stage === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-[#00C2FF]/20" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-t-[#00C2FF] border-r-transparent border-b-transparent border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#00C2FF] animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Processing Payment…</h2>
              <p className="text-white/50 mt-2">Please don't close this window.</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {["Verifying payment details", "Contacting payment network", "Confirming transaction"].map((step, i) => (
                <motion.div key={step}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.8 }}
                  className="flex items-center gap-2 text-sm text-white/50">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.8 }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00C2FF]" />
                  </motion.div>
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STAGE: Success ── */}
        {stage === "success" && invoice && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center py-12 gap-6">

            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-green-400/15 border-2 border-green-400/40 flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.25)]"
            >
              <CheckCircle2 className="h-12 w-12 text-green-400" />
            </motion.div>

            <div>
              <h2 className="text-3xl font-bold text-white">Payment Successful!</h2>
              <p className="text-white/50 mt-2">Your payment has been processed and confirmed.</p>
            </div>

            {/* Receipt card */}
            <Card className="w-full max-w-md p-6 space-y-4 bg-white/[0.03] border border-white/10 text-left">
              <div className="flex items-center gap-3 pb-4 border-b border-white/8">
                <div className="w-10 h-10 rounded-xl bg-green-400/15 border border-green-400/25 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Payment Receipt</p>
                  <p className="text-xs text-white/40">NexaCargo Global Logistics</p>
                </div>
              </div>

              {[
                ["Transaction Ref", txRef,                 true ],
                ["Invoice",         invoice.id,            false],
                ["Shipment",        invoice.shipment,      false],
                ["Route",           invoice.route,         false],
                ["Amount Paid",     `$${invoice.amount.toLocaleString("en-US",{minimumFractionDigits:2})} USD`, false],
                ["Payment Method",  PAY_METHODS.find(m=>m.id===method)?.label ?? "", false],
                ["Date & Time",     new Date().toLocaleString("en-US",{dateStyle:"medium",timeStyle:"short"}), false],
                ["Status",          "CONFIRMED",           false],
              ].map(([k, v, isTx]) => (
                <div key={k as string} className="flex justify-between items-center gap-2">
                  <span className="text-xs text-white/40">{k as string}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-mono font-semibold ${
                      (k as string) === "Status" ? "text-green-400" :
                      (isTx as boolean) ? "text-[#00C2FF]" : "text-white"
                    }`}>{v as string}</span>
                    {(isTx as boolean) && (
                      <button type="button" onClick={copyRef} className="text-white/30 hover:text-white/60 transition-colors">
                        {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </Card>

            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => generateInvoicePDF({
                  txRef,
                  invoiceId: invoice.id,
                  shipment: invoice.shipment,
                  route: invoice.route,
                  amount: invoice.amount,
                  paymentMethod: PAY_METHODS.find(m => m.id === method)?.label ?? method,
                  dateTime: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
                })}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(0,194,255,0.2)]">
                <Download className="h-4 w-4" /> Download Invoice PDF
              </button>
              <button
                onClick={() => { setStage("list"); setInvoice(null); }}
                className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all">
                Back to Invoices
              </button>
              <Link href="/customer">
                <button className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all">
                  Go to Dashboard
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
