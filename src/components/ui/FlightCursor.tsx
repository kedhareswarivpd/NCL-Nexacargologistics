"use client";

import { useEffect, useRef, useState } from "react";

export default function FlightCursor() {
  const [pos, setPos]       = useState({ x: -200, y: -200 });
  const [trail, setTrail]   = useState({ x: -200, y: -200 });
  const [clicked, setClicked] = useState(false);
  const mouse = useRef({ x: -200, y: -200 });
  const raf   = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });
    };
    const onDown = () => { setClicked(true);  setTimeout(() => setClicked(false), 300); };

    // smooth trailing dot
    const loop = () => {
      setTrail((prev) => ({
        x: prev.x + (mouse.current.x - prev.x) * 0.12,
        y: prev.y + (mouse.current.y - prev.y) * 0.12,
      }));
      raf.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    raf.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>

      {/* ── Trailing glow dot ── */}
      <div
        style={{
          position: "fixed",
          left: trail.x,
          top: trail.y,
          transform: "translate(-50%, -50%)",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "rgba(153,203,255,0.55)",
          boxShadow: "0 0 10px 4px rgba(153,203,255,0.3)",
          pointerEvents: "none",
          zIndex: 9998,
          transition: "opacity 0.2s",
        }}
      />

      {/* ── Main crosshair + plane cursor ── */}
      <div
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transition: "transform 0.15s ease",
            transform: clicked ? "scale(0.85) rotate(-10deg)" : "scale(1) rotate(0deg)",
            filter: "drop-shadow(0 0 6px rgba(153,203,255,0.8))",
          }}
        >
          {/* Outer crosshair ring */}
          <circle cx="24" cy="24" r="18" stroke="rgba(153,203,255,0.35)" strokeWidth="1" fill="none" />

          {/* Crosshair lines — top */}
          <line x1="24" y1="2"  x2="24" y2="11" stroke="rgba(153,203,255,0.9)" strokeWidth="1.2" strokeLinecap="round" />
          {/* bottom */}
          <line x1="24" y1="37" x2="24" y2="46" stroke="rgba(153,203,255,0.9)" strokeWidth="1.2" strokeLinecap="round" />
          {/* left */}
          <line x1="2"  y1="24" x2="11" y2="24" stroke="rgba(153,203,255,0.9)" strokeWidth="1.2" strokeLinecap="round" />
          {/* right */}
          <line x1="37" y1="24" x2="46" y2="24" stroke="rgba(153,203,255,0.9)" strokeWidth="1.2" strokeLinecap="round" />

          {/* Diagonal tick marks */}
          <line x1="10" y1="10" x2="13.5" y2="13.5" stroke="rgba(153,203,255,0.5)" strokeWidth="1" strokeLinecap="round" />
          <line x1="38" y1="10" x2="34.5" y2="13.5" stroke="rgba(153,203,255,0.5)" strokeWidth="1" strokeLinecap="round" />
          <line x1="10" y1="38" x2="13.5" y2="34.5" stroke="rgba(153,203,255,0.5)" strokeWidth="1" strokeLinecap="round" />
          <line x1="38" y1="38" x2="34.5" y2="34.5" stroke="rgba(153,203,255,0.5)" strokeWidth="1" strokeLinecap="round" />

          {/* Center dot */}
          <circle cx="24" cy="24" r="1.8" fill="rgba(153,203,255,1)" />

          {/* Airplane body — pointing up-right (45°) */}
          <g transform="translate(24,24) rotate(-45)">
            {/* Fuselage */}
            <path
              d="M0,-9 C1,-6 1.5,-2 1.5,0 L0,1.5 L-1.5,0 C-1.5,-2 -1,-6 0,-9Z"
              fill="white"
            />
            {/* Left wing */}
            <path
              d="M-1.2,-2 L-7,2 L-1.2,1Z"
              fill="white" opacity="0.95"
            />
            {/* Right wing */}
            <path
              d="M1.2,-2 L7,2 L1.2,1Z"
              fill="white" opacity="0.95"
            />
            {/* Tail left */}
            <path
              d="M-1,1.5 L-4,5 L-0.8,3Z"
              fill="white" opacity="0.85"
            />
            {/* Tail right */}
            <path
              d="M1,1.5 L4,5 L0.8,3Z"
              fill="white" opacity="0.85"
            />
          </g>
        </svg>
      </div>
    </>
  );
}
