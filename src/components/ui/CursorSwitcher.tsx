"use client";

import { useState } from "react";
import FlightCursor from "@/components/ui/FlightCursor";
import OrbitCursor from "@/components/ui/OrbitCursor";

export default function CursorSwitcher() {
  const [mode, setMode] = useState<"flight" | "orbit">("flight");
  return (
    <>
      {mode === "flight" ? <FlightCursor /> : <OrbitCursor />}
    </>
  );
}

/* Inline toggle button — placed inside the navbar next to Login */
export function CursorToggleButton() {
  const [mode, setMode] = useState<"flight" | "orbit">("flight");
  return (
    <button
      type="button"
      onClick={() => setMode((p) => (p === "flight" ? "orbit" : "flight"))}
      title={`Switch to ${mode === "flight" ? "orbit" : "flight"} cursor`}
      aria-label="Toggle cursor style"
      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#00C2FF]/40 transition-all duration-200 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-white"
    >
      <span className="text-base leading-none">{mode === "flight" ? "✈" : "⊙"}</span>
      {mode === "flight" ? "Flight" : "Orbit"}
    </button>
  );
}
