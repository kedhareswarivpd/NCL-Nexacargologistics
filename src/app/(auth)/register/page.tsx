"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User as UserIcon, AtSign, Lock, Building2, ArrowRight, Loader2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { PhoneField } from "@/components/ui/PhoneField";
import { Button } from "@/components/ui/button";
import { useForm } from "@/hooks/useForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { required, isEmail, isStrongPassword, matches, passwordScore, isPhone } from "@/lib/validation";
import { cn } from "@/lib/utils";

const STRENGTH = ["Too short", "Weak", "Fair", "Good", "Strong"];

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm({
    initialValues: { name: "", email: "", company: "", phone: "", password: "", confirmPassword: "" },
    validators: {
      name: [required("Name")],
      email: [required("Email"), isEmail],
      phone: [isPhone],
      password: [required("Password"), isStrongPassword],
      confirmPassword: [required("Confirmation"), matches("password")],
    },
    onSubmit: async (values) => {
      setFormError(null);
      try {
        const user = await register({
          name: values.name,
          email: values.email,
          company: values.company,
          phone: values.phone,
          password: values.password,
          confirmPassword: values.confirmPassword,
        });
        toast.success(`Welcome, ${user.name.split(" ")[0]}! Your account is ready.`);
        router.replace("/customer");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not create account.";
        setFormError(message);
        toast.error(message);
      }
    },
  });

  const score = passwordScore(form.values.password);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-on-surface">Create your account</h1>
        <p className="text-sm text-on-surface-variant">Start managing shipments in minutes.</p>
      </div>

      {formError && (
        <div role="alert" className="mb-5 rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {formError}
        </div>
      )}

      <form className="space-y-4" onSubmit={form.handleSubmit} noValidate>
        <FormField label="Full name" autoComplete="name" placeholder="John Doe" icon={UserIcon} {...form.fieldProps("name")} />
        <FormField label="Email" type="email" autoComplete="email" placeholder="john@company.com" icon={AtSign} {...form.fieldProps("email")} />
        <FormField label="Company (optional)" placeholder="Acme Freight Inc." icon={Building2} {...form.fieldProps("company")} />
        <PhoneField
          name="phone"
          value={form.values.phone}
          onChange={(v) => form.setValues({ ...form.values, phone: v })}
          onBlur={() =>
            form.handleBlur({ target: { name: "phone" } } as React.FocusEvent<HTMLInputElement>)
          }
          error={form.touched.phone ? form.errors.phone : undefined}
          disabled={form.submitting}
        />

        <div>
          <FormField label="Password" type="password" autoComplete="new-password" placeholder="Create a strong password" icon={Lock} {...form.fieldProps("password")} />
          {/* Live strength meter */}
          {form.values.password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < score ? (score >= 3 ? "bg-tertiary" : "bg-amber-400") : "bg-white/10",
                    )}
                  />
                ))}
              </div>
              <p className="mt-1 text-[11px] text-on-surface-variant">{STRENGTH[score]}</p>
            </div>
          )}
        </div>

        <FormField label="Confirm password" type="password" autoComplete="new-password" placeholder="Re-enter your password" icon={Lock} {...form.fieldProps("confirmPassword")} />

        <Button
          type="submit"
          disabled={form.submitting}
          className="group mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#005db7] text-base font-bold text-white shadow-[0_0_20px_rgba(0,93,183,0.3)] hover:bg-[#005db7]/80"
        >
          {form.submitting ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Creating account…</>
          ) : (
            <>Create Account <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-tertiary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
