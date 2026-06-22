"use client";

import { motion } from "framer-motion";
import { Navigation, MapPin } from "lucide-react";

interface LiveMapProps {
  lat?: number;
  lng?: number;
  label?: string;
  height?: number;
}

const STOPS = [
  { x: 80,  y: 260, name: "Depot",       done: true  },
  { x: 160, y: 200, name: "Stop 1",      done: true  },
  { x: 260, y: 170, name: "Stop 2",      done: false, active: true },
  { x: 360, y: 210, name: "Stop 3",      done: false },
  { x: 440, y: 150, name: "Destination", done: false },
];

// The route polyline points
const ROUTE = "M80,260 C120,230 140,210 160,200 C190,185 230,175 260,170 C300,165 330,190 360,210 C395,228 420,178 440,150";

export default function LiveMap({ label = "GPS Active", height = 320 }: LiveMapProps) {
  const W = 540;
  const H = height;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10"
      style={{ height, background: "#0d1e38" }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">

        {/* ── Map background blocks (city grid) ── */}
        <rect width={W} height={H} fill="#0d1e38" />

        {/* Park / green area */}
        <rect x="300" y="60"  width="110" height="70" rx="8" fill="rgba(16,80,40,0.35)" />
        <rect x="20"  y="80"  width="80"  height="55" rx="6" fill="rgba(16,80,40,0.28)" />

        {/* Water body */}
        <ellipse cx="480" cy="280" rx="80" ry="55" fill="rgba(0,80,160,0.25)" />

        {/* City blocks */}
        {[
          [20, 160, 55, 45], [90, 155, 50, 40], [155, 30, 60, 50],
          [240, 30, 55, 45], [330, 30, 55, 45], [410, 30, 70, 50],
          [20, 230, 55, 50], [90, 235, 50, 45], [155, 230, 50, 45],
          [310, 240, 55, 50],[380, 240, 60, 50],[20, 300, 60, 50],
        ].map(([x, y, w, hh], i) => (
          <rect key={i} x={x} y={y} width={w} height={hh} rx="4"
            fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        ))}

        {/* ── Road grid ── */}
        {/* horizontal roads */}
        {[100, 155, 225, 295, 350].map((y, i) => (
          <line key={`hr-${i}`} x1="0" y1={y} x2={W} y2={y}
            stroke="rgba(255,255,255,0.07)" strokeWidth={i % 2 === 0 ? 6 : 4} />
        ))}
        {/* vertical roads */}
        {[80, 150, 230, 310, 390, 460].map((x, i) => (
          <line key={`vr-${i}`} x1={x} y1="0" x2={x} y2={H}
            stroke="rgba(255,255,255,0.07)" strokeWidth={i % 2 === 0 ? 6 : 4} />
        ))}
        {/* road centre dashes */}
        {[100, 225, 350].map((y, i) => (
          <line key={`rd-${i}`} x1="0" y1={y} x2={W} y2={y}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="14 10" />
        ))}

        {/* ── Route path (completed — solid cyan) ── */}
        <path d="M80,260 C120,230 140,210 160,200 C190,185 230,175 260,170"
          fill="none" stroke="#00C2FF" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />

        {/* ── Route path (remaining — dashed) ── */}
        <path d="M260,170 C300,165 330,190 360,210 C395,228 420,178 440,150"
          fill="none" stroke="#00C2FF" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="8 6" opacity="0.45" />

        {/* Route glow under */}
        <path d={ROUTE} fill="none" stroke="rgba(0,194,255,0.15)"
          strokeWidth="12" strokeLinecap="round" />

        {/* ── Completed stop markers ── */}
        {STOPS.filter(s => s.done).map((s, i) => (
          <g key={i} transform={`translate(${s.x},${s.y})`}>
            <circle r="7" fill="#1E88E5" stroke="rgba(0,194,255,0.5)" strokeWidth="1.5" />
            <text fontSize="8" fill="white" textAnchor="middle" dy="3" fontWeight="bold">✓</text>
          </g>
        ))}

        {/* ── Destination pin ── */}
        <g transform="translate(440,150)">
          <motion.circle r="18" fill="rgba(0,194,255,0.12)"
            animate={{ r: [14, 22, 14], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.circle r="12" fill="rgba(0,194,255,0.15)"
            animate={{ r: [9, 15, 9], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
          />
          {/* pin body */}
          <path d="M0,-16 C-8,-16 -12,-8 -12,0 C-12,10 0,22 0,22 C0,22 12,10 12,0 C12,-8 8,-16 0,-16 Z"
            fill="#00C2FF" opacity="0.95" />
          <circle cy="-2" r="4.5" fill="white" opacity="0.9" />
          <text fontSize="7" fill="#0d1e38" textAnchor="middle" dy="20" fontWeight="700"
            fontFamily="Inter, sans-serif">DEST</text>
        </g>

        {/* ── Animated truck at current position (Stop 2) ── */}
        <motion.g
          animate={{ x: [0, 3, -2, 1, 0], y: [0, -2, 1, -1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <g transform="translate(260,170)">
            {/* accuracy circle */}
            <motion.circle r="22" fill="rgba(0,194,255,0.08)"
              animate={{ r: [18, 28, 18] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
            {/* heading cone */}
            <path d="M0,-30 L-10,-10 L10,-10 Z"
              fill="rgba(0,194,255,0.25)" transform="rotate(-20)" />
            {/* truck body */}
            <rect x="-14" y="-10" width="28" height="20" rx="4"
              fill="#1E88E5" stroke="#00C2FF" strokeWidth="1.5" />
            {/* cab */}
            <rect x="6" y="-14" width="12" height="14" rx="3"
              fill="#0d2a50" stroke="#00C2FF" strokeWidth="1" />
            {/* windshield */}
            <rect x="7" y="-13" width="10" height="7" rx="2"
              fill="rgba(0,194,255,0.5)" />
            {/* wheels */}
            <circle cx="-8" cy="12"  r="4" fill="#061422" stroke="#00C2FF" strokeWidth="1" />
            <circle cx="6"  cy="12"  r="4" fill="#061422" stroke="#00C2FF" strokeWidth="1" />
            {/* NexaCargo label */}
            <text fontSize="5.5" fill="white" textAnchor="middle" dy="-1"
              fontFamily="Inter, sans-serif" fontWeight="700" opacity="0.9">NEXA</text>
            {/* direction arrow */}
            <path d="M18,0 L24,-4 L22,0 L24,4 Z" fill="#00C2FF" />
          </g>
        </motion.g>

        {/* ── Active stop pulse at Stop 2 ── */}
        <g transform="translate(260,170)">
          <motion.circle r="8" fill="none" stroke="#00C2FF" strokeWidth="1.5"
            animate={{ r: [8, 20], opacity: [0.8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
          <motion.circle r="6" fill="none" stroke="#00C2FF" strokeWidth="1"
            animate={{ r: [6, 16], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.5 }} />
        </g>

        {/* ── Stop labels ── */}
        {STOPS.slice(1, -1).map((s, i) => (
          <g key={i}>
            <rect x={s.x - 18} y={s.y - 30} width="36" height="14" rx="4"
              fill="rgba(11,31,58,0.85)" stroke={s.active ? "#00C2FF" : "rgba(255,255,255,0.12)"} strokeWidth="0.8" />
            <text x={s.x} y={s.y - 20} fontSize="6.5" fill={s.active ? "#00C2FF" : "rgba(255,255,255,0.55)"}
              textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={s.active ? "700" : "400"}>
              {s.name}
            </text>
          </g>
        ))}

        {/* ── Compass rose ── */}
        <g transform={`translate(${W - 36}, 36)`}>
          <circle r="16" fill="rgba(11,31,58,0.8)" stroke="rgba(0,194,255,0.2)" strokeWidth="0.8" />
          <text fontSize="7" fill="#00C2FF" textAnchor="middle" dy="-8" fontWeight="700">N</text>
          <text fontSize="7" fill="rgba(255,255,255,0.4)" textAnchor="middle" dy="13">S</text>
          <text fontSize="7" fill="rgba(255,255,255,0.4)" textAnchor="end" dx="-8" dy="3.5">W</text>
          <text fontSize="7" fill="rgba(255,255,255,0.4)" textAnchor="start" dx="9" dy="3.5">E</text>
          <path d="M0,-10 L2,0 L0,-2 L-2,0 Z" fill="#00C2FF" />
        </g>

        {/* ── Scale bar ── */}
        <g transform="translate(16, 28)">
          <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <line x1="40" y1="-3" x2="40" y2="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <text x="20" y="-6" fontSize="7" fill="rgba(255,255,255,0.45)" textAnchor="middle"
            fontFamily="Inter, sans-serif">500m</text>
        </g>

        {/* ── Map attribution ── */}
        <text x={W - 8} y={H - 6} fontSize="6" fill="rgba(255,255,255,0.2)"
          textAnchor="end" fontFamily="Inter, sans-serif">NexaCargo GPS</text>

      </svg>

      {/* ── Overlays ── */}

      {/* LIVE GPS badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#0d1e38]/90 backdrop-blur px-3 py-1.5 rounded-full border border-[#00C2FF]/30">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[11px] uppercase tracking-widest text-[#00C2FF] font-bold">Live GPS</span>
      </div>

      {/* Location label */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#0d1e38]/90 backdrop-blur px-3 py-2 rounded-lg border border-white/10 max-w-[70%]">
        <MapPin className="w-3.5 h-3.5 text-[#00C2FF] shrink-0" />
        <p className="text-xs text-white/80 truncate">{label}</p>
      </div>

      {/* ETA chip */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#1E88E5]/20 backdrop-blur px-3 py-2 rounded-lg border border-[#1E88E5]/30">
        <Navigation className="w-3 h-3 text-[#00C2FF]" />
        <span className="text-xs text-white font-semibold">ETA 14 min</span>
      </div>
    </div>
  );
}
