"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LogisticsSidebar } from "@/components/shared/LogisticsSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";
import { MobileSidebarWrapper } from "@/components/shared/MobileSidebarWrapper";

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allow={["logistics", "admin"]}>
      <div className="flex bg-background text-on-surface min-h-screen">
        <MobileSidebarWrapper>
          <LogisticsSidebar />
        </MobileSidebarWrapper>
        <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
          <PortalHeader userRole="Logistics Manager" />
          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
