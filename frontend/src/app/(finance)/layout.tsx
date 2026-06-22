"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FinanceSidebar } from "@/components/shared/FinanceSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allow={["finance", "admin"]}>
      <div className="bg-background text-on-surface min-h-screen flex">
        <FinanceSidebar />
        <main className="h-screen flex flex-1 flex-col overflow-y-auto">
          <PortalHeader userRole="Finance Team" />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
