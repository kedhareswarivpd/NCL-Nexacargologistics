"use client";

/**
 * Guards a subtree so only authenticated users can see it.
 *
 * While auth state is rehydrating we show a spinner (avoids a flash of the
 * protected UI or a premature redirect). Unauthenticated users are sent to
 * /login with a `next` param so they return to where they were headed.
 *
 * Optionally restrict to specific roles via `allow`.
 */

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";
import { ROLE_HOME } from "@/lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allow?: UserRole[];
}

export function ProtectedRoute({ children, allow }: ProtectedRouteProps) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const roleDenied = !!(allow && user && !allow.includes(user.role));

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (roleDenied && user) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [status, pathname, router, roleDenied, user]);

  if (status === "loading" || roleDenied) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-tertiary" aria-hidden="true" />
        <span className="sr-only">Checking your session…</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
