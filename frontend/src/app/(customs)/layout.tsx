"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CustomsSidebar } from "@/components/shared/CustomsSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";

export default function CustomsLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allow={["admin"]}>
      <div className="bg-background text-on-surface min-h-screen">
        <CustomsSidebar />
        <main className="lg:ml-[280px] min-h-screen flex flex-col">
          <PortalHeader userRole="Customs Expert" />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
