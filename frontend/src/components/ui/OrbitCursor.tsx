import { useEffect, useState } from "react";

export default function OrbitCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <style>{`@media (pointer: fine) { * { cursor: none !important; } }`}</style>

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
          <circle cx="24" cy="24" r="19" stroke="rgba(0,194,255,0.95)" strokeWidth="2" fill="none" />
          <circle cx="24" cy="24" r="10" stroke="rgba(168,85,247,0.85)" strokeWidth="1.5" fill="none" />
          <path d="M24 6 C30 14, 38 18, 42 24 C38 30, 30 34, 24 42 C18 34, 10 30, 6 24 C10 18, 18 14, 24 6Z" fill="rgba(0,194,255,0.15)" stroke="rgba(0,229,255,1)" strokeWidth="1.5" />

        </svg>
      </div>
    </>
  );
}
