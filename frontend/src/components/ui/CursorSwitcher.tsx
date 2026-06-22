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
      className="flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 text-sm font-bold text-gray-700 hover:text-gray-900 active:scale-95"
    >
      <span className="text-base leading-none">{mode === "flight" ? "⊙" : "✈"}</span>
      {mode === "flight" ? "Orbit" : "Flight"}
    </button>
  );
}
