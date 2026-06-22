"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Map, CheckCircle2, User, Settings, HelpCircle, LogOut, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { PortalHeader } from "@/components/shared/PortalHeader";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/driver" },
  { icon: Map, label: "Routes", href: "/driver/routes" },
  { icon: CheckCircle2, label: "Tasks", href: "/driver/tasks" },
  { icon: User, label: "Profile", href: "/driver/profile" },
  { icon: Settings, label: "Settings", href: "/driver/settings" },
];

function DriverSidebar() {
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
        <p className="font-label-caps text-xs text-on-surface-variant opacity-70 uppercase tracking-widest mt-1">Driver Portal</p>
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

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allow={["driver", "admin"]}>
      <div className="bg-background text-on-surface min-h-screen">
        <DriverSidebar />
        <main className="lg:ml-[280px] h-screen flex flex-col overflow-y-auto">
          <PortalHeader userRole="Driver" />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
