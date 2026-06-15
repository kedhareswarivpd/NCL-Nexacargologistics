"use client";

import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState } from "react";

const S  = 480;
const CX = S / 2;
const CY = S / 2;
const R  = 200;

const STICKERS = [
  { emoji: "✈️", path: [[95,168],[210,125],[278,168],[334,152]], speed: 13 },
  { emoji: "🚢", path: [[278,168],[322,208],[358,268],[142,268]], speed: 24 },
  { emoji: "🚛", path: [[210,125],[278,168],[312,180],[322,208]], speed: 19 },
  { emoji: "✈️", path: [[312,180],[334,152],[356,140],[358,268]], speed: 11 },
  { emoji: "🚢", path: [[95,168],[142,268],[210,125],[278,168]], speed: 27 },
  { emoji: "🚛", path: [[356,140],[312,180],[278,168],[210,125]], speed: 21 },
];

function StickerMover({ emoji, path, speed, offset }: {
  emoji: string; path: number[][]; speed: number; offset: number;
}) {
  const tRef = useRef(offset);
  const [pos, setPos] = useState({ x: path[0][0], y: path[0][1] });

  useAnimationFrame((_, delta) => {
    tRef.current = (tRef.current + delta / (speed * 1000)) % 1;
    const t     = tRef.current;
    const total = path.length - 1;
    const seg   = Math.min(Math.floor(t * total), total - 1);
    const st    = t * total - seg;
    const [x1, y1] = path[seg];
    const [x2, y2] = path[seg + 1];
    setPos({ x: x1 + (x2 - x1) * st, y: y1 + (y2 - y1) * st });
  });

  return (
    <text
      x={pos.x} y={pos.y}
      fontSize="14"
      textAnchor="middle"
      dominantBaseline="middle"
      style={{ userSelect: "none", filter: "drop-shadow(0 0 4px rgba(0,194,255,0.8))" }}
    >
      {emoji}
    </text>
  );
}

/* Bangladesh polygon (equirect projected onto 480×480) */
const BD = "M 308 174 L 314 172 L 318 174 L 320 180 L 318 186 L 312 190 L 306 188 L 302 183 L 302 177 Z";

/* Dhaka city */
const DHAKA = { x: 312, y: 180 };

export function GlobeAnimation() {
  /* Latitude rings */
  const latLines = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => {
    const lat  = i / 4.5;
    const yPos = CY + lat * R;
    const xr   = R * Math.sqrt(Math.max(0, 1 - lat * lat));
    return { yPos, xr };
  });

  /* Longitude ellipses */
  const lonLines = [0, 20, 40, 60, 80, 100, 120, 140, 160].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return Math.abs(R * Math.sin(rad) * 0.5);
  });

  return (
    <div className="relative w-full flex items-center justify-center select-none">
      <svg viewBox={`0 0 ${S} ${S}`} width="100%" style={{ maxWidth: 520 }} aria-hidden="true">
        <defs>
          {/* Deep blue ocean */}
          <radialGradient id="ocean" cx="38%" cy="34%" r="65%">
            <stop offset="0%"   stopColor="#1565c0" />
            <stop offset="40%"  stopColor="#0d47a1" />
            <stop offset="75%"  stopColor="#07307a" />
            <stop offset="100%" stopColor="#020f3a" />
          </radialGradient>

          {/* Bangladesh fill */}
          <radialGradient id="bgd" cx="50%" cy="50%" r="60%">
            <stop offset="0%"   stopColor="#00e5ff" />
            <stop offset="60%"  stopColor="#00b0cc" />
            <stop offset="100%" stopColor="#006688" />
          </radialGradient>

          {/* Atmosphere */}
          <radialGradient id="atm" cx="50%" cy="50%" r="50%">
            <stop offset="76%"  stopColor="transparent" />
            <stop offset="88%"  stopColor="rgba(21,101,192,0.18)" />
            <stop offset="100%" stopColor="rgba(0,194,255,0.30)" />
          </radialGradient>

          {/* Specular top-left */}
          <radialGradient id="spec" cx="30%" cy="26%" r="44%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
            <stop offset="55%"  stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Limb dark edge */}
          <radialGradient id="limb" cx="72%" cy="62%" r="54%">
            <stop offset="55%"  stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,30,0.62)" />
          </radialGradient>

          <clipPath id="globeClip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>

          <filter id="globeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="22" floodColor="#1565c0" floodOpacity="0.40" />
          </filter>

          <filter id="bdGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer atmosphere halo */}
        <circle cx={CX} cy={CY} r={R + 22} fill="none" stroke="rgba(0,150,255,0.07)" strokeWidth="22" />
        <circle cx={CX} cy={CY} r={R + 10} fill="none" stroke="rgba(21,101,192,0.14)" strokeWidth="10" />

        {/* Drop shadow */}
        <circle cx={CX} cy={CY} r={R} fill="#020f3a" filter="url(#globeShadow)" />

        {/* Ocean base */}
        <circle cx={CX} cy={CY} r={R} fill="url(#ocean)" />

        {/* ── Thick grid lines ── */}
        <g clipPath="url(#globeClip)">
          {/* Latitude */}
          {latLines.map(({ yPos, xr }, i) => (
            <ellipse key={`lat${i}`} cx={CX} cy={yPos}
              rx={xr} ry={xr * 0.25}
              fill="none"
              stroke="rgba(100,180,255,0.35)"
              strokeWidth="1.2"
            />
          ))}
          {/* Longitude */}
          {lonLines.map((rx, i) => (
            <ellipse key={`lon${i}`} cx={CX} cy={CY}
              rx={rx} ry={R}
              fill="none"
              stroke="rgba(100,180,255,0.35)"
              strokeWidth="1.2"
            />
          ))}
          {/* Equator — slightly brighter */}
          <line x1={CX - R} y1={CY} x2={CX + R} y2={CY}
            stroke="rgba(100,200,255,0.55)" strokeWidth="1.6" />
          {/* Prime meridian */}
          <ellipse cx={CX} cy={CY} rx={0.01} ry={R}
            fill="none" stroke="rgba(100,200,255,0.55)" strokeWidth="1.6" />
        </g>

        {/* Bangladesh */}
        <g clipPath="url(#globeClip)">
          <path d={BD}
            fill="url(#bgd)"
            stroke="#00e5ff"
            strokeWidth="1.5"
            opacity="0.96"
            filter="url(#bdGlow)"
          />
        </g>

        {/* Sticker movers */}
        <g clipPath="url(#globeClip)">
          {STICKERS.map((s, i) => (
            <StickerMover key={i} emoji={s.emoji} path={s.path} speed={s.speed} offset={(i * 0.17) % 1} />
          ))}
        </g>

        {/* Dhaka city dot + pulse */}
        <g clipPath="url(#globeClip)">
          <motion.circle cx={DHAKA.x} cy={DHAKA.y}
            fill="none" stroke="#00e5ff" strokeWidth="1.2"
            initial={{ r: 4, opacity: 0.9 }}
            animate={{ r: 20, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          <circle cx={DHAKA.x} cy={DHAKA.y} r="5"
            fill="#00e5ff" stroke="rgba(0,229,255,0.5)" strokeWidth="2.5" />
          <text x={DHAKA.x + 8} y={DHAKA.y - 7}
            fontSize="7.5" fill="#00e5ff"
            fontFamily="Inter, sans-serif" fontWeight="700">
            🇧🇩 Dhaka
          </text>
        </g>

        {/* Specular */}
        <circle cx={CX} cy={CY} r={R} fill="url(#spec)" clipPath="url(#globeClip)" />

        {/* Limb darkening */}
        <circle cx={CX} cy={CY} r={R} fill="url(#limb)" clipPath="url(#globeClip)" />

        {/* Atmosphere overlay */}
        <circle cx={CX} cy={CY} r={R} fill="url(#atm)" />

        {/* Globe rim */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(0,194,255,0.4)" strokeWidth="1.5" />

        {/* LIVE badge */}
        <g transform="translate(16,16)">
          <rect width="70" height="20" rx="10"
            fill="rgba(2,15,58,0.90)" stroke="rgba(0,194,255,0.4)" strokeWidth="0.8" />
          <motion.circle cx="12" cy="10" r="3.2" fill="#00e5ff"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }} />
          <text x="20" y="14" fontSize="7.5" fill="#00C2FF"
            fontFamily="Inter, sans-serif" fontWeight="700">LIVE</text>
          <text x="40" y="14" fontSize="6.8" fill="rgba(0,194,255,0.6)"
            fontFamily="Inter, sans-serif">Tracking</text>
        </g>
      </svg>
    </div>
  );
}
