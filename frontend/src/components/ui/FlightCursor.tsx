"use client";

import { useEffect, useState } from "react";

export default function FlightCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onDown = () => {
      setClicked(true);
      setTimeout(() => setClicked(false), 300);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
    };
  }, []);

  return (
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
      <style>{`* { cursor: none !important; }`}</style>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transition: "transform 0.15s ease",
          transform: clicked ? "scale(0.85) rotate(-10deg)" : "scale(1) rotate(0deg)",
          filter: "drop-shadow(0 0 10px rgba(0,194,255,1))",
        }}
      >
        <circle cx="24" cy="24" r="18" stroke="rgba(0,194,255,0.8)" strokeWidth="1.5" fill="none" />
        <line x1="24" y1="2"  x2="24" y2="11" stroke="rgba(0,229,255,1)" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="24" y1="37" x2="24" y2="46" stroke="rgba(0,229,255,1)" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="2"  y1="24" x2="11" y2="24" stroke="rgba(0,229,255,1)" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="37" y1="24" x2="46" y2="24" stroke="rgba(0,229,255,1)" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="10" y1="10" x2="13.5" y2="13.5" stroke="rgba(0,194,255,0.85)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="38" y1="10" x2="34.5" y2="13.5" stroke="rgba(0,194,255,0.85)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="10" y1="38" x2="13.5" y2="34.5" stroke="rgba(0,194,255,0.85)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="38" y1="38" x2="34.5" y2="34.5" stroke="rgba(0,194,255,0.85)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="24" cy="24" r="2.5" fill="rgba(0,229,255,1)" />
        <g transform="translate(24,24) rotate(-45)">
          <path d="M0,-9 C1,-6 1.5,-2 1.5,0 L0,1.5 L-1.5,0 C-1.5,-2 -1,-6 0,-9Z" fill="white" />
          <path d="M-1.2,-2 L-7,2 L-1.2,1Z" fill="white" opacity="0.95" />
          <path d="M1.2,-2 L7,2 L1.2,1Z" fill="white" opacity="0.95" />
          <path d="M-1,1.5 L-4,5 L-0.8,3Z" fill="white" opacity="0.85" />
          <path d="M1,1.5 L4,5 L0.8,3Z" fill="white" opacity="0.85" />
        </g>
      </svg>
    </div>
  );
}
