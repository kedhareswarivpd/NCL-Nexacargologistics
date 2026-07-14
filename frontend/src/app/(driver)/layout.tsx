"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Map, CheckCircle2, User, Settings, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { PortalHeader } from "@/components/shared/PortalHeader";
import { MobileSidebarWrapper } from "@/components/shared/MobileSidebarWrapper";

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
    <aside className="flex h-full flex-col p-4 bg-surface-container-low/20 backdrop-blur-md border-r border-white/5 shadow-xl w-[280px]">
      <div className="mb-12 px-4 mt-2">
        <h1 className="text-3xl font-black text-on-surface">NexaCargo</h1>
        <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest mt-1">Driver Portal</p>
      </div>
      <nav className="flex flex-col gap-1 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-all text-xs uppercase tracking-widest",
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
        <Link href="/contact" className="flex items-center gap-4 text-on-surface-variant p-3 hover:bg-white/5 hover:text-on-surface transition-colors text-xs uppercase tracking-widest rounded-lg">
          <HelpCircle className="w-5 h-5" /> Support
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-4 text-on-surface-variant p-3 hover:bg-white/5 hover:text-on-surface transition-colors text-xs uppercase tracking-widest rounded-lg">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  );
}

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allow={["driver", "admin"]}>
      <div className="flex bg-background text-on-surface min-h-screen">
        <MobileSidebarWrapper>
          <DriverSidebar />
        </MobileSidebarWrapper>
        <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
          <PortalHeader userRole="Driver" />
          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
