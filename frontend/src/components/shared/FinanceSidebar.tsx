"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Banknote, TrendingUp, FileText, Settings, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/finance" },
  { icon: Receipt, label: "Invoices", href: "/finance/invoices" },
  { icon: Banknote, label: "Payments", href: "/finance/payments" },
  { icon: TrendingUp, label: "Revenue", href: "/finance/revenue" },
  { icon: FileText, label: "Reports", href: "/finance/reports" },
  { icon: Settings, label: "Settings", href: "/finance/settings" },
];

export function FinanceSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.info("You have been signed out.");
    router.replace("/");
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-white/5 bg-surface-container-low/20 p-4 shadow-xl backdrop-blur-md lg:flex">
      <div className="mb-12 px-4 mt-2">
        <h1 className="font-headline-lg text-3xl font-black text-on-surface">NexaCargo</h1>
        <p className="font-label-caps text-xs text-on-surface-variant opacity-70 uppercase tracking-widest mt-1">Finance Portal</p>
      </div>
      <nav className="flex flex-col gap-1 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-all font-label-caps text-xs uppercase tracking-widest",
                isActive
                  ? "bg-white/5 text-tertiary shadow-[0_0_15px_rgba(66,165,245,0.2)] translate-x-1"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-tertiary" : "text-on-surface-variant")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-white/5">
        <Link href="/contact" className="flex items-center gap-4 text-on-surface-variant p-3 hover:bg-white/5 hover:text-on-surface transition-colors font-label-caps text-xs uppercase tracking-widest rounded-lg">
          <HelpCircle className="w-5 h-5 text-on-surface-variant" /> Support
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-4 text-on-surface-variant p-3 hover:bg-white/5 hover:text-on-surface transition-colors font-label-caps text-xs uppercase tracking-widest rounded-lg">
          <LogOut className="w-5 h-5 text-on-surface-variant" /> Logout
        </button>
      </div>
    </aside>
  );
}
