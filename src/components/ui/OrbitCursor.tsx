"use client";

import { useEffect, useRef, useState } from "react";

export default function OrbitCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [trail, setTrail] = useState({ x: -200, y: -200 });
  const mouse = useRef({ x: -200, y: -200 });
  const raf = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });
    };

    const loop = () => {
      setTrail((prev) => ({
        x: prev.x + (mouse.current.x - prev.x) * 0.14,
        y: prev.y + (mouse.current.y - prev.y) * 0.14,
      }));
      raf.current = window.requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    raf.current = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>

      <div
        style={{
          position: "fixed",
          left: trail.x,
          top: trail.y,
          transform: "translate(-50%, -50%)",
          width: 18,
          height: 18,
          borderRadius: "9999px",
          background: "radial-gradient(circle, rgba(56,189,248,0.35), rgba(168,85,247,0.08))",
          boxShadow: "0 0 18px 8px rgba(56,189,248,0.22)",
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />

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
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="19" stroke="rgba(125,211,252,0.45)" strokeWidth="1.2" fill="none" />
          <circle cx="24" cy="24" r="10" stroke="rgba(192,132,252,0.35)" strokeWidth="1" fill="none" />
          <path d="M24 6 C30 14, 38 18, 42 24 C38 30, 30 34, 24 42 C18 34, 10 30, 6 24 C10 18, 18 14, 24 6Z" fill="rgba(15,23,42,0.55)" stroke="rgba(191,219,254,0.85)" strokeWidth="1" />
          <circle cx="24" cy="24" r="3" fill="rgba(224,242,254,1)" />
        </svg>
      </div>
    </>
  );
}
