"use client";

import { Globe } from "lucide-react";
import { TeamPage } from "@/components/shared/TeamPage";
import { customsTeam, renderCustomsCard } from "@/components/shared/team-configs";

export default function CustomsTeamPage() {
  return (
    <TeamPage
      department="Customs Department"
      title="Customs Experts"
      description="Team of 8 customs specialists handling clearance and compliance."
      icon={Globe}
      iconColor="bg-secondary"
      textColor="text-secondary"
      borderColor="border-secondary/30"
      backHref="/customs"
      defaultMembers={customsTeam.members}
      stats={customsTeam.stats}
      filters={customsTeam.filters}
      fetchMembers={customsTeam.fetchFn}
      renderCardContent={renderCustomsCard}
    />
  );
}
