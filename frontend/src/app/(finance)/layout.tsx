"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FinanceSidebar } from "@/components/shared/FinanceSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";
import { MobileSidebarWrapper } from "@/components/shared/MobileSidebarWrapper";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allow={["finance", "admin"]}>
      <div className="flex bg-background text-on-surface min-h-screen">
        <MobileSidebarWrapper>
          <FinanceSidebar />
        </MobileSidebarWrapper>
        <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
          <PortalHeader userRole="Finance Team" />
          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
