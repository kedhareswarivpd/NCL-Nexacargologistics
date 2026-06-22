"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SupportSidebar } from "@/components/shared/SupportSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";

export default function SupportLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allow={["admin"]}>
      <div className="bg-background text-on-surface min-h-screen">
        <SupportSidebar />
        <main className="lg:ml-[280px] min-h-screen flex flex-col">
          <PortalHeader userRole="Support Executive" />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
