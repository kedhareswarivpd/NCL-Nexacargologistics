"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AtSign, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/button";
import { useForm } from "@/hooks/useForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isEmail, required } from "@/lib/validation";

function AdminLoginForm() {
  const { login, logout, status } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const [formError, setFormError] = React.useState<string | null>(null);
  const hasSubmittedLogin = React.useRef(false);

  React.useEffect(() => {
    if (status === "authenticated" && !hasSubmittedLogin.current) {
      logout();
    }
  }, [status, logout]);

  const form = useForm({
    initialValues: { email: "", password: "" },
    validators: {
      email: [required("Email"), isEmail],
      password: [required("Password")],
    },
    onSubmit: async (values) => {
      setFormError(null);
      hasSubmittedLogin.current = true;
      try {
        const user = await login({ email: values.email, password: values.password });

        if (user.role !== "admin") {
          logout();
          hasSubmittedLogin.current = false;
          const message = "Only administrators can access this portal.";
          setFormError(message);
          toast.error(message);
          return;
        }

        toast.success(`Welcome back, ${user.name.split(" ")[0]}.`);
        router.push(params.get("next") || "/admin");
      } catch (err) {
        hasSubmittedLogin.current = false;
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setFormError(message);
        toast.error(message);
      }
    },
  });

  return (
    <main className="min-h-screen bg-background text-on-surface px-6 py-16 md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_0_40px_rgba(0,0,0,0.35)] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative p-8 md:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.08),_transparent_25%)]" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-tertiary/20 bg-tertiary/10 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-tertiary">
                <ShieldCheck className="h-3.5 w-3.5" /> Secure Admin Portal
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-on-surface md:text-4xl">Admin access</h1>
                <p className="max-w-md text-sm text-on-surface-variant md:text-base">
                  Sign in here to manage users, branches, analytics, and operational controls for NexaCargo.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li>• Role-restricted access for administrators only</li>
                <li>• Secure sign-in with your existing NexaCargo account</li>
                <li>• Redirects back to the page you requested after login</li>
              </ul>
            </div>
          </section>

          <section className="border-t border-white/10 p-8 md:p-10 lg:border-l lg:border-t-0 lg:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.35em] text-tertiary">Admin Login</p>
                <h2 className="mt-2 text-2xl font-semibold text-on-surface">Welcome back, administrator</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Use your secure admin credentials to continue.</p>
              </div>

              {formError && (
                <div role="alert" className="mb-5 rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                  {formError}
                </div>
              )}

              <form className="space-y-5" onSubmit={form.handleSubmit} noValidate>
                <FormField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@company.com"
                  icon={AtSign}
                  {...form.fieldProps("email")}
                />
                <PasswordField
                  label="Password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...form.fieldProps("password")}
                />

                <Button
                  type="submit"
                  disabled={form.submitting}
                  className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#1a4a8a] text-base font-bold text-white shadow-[0_0_20px_rgba(26,74,138,0.4)] hover:bg-[#2563eb]"
                >
                  {form.submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Signing in…
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-on-surface-variant">
                Not an admin? <Link href="/login" className="font-semibold text-tertiary hover:underline">Use the staff login page</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-tertiary" /></div>}>
      <AdminLoginForm />
    </React.Suspense>
  );
}