"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { WarehouseSidebar } from "@/components/shared/WarehouseSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";
import { MobileSidebarWrapper } from "@/components/shared/MobileSidebarWrapper";

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allow={["warehouse", "admin"]}>
      <div className="flex bg-background text-on-surface min-h-screen">
        <MobileSidebarWrapper>
          <WarehouseSidebar />
        </MobileSidebarWrapper>
        <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
          <PortalHeader userRole="Warehouse Staff" />
          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
