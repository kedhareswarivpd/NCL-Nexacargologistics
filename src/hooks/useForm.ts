"use client";

/**
 * A tiny form hook: manages values, per-field validation, touched state and
 * submission. Keeps page components declarative — they describe fields and
 * validators, the hook handles the wiring.
 */

import * as React from "react";
import { runValidators, type Validator } from "@/lib/validation";

type Values = Record<string, string>;
type Errors = Record<string, string | undefined>;

interface UseFormOptions<T extends Values> {
  initialValues: T;
  validators?: Partial<Record<keyof T, Validator[]>>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Values>({
  initialValues,
  validators = {},
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Errors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const validateField = React.useCallback(
    (name: keyof T, all: T): string | undefined => {
      const fieldValidators = validators[name];
      if (!fieldValidators) return undefined;
      return runValidators(all[name], fieldValidators, all);
    },
    [validators],
  );

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        // Re-validate this field live once it has been touched.
        if (touched[name]) {
          setErrors((errs) => ({ ...errs, [name]: validateField(name as keyof T, next) }));
        }
        return next;
      });
    },
    [touched, validateField],
  );

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((errs) => ({ ...errs, [name]: validateField(name as keyof T, values) }));
    },
    [values, validateField],
  );

  const validateAll = React.useCallback((): boolean => {
    const nextErrors: Errors = {};
    let valid = true;
    (Object.keys(validators) as (keyof T)[]).forEach((name) => {
      const error = validateField(name, values);
      nextErrors[name as string] = error;
      if (error) valid = false;
    });
    setErrors(nextErrors);
    setTouched(
      Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
    );
    return valid;
  }, [validators, validateField, values]);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateAll()) return;
      setSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setSubmitting(false);
      }
    },
    [validateAll, onSubmit, values],
  );

  return {
    values,
    errors,
    touched,
    submitting,
    setValues,
    handleChange,
    handleBlur,
    handleSubmit,
    /** Returns props to spread onto a field for a11y + wiring. */
    fieldProps: (name: keyof T) => ({
      name: name as string,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name as string] ? errors[name as string] : undefined,
    }),
  };
}
