"use client";

import * as React from "react";
import { Search, Loader2, Package, Ship, Truck, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { trackingApi } from "@/lib/services";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
};

export default function TrackPage() {
  const [query, setQuery]       = React.useState("");
  const [shipment, setShipment] = React.useState<any>(null);
  const [events, setEvents]     = React.useState<any[]>([]);
  const [loading, setLoading]   = React.useState(false);
  const [error, setError]       = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) { setError("Please enter a tracking ID."); return; }
    setError("");
    setShipment(null);
    setEvents([]);
    setLoading(true);
    try {
      const result = await trackingApi.track(trimmed);
      if (result?.shipment) {
        setShipment(result.shipment);
        setEvents(result.events ?? []);
      } else {
        setError("No shipment found for that tracking ID.");
      }
    } catch {
      setError("No shipment found for that tracking ID. Please check and try again.");
    }
    setLoading(false);
  }

  return (
    <div className="bg-background pt-20 text-on-surface">
      <section className="relative mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,rgba(0,93,183,0.18),transparent_70%)]" />

        {[...Array(12)].map((_, i) => (
          <motion.span key={i}
            className="absolute rounded-full bg-tertiary/25 blur-sm pointer-events-none"
            style={{ left: `${(i * 11 + 5) % 96}%`, top: `${(i * 17 + 8) % 90}%`, width: `${6 + (i % 3) * 3}px`, height: `${6 + (i % 3) * 3}px` }}
            animate={{ y: [0, -14, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.15 }}
          />
        ))}

        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span variants={fadeUp} className="font-label-caps text-xs text-tertiary mb-4 inline-block tracking-[0.2em] uppercase">
            Real-Time Tracking
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-4xl font-bold md:text-5xl">
            Track your shipment
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg mx-auto mt-4 max-w-xl text-on-surface-variant">
            Enter your shipment tracking ID to see real-time status.
          </motion.p>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} noValidate
            className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-start"
          >
            <div className="flex-1 text-left">
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setError(""); }}
                placeholder="e.g. SHP-90421"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-blue-200/50 focus:outline-none focus:border-[#00C2FF]/60 transition-all"
              />
              {error && <p className="text-red-400 text-xs mt-1 font-semibold">{error}</p>}
            </div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Button type="submit" size="lg" disabled={loading}
                className="h-12 gap-2 bg-[#005db7] text-white hover:bg-[#005db7]/80 sm:mt-0 flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Search className="h-4 w-4" /> Track</>}
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>
      </section>

      <AnimatePresence>
        {shipment && (
          <motion.section
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl px-6 pb-24"
          >
            <Card className="p-8">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant">Tracking #</p>
                  <p className="font-mono text-lg font-bold text-tertiary">{shipment.tracking_id}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{shipment.origin} → {shipment.destination}</p>
                </div>
                <span className="rounded-full bg-tertiary/10 px-3 py-1 text-xs font-medium text-tertiary">
                  {shipment.status}
                </span>
              </div>

              {events.length > 0 && (
                <ol className="relative space-y-8 border-l border-white/10 pl-8">
                  {events.map((e: any, i: number) => (
                    <motion.li key={i} className="relative"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.1 }}
                    >
                      <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full bg-tertiary text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <p className="text-sm font-semibold text-on-surface">{e.status}</p>
                      <p className="text-xs text-on-surface-variant">{e.location} · {e.changed_at}</p>
                    </motion.li>
                  ))}
                </ol>
              )}
            </Card>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
