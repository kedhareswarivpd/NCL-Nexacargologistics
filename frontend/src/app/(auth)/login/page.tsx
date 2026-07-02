"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AtSign, ArrowRight, Loader2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/button";
import { useForm } from "@/hooks/useForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isEmail, required } from "@/lib/validation";
import { ROLE_HOME } from "@/lib/types";

function LoginForm() {
  const { login, logout, status, user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const [formError, setFormError] = React.useState<string | null>(
    params.get("reason") === "session_expired" ? "Your session has expired. Please sign in again." : null
  );
  const hasSubmittedLogin = React.useRef(false);

  // If already authenticated on page load, redirect to their role's home
  React.useEffect(() => {
    if (status === "authenticated" && user && !hasSubmittedLogin.current) {
      const next = params.get("next");
      router.replace(next || ROLE_HOME[user.role]);
    }
  }, [status, user, router, params]);

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
        
        if (user.role === "admin") {
          logout();
          hasSubmittedLogin.current = false;
          const adminError = "Access Denied: Administrators must log in through the secure Admin Portal.";
          setFormError(adminError);
          toast.error("Admin login denied on this page.");
          return;
        }

        toast.success(`Welcome back, ${user.name.split(" ")[0]}.`);
        const next = params.get("next");
        router.push(next || ROLE_HOME[user.role]);
      } catch (err) {
        hasSubmittedLogin.current = false;
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setFormError(message);
        toast.error(message);
      }
    },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-on-surface">Welcome back</h1>
        <p className="text-sm text-on-surface-variant">Sign in to your operational dashboard.</p>
      </div>

      {/* Form-level error (e.g. bad credentials). */}
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
          placeholder="name@company.com"
          icon={AtSign}
          {...form.fieldProps("email")}
        />
        <div>
          <PasswordField
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...form.fieldProps("password")}
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-[11px] font-medium uppercase tracking-wider text-tertiary hover:text-white">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={form.submitting}
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#005db7] text-base font-bold text-white shadow-[0_0_20px_rgba(0,93,183,0.3)] hover:bg-[#005db7]/80"
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

      <p className="mt-8 text-center text-sm text-on-surface-variant">
        New to NexaCargo?{" "}
        <Link href="/register" className="font-semibold text-tertiary hover:underline">
          Create an account
        </Link>
      </p>

    </div>
  );
}

export default function LoginPage() {
  // useSearchParams requires a Suspense boundary in the App Router.
  return (
    <React.Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-tertiary" /></div>}>
      <LoginForm />
    </React.Suspense>
  );
}
