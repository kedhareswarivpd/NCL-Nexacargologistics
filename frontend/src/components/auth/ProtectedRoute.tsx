"use client";

/**
 * Guards a subtree so only authenticated users can see it.
 *
 * While auth state is rehydrating we show a spinner (avoids a flash of the
 * protected UI or a premature redirect). Unauthenticated users are sent to
 * /login with a `next` param so they return to where they were headed.
 *
 * Optionally restrict to specific roles via `allow`.
 * When a logged-in user tries to access a portal they don't belong to,
 * they are automatically signed out first before being redirected to /login,
 * ensuring a clean session switch between portals.
 */

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allow?: UserRole[];
}

export function ProtectedRoute({ children, allow }: ProtectedRouteProps) {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const roleDenied = !!(allow && user && !allow.includes(user.role));

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && roleDenied && user) {
      // User is logged in but doesn't belong to this portal →
      // sign them out automatically so they can log in fresh.
      logout();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router, roleDenied, user, logout]);

  if (status === "loading" || (status === "authenticated" && roleDenied)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-tertiary" aria-hidden="true" />
        <span className="sr-only">Signing you out…</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
