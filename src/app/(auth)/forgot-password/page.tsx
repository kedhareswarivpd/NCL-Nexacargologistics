"use client";

import * as React from "react";
import Link from "next/link";
import { AtSign, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/button";
import { useForm } from "@/hooks/useForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isEmail, required } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const toast = useToast();
  const [sent, setSent] = React.useState(false);

  const form = useForm({
    initialValues: { email: "" },
    validators: { email: [required("Email"), isEmail] },
    onSubmit: async (values) => {
      await forgotPassword(values.email);
      setSent(true);
      toast.success("Reset link sent. Check your inbox.");
    },
  });

  return (
    <div className="animate-in fade-in slide-in-from-right-4">
      <Link
        href="/login"
        className="group mb-8 inline-flex items-center gap-2 text-on-surface-variant transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to login</span>
      </Link>

      {!sent ? (
        <>
          <div className="mb-8">
            <h1 className="mb-1 text-2xl font-bold text-on-surface">Reset your password</h1>
            <p className="text-sm text-on-surface-variant">
              Enter your account email and we&apos;ll send you a secure reset link.
            </p>
          </div>
          <form className="space-y-6" onSubmit={form.handleSubmit} noValidate>
            <FormField
              label="Account email"
              type="email"
              autoComplete="email"
              placeholder="registered@email.com"
              icon={AtSign}
              {...form.fieldProps("email")}
            />
            <Button
              type="submit"
              disabled={form.submitting}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#005db7] text-base font-bold text-white hover:bg-[#005db7]/80"
            >
              {form.submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Sending…</>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        </>
      ) : (
        <div className="glass animate-in fade-in zoom-in rounded-2xl border-tertiary/40 p-8 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-tertiary" aria-hidden="true" />
          <h2 className="mb-1 text-lg font-bold text-on-surface">Check your email</h2>
          <p className="text-sm text-on-surface-variant">
            If an account exists for{" "}
            <span className="font-medium text-on-surface">{form.values.email}</span>, a reset link
            is on its way.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-semibold text-tertiary hover:underline"
          >
            Return to login
          </Link>
        </div>
      )}
    </div>
  );
}
