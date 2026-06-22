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

// dial code → required digit count (must match PhoneField's COUNTRIES list)
const DIAL_DIGIT_MAP: Record<string, number> = {
  "+1": 10, "+44": 10, "+91": 10, "+880": 10, "+86": 11, "+81": 10,
  "+82": 10, "+65": 8,  "+971": 9, "+966": 9,  "+49": 11, "+33": 9,
  "+39": 10, "+34": 9,  "+7": 10,  "+55": 11,  "+52": 10, "+61": 9,
  "+27": 9,  "+20": 10, "+234": 10,"+254": 9,  "+92": 10, "+94": 9,
  "+977": 10,"+60": 10, "+62": 12, "+63": 10,  "+66": 9,  "+84": 10,
  "+90": 10, "+98": 10, "+964": 10,"+972": 9,
};

/** Phone: optional — if provided must be "<dialCode> <digits>" with exact digit count. */
export const isPhone: Validator = (value) => {
  if (!value.trim()) return undefined;
  const match = value.match(/^(\+\d+)\s(\d+)$/);
  if (!match) return "Enter a valid phone number.";
  const [, dial, digits] = match;
  const expectedLen = DIAL_DIGIT_MAP[dial];
  if (expectedLen && digits.length !== expectedLen)
    return `Phone number must be exactly ${expectedLen} digits for ${dial}.`;
  return undefined;
};

/** Must be a positive number. */
export const isPositiveNumber =
  (label = "This field"): Validator =>
  (value) => {
    const n = parseFloat(value);
    if (isNaN(n) || n <= 0) return `${label} must be a positive number.`;
    return undefined;
  };

/** Date must not be in the past. */
export const isFutureDate: Validator = (value) => {
  if (!value) return undefined;
  return new Date(value) < new Date(new Date().toDateString())
    ? "Date must be today or in the future."
    : undefined;
};

/** Credit card: 16 digits (spaces allowed). */
export const isCardNumber: Validator = (value) => {
  const digits = value.replace(/\s/g, "");
  return /^\d{16}$/.test(digits) ? undefined : "Enter a valid 16-digit card number.";
};

/** Card expiry MM/YY — must not be expired. */
export const isCardExpiry: Validator = (value) => {
  if (!/^\d{2}\/\d{2}$/.test(value)) return "Use MM/YY format.";
  const [mm, yy] = value.split("/").map(Number);
  if (mm < 1 || mm > 12) return "Invalid month.";
  const exp = new Date(2000 + yy, mm - 1, 1);
  return exp < new Date() ? "Card has expired." : undefined;
};

/** CVV: 3 or 4 digits. */
export const isCVV: Validator = (value) =>
  /^\d{3,4}$/.test(value) ? undefined : "CVV must be 3 or 4 digits.";

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
