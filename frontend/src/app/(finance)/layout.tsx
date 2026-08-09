"use client";

import { PortalLayout } from "@/components/shared/PortalLayout";
import { financeNavItems } from "@/components/shared/sidebar-configs";

export const dynamic = "force-dynamic";

export default function FinanceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PortalLayout
      role={["finance"]}
      userRole="Finance Team"
      sidebarConfig={{
        portalName: "Finance Portal",
        navItems: financeNavItems,
      }}
    >
      {children}
    </PortalLayout>
  );
}
