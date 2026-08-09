"use client";

import { ReactNode } from "react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { supportNavItems } from "@/components/shared/sidebar-configs";

export const dynamic = "force-dynamic";

export default function SupportLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <PortalLayout
      role={["support"]}
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
