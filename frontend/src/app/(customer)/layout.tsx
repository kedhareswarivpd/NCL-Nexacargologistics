"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CustomerSidebar } from "@/components/shared/CustomerSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allow={["customer", "admin"]}>
      <div className="h-screen w-screen flex bg-background text-on-surface overflow-hidden">
        <CustomerSidebar />
        <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
          <PortalHeader userRole="Customer" />
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
