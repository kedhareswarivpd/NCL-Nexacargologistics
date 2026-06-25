"use client";

import * as React from "react";
import { Search, Loader2, Package, Ship, Truck, CheckCircle2, MapPin } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/button";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/context/ToastContext";
import { required } from "@/lib/validation";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface TrackingEvent {
  status: string; location: string; time: string; done: boolean; Icon: React.ElementType;
}

const MOCK_TIMELINE: TrackingEvent[] = [
  { status: "Order received",       location: "Dhaka, Bangladesh",        time: "Jun 02, 09:14", done: true,  Icon: Package },
  { status: "Departed origin port", location: "Chattogram Port",          time: "Jun 03, 18:40", done: true,  Icon: Ship    },
  { status: "In transit",           location: "Singapore Transshipment",  time: "Jun 06, 11:02", done: true,  Icon: Ship    },
  { status: "Customs clearance",    location: "Rotterdam, NL",            time: "Est. Jun 09",   done: false, Icon: MapPin  },
  { status: "Out for delivery",     location: "Destination hub",          time: "Est. Jun 10",   done: false, Icon: Truck   },
];

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
};

export default function TrackPage() {
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [result, setResult] = React.useState<string | null>(null);

  const form = useForm({
    initialValues: { tracking: "" },
    validators: { tracking: [required("Tracking number")] },
    onSubmit: async (values) => {
      await new Promise((r) => setTimeout(r, 800));
      router.push(`/customer/track?tracking_id=${encodeURIComponent(values.tracking.trim())}`);
    },
  });

  return (
    <div className="bg-background pt-20 text-on-surface">

      {/* Hero */}
      <section className="relative mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,rgba(0,93,183,0.18),transparent_70%)]" />

        {/* Floating particles */}
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
            Enter a tracking or container number to see real-time status across our global network.
          </motion.p>

          <motion.form variants={fadeUp} onSubmit={form.handleSubmit} noValidate
            className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-start"
          >
            <div className="flex-1 text-left">
              <FormField label="Tracking number" placeholder="e.g. SHP-90421 or CNX-4421"
                icon={Search} {...form.fieldProps("tracking")} />
            </div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Button type="submit" size="lg" disabled={form.submitting}
                className="h-12 gap-2 bg-[#005db7] text-white hover:bg-[#005db7]/80 sm:mt-[26px] flex items-center justify-center"
              >
                {form.submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Search className="h-4 w-4" /> Track Shipment</>}
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>
      </section>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.section
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl px-6 pb-24"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}
              whileHover={{ boxShadow: "0 0 40px rgba(0,194,255,0.1)" }}
            >
              <Card className="p-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-2">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <p className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant">Tracking #</p>
                    <p className="font-mono text-lg font-bold text-tertiary">{result}</p>
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    className="rounded-full bg-tertiary/10 px-3 py-1 text-xs font-medium text-tertiary"
                  >
                    In transit
                  </motion.span>
                </div>

                <ol className="relative space-y-8 border-l border-white/10 pl-8">
                  {MOCK_TIMELINE.map((e, i) => (
                    <motion.li key={e.status} className="relative"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.1 }}
                      whileHover={{ x: 4 }}
                    >
                      <motion.span
                        className={`absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full ${e.done ? "bg-tertiary text-on-tertiary" : "border border-white/20 bg-surface-container text-on-surface-variant"}`}
                        whileHover={{ scale: 1.2 }}
                      >
                        {e.done ? <CheckCircle2 className="h-4 w-4" /> : <e.Icon className="h-3.5 w-3.5" />}
                      </motion.span>
                      <p className={`text-sm font-semibold ${e.done ? "text-on-surface" : "text-on-surface-variant"}`}>{e.status}</p>
                      <p className="text-xs text-on-surface-variant">{e.location} · {e.time}</p>
                    </motion.li>
                  ))}
                </ol>
              </Card>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
