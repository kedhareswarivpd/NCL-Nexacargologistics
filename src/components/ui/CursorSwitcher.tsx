"use client";

import { useEffect, useState } from "react";
import FlightCursor from "@/components/ui/FlightCursor";
import OrbitCursor from "@/components/ui/OrbitCursor";

const KEY = "nexacargo_cursor_mode";

function useCursorMode(): ["flight" | "orbit", () => void] {
  const [mode, setMode] = useState<"flight" | "orbit">("flight");

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as "flight" | "orbit" | null;
    if (stored) setMode(stored);

    const handler = (e: StorageEvent) => {
      if (e.key === KEY && (e.newValue === "flight" || e.newValue === "orbit"))
        setMode(e.newValue);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggle = () => {
    const next = mode === "flight" ? "orbit" : "flight";
    setMode(next);
    localStorage.setItem(KEY, next);
    window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: next }));
  };

  return [mode, toggle];
}

export default function CursorSwitcher() {
  const [mode] = useCursorMode();
  return mode === "flight" ? <FlightCursor /> : <OrbitCursor />;
}

export function CursorToggleButton() {
  const [mode, toggle] = useCursorMode();
  return (
    <button
      type="button"
      onClick={toggle}
      title={`Switch to ${mode === "flight" ? "orbit" : "flight"} cursor`}
      aria-label="Toggle cursor style"
      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#00C2FF]/40 transition-all duration-200 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-white"
    >
      <span className="text-base leading-none">{mode === "flight" ? "✈" : "⊙"}</span>
      {mode === "flight" ? "Flight" : "Orbit"}
    </button>
  );
}
