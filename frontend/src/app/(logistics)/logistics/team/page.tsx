"use client";

import { Truck } from "lucide-react";
import { TeamPage } from "@/components/shared/TeamPage";
import { logisticsTeam, renderLogisticsCard } from "@/components/shared/team-configs";

export default function LogisticsTeamPage() {
  return (
    <TeamPage
      department="Logistics Department"
      title="Logistics Managers"
      description="Team of 15 logistics professionals managing shipments across India."
      icon={Truck}
      iconColor="bg-tertiary"
      textColor="text-tertiary"
      borderColor="border-tertiary/30"
      backHref="/logistics"
      defaultMembers={logisticsTeam.members}
      stats={logisticsTeam.stats}
      filters={logisticsTeam.filters}
      fetchMembers={logisticsTeam.fetchFn}
      renderCardContent={renderLogisticsCard}
      showEdit
    />
  );
}
