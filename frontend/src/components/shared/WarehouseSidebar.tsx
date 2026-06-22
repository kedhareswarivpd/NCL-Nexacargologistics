"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PackageOpen, ScanBarcode, Truck, ClipboardList, Settings, HelpCircle, LogOut, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/warehouse" },
  { icon: PackageOpen, label: "Inventory", href: "/warehouse/inventory" },
  { icon: ScanBarcode, label: "Inbound", href: "/warehouse/inbound" },
  { icon: Truck, label: "Outbound", href: "/warehouse/outbound" },
  { icon: ClipboardList, label: "Tasks", href: "/warehouse/tasks" },
  { icon: Users, label: "Our Team", href: "/warehouse/team" },
  { icon: Settings, label: "Settings", href: "/warehouse/settings" },
];

export function WarehouseSidebar() {
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
    <aside className="fixed left-0 top-0 h-full flex flex-col p-4 bg-surface-container-low/20 backdrop-blur-md border-r border-white/5 shadow-xl w-[280px] z-50 hidden lg:flex">
      <div className="mb-12 px-4 mt-2">
        <h1 className="font-headline-lg text-3xl font-black text-on-surface">NexaCargo</h1>
        <p className="font-label-caps text-xs text-on-surface-variant opacity-70 uppercase tracking-widest mt-1">Warehouse Portal</p>
      </div>
      <nav className="flex flex-col gap-1 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-colors font-label-caps text-xs uppercase tracking-widest",
                isActive
                  ? "sidebar-active-glow bg-white/5 text-tertiary shadow-[0_0_15px_rgba(66,165,245,0.2)]"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "text-tertiary scale-110" : "text-on-surface-variant group-hover:scale-110")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-white/5">
        <Link href="/contact" className="flex items-center gap-4 text-on-surface-variant p-3 hover:bg-white/5 hover:text-on-surface transition-colors font-label-caps text-xs uppercase tracking-widest rounded-lg">
          <HelpCircle className="w-5 h-5 text-on-surface-variant" /> Support
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-4 text-on-surface-variant p-3 hover:bg-white/5 hover:text-error transition-colors font-label-caps text-xs uppercase tracking-widest rounded-lg">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  );
}
