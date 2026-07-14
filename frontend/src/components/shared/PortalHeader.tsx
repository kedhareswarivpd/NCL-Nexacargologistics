"use client";

import { useRef, useState, useEffect } from "react";
import {
  Search, Bell, Grid, ShieldAlert, User, LogOut, Settings,
  ChevronRight, ArrowLeft, LayoutDashboard, Truck, Warehouse,
  Navigation, TrendingUp, Users, GitBranch, BarChart2, FileSignature,
  Receipt, CreditCard, Shield, HeadphonesIcon, MapPin, X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter, usePathname } from "next/navigation";
import { ROLE_LABEL } from "@/lib/types";
import { notificationsApi, quotesApi } from "@/lib/services";
import Link from "next/link";

// ── Quick-link grids per role ────────────────────────────────────────────────
const GRID_LINKS: Record<string, { icon: React.ElementType; label: string; href: string; color: string }[]> = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard",   href: "/admin",            color: "text-tertiary bg-tertiary/10" },
    { icon: Users,           label: "Users",        href: "/admin/users",      color: "text-secondary bg-secondary/10" },
    { icon: GitBranch,       label: "Branches",     href: "/admin/branches",   color: "text-green-400 bg-green-400/10" },
    { icon: BarChart2,       label: "Analytics",    href: "/admin/analytics",  color: "text-purple-400 bg-purple-400/10" },
    { icon: Truck,           label: "Logistics",    href: "/logistics",        color: "text-orange-400 bg-orange-400/10" },
    { icon: Warehouse,       label: "Warehouse",    href: "/warehouse",        color: "text-blue-400 bg-blue-400/10" },
    { icon: Navigation,      label: "Driver",       href: "/driver",           color: "text-yellow-400 bg-yellow-400/10" },
    { icon: TrendingUp,      label: "Finance",      href: "/finance",          color: "text-pink-400 bg-pink-400/10" },
  ],
  customer: [
    { icon: LayoutDashboard, label: "Dashboard",   href: "/customer",           color: "text-tertiary bg-tertiary/10" },
    { icon: MapPin,          label: "Track",        href: "/customer/track",     color: "text-green-400 bg-green-400/10" },
    { icon: FileSignature,   label: "Quotes",       href: "/customer/quotes",    color: "text-secondary bg-secondary/10" },
    { icon: Receipt,         label: "Invoices",     href: "/customer/invoices",  color: "text-orange-400 bg-orange-400/10" },
    { icon: CreditCard,      label: "Payments",     href: "/customer/payment",   color: "text-purple-400 bg-purple-400/10" },
    { icon: Shield,          label: "Insurance",    href: "/customer/insurance", color: "text-blue-400 bg-blue-400/10" },
    { icon: HeadphonesIcon,  label: "Support",      href: "/customer/support",   color: "text-pink-400 bg-pink-400/10" },
  ],
  logistics: [
    { icon: LayoutDashboard, label: "Dashboard",   href: "/logistics",                color: "text-tertiary bg-tertiary/10" },
    { icon: Truck,           label: "Shipments",   href: "/logistics/shipments",      color: "text-secondary bg-secondary/10" },
    { icon: Navigation,      label: "Routes",      href: "/logistics/routes",         color: "text-green-400 bg-green-400/10" },
    { icon: Warehouse,       label: "Containers",  href: "/logistics/containers",     color: "text-orange-400 bg-orange-400/10" },
  ],
  warehouse: [
    { icon: LayoutDashboard, label: "Dashboard",   href: "/warehouse",                color: "text-tertiary bg-tertiary/10" },
    { icon: Warehouse,       label: "Inventory",   href: "/warehouse/inventory",      color: "text-secondary bg-secondary/10" },
    { icon: Truck,           label: "Inbound",     href: "/warehouse/inbound",        color: "text-green-400 bg-green-400/10" },
    { icon: Navigation,      label: "Outbound",    href: "/warehouse/outbound",       color: "text-orange-400 bg-orange-400/10" },
  ],
  driver: [
    { icon: LayoutDashboard, label: "Dashboard",   href: "/driver",                   color: "text-tertiary bg-tertiary/10" },
    { icon: Navigation,      label: "Routes",      href: "/driver/routes",            color: "text-secondary bg-secondary/10" },
    { icon: Truck,           label: "Tasks",        href: "/driver/tasks",             color: "text-green-400 bg-green-400/10" },
  ],
  finance: [
    { icon: LayoutDashboard, label: "Dashboard",   href: "/finance",                  color: "text-tertiary bg-tertiary/10" },
    { icon: Receipt,         label: "Invoices",    href: "/finance/invoices",         color: "text-secondary bg-secondary/10" },
    { icon: CreditCard,      label: "Payments",    href: "/finance/payments",         color: "text-green-400 bg-green-400/10" },
    { icon: TrendingUp,      label: "Revenue",     href: "/finance/revenue",          color: "text-orange-400 bg-orange-400/10" },
  ],
};

// ShieldAlert destination per role
const ALERT_HREF: Record<string, string> = {
  admin:     "/admin/notifications",
  customer:  "/customer/support",
  logistics: "/logistics",
  warehouse: "/warehouse",
  driver:    "/driver",
  finance:   "/finance/reports",
};

const PAGE_TITLES: Record<string, string> = {
  "/admin/users":         "User Management",
  "/admin/branches":      "Branch Management",
  "/admin/access":        "Access Control",
  "/admin/analytics":     "Analytics",
  "/admin/notifications": "Notifications",
};

type NotifRow = { id: string; title?: string; message: string; status: string; created_at: string };
type QuoteRow = { id: string; origin: string; destination: string; status: string; created_at: string };

export function PortalHeader({ userRole = "Premium Member" }: { userRole?: string }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [bellOpen,   setBellOpen]   = useState(false);
  const [gridOpen,   setGridOpen]   = useState(false);

  const [notifs, setNotifs] = useState<NotifRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);

  const avatarRef = useRef<HTMLDivElement>(null);
  const bellRef   = useRef<HTMLDivElement>(null);
  const gridRef   = useRef<HTMLDivElement>(null);

  const role = user?.role ?? "customer";
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminSubPage = pathname.startsWith("/admin/");
  const pageTitle = PAGE_TITLES[pathname] ?? "";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
    : "AU";
  const roleLabel = user?.role ? ROLE_LABEL[user.role] : userRole;

  // Fetch bell data when opened
  useEffect(() => {
    if (!bellOpen) return;
    if (role === "admin") {
      notificationsApi.list()
        .then((data: NotifRow[]) => setNotifs((data ?? []).slice(0, 6)))
        .catch(() => setNotifs([]));
    } else if (role === "customer") {
      quotesApi.list()
        .then((data: QuoteRow[]) => setQuotes((data ?? []).slice(0, 6)))
        .catch(() => setQuotes([]));
    }
  }, [bellOpen, role]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
      if (bellRef.current   && !bellRef.current.contains(e.target as Node))   setBellOpen(false);
      if (gridRef.current   && !gridRef.current.contains(e.target as Node))   setGridOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info("You have been signed out.");
    router.replace("/");
  };

  const gridLinks = GRID_LINKS[role] ?? GRID_LINKS.customer;
  const alertHref = ALERT_HREF[role] ?? "/";

  return (
    <header className="animate-fade-in flex justify-between items-center w-full px-4 lg:px-6 h-16 bg-surface/5 backdrop-blur-lg border-b border-white/5 sticky top-0 z-40">
      <div className="flex items-center gap-4 w-1/2 pl-10 lg:pl-0">
        {isAdminSubPage && (
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-tertiary/40 transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-tertiary group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface">Admin</span>
          </button>
        )}
        {isAdminSubPage && pageTitle && (
          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
            <span className="opacity-40">/</span>
            <span className="text-on-surface font-medium">{pageTitle}</span>
          </div>
        )}
        {!isAdminPage && (
          <div className="relative group w-full max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 group-focus-within:text-tertiary transition-colors" />
            <input
              className="w-full bg-black/20 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all placeholder:text-on-surface-variant/50"
              placeholder="Track shipment, invoice or cargo..."
              type="text"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">

          {/* ── Bell ── */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => { setBellOpen(o => !o); setGridOpen(false); setAvatarOpen(false); }}
              className="hover:bg-white/10 rounded-full p-2 transition-all hover:scale-110 active:scale-95 relative"
            >
              <Bell className="text-on-surface w-5 h-5" />
              {role !== "admin" && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full animate-pulse" />
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-2xl border border-white/10 bg-surface-container shadow-2xl z-50 overflow-hidden animate-scale-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-on-surface">
                    {role === "admin" ? "Recent Notifications" : "Recent Quotes"}
                  </p>
                  <button onClick={() => setBellOpen(false)}><X className="w-4 h-4 text-on-surface-variant" /></button>
                </div>
                <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                  {role === "admin" ? (
                    notifs.length === 0
                      ? <p className="px-4 py-6 text-sm text-on-surface-variant text-center">No notifications yet.</p>
                      : notifs.map(n => (
                          <div key={n.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                            <p className="text-sm text-on-surface truncate">{n.title ?? n.message}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className={`text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 ${n.status === "sent" ? "bg-green-400/10 text-green-400" : "bg-white/5 text-on-surface-variant"}`}>{n.status}</span>
                              <span className="text-[10px] text-on-surface-variant">{new Date(n.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                  ) : role === "customer" ? (
                    quotes.length === 0
                      ? <p className="px-4 py-6 text-sm text-on-surface-variant text-center">No quotes submitted yet.</p>
                      : quotes.map(q => (
                          <div key={q.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                            <p className="text-sm text-on-surface">{q.origin} → {q.destination}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 bg-yellow-400/10 text-yellow-400">{q.status}</span>
                              <span className="text-[10px] text-on-surface-variant">{new Date(q.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                  ) : (
                    <p className="px-4 py-6 text-sm text-on-surface-variant text-center">No alerts at this time.</p>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-white/5">
                  <Link href={alertHref} onClick={() => setBellOpen(false)} className="text-xs text-tertiary hover:underline">View all →</Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Grid (App Switcher) ── */}
          <div className="relative" ref={gridRef}>
            <button
              onClick={() => { setGridOpen(o => !o); setBellOpen(false); setAvatarOpen(false); }}
              className="hover:bg-white/10 rounded-full p-2 transition-all hover:scale-110 active:scale-95 hover:rotate-12"
            >
              <Grid className="text-on-surface w-5 h-5" />
            </button>

            {gridOpen && (
              <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-[288px] sm:w-72 rounded-2xl border border-white/10 bg-surface-container shadow-2xl z-50 overflow-hidden animate-scale-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-on-surface">Quick Access</p>
                  <button onClick={() => setGridOpen(false)}><X className="w-4 h-4 text-on-surface-variant" /></button>
                </div>
                <div className="grid grid-cols-3 gap-1 p-3">
                  {gridLinks.map(({ icon: Icon, label, href, color }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setGridOpen(false)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] text-on-surface-variant group-hover:text-on-surface uppercase tracking-widest text-center">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── ShieldAlert ── */}
          <button
            onClick={() => { setGridOpen(false); setBellOpen(false); setAvatarOpen(false); router.push(alertHref); }}
            className="hover:bg-white/10 rounded-full p-2 transition-all hover:scale-110 active:scale-95"
            title={role === "admin" ? "Notifications Centre" : role === "customer" ? "Support Tickets" : "Alerts"}
          >
            <ShieldAlert className="text-on-surface w-5 h-5" />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        {/* ── Avatar ── */}
        <div className="relative" ref={avatarRef}>
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => { setAvatarOpen(o => !o); setBellOpen(false); setGridOpen(false); }}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm text-on-surface leading-tight">{user?.name ?? "User"}</p>
              <p className="text-[10px] text-tertiary uppercase tracking-widest">{roleLabel}</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-tertiary/20 scale-0 group-hover:scale-110 transition-transform duration-300 blur-sm" />
              <div className="w-10 h-10 rounded-full border border-[#00C2FF]/30 bg-[#1E88E5] flex items-center justify-center relative z-10 transition-transform group-hover:scale-105">
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
            </div>
          </div>

          {avatarOpen && (
            <div className="absolute right-0 top-14 w-[calc(100vw-2rem)] max-w-[288px] sm:w-72 rounded-2xl border border-white/10 bg-surface-container shadow-2xl z-50 animate-scale-in overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1E88E5] flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-white">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{user?.name ?? "User"}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-tertiary/10 text-tertiary">{roleLabel}</span>
                </div>
              </div>
              <div className="p-3 border-b border-white/5 space-y-1 text-xs text-on-surface-variant px-5 py-4">
                {user?.company && <div className="flex justify-between"><span>Company</span><span className="text-on-surface font-medium">{user.company}</span></div>}
                {user?.phone   && <div className="flex justify-between"><span>Phone</span><span className="text-on-surface font-medium">{user.phone}</span></div>}
                <div className="flex justify-between">
                  <span>Member since</span>
                  <span className="text-on-surface font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                  </span>
                </div>
              </div>
              <div className="p-2">
                <button onClick={() => { setAvatarOpen(false); router.push("/profile"); }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3"><User className="h-4 w-4 text-on-surface-variant" /><span className="text-sm text-on-surface">View Profile</span></div>
                  <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button onClick={() => { setAvatarOpen(false); router.push("/profile"); }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3"><Settings className="h-4 w-4 text-on-surface-variant" /><span className="text-sm text-on-surface">Settings</span></div>
                  <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-error/10 transition-colors mt-1">
                  <LogOut className="h-4 w-4 text-error" />
                  <span className="text-sm text-error font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
