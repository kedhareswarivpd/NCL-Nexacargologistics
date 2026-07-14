"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/shared/AdminSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";
import { MobileSidebarWrapper } from "@/components/shared/MobileSidebarWrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/admin-login?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && user && user.role !== "admin") {
      // Authenticated but wrong role → sign out automatically, redirect to admin login
      logout();
      router.replace(`/admin-login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, user, router, pathname, logout]);

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
    <div className="flex bg-background text-on-surface min-h-screen">
      <MobileSidebarWrapper>
        <AdminSidebar />
      </MobileSidebarWrapper>
      <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
        <PortalHeader userRole="Administrator" />
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
