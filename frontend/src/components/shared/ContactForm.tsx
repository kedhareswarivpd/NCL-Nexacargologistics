"use client";

import * as React from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/button";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/context/ToastContext";
import { required, isEmail, minLength } from "@/lib/validation";

/**
 * Contact form with client-side validation and simulated submission.
 * On success it shows a confirmation state and a toast.
 */
export function ContactForm() {
  const toast = useToast();
  const [done, setDone] = React.useState(false);

  const form = useForm({
    initialValues: { name: "", email: "", company: "", message: "" },
    validators: {
      name: [required("Name"), minLength(2, "Name")],
      email: [required("Email"), isEmail],
      message: [required("Message"), minLength(10, "Message")],
    },
    onSubmit: async () => {
      // Simulate a network request to a contact endpoint.
      await new Promise((r) => setTimeout(r, 700));
      setDone(true);
      toast.success("Thanks! Our team will reach out shortly.");
    },
  });

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-tertiary" aria-hidden="true" />
        <h3 className="text-xl font-bold text-on-surface">Message sent</h3>
        <p className="max-w-sm text-sm text-on-surface-variant">
          We&apos;ve received your inquiry and a logistics specialist will be in touch within one
          business day.
        </p>
        <Button variant="outline" className="mt-2" onClick={() => { setDone(false); form.setValues({ name: "", email: "", company: "", message: "" }); }}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form className="grid grid-cols-1 gap-6 md:grid-cols-2" onSubmit={form.handleSubmit} noValidate>
      <FormField 
        label="Full name" 
        placeholder="John Doe" 
        {...form.fieldProps("name")}
        onChange={(e) => {
          const filtered = e.target.value.replace(/[0-9]/g, '');
          form.setValues({ ...form.values, name: filtered });
          if (form.touched.name) {
            form.handleChange({ ...e, target: { ...e.target, value: filtered } } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
      />
      <FormField label="Email address" type="email" placeholder="john@company.com" {...form.fieldProps("email")} />
      <div className="md:col-span-2">
        <FormField label="Company (optional)" placeholder="Enterprise Inc." {...form.fieldProps("company")} />
      </div>
      <div className="md:col-span-2">
        <FormField label="Your message" as="textarea" placeholder="Tell us about your logistics requirements…" {...form.fieldProps("message")} />
      </div>
      <div className="pt-1 md:col-span-2">
        <Button
          type="submit"
          size="lg"
          disabled={form.submitting}
          className="flex h-12 w-full items-center justify-center gap-2 text-base"
        >
          {form.submitting ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Sending…</>
          ) : (
            <><Send className="h-4 w-4" /> Send inquiry</>
          )}
        </Button>
      </div>
    </form>
  );
}
