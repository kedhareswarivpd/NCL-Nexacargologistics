"use client";

import * as React from "react";
import { User as UserIcon, Building2, Phone, Mail, Save, Pencil, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useForm } from "@/hooks/useForm";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { required } from "@/lib/validation";
import { ROLE_LABEL } from "@/lib/types";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = React.useState(false);

  const form = useForm({
    initialValues: {
      name: user?.name ?? "",
      company: user?.company ?? "",
      phone: user?.phone ?? "",
    },
    validators: { name: [required("Name")] },
    onSubmit: async (values) => {
      try {
        await updateProfile({ name: values.name, company: values.company, phone: values.phone });
        toast.success("Profile updated.");
        setEditing(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed.");
      }
    },
  });

  // Keep the form in sync if the user changes (e.g. after rehydration).
  React.useEffect(() => {
    if (user) {
      form.setValues({
        name: user.name,
        company: user.company ?? "",
        phone: user.phone ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-headline-lg text-3xl font-bold text-on-surface">Your profile</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage your account details and contact information.
        </p>
      </div>

      {/* Identity header */}
      <Card className="flex items-center gap-5 p-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#005db7] text-xl font-bold text-white">
          {initials}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-on-surface">{user.name}</h2>
          <p className="truncate text-sm text-on-surface-variant">{user.email}</p>
          <span className="font-label-caps mt-1 inline-block rounded-full bg-tertiary/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-tertiary">
            {ROLE_LABEL[user.role]}
          </span>
        </div>
      </Card>

      {/* Details / edit form */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-base font-semibold text-on-surface">Account details</h3>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                form.setValues({ name: user.name, company: user.company ?? "", phone: user.phone ?? "" });
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
          )}
        </div>

        {editing ? (
          <form className="space-y-4" onSubmit={form.handleSubmit} noValidate>
            <FormField label="Full name" icon={UserIcon} {...form.fieldProps("name")} />
            <FormField label="Company" icon={Building2} placeholder="Company name" {...form.fieldProps("company")} />
            <FormField label="Phone" icon={Phone} placeholder="+880 ..." {...form.fieldProps("phone")} />
            <div className="pt-2">
              <Button
                type="submit"
                disabled={form.submitting}
                className="gap-2 bg-[#005db7] text-white hover:bg-[#005db7]/80"
              >
                {form.submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save changes</>}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="divide-y divide-white/5">
            <DetailRow icon={UserIcon} label="Full name" value={user.name} />
            <DetailRow icon={Mail} label="Email" value={user.email} />
            <DetailRow icon={Building2} label="Company" value={user.company || "—"} />
            <DetailRow icon={Phone} label="Phone" value={user.phone || "—"} />
          </dl>
        )}
      </Card>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      <Icon className="h-4 w-4 text-on-surface-variant" aria-hidden="true" />
      <dt className="w-28 text-xs uppercase tracking-wider text-on-surface-variant">{label}</dt>
      <dd className="text-sm text-on-surface">{value}</dd>
    </div>
  );
}
