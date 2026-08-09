"use client";

import { HeadphonesIcon } from "lucide-react";
import { TeamPage } from "@/components/shared/TeamPage";
import { supportTeam } from "@/components/shared/team-configs";

export default function SupportTeamPage() {
  return (
    <TeamPage
      department="Support Department"
      title="Support Team"
      description="Team of 6 support executives helping customers across channels."
      icon={HeadphonesIcon}
      iconColor="bg-tertiary"
      textColor="text-tertiary"
      borderColor="border-tertiary/30"
      backHref="/support"
      defaultMembers={supportTeam.members}
      stats={supportTeam.stats}
      filters={supportTeam.filters}
      fetchMembers={supportTeam.fetchFn}
    />
  );
}
