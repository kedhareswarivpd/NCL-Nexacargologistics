"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CustomsSidebar } from "@/components/shared/CustomsSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";
import { MobileSidebarWrapper } from "@/components/shared/MobileSidebarWrapper";

// Force dynamic rendering to prevent 304 cache issues on Vercel
export const dynamic = "force-dynamic";

export default function CustomsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ProtectedRoute allow={["customs"]}>
      <div className="flex bg-background text-on-surface min-h-screen">
        <MobileSidebarWrapper>
          <CustomsSidebar />
        </MobileSidebarWrapper>
        <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
          <PortalHeader userRole="Customs Expert" />
          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
