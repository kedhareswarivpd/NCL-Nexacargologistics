"use client";

/**
 * Composes all client-side context providers into a single component so the
 * root (server) layout can stay a Server Component while still wrapping the
 * tree in the providers the app needs.
 */

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
