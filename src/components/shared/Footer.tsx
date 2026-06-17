"use client";
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Globe, Mail, Phone, MapPin, Plane, Ship, Truck } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const LIVE_SHIPMENTS = [
  { id: "NX-88421", icon: Plane, from: "Dhaka",      to: "Dubai",     status: "In Transit",    color: "text-[#00C2FF]", dot: "bg-[#00C2FF]" },
  { id: "NX-77302", icon: Ship,  from: "Shanghai",   to: "Rotterdam", status: "On Schedule",   color: "text-green-400", dot: "bg-green-400" },
  { id: "NX-65190", icon: Truck, from: "Mumbai",     to: "Singapore", status: "Customs Check", color: "text-amber-400", dot: "bg-amber-400" },
  { id: "NX-54087", icon: Plane, from: "New York",   to: "London",    status: "Delivered",     color: "text-green-400", dot: "bg-green-400" },
  { id: "NX-43211", icon: Ship,  from: "Chittagong", to: "Sydney",    status: "In Transit",    color: "text-[#00C2FF]", dot: "bg-[#00C2FF]" },
]

export function Footer() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleRequestQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/customer/quotes");
    } else {
      router.push("/login?next=/customer/quotes");
    }
  };
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-white/5 relative overflow-hidden">

      {/* ── World map background ── */}
      <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.045]">
        <svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <path d="M 120 80 L 160 70 L 200 75 L 230 90 L 240 110 L 220 130 L 200 150 L 180 170 L 160 200 L 140 220 L 120 210 L 100 190 L 90 160 L 95 130 L 100 100 Z" fill="#00C2FF" />
          <path d="M 230 40 L 260 35 L 280 50 L 270 70 L 245 75 L 225 60 Z" fill="#00C2FF" />
          <path d="M 180 240 L 210 230 L 230 250 L 235 280 L 225 320 L 210 360 L 190 380 L 170 360 L 160 320 L 165 280 L 170 260 Z" fill="#00C2FF" />
          <path d="M 440 70 L 470 65 L 500 70 L 510 85 L 505 100 L 490 110 L 470 115 L 450 108 L 435 95 L 435 80 Z" fill="#00C2FF" />
          <path d="M 460 45 L 475 40 L 490 50 L 485 65 L 470 68 L 455 58 Z" fill="#00C2FF" />
          <path d="M 450 130 L 490 120 L 520 130 L 530 160 L 525 200 L 510 240 L 490 270 L 470 260 L 455 230 L 445 190 L 440 155 Z" fill="#00C2FF" />
          <path d="M 510 55 L 580 45 L 660 50 L 720 60 L 760 75 L 780 90 L 770 110 L 730 120 L 680 115 L 630 110 L 580 105 L 540 100 L 510 88 L 505 70 Z" fill="#00C2FF" />
          <path d="M 540 110 L 570 108 L 590 118 L 585 135 L 565 140 L 545 132 Z" fill="#00C2FF" />
          <path d="M 600 120 L 625 115 L 640 130 L 635 160 L 618 175 L 600 165 L 590 145 L 592 128 Z" fill="#00C2FF" />
          <path d="M 680 120 L 720 115 L 740 128 L 730 145 L 700 148 L 678 138 Z" fill="#00C2FF" />
          <path d="M 660 75 L 720 70 L 760 80 L 770 100 L 750 118 L 710 120 L 670 112 L 650 98 L 652 82 Z" fill="#00C2FF" />
          <path d="M 730 280 L 790 270 L 830 280 L 840 310 L 825 340 L 790 350 L 755 340 L 735 315 L 728 295 Z" fill="#00C2FF" />
          <path d="M 790 85 L 805 80 L 815 90 L 808 103 L 793 105 L 785 95 Z" fill="#00C2FF" />
          <path d="M 430 72 L 442 68 L 448 78 L 440 86 L 428 82 Z" fill="#00C2FF" />
          <line x1="0" y1="250" x2="1000" y2="250" stroke="#00C2FF" strokeWidth="0.5" strokeDasharray="4 8" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="#00C2FF" strokeWidth="0.5" strokeDasharray="4 8" />
          <line x1="0" y1="125" x2="1000" y2="125" stroke="#00C2FF" strokeWidth="0.3" strokeDasharray="2 12" />
          <line x1="0" y1="375" x2="1000" y2="375" stroke="#00C2FF" strokeWidth="0.3" strokeDasharray="2 12" />
          <line x1="250" y1="0" x2="250" y2="500" stroke="#00C2FF" strokeWidth="0.3" strokeDasharray="2 12" />
          <line x1="750" y1="0" x2="750" y2="500" stroke="#00C2FF" strokeWidth="0.3" strokeDasharray="2 12" />
        </svg>
      </div>

      {/* ── Moving vehicles animation ── */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#061422]/60 to-transparent" />
        {/* Ship 1 */}
        <div className="absolute bottom-2" style={{ animation: "footer-ship 28s linear infinite" }}>
          <svg width="90" height="32" viewBox="0 0 90 32" fill="none">
            <path d="M4 22 Q8 28 14 29 L76 29 Q82 28 86 22 Z" fill="rgba(26,58,92,0.7)" />
            <rect x="12" y="14" width="66" height="9" rx="1" fill="rgba(30,74,122,0.7)" />
            <rect x="16" y="8" width="10" height="7" rx="1" fill="rgba(192,57,43,0.8)" />
            <rect x="28" y="8" width="10" height="7" rx="1" fill="rgba(230,126,34,0.8)" />
            <rect x="40" y="8" width="10" height="7" rx="1" fill="rgba(41,128,185,0.8)" />
            <rect x="52" y="8" width="10" height="7" rx="1" fill="rgba(231,76,60,0.8)" />
            <rect x="10" y="4" width="10" height="11" rx="1" fill="rgba(13,44,78,0.8)" />
          </svg>
        </div>
        {/* Ship 2 */}
        <div className="absolute bottom-3" style={{ animation: "footer-ship 42s linear infinite", animationDelay: "-18s", opacity: 0.6 }}>
          <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
            <path d="M3 14 Q6 19 10 20 L50 20 Q54 19 57 14 Z" fill="rgba(26,58,92,0.6)" />
            <rect x="8" y="9" width="44" height="6" rx="1" fill="rgba(30,74,122,0.6)" />
            <rect x="10" y="5" width="7" height="5" rx="1" fill="rgba(192,57,43,0.7)" />
            <rect x="19" y="5" width="7" height="5" rx="1" fill="rgba(41,128,185,0.7)" />
            <rect x="28" y="5" width="7" height="5" rx="1" fill="rgba(231,76,60,0.7)" />
          </svg>
        </div>
        {/* Plane */}
        <div className="absolute" style={{ top: 4, animation: "footer-plane 18s linear infinite", animationDelay: "-6s" }}>
          <svg width="44" height="20" viewBox="0 0 80 38" fill="none" opacity="0.5">
            <ellipse cx="42" cy="19" rx="30" ry="7" fill="#b0c8f0" />
            <path d="M72 19 Q80 19 78 16 L72 13 Z" fill="#e0eeff" />
            <path d="M34 19 L16 4 L22 19 L16 34 L34 19Z" fill="#7aaee8" />
          </svg>
        </div>
        {/* Truck */}
        <div className="absolute bottom-2" style={{ animation: "footer-truck 22s linear infinite", animationDelay: "-10s" }}>
          <svg width="70" height="30" viewBox="0 0 88 42" fill="none" opacity="0.55">
            <rect x="2" y="10" width="54" height="24" rx="2" fill="rgba(26,58,92,0.8)" />
            <rect x="8" y="16" width="30" height="6" rx="1" fill="rgba(0,194,255,0.25)" />
            <path d="M56 18 L56 34 L82 34 L82 22 Q82 16 76 14 L60 14 Q56 14 56 18Z" fill="rgba(26,58,92,0.8)" />
            <path d="M60 16 Q60 14 64 14 L74 14 Q79 14 80 18 L80 22 L60 22 Z" fill="rgba(0,194,255,0.4)" />
            <circle cx="16" cy="36" r="4" fill="rgba(6,20,34,0.9)" stroke="rgba(58,106,154,0.8)" strokeWidth="1.5" />
            <circle cx="36" cy="36" r="4" fill="rgba(6,20,34,0.9)" stroke="rgba(58,106,154,0.8)" strokeWidth="1.5" />
            <circle cx="64" cy="36" r="4" fill="rgba(6,20,34,0.9)" stroke="rgba(58,106,154,0.8)" strokeWidth="1.5" />
            <circle cx="76" cy="36" r="4" fill="rgba(6,20,34,0.9)" stroke="rgba(58,106,154,0.8)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes footer-ship  { from { transform: translateX(-120px); } to { transform: translateX(105vw); } }
        @keyframes footer-plane { from { transform: translateX(-80px);  } to { transform: translateX(105vw); } }
        @keyframes footer-truck { from { transform: translateX(-100px); } to { transform: translateX(105vw); } }
      `}</style>

      {/* ── Live Tracking Map ── */}
      <div className="border-b border-white/5 px-6 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-green-400 font-semibold">Live Global Tracking</span>
            <span className="text-[10px] text-white/30 ml-auto font-mono">5 active shipments</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-white/10 relative" style={{ height: 260 }}>
              <iframe
                title="NexaCargo Live Tracking Map"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.85) saturate(1.2)" }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}&center=25,40&zoom=2&maptype=roadmap`}
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute flex flex-col items-center" style={{ top: "38%", left: "68%" }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] shadow-[0_0_8px_rgba(0,194,255,0.9)] animate-pulse" />
                  <span className="text-[8px] text-[#00C2FF] font-bold mt-0.5 whitespace-nowrap">NX-88421</span>
                </div>
                <div className="absolute flex flex-col items-center" style={{ top: "30%", left: "79%" }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.9)] animate-pulse" />
                  <span className="text-[8px] text-green-400 font-bold mt-0.5 whitespace-nowrap">NX-77302</span>
                </div>
                <div className="absolute flex flex-col items-center" style={{ top: "42%", left: "66%" }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
                  <span className="text-[8px] text-amber-400 font-bold mt-0.5 whitespace-nowrap">NX-65190</span>
                </div>
                <div className="absolute flex flex-col items-center" style={{ top: "28%", left: "24%" }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.9)] animate-pulse" />
                  <span className="text-[8px] text-green-400 font-bold mt-0.5 whitespace-nowrap">NX-54087</span>
                </div>
                <div className="absolute flex flex-col items-center" style={{ top: "40%", left: "70%" }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] shadow-[0_0_8px_rgba(0,194,255,0.9)] animate-pulse" />
                  <span className="text-[8px] text-[#00C2FF] font-bold mt-0.5 whitespace-nowrap">NX-43211</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {LIVE_SHIPMENTS.map(({ id, icon: Icon, from, to, status, color, dot }) => (
                <div key={id} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-white">{id}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse shrink-0`} />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-white/40 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate">{from} → {to}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold shrink-0 ${color}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main links grid ── */}
      <div className="py-12 px-6 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto w-full relative z-10">
        <div className="col-span-1">
          <span className="font-label-caps text-xs text-primary mb-6 block uppercase tracking-widest">NexaCargo Global</span>
          <p className="font-body-sm text-sm text-on-surface-variant max-w-xs mb-8">
            Redefining the logistics landscape through technological excellence and global integrity.
          </p>
          <div className="flex gap-6">
            <Link href="/about" title="About NexaCargo" className="text-on-surface-variant hover:text-tertiary transition-colors">
              <Globe className="w-5 h-5" />
            </Link>
            <Link href="/contact" title="Email Us" className="text-on-surface-variant hover:text-tertiary transition-colors">
              <Mail className="w-5 h-5" />
            </Link>
            <Link href="/contact" title="Call Us" className="text-on-surface-variant hover:text-tertiary transition-colors">
              <Phone className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <div>
          <h5 className="font-title-md text-xl text-on-surface mb-6 font-semibold">Company</h5>
          <ul className="space-y-4">
            <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/terms-of-service">Terms of Service</Link></li>
            <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/careers">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-title-md text-xl text-on-surface mb-6 font-semibold">Network</h5>
          <ul className="space-y-4">
            <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/global-offices">Global Offices</Link></li>
            <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/warehouse-network">Warehouse Network</Link></li>
            <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/customs-hubs">Customs Hubs</Link></li>
            <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/partners">Partners</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-title-md text-xl text-on-surface mb-6 font-semibold">Support</h5>
          <ul className="space-y-4">
            <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/contact">Contact</Link></li>
            <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/contact">Help Center</Link></li>
            <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/customer/track">Track Status</Link></li>
            <li><a href="/customer/quotes" onClick={handleRequestQuote} className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors cursor-pointer">Request Quote</a></li>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="px-6 pb-10 max-w-7xl mx-auto w-full relative z-10">
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-body-sm text-sm text-on-surface-variant">© 2026 NexaCargo Global Logistics. All rights reserved.</span>
          <div className="flex gap-8">
            <span className="font-label-caps text-[10px] text-on-surface-variant/30 uppercase tracking-widest">ISO 9001:2015 CERTIFIED</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant/30 uppercase tracking-widest">GDPR COMPLIANT</span>
          </div>
        </div>
      </div>

    </footer>
  )
}
