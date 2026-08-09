"use client";
import React from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PortalHeader } from "@/components/shared/PortalHeader";
import { MobileSidebarWrapper } from "@/components/shared/MobileSidebarWrapper";
import { PortalSidebar } from "@/components/shared/PortalSidebar";

interface PortalLayoutProps {
  children: React.ReactNode;
  role: string[];
  userRole: string;
  sidebarConfig: Parameters<typeof PortalSidebar>[0];
}

export function PortalLayout({ children, role, userRole, sidebarConfig }: PortalLayoutProps) {
  return (
    <ProtectedRoute allow={role}>
      <div className="flex bg-background text-on-surface min-h-screen">
        <MobileSidebarWrapper>
          <PortalSidebar {...sidebarConfig} />
        </MobileSidebarWrapper>
        <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
          <PortalHeader userRole={userRole} />
          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
