"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, MessageSquare, CheckCircle2, Clock, XCircle, RefreshCw, Send, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { notificationsApi } from "@/lib/services";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface NotificationItem {
  id: string;
  channel: string;
  recipient_name?: string;
  recipient_contact?: string;
  title?: string;
  subject?: string;
  message: string;
  status: string;
  related_id?: string;
  created_at: string;
}

const CHANNEL_STYLES: Record<string, string> = {
  email: "text-tertiary bg-tertiary/10",
  sms:   "text-secondary bg-secondary/10",
};

const STATUS_STYLES: Record<string, string> = {
  queued: "text-on-surface-variant bg-white/5",
  sent:   "text-green-400 bg-green-400/10",
  failed: "text-error bg-error/10",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  queued: Clock,
  sent:   CheckCircle2,
  failed: XCircle,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } }
} as const;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState("all");
  const [showForm, setShowForm]           = useState(false);
  const [sending, setSending]             = useState(false);
  const [form, setForm] = useState({
    recipient_name: "", recipient_email: "", recipient_phone: "",
    subject: "", message: "", type: "both" as "sms" | "email" | "both",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await notificationsApi.list();
      setNotifications((data ?? []) as NotificationItem[]);
    } catch {
      setNotifications([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await notificationsApi.list();
        if (isMounted) setNotifications((data ?? []) as NotificationItem[]);
      } catch {
        if (isMounted) setNotifications([]);
      }
      if (isMounted) {
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Backend notifications use channel/title/message/user_id. The old
    // recipient_email/phone fields have no backend equivalent; subject maps to title.
    const channel = form.type === "both" ? "email" : form.type;
    try {
      await notificationsApi.send({
        channel,
        title:   form.subject || form.message,
        message: form.message,
      });
    } catch {
      /* ignore — surfaced via apiError if needed */
    }
    setForm({ recipient_name: "", recipient_email: "", recipient_phone: "", subject: "", message: "", type: "both" });
    setShowForm(false);
    setSending(false);
    load();
  }

  const filtered = notifications.filter((n) => filter === "all" || n.channel === filter || n.status === filter);

  const stats = {
    total:  notifications.length,
    sent:   notifications.filter((n) => n.status === "sent").length,
    queued: notifications.filter((n) => n.status === "queued").length,
    failed: notifications.filter((n) => n.status === "failed").length,
  };

  const inputCls = "mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 transition-colors";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <motion.div variants={itemVariants}>
          <Link href="/admin" className="inline-flex items-center gap-2 mb-5 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
            <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
            <span className="text-sm font-bold text-[#0B1F3A]">Back to Admin Dashboard</span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-tertiary">Admin Portal</p>
          <h1 className="text-3xl font-bold text-on-surface mt-1">Notifications</h1>
          <p className="text-sm text-on-surface-variant mt-1">SMS & email alerts sent to customers and staff.</p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex gap-2 shrink-0">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={load} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-on-surface-variant text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-tertiary/20 text-tertiary text-xs font-semibold hover:bg-tertiary/30 transition-colors shadow-[0_4px_12px_rgba(153,203,255,0.1)]"
          >
            <Send className="h-4 w-4" /> Send Notification
          </motion.button>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Sent",  value: stats.total,  Icon: Bell,         color: "text-tertiary bg-tertiary/10" },
          { label: "Delivered",   value: stats.sent,   Icon: CheckCircle2, color: "text-green-400 bg-green-400/10" },
          { label: "Queued",      value: stats.queued, Icon: Clock,        color: "text-secondary bg-secondary/10" },
          { label: "Failed",      value: stats.failed, Icon: XCircle,      color: "text-error bg-error/10" },
        ].map(({ label, value, Icon, color }) => (
          <motion.div
            key={label}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="p-5 flex items-center gap-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 transition-colors h-full">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}><Icon className="h-5 w-5" /></span>
              <div>
                <p className="font-mono text-2xl font-bold text-on-surface">{loading ? "—" : value}</p>
                <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Send Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <Card className="p-5 space-y-4 border border-tertiary/20 bg-white/[0.01]">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">New Notification</h2>
              <form noValidate onSubmit={handleSend} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Recipient Name</label><input required value={form.recipient_name} onChange={(e) => { const filtered = e.target.value.replace(/[0-9]/g, ''); setForm({ ...form, recipient_name: filtered }); }} placeholder="e.g. John Smith" className={inputCls} /></div>
                  <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Email</label><input type="email" value={form.recipient_email} onChange={(e) => setForm({ ...form, recipient_email: e.target.value })} placeholder="john@example.com" className={inputCls} /></div>
                  <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Phone</label><input value={form.recipient_phone} onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })} placeholder="+1234567890" className={inputCls} /></div>
                  <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Shipment Update" className={inputCls} /></div>
                  <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Channel</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "sms" | "email" | "both" })} className={inputCls}>
                      <option value="both">SMS + Email</option>
                      <option value="email">Email only</option>
                      <option value="sms">SMS only</option>
                    </select>
                  </div>
                </div>
                <div><label className="text-xs uppercase tracking-widest text-on-surface-variant">Message</label><textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your shipment SHP-XXXXX is now In Transit..." className={`${inputCls} resize-none`} /></div>
                <div className="flex gap-3">
                  <button type="submit" disabled={sending} className="px-4 py-2 rounded-lg bg-tertiary/20 text-tertiary text-sm font-semibold hover:bg-tertiary/30 transition-colors disabled:opacity-50">
                    {sending ? "Sending…" : "Send"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-white/5 text-on-surface-variant text-sm font-semibold hover:bg-white/10 transition-colors">Cancel</button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {["all", "email", "sms", "queued", "sent", "failed"].map((f) => {
          const isSelected = filter === f;
          return (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest overflow-hidden transition-all duration-200`}
            >
              {isSelected && (
                <motion.span 
                  layoutId="activeNotifFilter" 
                  className="absolute inset-0 bg-tertiary/20 border-b-2 border-tertiary rounded-lg -z-10" 
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className={isSelected ? "text-tertiary font-bold" : "text-on-surface-variant hover:text-on-surface"}>
                {f}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Notifications Table */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden bg-white/[0.01] border border-white/5">
          {loading ? (
            <p className="p-6 text-sm text-on-surface-variant">Loading notifications…</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-on-surface-variant bg-white/[0.02]">
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Related</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filtered.map((n, index) => {
                    const StatusIcon = STATUS_ICONS[n.status] ?? Clock;
                    return (
                      <motion.tr 
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 26, delay: Math.min(index, 10) * 0.02 }}
                        className="hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1.5 w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CHANNEL_STYLES[n.channel] ?? ""}`}>
                            {n.channel === "email" ? <Mail className="h-3 w-3 shrink-0" /> : <MessageSquare className="h-3 w-3 shrink-0" />}
                            {n.channel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-on-surface font-medium">{n.recipient_name}</p>
                          <p className="text-xs text-on-surface-variant">{n.recipient_contact}</p>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant max-w-[200px] truncate">{n.subject ?? n.message}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1.5 w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[n.status]} ${n.status === "queued" ? "animate-pulse" : ""}`}>
                            <StatusIcon className="h-3 w-3 shrink-0" /> {n.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant font-mono">{n.related_id ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">
                          {new Date(n.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <motion.tr layout>
                    <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-sm">No notifications found.</td>
                  </motion.tr>
                )}
              </tbody>
            </table>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
