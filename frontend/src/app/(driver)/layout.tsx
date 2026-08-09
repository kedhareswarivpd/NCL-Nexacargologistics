"use client";

import { PortalLayout } from "@/components/shared/PortalLayout";
import { driverNavItems } from "@/components/shared/sidebar-configs";

export const dynamic = "force-dynamic";

export default function DriverLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PortalLayout
      role={["driver"] as const}
      userRole="Driver"
      sidebarConfig={{
        portalName: "Driver Portal",
        navItems: driverNavItems,
      }}
    >
      {children}
    </PortalLayout>
  );
}
