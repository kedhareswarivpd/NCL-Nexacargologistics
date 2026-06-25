"use client";

import { useEffect, useRef } from "react";

const SIZE = 520;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 200;

// Realistic continent outlines
const CONTINENTS: [number, number][][] = [
  // North America
  [
    [-168,65],[-165,60],[-155,58],[-145,60],[-135,55],[-125,50],[-125,40],
    [-120,35],[-115,30],[-110,22],[-105,20],[-100,15],[-90,15],[-85,10],
    [-80,8],[-82,15],[-88,20],[-82,23],[-80,25],[-82,30],[-75,35],[-70,42],
    [-65,45],[-60,50],[-60,55],[-65,60],[-75,62],[-80,68],[-90,70],[-110,68],
    [-130,65],[-150,68],[-168,65],
  ],
  // South America
  [
    [-80,10],[-76,8],[-72,10],[-68,8],[-60,3],[-50,-5],[-40,-5],[-35,-7],
    [-38,-15],[-40,-22],[-45,-30],[-50,-40],[-60,-48],[-65,-53],[-72,-55],
    [-75,-50],[-73,-40],[-72,-30],[-75,-20],[-80,-10],[-81,0],[-80,10],
  ],
  // Europe + Asia
  [
    [-10,36],[-9,42],[-5,43],[0,45],[0,50],[5,50],[5,53],[10,54],[10,58],
    [15,58],[20,62],[20,68],[25,70],[35,70],[45,68],[55,67],[65,68],[75,70],
    [85,72],[95,74],[105,75],[115,74],[125,73],[135,74],[145,72],[155,73],
    [165,70],[175,68],[180,64],[175,58],[165,55],[160,50],[150,48],[142,42],
    [140,38],[135,35],[130,37],[125,34],[120,36],[122,30],[120,22],[115,18],
    [110,20],[108,15],[105,10],[100,5],[96,7],[97,15],[90,15],[88,22],[80,22],
    [78,12],[77,8],[74,15],[72,20],[68,23],[65,25],[60,25],[55,20],[50,15],
    [45,18],[40,25],[35,30],[30,31],[27,35],[28,40],[25,41],[22,38],[18,40],
    [14,43],[12,40],[5,42],[2,38],[-5,36],[-10,36],
  ],
  // Africa
  [
    [-17,15],[-15,18],[-10,25],[-5,30],[0,33],[5,36],[10,36],[15,33],[20,31],
    [25,32],[30,31],[32,28],[34,25],[33,18],[43,12],[51,11],[48,5],[44,-5],
    [40,-15],[35,-25],[30,-34],[25,-34],[18,-34],[13,-25],[10,-15],[10,-5],
    [5,0],[-5,5],[-12,5],[-17,15],
  ],
  // Australia
  [
    [113,-22],[115,-18],[122,-15],[130,-11],[136,-11],[140,-15],[142,-10],
    [146,-15],[153,-25],[150,-32],[151,-38],[145,-38],[140,-35],[135,-38],
    [125,-33],[117,-35],[113,-30],[113,-22],
  ],
  // Greenland
  [[-70,70],[-65,75],[-60,80],[-40,82],[-20,80],[-25,75],[-30,68],[-40,60],[-55,60],[-70,70]],
  // Antarctica (partial)
  [
    [-180,-70],[-150,-72],[-120,-68],[-90,-70],[-60,-72],[-30,-68],[0,-70],
    [30,-68],[60,-70],[90,-68],[120,-70],[150,-72],[180,-70],[180,-90],[-180,-90],[-180,-70],
  ],
  // Great Britain
  [[-10,50],[-9,54],[-6,56],[-5,59],[-2,59],[0,55],[2,52],[0,50],[-6,50],[-10,50]],
  // Japan
  [[130,30],[132,33],[136,36],[140,38],[143,43],[146,45],[144,46],[140,43],[138,38],[132,34],[130,30]],
  // New Zealand
  [[166,-46],[168,-44],[173,-40],[176,-37],[178,-38],[175,-42],[172,-45],[168,-48],[166,-46]],
  // Iceland
  [[-24,64],[-22,66],[-14,66],[-15,64],[-20,63],[-24,64]],
  // Madagascar
  [[45,-25],[48,-20],[50,-12],[49,-12],[46,-18],[43,-25],[45,-25]],
  // Borneo
  [[108,4],[110,2],[115,1],[117,4],[116,7],[114,6],[110,4],[108,4]],
  // Sumatra
  [[96,5],[100,3],[106,0],[106,-4],[103,-5],[100,-2],[98,1],[96,5]],
  // Sri Lanka
  [[80,10],[82,9],[82,6],[80,6],[80,10]],
  // Philippines
  [[120,18],[122,16],[122,12],[120,10],[118,12],[118,16],[120,18]],
];

// City hubs with glow colors
const CITIES = [
  { lon: 72.8777,  lat: 19.076,  label: "MUM", color: "#FFD700" },
  { lon: -74.006,  lat: 40.7128, label: "NYC", color: "#00C2FF" },
  { lon: -0.1278,  lat: 51.5074, label: "LON", color: "#00C2FF" },
  { lon: 139.6917, lat: 35.6895, label: "TYO", color: "#00FF88" },
  { lon: 151.2093, lat: -33.868, label: "SYD", color: "#1E88E5" },
  { lon: 55.2708,  lat: 25.2048, label: "DXB", color: "#FF7043" },
  { lon: 103.8198, lat: 1.3521,  label: "SIN", color: "#00FF88" },
  { lon: 2.3522,   lat: 48.8566, label: "PAR", color: "#00C2FF" },
  { lon: 116.3974, lat: 39.9042, label: "BEJ", color: "#FF4444" },
  { lon: -43.1729, lat: -22.906, label: "RIO", color: "#FFD700" },
  { lon: -99.1332, lat: 19.4326, label: "MEX", color: "#FF7043" },
  { lon: 37.6173,  lat: 55.7558, label: "MOS", color: "#00C2FF" },
];



function project(lon: number, lat: number, rot: number) {
  const lam = (lon * Math.PI) / 180 + rot;
  const phi = (lat * Math.PI) / 180;
  const x = Math.cos(phi) * Math.sin(lam);
  const y = Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(lam);
  return { x, y, z, px: CX + x * R, py: CY - y * R };
}



export function GlobeAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    let rot = 0;
    let pulse = 0;
    let animId: number;

    // Pre-generate star field
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * SIZE,
      y: Math.random() * SIZE,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.7 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      rot += 0.003;
      pulse += 0.04;

      // ── 1. Deep space background ──
      const bg = ctx.createRadialGradient(CX, CY, R * 0.4, CX, CY, SIZE * 0.75);
      bg.addColorStop(0, "#050e1f");
      bg.addColorStop(1, "#010610");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Stars
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.a})`;
        ctx.fill();
      });

      // ── 2. Atmosphere glow (outer halo) ──
      const atmGlow = ctx.createRadialGradient(CX, CY, R * 0.92, CX, CY, R * 1.22);
      atmGlow.addColorStop(0, "rgba(30,100,255,0.18)");
      atmGlow.addColorStop(0.4, "rgba(0,140,255,0.09)");
      atmGlow.addColorStop(1, "rgba(0,60,180,0)");
      ctx.beginPath();
      ctx.arc(CX, CY, R * 1.22, 0, Math.PI * 2);
      ctx.fillStyle = atmGlow;
      ctx.fill();

      // ── 3. Ocean base ──
      const ocean = ctx.createRadialGradient(CX - R * 0.3, CY - R * 0.3, R * 0.1, CX, CY, R);
      ocean.addColorStop(0,   "#1a5276");
      ocean.addColorStop(0.3, "#0e3460");
      ocean.addColorStop(0.7, "#071d3a");
      ocean.addColorStop(1,   "#030d1e");
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fillStyle = ocean;
      ctx.shadowColor = "rgba(0,100,255,0.3)";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.restore();

      // Thin atmosphere rim
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(80,160,255,0.55)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // ── 4. Clip everything to globe ──
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.clip();

      // Grid lines (latitude/longitude)
      ctx.strokeStyle = "rgba(80,160,255,0.07)";
      ctx.lineWidth = 0.7;
      for (let lon = -180; lon < 180; lon += 20) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 4) {
          const pt = project(lon, lat, rot);
          if (pt.z >= 0) {
            first ? ctx.moveTo(pt.px, pt.py) : ctx.lineTo(pt.px, pt.py);
            first = false;
          } else { first = true; }
        }
        ctx.stroke();
      }
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 4) {
          const pt = project(lon, lat, rot);
          if (pt.z >= 0) {
            first ? ctx.moveTo(pt.px, pt.py) : ctx.lineTo(pt.px, pt.py);
            first = false;
          } else { first = true; }
        }
        ctx.stroke();
      }

      // ── 5. Continent fills ──
      for (const continent of CONTINENTS) {
        const pts = continent.map(([lon, lat]) => project(lon, lat, rot));
        const visible = pts.some(p => p.z >= 0);
        if (!visible) continue;

        ctx.save();
        ctx.beginPath();
        pts.forEach((pt, i) => {
          if (pt.z >= 0) {
            i === 0 || pts[i-1].z < 0 ? ctx.moveTo(pt.px, pt.py) : ctx.lineTo(pt.px, pt.py);
          }
        });
        ctx.closePath();

        // Land gradient — realistic green/brown/tan tones
        const landGrad = ctx.createLinearGradient(CX - R, CY - R, CX + R, CY + R);
        landGrad.addColorStop(0,   "#2d5a1b");
        landGrad.addColorStop(0.3, "#3a7023");
        landGrad.addColorStop(0.6, "#4a8030");
        landGrad.addColorStop(0.8, "#8b6914");
        landGrad.addColorStop(1,   "#6b4f10");
        ctx.fillStyle = landGrad;
        ctx.fill();

        // Continent border
        ctx.strokeStyle = "rgba(80,160,60,0.35)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }

      // ── 6. Ocean depth shimmer ──
      const shimmer = ctx.createRadialGradient(CX - R*0.4, CY - R*0.4, 0, CX, CY, R);
      shimmer.addColorStop(0, "rgba(100,180,255,0.06)");
      shimmer.addColorStop(0.5, "rgba(0,80,180,0.04)");
      shimmer.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shimmer;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fill();

      // ── 7. Polar ice caps ──
      for (const [poleLat, color] of [[85, "rgba(220,240,255,0.75)"], [-80, "rgba(200,230,255,0.6)"]] as [number,string][]) {
        ctx.save();
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 5) {
          const pt = project(lon, poleLat, rot);
          if (pt.z >= 0) {
            first ? ctx.moveTo(pt.px, pt.py) : ctx.lineTo(pt.px, pt.py);
            first = false;
          }
        }
        const capCenter = project(0, poleLat > 0 ? 90 : -90, rot);
        if (capCenter.z >= 0) ctx.lineTo(capCenter.px, capCenter.py);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }

      // ── 8. City night lights (subtle dots on dark side) ──
      CITIES.forEach(city => {
        const pt = project(city.lon, city.lat, rot);
        if (pt.z < 0.05) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = city.color;
        ctx.shadowColor = city.color;
        ctx.shadowBlur = 10;
        ctx.fill();

        // Pulse ring
        const pr = 2.5 + ((pulse * 2.5 + CITIES.indexOf(city) * 1.3) % 10);
        const po = Math.max(0, 1 - (pr - 2.5) / 10);
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, pr, 0, Math.PI * 2);
        ctx.strokeStyle = `${city.color}${Math.floor(po * 200).toString(16).padStart(2,"0")}`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      });



      // End clip
      ctx.restore();

      // ── 10. Specular highlight (sunlight reflection) ──
      ctx.save();
      const spec = ctx.createRadialGradient(
        CX - R * 0.42, CY - R * 0.42, R * 0.05,
        CX - R * 0.3,  CY - R * 0.3,  R * 0.75
      );
      spec.addColorStop(0,   "rgba(255,255,255,0.22)");
      spec.addColorStop(0.3, "rgba(200,230,255,0.07)");
      spec.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();
      ctx.restore();

      // ── 11. Night-side shadow (terminator) ──
      ctx.save();
      const shadow = ctx.createRadialGradient(
        CX + R * 0.35, CY + R * 0.2, R * 0.15,
        CX + R * 0.5,  CY + R * 0.4, R * 0.9
      );
      shadow.addColorStop(0,   "rgba(0,0,0,0)");
      shadow.addColorStop(0.45,"rgba(0,0,10,0.15)");
      shadow.addColorStop(0.75,"rgba(0,0,10,0.55)");
      shadow.addColorStop(1,   "rgba(0,0,10,0.80)");
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fillStyle = shadow;
      ctx.fill();
      ctx.restore();

      // ── 12. Thin atmosphere inner rim ──
      ctx.save();
      const rim = ctx.createRadialGradient(CX, CY, R * 0.88, CX, CY, R * 1.04);
      rim.addColorStop(0,   "rgba(0,0,0,0)");
      rim.addColorStop(0.5, "rgba(40,120,255,0.12)");
      rim.addColorStop(1,   "rgba(10,60,200,0.25)");
      ctx.beginPath();
      ctx.arc(CX, CY, R * 1.04, 0, Math.PI * 2);
      ctx.fillStyle = rim;
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative flex items-center justify-center select-none pointer-events-none"
      style={{ width: SIZE, height: SIZE, maxWidth: "100%" }}>
      {/* Outer glow rings */}
      <div className="absolute rounded-full animate-pulse pointer-events-none"
        style={{ inset: "-8px", border: "1px solid rgba(0,194,255,0.12)" }} />
      <div className="absolute rounded-full pointer-events-none animate-spin"
        style={{ inset: "-18px", border: "1px solid rgba(30,136,229,0.07)", animationDuration: "40s" }} />
      <div className="absolute rounded-full pointer-events-none animate-spin"
        style={{ inset: "-32px", border: "1px solid rgba(0,194,255,0.04)", animationDuration: "22s", animationDirection: "reverse" }} />

      {/* Globe canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: SIZE, height: SIZE }}
        className="relative z-10"
      />
    </div>
  );
}
