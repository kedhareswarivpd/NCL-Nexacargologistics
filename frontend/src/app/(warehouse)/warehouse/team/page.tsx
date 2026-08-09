"use client";

import { Warehouse } from "lucide-react";
import { TeamPage } from "@/components/shared/TeamPage";
import { warehouseTeam } from "@/components/shared/team-configs";

export default function WarehouseTeamPage() {
  return (
    <TeamPage
      department="Warehouse Department"
      title="Warehouse Team"
      description="Team of 8 warehouse staff managing inventory and operations."
      icon={Warehouse}
      iconColor="bg-tertiary"
      textColor="text-tertiary"
      borderColor="border-tertiary/30"
      backHref="/warehouse"
      defaultMembers={warehouseTeam.members}
      stats={warehouseTeam.stats}
      filters={warehouseTeam.filters}
      fetchMembers={warehouseTeam.fetchFn}
    />
  );
}
