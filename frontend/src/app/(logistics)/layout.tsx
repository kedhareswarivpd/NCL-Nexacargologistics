"use client";

import { PortalLayout } from "@/components/shared/PortalLayout";
import { logisticsNavItems } from "@/components/shared/sidebar-configs";

export const dynamic = "force-dynamic";

export default function LogisticsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PortalLayout
      role={["logistics"] as const}
      userRole="Logistics Manager"
      sidebarConfig={{
        portalName: "Logistics Portal",
        navItems: logisticsNavItems,
      }}
    >
      {children}
    </PortalLayout>
  );
}
