"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HelpCircle, LogOut, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  enabled?: boolean;
}

interface PortalLink {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface PortalSidebarConfig {
  portalName: string;
  navItems: NavItem[];
  portalLinks?: PortalLink[];
  activeColor?: string;
  activeGlow?: string;
  activeIconColor?: string;
  showHome?: boolean;
}

export function PortalSidebar(config: PortalSidebarConfig) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const {
    portalName,
    navItems,
    portalLinks,
    activeColor = "text-tertiary",
    activeGlow = "shadow-[0_0_15px_rgba(66,165,245,0.2)]",
    activeIconColor = "text-tertiary",
    showHome = false,
  } = config;

  const handleLogout = () => {
    logout();
    toast.info("You have been signed out.");
    router.replace("/");
  };

  return (
    <aside className="flex h-full flex-col p-4 bg-surface-container-low/20 backdrop-blur-md border-r border-white/5 shadow-xl w-[280px] overflow-y-auto">
      <div className="mb-12 px-4 mt-2">
        <h1 className="text-3xl font-black text-on-surface">NexaCargo</h1>
        <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest mt-1">{portalName}</p>
      </div>
      <nav className="flex flex-col gap-1 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (item.enabled === false) {
            return (
              <div key={item.label} className="flex items-center gap-4 p-3 rounded-lg text-xs uppercase tracking-widest text-on-surface-variant/30 cursor-not-allowed select-none">
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-on-surface-variant/40 normal-case tracking-normal">Soon</span>
              </div>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-all text-xs uppercase tracking-widest",
                isActive
                  ? `bg-white/5 ${activeColor} ${activeGlow} translate-x-1`
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? activeIconColor : "text-on-surface-variant")} />
              {item.label}
            </Link>
          );
        })}

        {portalLinks && portalLinks.length > 0 && (
          <>
            <p className="mt-6 mb-1 px-3 text-[10px] uppercase tracking-widest text-on-surface-variant/50">Portals</p>
            {portalLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-4 p-3 rounded-lg text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors rounded-lg -z-10" />
                <div className="w-5 h-5 flex items-center justify-center shrink-0 text-on-surface-variant group-hover:text-on-surface">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="transition-colors text-on-surface-variant group-hover:text-on-surface">
                  {item.label}
                </span>
              </Link>
            ))}
          </>
        )}
      </nav>
      <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-white/5">
        <Link href="/contact" className="flex items-center gap-4 text-on-surface-variant p-3 hover:bg-white/5 hover:text-on-surface transition-colors text-xs uppercase tracking-widest rounded-lg">
          <HelpCircle className="w-5 h-5" /> Support
        </Link>
        <button type="button" onClick={handleLogout} className="w-full flex items-center gap-4 text-on-surface-variant p-3 hover:bg-white/5 hover:text-on-surface transition-colors text-xs uppercase tracking-widest rounded-lg">
          <LogOut className="w-5 h-5" /> Logout
        </button>
        {showHome && (
          <Link href="/" className="flex items-center gap-4 text-on-surface-variant p-3 hover:bg-white/5 hover:text-on-surface transition-colors text-xs uppercase tracking-widest rounded-lg">
            <Home className="w-5 h-5" /> Home
          </Link>
        )}
      </div>
    </aside>
  );
}
