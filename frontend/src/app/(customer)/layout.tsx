"use client";

import { PortalLayout } from "@/components/shared/PortalLayout";
import { customerNavItems } from "@/components/shared/sidebar-configs";

export const dynamic = "force-dynamic";

export default function CustomerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PortalLayout
      role={["customer"] as const}
      userRole="Customer"
      sidebarConfig={{
        portalName: "Customer Portal",
        navItems: customerNavItems,
      }}
    >
      {children}
    </PortalLayout>
  );
}
