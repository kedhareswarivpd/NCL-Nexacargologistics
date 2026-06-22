"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { WarehouseSidebar } from "@/components/shared/WarehouseSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allow={["warehouse", "admin"]}>
      <div className="bg-background text-on-surface min-h-screen">
        <WarehouseSidebar />
        <main className="lg:ml-[280px] h-screen flex flex-col overflow-y-auto">
          <PortalHeader userRole="Warehouse Staff" />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
