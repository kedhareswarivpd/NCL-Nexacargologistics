"use client";

import { PortalLayout } from "@/components/shared/PortalLayout";
import { warehouseNavItems } from "@/components/shared/sidebar-configs";

export const dynamic = "force-dynamic";

export default function WarehouseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PortalLayout
      role={["warehouse"] as const}
      userRole="Warehouse Staff"
      sidebarConfig={{
        portalName: "Warehouse Portal",
        navItems: warehouseNavItems,
      }}
    >
      {children}
    </PortalLayout>
  );
}
