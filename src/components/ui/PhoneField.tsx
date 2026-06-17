"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// dial code → [flag, name, max subscriber digits (excluding dial code)]
const COUNTRIES: [string, string, string, number][] = [
  ["+1",   "🇺🇸", "US / Canada",   10],
  ["+44",  "🇬🇧", "UK",            10],
  ["+91",  "🇮🇳", "India",         10],
  ["+880", "🇧🇩", "Bangladesh",    10],
  ["+86",  "🇨🇳", "China",         11],
  ["+81",  "🇯🇵", "Japan",         10],
  ["+82",  "🇰🇷", "South Korea",   10],
  ["+65",  "🇸🇬", "Singapore",      8],
  ["+971", "🇦🇪", "UAE",            9],
  ["+966", "🇸🇦", "Saudi Arabia",   9],
  ["+49",  "🇩🇪", "Germany",       11],
  ["+33",  "🇫🇷", "France",         9],
  ["+39",  "🇮🇹", "Italy",         10],
  ["+34",  "🇪🇸", "Spain",          9],
  ["+7",   "🇷🇺", "Russia",        10],
  ["+55",  "🇧🇷", "Brazil",        11],
  ["+52",  "🇲🇽", "Mexico",        10],
  ["+61",  "🇦🇺", "Australia",      9],
  ["+27",  "🇿🇦", "South Africa",   9],
  ["+20",  "🇪🇬", "Egypt",         10],
  ["+234", "🇳🇬", "Nigeria",       10],
  ["+254", "🇰🇪", "Kenya",          9],
  ["+92",  "🇵🇰", "Pakistan",      10],
  ["+94",  "🇱🇰", "Sri Lanka",      9],
  ["+977", "🇳🇵", "Nepal",         10],
  ["+60",  "🇲🇾", "Malaysia",      10],
  ["+62",  "🇮🇩", "Indonesia",     12],
  ["+63",  "🇵🇭", "Philippines",   10],
  ["+66",  "🇹🇭", "Thailand",       9],
  ["+84",  "🇻🇳", "Vietnam",       10],
  ["+90",  "🇹🇷", "Turkey",        10],
  ["+98",  "🇮🇷", "Iran",          10],
  ["+964", "🇮🇶", "Iraq",          10],
  ["+972", "🇮🇱", "Israel",         9],
];

interface PhoneFieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

/** Splits a stored value like "+91 9876543210" into [dialCode, number]. */
function parsePhone(value: string): [string, string] {
  const match = value.match(/^(\+\d+)\s?(.*)/);
  if (match) return [match[1], match[2]];
  return ["+1", value];
}

export function PhoneField({ label = "Phone", name, value, onChange, onBlur, error, disabled }: PhoneFieldProps) {
  const [dial, setDial] = React.useState(() => parsePhone(value)[0]);
  const [number, setNumber] = React.useState(() => parsePhone(value)[1]);

  const country = COUNTRIES.find(([d]) => d === dial) ?? COUNTRIES[0];
  const maxDigits = country[3];

  const id = `field-${name}`;
  const errorId = `${id}-error`;

  const handleDialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDial = e.target.value;
    const newCountry = COUNTRIES.find(([d]) => d === newDial) ?? COUNTRIES[0];
    const trimmed = number.slice(0, newCountry[3]);
    setDial(newDial);
    setNumber(trimmed);
    onChange(trimmed ? `${newDial} ${trimmed}` : "");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, maxDigits);
    setNumber(raw);
    onChange(raw ? `${dial} ${raw}` : "");
  };

  // Sync if external value changes (e.g. on reset)
  React.useEffect(() => {
    const [d, n] = parsePhone(value);
    if (COUNTRIES.find(([code]) => code === d)) setDial(d);
    setNumber(n);
  }, [value]);

  const baseInput = cn(
    "h-12 rounded-xl border bg-black/30 text-sm text-on-surface outline-none transition-all placeholder:text-white/25",
    "focus:border-tertiary focus:ring-1 focus:ring-tertiary",
    error ? "border-error/60" : "border-white/10",
  );

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
        {label}
      </label>
      <div className="flex gap-2">
        {/* Country selector */}
        <select
          value={dial}
          onChange={handleDialChange}
          disabled={disabled}
          aria-label="Country dial code"
          className={cn(baseInput, "w-32 cursor-pointer px-2 appearance-none text-center")}
        >
          {COUNTRIES.map(([code, flag, name]) => (
            <option key={code} value={code} className="bg-[#0c141d]">
              {flag} {code}
            </option>
          ))}
        </select>

        {/* Number input */}
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={handleNumberChange}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={maxDigits}
          placeholder={`${maxDigits} digits`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(baseInput, "flex-1 px-4")}
        />
      </div>
      {/* Digit counter */}
      <p className="text-right text-[11px] text-on-surface-variant/60">
        {number.length} / {maxDigits}
      </p>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
