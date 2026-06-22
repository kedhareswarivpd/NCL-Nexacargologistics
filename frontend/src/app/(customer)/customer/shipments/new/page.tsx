"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Package, ClipboardCheck, Loader2, Search, FileText, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { quotesApi, shipmentsApi } from "@/lib/services";
import { apiError } from "@/lib/api";
import Link from "next/link";

const INCOTERMS = [
  { value: "FOB", label: "FOB — Free On Board" },
  { value: "CIF", label: "CIF — Cost, Insurance & Freight" },
  { value: "EXW", label: "EXW — Ex Works" },
  { value: "FCA", label: "FCA — Free Carrier" },
  { value: "DDP", label: "DDP — Delivered Duty Paid" },
  { value: "DAP", label: "DAP — Delivered At Place" },
];

function BookShipmentContent() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [quoteIdInput, setQuoteIdInput] = useState("");
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [booking, setBooking] = useState(false);
  const [bookedShipment, setBookedShipment] = useState<any>(null);
  
  const [availableQuotes, setAvailableQuotes] = useState<any[]>([]);
  const [generatingDemo, setGeneratingDemo] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    description: "",
    incoterm: "FOB",
    eta: "",
    value_amount: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load customer quotes for dropdown select
  useEffect(() => {
    (async () => {
      try {
        const list = await quotesApi.list();
        setAvailableQuotes(list.filter((q: any) => q.status === "quoted" || q.status === "accepted") || []);
      } catch {
        setAvailableQuotes([]);
      }
    })();
  }, [user?.id]);

  // If quote_id param is passed, load quote
  const urlQuoteId = searchParams.get("quote_id");
  useEffect(() => {
    if (urlQuoteId) {
      setQuoteIdInput(urlQuoteId);
      lookupQuote(urlQuoteId);
    }
  }, [urlQuoteId]);

  const handleGenerateDemoQuote = async () => {
    setGeneratingDemo(true);
    try {
      const demoQuote = await quotesApi.create({
        origin: "Singapore Port",
        destination: "Rotterdam Gateway",
        mode: "sea",
        cargo_type: "Electronics",
        weight: 1200,
        volume: 4.5,
        notes: "Automated demo quote for quick shipment booking",
      });
      setQuote(demoQuote);
      setQuoteIdInput(demoQuote.id);
      toast.success("Demo quote created and loaded automatically!");
      router.replace(`/customer/shipments/new?quote_id=${demoQuote.id}`);
    } catch (err) {
      toast.error("Could not generate demo quote.");
    } finally {
      setGeneratingDemo(false);
    }
  };

  async function lookupQuote(id: string) {
    if (!id.trim()) return;
    setLoadingQuote(true);
    setQuote(null);
    setErrors({});
    try {
      const q = await quotesApi.get(id.trim());
      setQuote(q);
      toast.success("Quote details loaded successfully.");
    } catch (err) {
      toast.error("Could not find quote. Please check the ID.");
      setErrors({ quoteId: "Quote not found. Verify the ID." });
    } finally {
      setLoadingQuote(false);
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.description.trim()) errs.description = "Description is required.";
    if (!form.eta) errs.eta = "Preferred delivery date (ETA) is required.";
    return errs;
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setBooking(true);

    try {
      const shipmentPayload = {
        quote_id: quote.id,
        origin: quote.origin,
        destination: quote.destination,
        mode: quote.mode || "sea",
        cargo_type: quote.cargo_type,
        weight: quote.weight ? `${quote.weight} kg` : undefined,
        volume: quote.volume ? `${quote.volume} m³` : undefined,
        description: form.description.trim(),
        incoterm: form.incoterm,
        eta: form.eta,
        value_amount: form.value_amount ? parseFloat(form.value_amount) : undefined,
        currency: "USD",
        customer_id: user?.id,
        customer_name: quote.contact_name || user?.name,
        customer_email: quote.contact_email || user?.email,
        customer_phone: quote.contact_phone || user?.phone,
      };

      const result = await shipmentsApi.create(shipmentPayload);
      setBookedShipment(result);
      toast.success("Shipment booked successfully!");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBooking(false);
    }
  };

  const inputCls = "mt-1 w-full px-3 py-2.5 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 border-white/10";

  // Success Screen
  if (bookedShipment) {
    return (
      <div className="space-y-6 max-w-xl mx-auto page-enter py-8">
        <Card className="p-8 text-center border border-green-400/20 bg-green-400/5 space-y-6 shadow-[0_4px_24px_rgba(74,222,128,0.1)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-400/10 mx-auto">
            <ClipboardCheck className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Shipment Booked!</h1>
            <p className="text-sm text-on-surface-variant mt-2">
              Your shipment has been successfully created and linked to your quote.
            </p>
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-on-surface-variant">Tracking ID:</span>
              <span className="font-bold text-tertiary">{bookedShipment.tracking_id}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-on-surface-variant">Route:</span>
              <span className="text-on-surface font-semibold">{bookedShipment.origin} → {bookedShipment.destination}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-on-surface-variant">Status:</span>
              <span className="text-amber-400 font-semibold">{bookedShipment.status}</span>
            </div>
            {bookedShipment.eta && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant">ETA:</span>
                <span className="text-on-surface">{bookedShipment.eta}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/customer/track?tracking_id=${bookedShipment.tracking_id}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] transition-colors shadow-[0_0_20px_rgba(30,136,229,0.3)]"
            >
              Track This Shipment <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/customer"
              className="w-full text-center py-3 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <Link href="/customer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
        <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
        <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
      </Link>

      <div>
        <p className="text-xs uppercase tracking-widest text-tertiary">Customer Portal</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Book Shipment</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Convert your approved quote into a live shipment by adding cargo and routing details.
        </p>
      </div>

      {/* Quote Lookup input (only if no quote loaded) */}
      {!quote && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-tertiary">
            <Search className="h-5 w-5" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Enter Quote ID to Begin</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={quoteIdInput}
                onChange={(e) => setQuoteIdInput(e.target.value)}
                placeholder="Paste Quote ID (e.g. e2cf8eac-...)"
                className={inputCls}
              />
              {errors.quoteId && <p className="text-xs text-red-400 mt-1 font-semibold">{errors.quoteId}</p>}
            </div>
            <button
              onClick={() => lookupQuote(quoteIdInput)}
              disabled={loadingQuote || !quoteIdInput.trim()}
              className="h-11 sm:mt-1 px-6 rounded-lg bg-[#1E88E5] text-white text-sm font-bold hover:bg-[#1565C0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loadingQuote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Look Up Quote"}
            </button>
          </div>

          <div className="border-t border-white/5 pt-4 mt-2">
            <p className="text-xs text-on-surface-variant mb-3 font-semibold">Or use one of these automated options:</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {availableQuotes.length > 0 && (
                <div className="flex-1">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setQuoteIdInput(e.target.value);
                        lookupQuote(e.target.value);
                        router.replace(`/customer/shipments/new?quote_id=${e.target.value}`);
                      }
                    }}
                    value={quote?.id || ""}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-xs text-on-surface focus:outline-none focus:border-tertiary/50"
                  >
                    <option value="">-- Choose an Existing Quote --</option>
                    {availableQuotes.map((q: any) => (
                      <option key={q.id} value={q.id}>
                        {q.quote_ref || q.id.slice(0, 8)} ({q.origin} → {q.destination})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                type="button"
                onClick={handleGenerateDemoQuote}
                disabled={generatingDemo}
                className="px-4 py-2.5 rounded-lg bg-tertiary/10 border border-tertiary/20 text-tertiary text-xs font-bold hover:bg-tertiary/20 transition-all flex items-center justify-center gap-2"
              >
                {generatingDemo ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>Auto-Generate Demo Quote & Fill</>
                )}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Quote Summary & Shipment Details Form */}
      {quote && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quote summary card */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5 border border-white/5 bg-white/[0.01] space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-tertiary" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-tertiary uppercase tracking-wider">
                  {quote.quote_ref || "Quote"}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                  {quote.status}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant">Origin</label>
                  <p className="text-sm font-semibold text-on-surface mt-0.5">{quote.origin}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant">Destination</label>
                  <p className="text-sm font-semibold text-on-surface mt-0.5">{quote.destination}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-on-surface-variant">Cargo Type</label>
                    <p className="text-xs text-on-surface font-semibold mt-0.5">{quote.cargo_type || "—"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-on-surface-variant">Weight</label>
                    <p className="text-xs text-on-surface font-semibold mt-0.5">{quote.weight ? `${quote.weight} kg` : "—"}</p>
                  </div>
                </div>
                {quote.amount != null && (
                  <div className="border-t border-white/5 pt-3 mt-1">
                    <label className="text-[10px] uppercase tracking-wider text-on-surface-variant">Estimated Cost</label>
                    <p className="text-lg font-black text-tertiary mt-0.5">
                      ${Number(quote.amount).toLocaleString()} USD
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setQuote(null);
                  setQuoteIdInput("");
                  setForm({ description: "", incoterm: "FOB", eta: "", value_amount: "" });
                }}
                className="w-full text-center py-2 border border-white/10 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all mt-2"
              >
                Change Quote
              </button>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6 text-tertiary">
                <FileText className="h-5 w-5" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Additional Shipment Details</h2>
              </div>

              <form onSubmit={handleBook} className="space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant">Cargo Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => {
                      setForm({ ...form, description: e.target.value });
                      setErrors(p => ({ ...p, description: "" }));
                    }}
                    placeholder="Describe the items being shipped (e.g. 5 boxes of electronic components, fragile, handle with care)"
                    rows={3}
                    className={`${inputCls} resize-none ${errors.description ? "border-red-500" : ""}`}
                  />
                  {errors.description && <p className="text-xs text-red-400 mt-1 font-semibold">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant">Incoterm</label>
                    <select
                      value={form.incoterm}
                      onChange={(e) => setForm({ ...form, incoterm: e.target.value })}
                      className={inputCls}
                    >
                      {INCOTERMS.map((inc) => (
                        <option key={inc.value} value={inc.value}>
                          {inc.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant">Preferred Delivery Date (ETA)</label>
                    <input
                      type="date"
                      value={form.eta}
                      onChange={(e) => {
                        setForm({ ...form, eta: e.target.value });
                        setErrors(p => ({ ...p, eta: "" }));
                      }}
                      className={`${inputCls} ${errors.eta ? "border-red-500" : ""}`}
                    />
                    {errors.eta && <p className="text-xs text-red-400 mt-1 font-semibold">{errors.eta}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant">Declared Value of Cargo (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/50">$</span>
                      <input
                        type="number"
                        value={form.value_amount}
                        onChange={(e) => setForm({ ...form, value_amount: e.target.value })}
                        placeholder="e.g. 25000"
                        className={`${inputCls} pl-7`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <div className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-tertiary shrink-0" />
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">
                        Cargo insurance coverage is available. Set insurance options separately under the <Link href="/customer/insurance" className="text-tertiary underline font-semibold">Insurance tab</Link> after booking.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={booking}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-tertiary hover:bg-tertiary/90 text-white font-bold text-sm transition-colors shadow-[0_4px_16px_rgba(66,165,245,0.25)] disabled:opacity-50"
                >
                  {booking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Booking Shipment…
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4" /> Book Shipment Now
                    </>
                  )}
                </button>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookShipmentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-tertiary" /></div>}>
      <BookShipmentContent />
    </Suspense>
  );
}
