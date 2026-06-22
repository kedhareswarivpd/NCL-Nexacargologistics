"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLE_HOME } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [user, status, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-tertiary" />
    </div>
  );
}
