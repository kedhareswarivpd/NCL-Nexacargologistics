"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade-out at 2.6 s, fully gone by 3 s
    const fadeTimer = setTimeout(() => setFadeOut(true), 2600);
    const hideTimer = setTimeout(() => setVisible(false), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B1F3A] select-none"
      style={{
        transition: "opacity 0.4s ease",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "all",
      }}
    >
      {/* Radial ambient glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle,#1E88E5 0%,transparent 70%)" }} />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle,#00C2FF 0%,transparent 70%)" }} />

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,194,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(0,194,255,0.6) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

      {/* Logo + brand */}
      <div className="relative flex flex-col items-center gap-6">

        {/* Spinning ring */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: "#00C2FF",
              borderRightColor: "#1E88E5",
              animation: "spin 1s linear infinite",
            }}
          />
          {/* Inner pulse ring */}
          <div
            className="absolute inset-2 rounded-full border border-[#00C2FF]/30"
            style={{ animation: "ping 1.5s ease-in-out infinite" }}
          />
          {/* Logo mark */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#00C2FF] flex items-center justify-center shadow-[0_0_30px_rgba(0,194,255,0.4)]">
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
              <path d="M4 20 L16 6 L28 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 26 H24" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <p className="text-3xl font-black tracking-tight text-white">
            Nexa<span style={{ color: "#00C2FF" }}>Cargo</span>
          </p>
          <p className="text-xs text-[#00C2FF]/60 uppercase tracking-[0.3em] mt-1 font-semibold">
            Global Logistics
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1E88E5] to-[#00C2FF]"
            style={{
              animation: "progress 3s ease-in-out forwards",
            }}
          />
        </div>
      </div>

      {/* Keyframe styles injected inline for portability */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ping {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes progress {
          0%   { width: 0%; }
          60%  { width: 70%; }
          90%  { width: 92%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
