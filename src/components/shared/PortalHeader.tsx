"use client";

import { useRef, useState, useEffect } from "react";
import { Search, Bell, Grid, ShieldAlert, User, LogOut, Settings, ChevronRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter, usePathname } from "next/navigation";
import { ROLE_LABEL } from "@/lib/types";

export function PortalHeader({ userRole = "Premium Member" }: { userRole?: string }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Show back-to-admin button when on any admin sub-page (not the main /admin dashboard)
  const isAdminSubPage = pathname.startsWith("/admin/");

  // Page title derived from pathname
  const PAGE_TITLES: Record<string, string> = {
    "/admin/users":         "User Management",
    "/admin/branches":      "Branch Management",
    "/admin/access":        "Access Control",
    "/admin/analytics":     "Analytics",
    "/admin/notifications": "Notifications",
  };
  const pageTitle = PAGE_TITLES[pathname] ?? "";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
    : "AU";

  const roleLabel = user?.role ? ROLE_LABEL[user.role] : userRole;

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info("You have been signed out.");
    router.replace("/");
  };

  return (
    <header className="animate-fade-in flex justify-between items-center w-full px-6 h-16 bg-surface/5 backdrop-blur-lg border-b border-white/5 sticky top-0 z-40 transition-shadow duration-300">
      <div className="flex items-center gap-4 w-1/2">

        {/* ── Back to Admin button (only on sub-pages) ── */}
        {isAdminSubPage && (
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-tertiary/40 transition-all duration-200 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-tertiary group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface">
              Admin
            </span>
          </button>
        )}

        {/* Page title breadcrumb */}
        {isAdminSubPage && pageTitle && (
          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
            <span className="opacity-40">/</span>
            <span className="text-on-surface font-medium">{pageTitle}</span>
          </div>
        )}

        {/* Search — hidden when breadcrumb is showing on small screens */}
        <div className={`relative group ${isAdminSubPage ? "hidden md:block w-full max-w-xs" : "w-full max-w-md"}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 transition-colors duration-200 group-focus-within:text-tertiary" />
          <input
            className="w-full bg-black/20 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all duration-300 placeholder:text-on-surface-variant/50 focus:bg-black/30 focus:scale-[1.01]"
            placeholder="Track shipment, invoice or cargo..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button className="hover:bg-white/10 rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95 relative">
            <Bell className="text-on-surface w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full animate-pulse" />
          </button>
          <button className="hover:bg-white/10 rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95 hover:rotate-12">
            <Grid className="text-on-surface w-5 h-5" />
          </button>
          <button className="hover:bg-white/10 rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95">
            <ShieldAlert className="text-on-surface w-5 h-5" />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        {/* Avatar + popup */}
        <div className="relative" ref={popupRef}>
          <div
            className="flex items-center gap-4 animate-slide-right cursor-pointer"
            onClick={() => setOpen((o) => !o)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm text-on-surface leading-tight">{user?.name ?? "Admin"}</p>
              <p className="text-[10px] text-tertiary uppercase tracking-widest">{roleLabel}</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-tertiary/20 scale-0 group-hover:scale-110 transition-transform duration-300 blur-sm" />
              <div className="w-10 h-10 rounded-full border border-[#00C2FF]/30 bg-[#1E88E5] flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-105 animate-glow-pulse">
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
            </div>
          </div>

          {/* Popup */}
          {open && (
            <div className="absolute right-0 top-14 w-72 rounded-2xl border border-white/10 bg-surface-container shadow-2xl z-50 animate-scale-in overflow-hidden">
              {/* Profile header */}
              <div className="p-5 border-b border-white/5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1E88E5] flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-white">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{user?.name ?? "Admin"}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-tertiary/10 text-tertiary">
                    {roleLabel}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-3 border-b border-white/5 space-y-1 text-xs text-on-surface-variant px-5 py-4">
                {user?.company && (
                  <div className="flex justify-between">
                    <span>Company</span>
                    <span className="text-on-surface font-medium">{user.company}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex justify-between">
                    <span>Phone</span>
                    <span className="text-on-surface font-medium">{user.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Member since</span>
                  <span className="text-on-surface font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={() => { setOpen(false); router.push("/profile"); }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-sm text-on-surface">View Profile</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => { setOpen(false); router.push("/profile"); }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-sm text-on-surface">Settings</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-error/10 transition-colors mt-1"
                >
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
