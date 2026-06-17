"use client";

import { useState, useEffect, useRef } from "react";
import { FileSignature, CheckCircle2, Clock, Send, Zap, Ship, Plane, Truck, Package, ArrowRight, Shield, ShieldCheck, ShieldAlert, ShieldX, ArrowLeft, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// ── Route analysis helpers ────────────────────────────────────────────────────

const LANDLOCKED = new Set([
  "afghanistan","andorra","armenia","austria","azerbaijan","belarus","bhutan",
  "bolivia","botswana","burkina faso","burundi","central african republic",
  "chad","czech republic","czechia","ethiopia","hungary","kazakhstan",
  "kosovo","kyrgyzstan","laos","lesotho","liechtenstein","luxembourg",
  "malawi","mali","moldova","mongolia","nepal","niger","north macedonia",
  "paraguay","rwanda","san marino","serbia","slovakia","south sudan",
  "swaziland","eswatini","switzerland","tajikistan","turkmenistan","uganda",
  "uzbekistan","vatican","zambia","zimbabwe",
]);

const CONTINENT_MAP: [string, string[]][] = [
  ["asia",     ["china","shanghai","beijing","hong kong","japan","tokyo","osaka","korea","seoul","busan","singapore","malaysia","kuala lumpur","indonesia","jakarta","thailand","bangkok","vietnam","hanoi","ho chi minh","india","mumbai","delhi","chennai","kolkata","bangladesh","dhaka","chittagong","pakistan","karachi","lahore","sri lanka","colombo","nepal","kathmandu","philippines","manila","taiwan","taipei","myanmar","yangon","cambodia","phnom penh","laos","vientiane","mongolia","ulaanbaatar","afghanistan","kabul","uzbekistan","tashkent","kazakhstan","almaty","astana"]],
  ["europe",   ["uk","united kingdom","london","manchester","germany","hamburg","frankfurt","berlin","munich","france","paris","lyon","marseille","netherlands","rotterdam","amsterdam","spain","madrid","barcelona","valencia","italy","rome","milan","naples","genoa","poland","warsaw","gdansk","belgium","antwerp","brussels","sweden","stockholm","gothenburg","norway","oslo","denmark","copenhagen","aarhus","finland","helsinki","switzerland","zurich","geneva","austria","vienna","turkey","istanbul","izmir","portugal","lisbon","porto","greece","athens","piraeus","romania","bucharest","constanta","ukraine","odessa","kyiv","russia","moscow","st petersburg","vladivostok","croatia","rijeka","slovenia","koper","hungary","budapest","czech","prague","slovakia","bratislava"]],
  ["namerica", ["usa","united states","new york","los angeles","chicago","houston","miami","seattle","boston","savannah","long beach","baltimore","norfolk","canada","toronto","vancouver","montreal","halifax","mexico","mexico city","veracruz","manzanillo","panama","colon"]],
  ["samerica", ["brazil","sao paulo","santos","rio","argentina","buenos aires","rosario","chile","santiago","valparaiso","colombia","bogota","cartagena","peru","lima","callao","ecuador","guayaquil","venezuela","caracas","la guaira","uruguay","montevideo"]],
  ["mideast",  ["uae","dubai","abu dhabi","jebel ali","saudi","riyadh","jeddah","dammam","qatar","doha","kuwait","bahrain","oman","muscat","salalah","iraq","baghdad","basra","israel","tel aviv","haifa","jordan","aqaba","iran","tehran","bandar abbas","egypt","cairo","alexandria","port said"]],
  ["africa",   ["nigeria","lagos","apapa","kenya","nairobi","mombasa","south africa","johannesburg","durban","cape town","ethiopia","addis ababa","ghana","accra","tema","tanzania","dar es salaam","mozambique","maputo","senegal","dakar","morocco","casablanca","tangier","tunisia","tunis","algeria","algiers","angola","luanda","cameroon","douala","ivory coast","abidjan"]],
  ["oceania",  ["australia","sydney","melbourne","brisbane","perth","adelaide","fremantle","new zealand","auckland","wellington","fiji","suva","papua new guinea","port moresby"]],
];

function getContinent(place: string): string | null {
  const p = place.toLowerCase();
  for (const [continent, keys] of CONTINENT_MAP) {
    if (keys.some(k => p.includes(k))) return continent;
  }
  return null;
}

function isLandlocked(place: string): boolean {
  const p = place.toLowerCase();
  return [...LANDLOCKED].some(l => p.includes(l));
}

type RouteMode = { mode: "road" | "sea" | "air"; available: boolean; reason: string; transit: string; cost: string; co2: string; };

function analyseRoute(origin: string, dest: string): RouteMode[] | null {
  if (origin.trim().length < 3 || dest.trim().length < 3) return null;
  const co = getContinent(origin);
  const cd = getContinent(dest);
  const sameContinent = co !== null && cd !== null && co === cd;
  const crossOcean = co !== null && cd !== null && !sameContinent;
  const originLocked = isLandlocked(origin);
  const destLocked   = isLandlocked(dest);
  const seaAvailable = !(originLocked && destLocked);

  return [
    {
      mode: "road",
      available: sameContinent,
      reason: sameContinent
        ? "Both locations are on the same continent — overland trucking is possible."
        : crossOcean
        ? "Road transport is not possible across oceans."
        : "Could not determine if both locations share a land route.",
      transit: "3 – 14 days",
      cost: "$",
      co2: "Medium",
    },
    {
      mode: "sea",
      available: seaAvailable,
      reason: seaAvailable
        ? "Sea freight is available via international shipping lanes."
        : "Both locations are landlocked — sea freight is not available.",
      transit: "15 – 45 days",
      cost: "$",
      co2: "Low",
    },
    {
      mode: "air",
      available: true,
      reason: "Air freight is available to any destination worldwide.",
      transit: "1 – 5 days",
      cost: "$$$",
      co2: "High",
    },
  ];
}

const MODE_META = {
  road: { icon: Truck,  label: "Road (Overland)",  color: "text-green-400",  border: "border-green-400/30",  bg: "bg-green-400/5"  },
  sea:  { icon: Ship,   label: "Sea (Waterways)",   color: "text-blue-400",   border: "border-blue-400/30",   bg: "bg-blue-400/5"   },
  air:  { icon: Plane,  label: "Air (Airways)",     color: "text-[#00C2FF]", border: "border-[#00C2FF]/30", bg: "bg-[#00C2FF]/5" },
};

// ─────────────────────────────────────────────────────────────────────────────

const SERVICES = [
  { icon: Ship,    label: "Sea Freight",  desc: "FCL & LCL container shipping worldwide",       type: "FCL 20FT",      color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { icon: Plane,   label: "Air Freight",  desc: "Express air cargo for time-sensitive goods",   type: "Air Freight",   color: "text-[#00C2FF] bg-[#00C2FF]/10 border-[#00C2FF]/20" },
  { icon: Package, label: "Bulk Cargo",   desc: "Cost-effective bulk and breakbulk shipping",   type: "Bulk",          color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
];

const INSURANCE_PLANS = [
  {
    id: "None",
    name: "No Insurance",
    desc: "Carrier liability only",
    rate: "0.00%",
    icon: ShieldX,
    color: "text-on-surface-variant bg-white/5 border-white/10"
  },
  {
    id: "Basic",
    name: "Basic Cover",
    desc: "Up to $50,000 cargo value",
    rate: "0.35%",
    icon: Shield,
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20"
  },
  {
    id: "Standard",
    name: "Standard Cover",
    desc: "Up to $150,000 cargo value",
    rate: "0.45%",
    icon: ShieldCheck,
    color: "text-tertiary bg-tertiary/10 border-tertiary/30",
    recommended: true
  },
  {
    id: "Premium",
    name: "Premium Cover",
    desc: "Up to $500,000 cargo value",
    rate: "0.60%",
    icon: ShieldAlert,
    color: "text-secondary bg-secondary/10 border-secondary/20"
  }
];

export default function RequestQuotesPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ origin: "", destination: "", type: "FCL 20FT", weight: "", date: "", insurance: "No Insurance", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quotes, setQuotes] = useState<any[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const routeModes = analyseRoute(form.origin, form.destination);

  const selectService = (type: string) => {
    setForm(p => ({ ...p, type }));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`quotes_${user.id}`);
      if (stored) {
        setQuotes(JSON.parse(stored));
      }
    }
  }, [user?.id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.origin.trim())      e.origin      = "Please fill out this field";
    if (!form.destination.trim()) e.destination = "Please fill out this field";
    if (!form.weight.trim())      e.weight      = "Please fill out this field";
    if (!form.date.trim())        e.date        = "Please fill out this field";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const newQuote = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      origin: form.origin,
      destination: form.destination,
      type: form.type,
      weight: form.weight,
      date: form.date,
      insurance: form.insurance,
      notes: form.notes,
      status: "Pending Review",
      createdAt: new Date().toISOString(),
    };

    const updated = [newQuote, ...quotes];
    setQuotes(updated);
    if (user?.id) {
      localStorage.setItem(`quotes_${user.id}`, JSON.stringify(updated));
    }

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setForm({ origin: "", destination: "", type: "FCL 20FT", weight: "", date: "", insurance: "No Insurance", notes: "" });
  };

  return (
    <div className="space-y-6 page-enter">
      <Link href="/customer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
        <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
        <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
      </Link>
      <div>
        <p className="text-xs uppercase tracking-widest text-tertiary">Customer Portal</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Request a Quote</h1>
        <p className="text-sm text-on-surface-variant mt-1">Instant quotes for shipping services — get pricing within 24 hours.</p>
      </div>

      {/* Service highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SERVICES.map(({ icon: Icon, label, desc, type, color }) => (
          <button key={label} onClick={() => selectService(type)}
            className={`text-left p-4 flex items-start gap-3 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,194,255,0.12)] ${
              form.type === type || (type === "FCL 20FT" && ["FCL 20FT","FCL 40FT","FCL 40HQ","LCL"].includes(form.type))
                ? "border-[#00C2FF]/40 bg-[#00C2FF]/5 shadow-[0_0_16px_rgba(0,194,255,0.1)]"
                : "border-white/8 bg-white/[0.02] hover:border-white/15"
            }`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${color}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">{label}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
              <p className="text-[10px] text-[#00C2FF] mt-1.5 font-semibold">Click to select →</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quote Form */}
      <div ref={formRef}>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <Zap className="h-5 w-5 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Get an Instant Quote</h2>
        </div>

        {submitted && (
          <div className="flex items-center gap-2 mb-5 p-4 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 text-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Quote request submitted!</p>
              <p className="text-xs text-green-400/80 mt-0.5">Our team will respond within 24 business hours.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Origin Port / City</label>
              <input value={form.origin} onChange={(e) => { setForm({ ...form, origin: e.target.value }); setErrors(p => ({ ...p, origin: "" })); }}
                placeholder="e.g. Shanghai" className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${errors.origin ? "border-red-500" : "border-white/10"}`} />
              {errors.origin && <p className="text-xs text-red-400 mt-1">{errors.origin}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Destination Port / City</label>
              <input value={form.destination} onChange={(e) => { setForm({ ...form, destination: e.target.value }); setErrors(p => ({ ...p, destination: "" })); }}
                placeholder="e.g. Rotterdam" className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${errors.destination ? "border-red-500" : "border-white/10"}`} />
              {errors.destination && <p className="text-xs text-red-400 mt-1">{errors.destination}</p>}
            </div>
          </div>

          {/* Route Analysis Panel */}
          {routeModes && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                Available Routes — <span className="text-tertiary">{form.origin}</span> → <span className="text-tertiary">{form.destination}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {routeModes.map(({ mode, available, reason, transit, cost, co2 }) => {
                  const { icon: Icon, label, color, border, bg } = MODE_META[mode];
                  return (
                    <div key={mode} className={`rounded-xl border p-4 flex flex-col gap-3 ${
                      available ? `${bg} ${border}` : "bg-white/[0.02] border-white/5 opacity-60"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${available ? color : "text-on-surface-variant"}`} />
                          <span className={`text-sm font-semibold ${available ? "text-on-surface" : "text-on-surface-variant"}`}>{label}</span>
                        </div>
                        {available
                          ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                          : <XCircle className="h-4 w-4 text-error shrink-0" />}
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">{reason}</p>
                      {available && (
                        <div className="grid grid-cols-3 gap-1 border-t border-white/5 pt-3 text-center">
                          <div><p className="text-[10px] text-on-surface-variant">Transit</p><p className="text-xs font-semibold text-on-surface mt-0.5">{transit}</p></div>
                          <div><p className="text-[10px] text-on-surface-variant">Cost</p><p className={`text-xs font-semibold mt-0.5 ${color}`}>{cost}</p></div>
                          <div><p className="text-[10px] text-on-surface-variant">CO₂</p><p className="text-xs font-semibold text-on-surface mt-0.5">{co2}</p></div>
                        </div>
                      )}
                      {!available && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-error">Not Available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Cargo Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
                <option>FCL 20FT</option>
                <option>FCL 40FT</option>
                <option>FCL 40HQ</option>
                <option>LCL</option>
                <option>Air Freight</option>
                <option>Bulk</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Cargo Weight (kg)</label>
              <input type="number" value={form.weight} onChange={(e) => { setForm({ ...form, weight: e.target.value }); setErrors(p => ({ ...p, weight: "" })); }}
                placeholder="e.g. 5000" className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${errors.weight ? "border-red-500" : "border-white/10"}`} />
              {errors.weight && <p className="text-xs text-red-400 mt-1">{errors.weight}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Preferred Shipment Date</label>
            <input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value }); setErrors(p => ({ ...p, date: "" })); }}
              className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50 ${errors.date ? "border-red-500" : "border-white/10"}`} />
            {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-on-surface-variant block mb-1">
              Select Cargo Insurance Policy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {INSURANCE_PLANS.map((plan) => {
                const Icon = plan.icon;
                const isSelected = form.insurance === plan.name;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setForm({ ...form, insurance: plan.name })}
                    className={`relative p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "bg-tertiary/5 border-tertiary/50 shadow-[0_0_15px_rgba(66,165,245,0.15)]"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    {plan.recommended && (
                      <span className="absolute top-2.5 right-2.5 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-tertiary/20 text-tertiary">
                        Rec
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${plan.color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-on-surface text-xs">{plan.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{plan.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1 border-t border-white/5 mt-1 w-full">
                      <span className="text-[10px] text-on-surface-variant font-mono">Rate:</span>
                      <span className="font-mono text-xs font-bold text-tertiary">{plan.rate}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Additional Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              placeholder="Hazardous goods, temperature requirements, special handling…"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 resize-none" />
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] transition-colors shadow-[0_0_20px_rgba(30,136,229,0.3)]">
            <Send className="h-4 w-4" /> Submit Quote Request
          </button>
        </form>
      </Card>
      </div>

      {/* Past quotes */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Past Quotes</h2>
        {quotes.length === 0 ? (
          <Card className="p-10 flex flex-col items-center text-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <FileSignature className="h-7 w-7 text-on-surface-variant/40" />
            </div>
            <p className="text-sm font-semibold text-on-surface">No quotes yet</p>
            <p className="text-xs text-on-surface-variant max-w-xs">Your submitted quote requests will appear here once processed.</p>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1">
              <Clock className="h-3.5 w-3.5" /> Responses within 24 business hours
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {quotes.map((q) => (
              <Card key={q.id} className="p-5 hover:bg-white/2 transition-colors border border-white/5 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-tertiary/60" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-tertiary">{q.id}</span>
                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-on-surface-variant font-semibold">
                        {q.type}
                      </span>
                      {q.insurance && q.insurance !== "No Insurance" && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 font-bold">
                          🛡️ {q.insurance}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm font-semibold text-on-surface">
                      <span>{q.origin}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-on-surface-variant/40" />
                      <span>{q.destination}</span>
                    </div>

                    <p className="text-xs text-on-surface-variant">
                      Weight: <span className="font-medium text-on-surface">{q.weight} kg</span>
                      {q.date && (
                        <>
                          <span className="mx-2">•</span>
                          Ship Date: <span className="font-medium text-on-surface">{q.date}</span>
                        </>
                      )}
                    </p>

                    {q.notes && (
                      <p className="text-xs text-on-surface-variant italic max-w-xl bg-white/[0.01] p-2 rounded border border-white/5">
                        Notes: {q.notes}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
                      <Clock className="h-3 w-3 animate-pulse" /> Pending Review
                    </span>
                    <span className="text-[10px] text-on-surface-variant/50 font-mono">
                      Requested: {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
