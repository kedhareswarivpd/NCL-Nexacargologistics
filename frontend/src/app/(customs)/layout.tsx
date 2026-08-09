"use client";

import { ReactNode } from "react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { customsNavItems } from "@/components/shared/sidebar-configs";

export const dynamic = "force-dynamic";

export default function CustomsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <PortalLayout
      role={["customs"] as const}
      userRole="Customs Expert"
      sidebarConfig={{
        portalName: "Customs Portal",
        navItems: customsNavItems,
        activeColor: "text-secondary",
        activeGlow: "shadow-[0_0_15px_rgba(169,199,255,0.2)]",
        activeIconColor: "text-secondary",
      }}
    >
      {children}
    </PortalLayout>
  );
}
