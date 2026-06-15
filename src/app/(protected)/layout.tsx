import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthHeader } from "@/components/shared/AuthHeader";

/**
 * Layout for authenticated pages. Wraps children in ProtectedRoute so an
 * unauthenticated visit redirects to /login, and renders the shared header.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AuthHeader />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
