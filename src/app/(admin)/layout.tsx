"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/shared/AdminSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/admin-login?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && user && user.role !== "admin") {
      // Authenticated but wrong role → send to their own dashboard
      const roleHome: Record<string, string> = {
        customer: "/customer",
        logistics: "/logistics",
        warehouse: "/warehouse",
        driver: "/driver",
        finance: "/finance",
      };
      router.replace(roleHome[user.role] ?? "/login");
    }
  }, [status, user, router, pathname]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
        <Loader2 className="h-6 w-6 animate-spin text-tertiary" />
      </div>
    );
  }

  if (status === "unauthenticated" || (user && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <AdminSidebar />
      <main className="lg:ml-[280px] h-screen flex flex-col overflow-y-auto">
        <PortalHeader userRole="Administrator" />
        {children}
      </main>
    </div>
  );
}
