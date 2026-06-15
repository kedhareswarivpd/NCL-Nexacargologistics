/**
 * Small, dependency-free validation helpers.
 *
 * Each validator returns `undefined` when the value is valid, or a string
 * error message when it is not. This shape plugs directly into `useForm`.
 */

export type Validator = (value: string, allValues?: Record<string, string>) => string | undefined;

/** Field must not be empty (after trimming). */
export const required =
  (label = "This field"): Validator =>
  (value) =>
    value.trim().length === 0 ? `${label} is required.` : undefined;

/** Minimum length. */
export const minLength =
  (n: number, label = "This field"): Validator =>
  (value) =>
    value.length < n ? `${label} must be at least ${n} characters.` : undefined;

/** Basic but practical email check. */
export const isEmail: Validator = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? undefined
    : "Enter a valid email address.";

/**
 * Password strength: at least 8 chars, with letters and numbers.
 * Kept intentionally pragmatic — strong enough to be meaningful without
 * frustrating users during a demo.
 */
export const isStrongPassword: Validator = (value) => {
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(value)) return "Password must include a letter.";
  if (!/[0-9]/.test(value)) return "Password must include a number.";
  return undefined;
};

/** Confirm-password matcher. Compares against another field by key. */
export const matches =
  (otherKey: string, label = "Passwords"): Validator =>
  (value, allValues) =>
    allValues && value !== allValues[otherKey] ? `${label} do not match.` : undefined;

/** Run a list of validators, returning the first error found. */
export function runValidators(
  value: string,
  validators: Validator[],
  allValues?: Record<string, string>,
): string | undefined {
  for (const validate of validators) {
    const error = validate(value, allValues);
    if (error) return error;
  }
  return undefined;
}

/** A simple 0–4 strength score for the password meter UI. */
export function passwordScore(value: string): number {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(score, 4);
}
