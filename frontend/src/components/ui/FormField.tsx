"use client";

/**
 * A labeled input with built-in error display and accessibility wiring:
 * - associates label with input via htmlFor/id
 * - sets aria-invalid and aria-describedby when there's an error
 * - error text lives in a role="alert" region
 *
 * Works for both <input> and <textarea> (set `as="textarea"`).
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  name: string;
  error?: string;
  icon?: React.ElementType;
  as?: "input" | "textarea";
  /** Visual hint shown under the label when there's no error. */
  hint?: string;
}

export function FormField({
  label,
  name,
  error,
  icon: Icon,
  as = "input",
  hint,
  className,
  type = "text",
  ...props
}: FormFieldProps) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const sharedClasses = cn(
    "w-full rounded-xl border bg-black/30 px-4 text-sm text-on-surface outline-none transition-all placeholder:text-white/25",
    "focus:border-tertiary focus:ring-1 focus:ring-tertiary",
    error ? "border-error/60" : "border-white/10",
    Icon ? "pl-12" : "",
    className,
  );

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
            aria-hidden="true"
          />
        )}
        {as === "textarea" ? (
          <textarea
            id={id}
            name={name}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            rows={4}
            className={cn(sharedClasses, "py-3")}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(sharedClasses, "h-12")}
            {...props}
          />
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-on-surface-variant/70">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
