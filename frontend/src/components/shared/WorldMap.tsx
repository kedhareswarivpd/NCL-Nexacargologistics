"use client";

import { motion } from "framer-motion";
import { MapPin, Globe, Zap } from "lucide-react";

const OFFICES = [
  { city: "New York",   region: "Americas HQ",    x: "18%",  y: "34%", primary: true  },
  { city: "London",     region: "Europe HQ",      x: "44%",  y: "26%", primary: true  },
  { city: "Dubai",      region: "Middle East Hub", x: "57%",  y: "38%", primary: true  },
  { city: "Singapore",  region: "Asia Pacific HQ", x: "74%",  y: "54%", primary: true  },
  { city: "Shanghai",   region: "China Hub",       x: "77%",  y: "33%", primary: false },
  { city: "São Paulo",  region: "Latin America",   x: "26%",  y: "64%", primary: false },
  { city: "Lagos",      region: "Africa Hub",      x: "47%",  y: "53%", primary: false },
  { city: "Sydney",     region: "Oceania Hub",     x: "80%",  y: "70%", primary: false },
  { city: "Tokyo",      region: "Japan Hub",       x: "81%",  y: "31%", primary: false },
  { city: "Mumbai",     region: "India Hub",       x: "62%",  y: "44%", primary: false },
  { city: "Rotterdam",  region: "Port Hub",        x: "46%",  y: "24%", primary: false },
  { city: "Los Angeles",region: "West Coast Hub",  x: "11%",  y: "36%", primary: false },
];

/* Animated SVG route line between two % positions */
function RouteLine({ x1, y1, x2, y2, delay = 0 }: { x1: number; y1: number; y2: number; x2: number; delay?: number }) {
  const mx = (x1 + x2) / 2;
  const my = Math.min(y1, y2) - 8;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 6;

  return (
    <motion.path d={d} fill="none"
      stroke="rgba(0,194,255,0.25)" strokeWidth="0.6"
      strokeDasharray={`${len} ${len}`}
      initial={{ strokeDashoffset: len }}
      animate={{ strokeDashoffset: 0 }}
      transition={{ duration: 2.5, delay, ease: "easeInOut", repeat: Infinity, repeatDelay: 4 }}
    />
  );
}

export default function WorldMap() {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: 540 }}>

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#061830] via-[#0a1e38] to-[#06101e]" />

      {/* ── Grid lines ── */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(0,194,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,255,1) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* ── Radial glow centres ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(0,93,183,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_30%_at_18%_34%,rgba(0,194,255,0.08),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_30%_at_74%_54%,rgba(0,194,255,0.08),transparent)]" />

      {/* ── World map SVG ── */}
      <svg
        viewBox="0 0 100 56"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="landGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#1a3a5c" />
            <stop offset="100%" stopColor="#0d2040" />
          </radialGradient>
          <filter id="landGlow">
            <feGaussianBlur stdDeviation="0.3" />
            <feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor="#00C2FF" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* ── Continents ── */}
        {/* North America */}
        <path d="M8,14 L14,13 L18,15 L20,18 L19,22 L17,25 L15,28 L14,32 L12,34 L10,33 L8,30 L7,26 L7,22 L8,18 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.2)" strokeWidth="0.15" opacity="0.9" />
        {/* Greenland */}
        <path d="M18,7 L22,6 L24,8 L23,11 L20,12 L17,11 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.15)" strokeWidth="0.1" opacity="0.8" />
        {/* South America */}
        <path d="M20,35 L24,34 L27,36 L28,40 L27,45 L24,49 L21,50 L18,47 L17,42 L18,38 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.2)" strokeWidth="0.15" opacity="0.9" />
        {/* Europe */}
        <path d="M42,13 L46,12 L50,13 L52,16 L50,19 L46,20 L43,19 L41,16 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.2)" strokeWidth="0.15" opacity="0.9" />
        {/* UK */}
        <path d="M43,14 L44,13 L45,14 L44,16 L43,15 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.15)" strokeWidth="0.1" opacity="0.85" />
        {/* Africa */}
        <path d="M44,22 L49,21 L53,23 L55,27 L54,33 L51,38 L47,41 L44,39 L42,34 L41,28 L42,24 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.2)" strokeWidth="0.15" opacity="0.9" />
        {/* Asia (main) */}
        <path d="M52,10 L60,9 L68,10 L74,12 L78,15 L80,18 L78,22 L72,24 L65,25 L58,23 L53,20 L50,16 L51,12 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.2)" strokeWidth="0.15" opacity="0.9" />
        {/* India */}
        <path d="M60,24 L64,23 L67,25 L67,30 L64,33 L61,31 L59,27 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.15)" strokeWidth="0.12" opacity="0.88" />
        {/* SE Asia */}
        <path d="M70,28 L75,27 L78,29 L78,33 L75,35 L72,34 L70,31 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.15)" strokeWidth="0.12" opacity="0.88" />
        {/* Japan */}
        <path d="M80,19 L82,18 L83,20 L82,22 L80,21 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.15)" strokeWidth="0.1" opacity="0.85" />
        {/* Australia */}
        <path d="M73,40 L80,39 L85,41 L86,46 L83,50 L78,51 L73,49 L71,45 L72,41 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.2)" strokeWidth="0.15" opacity="0.9" />
        {/* New Zealand */}
        <path d="M86,46 L87,44 L88,46 L87,48 Z"
          fill="url(#landGrad)" stroke="rgba(0,194,255,0.1)" strokeWidth="0.1" opacity="0.7" />

        {/* ── Ocean shimmer lines ── */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.line key={i}
            x1="0" y1={10 + i * 10} x2="100" y2={10 + i * 10}
            stroke="rgba(0,120,200,0.04)" strokeWidth="0.3"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.6 }}
          />
        ))}

        {/* ── Animated route connections between major hubs ── */}
        <RouteLine x1={18} y1={34} x2={44} y2={24} delay={0}   />
        <RouteLine x1={44} y1={24} x2={57} y2={38} delay={0.5} />
        <RouteLine x1={57} y1={38} x2={74} y2={54} delay={1}   />
        <RouteLine x1={18} y1={34} x2={26} y2={64} delay={1.5} />
        <RouteLine x1={74} y1={54} x2={77} y2={33} delay={0.8} />
        <RouteLine x1={77} y1={33} x2={81} y2={31} delay={1.2} />
        <RouteLine x1={57} y1={38} x2={62} y2={44} delay={0.3} />
        <RouteLine x1={44} y1={24} x2={47} y2={53} delay={1.8} />
        <RouteLine x1={11} y1={36} x2={18} y2={34} delay={0.2} />
        <RouteLine x1={74} y1={54} x2={80} y2={70} delay={1.4} />
      </svg>

      {/* ── Office pins ── */}
      {OFFICES.map((office, idx) => (
        <div key={office.city}
          className="absolute"
          style={{ left: office.x, top: office.y, transform: "translate(-50%,-50%)" }}>

          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full border"
            style={{
              borderColor: office.primary ? "rgba(0,194,255,0.6)" : "rgba(30,136,229,0.4)",
              width: office.primary ? 36 : 28,
              height: office.primary ? 36 : 28,
              left: "50%", top: "50%",
              transform: "translate(-50%,-50%)",
            }}
            animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: idx * 0.22, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border"
            style={{
              borderColor: office.primary ? "rgba(0,194,255,0.3)" : "rgba(30,136,229,0.2)",
              width: office.primary ? 24 : 18,
              height: office.primary ? 24 : 18,
              left: "50%", top: "50%",
              transform: "translate(-50%,-50%)",
            }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: idx * 0.22 + 0.5, ease: "easeOut" }}
          />

          {/* Pin dot */}
          <motion.div
            className="relative z-10 rounded-full flex items-center justify-center cursor-pointer group"
            style={{
              width: office.primary ? 14 : 10,
              height: office.primary ? 14 : 10,
              background: office.primary
                ? "radial-gradient(circle at 35% 35%, #00C2FF, #1E88E5)"
                : "radial-gradient(circle at 35% 35%, #4fa3ff, #1a4a8a)",
              boxShadow: office.primary
                ? "0 0 14px 4px rgba(0,194,255,0.6), 0 0 4px rgba(0,194,255,0.9)"
                : "0 0 8px 2px rgba(30,136,229,0.5)",
            }}
            whileHover={{ scale: 1.5 }}
            animate={office.primary ? { boxShadow: ["0 0 8px 3px rgba(0,194,255,0.5)", "0 0 18px 6px rgba(0,194,255,0.8)", "0 0 8px 3px rgba(0,194,255,0.5)"] } : {}}
            transition={office.primary ? { duration: 2, repeat: Infinity } : {}}
          >
            {office.primary && <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />}
          </motion.div>

          {/* Tooltip on hover */}
          <motion.div
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-none z-20
                       bg-[#0a1628]/95 backdrop-blur border border-[#00C2FF]/30 rounded-xl px-3 py-2
                       whitespace-nowrap opacity-0 group-hover:opacity-100 shadow-[0_0_20px_rgba(0,194,255,0.2)]"
            initial={{ opacity: 0, y: 4 }}
            whileHover={{ opacity: 1, y: 0 }}
          >
            <p className="text-white text-xs font-bold">{office.city}</p>
            <p className="text-[#00C2FF] text-[10px]">{office.region}</p>
          </motion.div>
        </div>
      ))}

      {/* ── Stat overlays ── */}
      <div className="absolute top-6 left-6 flex flex-col gap-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="flex items-center gap-2.5 bg-[#0a1628]/85 backdrop-blur border border-[#00C2FF]/25 rounded-xl px-4 py-2.5 shadow-[0_0_20px_rgba(0,194,255,0.1)]"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          <div>
            <p className="text-white text-sm font-bold">140+ Countries</p>
            <p className="text-[#00C2FF] text-[10px] uppercase tracking-wider">Global Coverage</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
          className="flex items-center gap-2.5 bg-[#0a1628]/85 backdrop-blur border border-[#1E88E5]/25 rounded-xl px-4 py-2.5"
        >
          <Zap className="w-4 h-4 text-[#00C2FF] shrink-0" />
          <div>
            <p className="text-white text-sm font-bold">12 Major Hubs</p>
            <p className="text-[#00C2FF] text-[10px] uppercase tracking-wider">Active Offices</p>
          </div>
        </motion.div>
      </div>

      {/* ── Centre overlay card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center
                   bg-[#0a1628]/80 backdrop-blur-xl border border-[#00C2FF]/25
                   rounded-2xl px-8 py-6 shadow-[0_0_40px_rgba(0,194,255,0.15)]"
      >
        <div className="w-12 h-12 rounded-xl bg-[#1E88E5]/20 border border-[#1E88E5]/30 flex items-center justify-center mx-auto mb-3">
          <Globe className="w-6 h-6 text-[#00C2FF]" />
        </div>
        <h3 className="text-white font-bold text-xl mb-1">Global Presence</h3>
        <p className="text-[#b8cce8] text-sm mb-4 max-w-xs">
          Operating across 140+ countries with local expertise at every major port.
        </p>
        <div className="flex items-center justify-center gap-6 border-t border-white/8 pt-4">
          <div className="text-center">
            <p className="text-white font-bold text-lg">500K+</p>
            <p className="text-[#00C2FF] text-[10px] uppercase tracking-wider">Shipments</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-white font-bold text-lg">98%</p>
            <p className="text-[#00C2FF] text-[10px] uppercase tracking-wider">On-Time</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-white font-bold text-lg">24/7</p>
            <p className="text-[#00C2FF] text-[10px] uppercase tracking-wider">Support</p>
          </div>
        </div>
      </motion.div>

      {/* ── Bottom live indicator ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        className="absolute bottom-5 right-6 flex items-center gap-2
                   bg-[#0a1628]/80 backdrop-blur border border-white/10 rounded-full px-4 py-2"
      >
        <MapPin className="w-3.5 h-3.5 text-[#00C2FF]" />
        <span className="text-[11px] text-white/70 uppercase tracking-widest font-semibold">
          {OFFICES.length} offices online
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      </motion.div>

    </section>
  );
}
