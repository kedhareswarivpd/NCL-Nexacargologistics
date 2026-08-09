"use client";

import { ReactNode } from "react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { supportNavItems } from "@/components/shared/sidebar-configs";

export const dynamic = "force-dynamic";

export default function SupportLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <PortalLayout
      role={["support"] as const}
      userRole="Support Executive"
      sidebarConfig={{
        portalName: "Support Portal",
        navItems: supportNavItems,
      }}
    >
      {children}
    </PortalLayout>
  );
}
