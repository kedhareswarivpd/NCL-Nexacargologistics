"use client";
import React from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminSidebar } from "@/components/shared/AdminSidebar";
import { PortalHeader } from "@/components/shared/PortalHeader";
import { MobileSidebarWrapper } from "@/components/shared/MobileSidebarWrapper";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProtectedRoute allow={["admin"]}>
      <div className="flex bg-background text-on-surface min-h-screen">
        <MobileSidebarWrapper>
          <AdminSidebar />
        </MobileSidebarWrapper>
        <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
          <PortalHeader userRole="Administrator" />
          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
