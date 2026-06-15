"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LogisticsSidebar } from "@/components/shared/LogisticsSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allow={["logistics", "admin"]}>
      <div className="bg-background text-on-surface min-h-screen">
        <LogisticsSidebar />
        <main className="lg:ml-[280px] h-screen flex flex-col overflow-y-auto">
          <PortalHeader userRole="Logistics Manager" />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
