"use client";

import { PortalLayout } from "@/components/shared/PortalLayout";
import { adminNavItems, adminPortalLinks } from "@/components/shared/sidebar-configs";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PortalLayout
      role={["admin"]}
      userRole="Administrator"
      sidebarConfig={{
        portalName: "Admin Portal",
        navItems: adminNavItems,
        portalLinks: adminPortalLinks,
        showHome: true,
      }}
    >
      {children}
    </PortalLayout>
  );
}
