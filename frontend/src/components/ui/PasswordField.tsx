"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

export function PasswordField({
  label,
  name,
  error,
  hint,
  className,
  ...props
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const sharedClasses = cn(
    "w-full rounded-xl border bg-black/30 px-4 text-sm text-on-surface outline-none transition-all placeholder:text-white/25",
    "focus:border-tertiary focus:ring-1 focus:ring-tertiary",
    error ? "border-error/60" : "border-white/10",
    "pl-12 pr-12",
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
        {/* Lock icon on the left */}
        <Lock
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
          aria-hidden="true"
        />

        {/* Password input */}
        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(sharedClasses, "h-12")}
          {...props}
        />

        {/* Toggle visibility button on the right */}
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
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
