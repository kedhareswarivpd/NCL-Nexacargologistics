"use client";

import { useState, useEffect, useRef } from "react";
import { FileSignature, CheckCircle2, Clock, Send, Zap, Ship, Plane, Truck, Package, ArrowRight, Shield, ShieldCheck, ShieldAlert, ShieldX, ArrowLeft, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { quotesApi } from "@/lib/services";
import { apiError } from "@/lib/api";
import { supabase } from "@/lib/supabase";

// Map the UI cargo-type selection onto a transport mode the backend understands.
function typeToMode(type: string): "air" | "sea" | "road" {
  if (type === "Air Freight") return "air";
  return "sea";
}

const QUOTE_STATUS_STYLES: Record<string, string> = {
  quoted: "bg-tertiary/10 text-tertiary border-tertiary/20",
  pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  accepted: "bg-green-400/10 text-green-400 border-green-400/20",
  rejected: "bg-error/10 text-error border-error/20",
  expired: "bg-white/5 text-on-surface-variant border-white/10",
};

// ── Route analysis helpers ────────────────────────────────────────────────────

const LANDLOCKED = new Set([
  "afghanistan","kabul",
  "andorra",
  "armenia","yerevan",
  "austria","vienna","salzburg","innsbruck",
  "azerbaijan","baku",
  "belarus","minsk",
  "bhutan","thimphu",
  "bolivia","la paz","sucre",
  "botswana","gaborone",
  "burkina faso","ouagadougou",
  "burundi","bujumbura",
  "central african republic","bangui",
  "chad","n'djamena",
  "czech republic","czechia","prague","brno",
  "ethiopia","addis ababa",
  "hungary","budapest",
  "kazakhstan","almaty","astana",
  "kosovo","pristina",
  "kyrgyzstan","bishkek",
  "laos","vientiane",
  "lesotho","maseru",
  "liechtenstein","vaduz",
  "luxembourg",
  "malawi","lilongwe",
  "mali","bamako",
  "moldova","chisinau",
  "mongolia","ulaanbaatar",
  "nepal","kathmandu",
  "niger","niamey",
  "north macedonia","skopje",
  "paraguay","asuncion",
  "rwanda","kigali",
  "san marino",
  "serbia","belgrade",
  "slovakia","bratislava",
  "south sudan","juba",
  "swaziland","eswatini","mbabane",
  "switzerland","zurich","geneva","basel",
  "tajikistan","dushanbe",
  "turkmenistan","ashgabat",
  "uganda","kampala",
  "uzbekistan","tashkent",
  "vatican",
  "zambia","lusaka",
  "zimbabwe","harare",
]);

const CONTINENT_MAP: [string, string[]][] = [
  ["asia",     ["china","shanghai","beijing","hong kong","shenzhen","japan","tokyo","osaka","yokohama","nagoya","kyoto","kobe","korea","seoul","busan","incheon","daegu","daejeon","gwangju","singapore","malaysia","kuala lumpur","penang","johor bahru","indonesia","jakarta","surabaya","bandung","medan","thailand","bangkok","nonthaburi","chiang mai","phuket","vietnam","hanoi","ho chi minh","da nang","haiphong","india","mumbai","delhi","bangalore","hyderabad","chennai","kolkata","pune","ahmedabad","kurnool","bangladesh","dhaka","chittagong","khulna","rajshahi","pakistan","karachi","lahore","islamabad","faisalabad","sri lanka","colombo","kandy","galle","nepal","kathmandu","pokhara","lalitpur","philippines","manila","cebu","davao","taiwan","taipei","myanmar","yangon","cambodia","phnom penh","laos","vientiane","mongolia","ulaanbaatar","afghanistan","kabul","uzbekistan","tashkent","kazakhstan","almaty","astana"]],
  ["europe",   ["uk","united kingdom","london","manchester","birmingham","glasgow","edinburgh","belfast","germany","hamburg","frankfurt","berlin","munich","stuttgart","dusseldorf","cologne","france","paris","lyon","marseille","netherlands","rotterdam","amsterdam","spain","madrid","barcelona","valencia","seville","italy","rome","milan","naples","genoa","turin","venice","florence","poland","warsaw","gdansk","krakow","belgium","antwerp","brussels","sweden","stockholm","gothenburg","malmo","norway","oslo","bergen","denmark","copenhagen","aarhus","odense","finland","helsinki","tampere","turku","switzerland","zurich","geneva","basel","austria","vienna","salzburg","innsbruck","turkey","istanbul","izmir","portugal","lisbon","porto","greece","athens","thessaloniki","piraeus","romania","bucharest","constanta","ukraine","odessa","kyiv","russia","moscow","st petersburg","vladivostok","croatia","rijeka","slovenia","koper","hungary","budapest","czech","prague","brno","slovakia","bratislava","dublin","ireland"]],
  ["namerica", ["usa","united states","america","new york","los angeles","chicago","houston","miami","seattle","boston","savannah","long beach","baltimore","norfolk","dallas","austin","san francisco","atlanta","denver","philadelphia","phoenix","san diego","detroit","canada","toronto","vancouver","montreal","halifax","calgary","edmonton","ottawa","quebec","mexico","mexico city","veracruz","manzanillo","monterrey","guadalajara","panama","colon"]],
  ["samerica", ["brazil","sao paulo","santos","rio","argentina","buenos aires","rosario","chile","santiago","valparaiso","colombia","bogota","cartagena","barranquilla","peru","lima","callao","ecuador","guayaquil","venezuela","caracas","la guaira","uruguay","montevideo"]],
  ["mideast",  ["uae","dubai","abu dhabi","jebel ali","saudi","riyadh","jeddah","mecca","medina","dammam","qatar","doha","hamad","kuwait","kuwait city","shuwaikh","shuaiba","bahrain","manama","oman","muscat","salalah","sohar","iraq","baghdad","basra","erbil","israel","tel aviv","jerusalem","haifa","ashdod","jordan","aqaba","amman","iran","tehran","mashhad","isfahan","tabriz","bandar abbas","egypt","cairo","alexandria","port said","giza","damietta","beirut","damascus"]],
  ["africa",   ["nigeria","lagos","abuja","apapa","tin can","kenya","nairobi","mombasa","south africa","johannesburg","durban","cape town","pretoria","port elizabeth","ethiopia","addis ababa","ghana","accra","kumasi","tema","tanzania","dar es salaam","dodoma","mozambique","maputo","senegal","dakar","morocco","casablanca","tangier","rabat","marrakesh","tunisia","tunis","algeria","algiers","angola","luanda","cameroon","douala","yaounde","ivory coast","abidjan"]],
  ["oceania",  ["australia","sydney","melbourne","brisbane","perth","adelaide","gold coast","canberra","hobart","fremantle","new zealand","auckland","wellington","christchurch","hamilton","dunedin","fiji","suva","lautoka","papua new guinea","port moresby"]],
];

const PORTS = new Set([
  "shanghai", "ningbo", "shenzhen", "guangzhou", "qingdao", "tianjin", "xiamen", "dalian",
  "busan", "singapore", "port klang", "jakarta", "surabaya", "laem chabang", "bangkok", 
  "ho chi minh", "hanoi", "da nang", "haiphong", "mumbai", "nhava sheva", "chennai", 
  "kolkata", "chittagong", "karachi", "manila", "kaohsiung", "keelung", "taichung",
  "colombo", "yangon", "chiba", "yokohama", "nagoya", "osaka", "kobe", "tokyo",

  "rotterdam", "antwerp", "hamburg", "bremerhaven", "valencia", "piraeus", "algeciras", 
  "felixstowe", "london", "southampton", "gdansk", "le havre", "barcelona", "genoa", 
  "trieste", "marseille", "constanta", "odessa", "st petersburg", "vladivostok",
  "gothenburg", "aarhus", "copenhagen", "oslo", "helsinki", "lisbon", "porto", "bilbao",

  "los angeles", "long beach", "new york", "new jersey", "savannah", "seattle", "tacoma",
  "oakland", "houston", "norfolk", "charleston", "miami", "vancouver", "prince rupert",
  "montreal", "halifax", "manzanillo", "lazaro cardenas", "veracruz", "panama", "colon",

  "santos", "itapoa", "paranagua", "rio", "buenos aires", "san antonio", "valparaiso",
  "callao", "guayaquil", "cartagena", "barranquilla", "montevideo",

  "jebel ali", "dubai", "abu dhabi", "salalah", "jeddah", "king abdullah", "dammam",
  "doha", "hamad", "shuwaikh", "shuaiba", "bahrain", "muscat", "sohar", "basra", 
  "bandar abbas", "alexandria", "damietta", "port said", "ashdod", "haifa", "aqaba",

  "durban", "cape town", "port elizabeth", "lagos", "apapa", "tin can", "mombasa", 
  "dar es salaam", "tangier", "casablanca", "dakar", "abidjan", "tema", "luanda",

  "sydney", "melbourne", "brisbane", "fremantle", "adelaide", "hedland", "auckland", 
  "tauranga", "lyttelton", "suva", "lautoka", "port moresby"
]);

const ISOLATED_GROUPS: { name: string; keys: string[] }[] = [
  { name: "japan", keys: ["japan", "tokyo", "osaka", "yokohama", "nagoya", "kyoto", "kobe"] },
  { name: "taiwan", keys: ["taiwan", "taipei"] },
  { name: "philippines", keys: ["philippines", "manila", "cebu", "davao"] },
  { name: "indonesia", keys: ["indonesia", "jakarta", "surabaya", "bandung", "medan"] },
  { name: "sri lanka", keys: ["sri lanka", "colombo", "kandy", "galle"] },
  { name: "australia", keys: ["australia", "sydney", "melbourne", "brisbane", "perth", "adelaide", "gold coast", "canberra", "hobart", "fremantle"] },
  { name: "new zealand", keys: ["new zealand", "auckland", "wellington", "christchurch", "hamilton", "dunedin"] },
  { name: "fiji", keys: ["fiji", "suva", "lautoka"] },
  { name: "madagascar", keys: ["madagascar"] },
  { name: "korea", keys: ["korea", "seoul", "busan", "incheon", "daegu", "daejeon", "gwangju"] },
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

function isPort(place: string): boolean {
  const p = place.toLowerCase();
  if (p.includes("port") || p.includes("harbor") || p.includes("terminal") || p.includes("pier") || p.includes("wharf") || p.includes("dock") || p.includes("gateway")) {
    return true;
  }
  return [...PORTS].some(port => p.includes(port));
}

function checkRoadIsolation(place1: string, place2: string): boolean {
  const p1 = place1.toLowerCase();
  const p2 = place2.toLowerCase();
  let group1: string | null = null;
  let group2: string | null = null;
  
  for (const g of ISOLATED_GROUPS) {
    if (g.keys.some(k => p1.includes(k))) group1 = g.name;
    if (g.keys.some(k => p2.includes(k))) group2 = g.name;
  }
  
  if (group1 !== null || group2 !== null) {
    return group1 !== group2;
  }
  return false;
}

type RouteMode = { mode: "road" | "sea" | "air"; available: boolean; reason: string; transit: string; cost: string; co2: string; };

function analyseRoute(origin: string, dest: string): RouteMode[] | null {
  if (origin.trim().length < 3 || dest.trim().length < 3) return null;
  const co = getContinent(origin);
  const cd = getContinent(dest);
  const sameContinent = co !== null && cd !== null && co === cd;
  const crossOcean = co !== null && cd !== null && !sameContinent;
  
  const roadIsolated = checkRoadIsolation(origin, dest);
  const roadAvailable = sameContinent && !roadIsolated;
  
  const originLocked = isLandlocked(origin);
  const destLocked   = isLandlocked(dest);
  
  let seaAvailable = !(originLocked && destLocked);
  if (sameContinent) {
    seaAvailable = isPort(origin) && isPort(dest);
  }

  return [
    {
      mode: "road",
      available: roadAvailable,
      reason: roadAvailable
        ? "Both locations are on the same continent — overland trucking is possible."
        : roadIsolated
        ? "Road transport is not possible across oceans or to/from island destinations."
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
        : sameContinent
        ? "Waterways are not available for inland routes on the same continent."
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

const POPULAR_LOCATIONS = [
  { name: "Singapore Port, SG", value: "Singapore Port, SG" },
  { name: "Rotterdam Gateway, NL", value: "Rotterdam Gateway, NL" },
  { name: "Shanghai Port, CN", value: "Shanghai Port, CN" },
  { name: "Tokyo Port, JP", value: "Tokyo Port, JP" },
  { name: "London Gateway, UK", value: "London Gateway, UK" },
  { name: "New York Port, US", value: "New York Port, US" },
  { name: "Sydney Port, AU", value: "Sydney Port, AU" },
  { name: "Mumbai Port, IN", value: "Mumbai Port, IN" },
  { name: "Hyderabad, IN", value: "Hyderabad, IN" },
  { name: "Kurnool, IN", value: "Kurnool, IN" },
  { name: "Zurich, CH (Landlocked)", value: "Zurich, CH" },
  { name: "Vienna, AT (Landlocked)", value: "Vienna, AT" }
];

export default function RequestQuotesPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ origin: "", destination: "", type: "FCL 20FT", mode: "", weight: "", date: "", insurance: "No Insurance", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const routeModes = analyseRoute(form.origin, form.destination);

  const filteredOriginLocs = POPULAR_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(form.origin.toLowerCase())
  );
  const filteredDestLocs = POPULAR_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(form.destination.toLowerCase())
  );

  // Keep track of previous values for intelligent defaults
  const prevTypeRef = useRef(form.type);
  const prevOriginRef = useRef(form.origin);
  const prevDestRef = useRef(form.destination);

  useEffect(() => {
    const typeChanged = prevTypeRef.current !== form.type;
    const routeChanged = prevOriginRef.current !== form.origin || prevDestRef.current !== form.destination;
    
    prevTypeRef.current = form.type;
    prevOriginRef.current = form.origin;
    prevDestRef.current = form.destination;

    if (routeModes && routeModes.length > 0) {
      let shouldUpdate = false;
      let nextMode = form.mode;

      if (!form.mode || routeChanged || typeChanged) {
        shouldUpdate = true;
        if (form.type === "Air Freight") {
          nextMode = "air";
        } else {
          const seaMode = routeModes.find(rm => rm.mode === "sea" && rm.available);
          const roadMode = routeModes.find(rm => rm.mode === "road" && rm.available);
          const airMode = routeModes.find(rm => rm.mode === "air" && rm.available);
          
          if (seaMode) {
            nextMode = "sea";
          } else if (roadMode) {
            nextMode = "road";
          } else if (airMode) {
            nextMode = "air";
          }
        }
      }

      // Verify selected mode is actually available, fallback if not
      const nextAvailable = routeModes.find(rm => rm.mode === nextMode && rm.available);
      if (!nextAvailable) {
        const firstAvailable = routeModes.find(rm => rm.available);
        if (firstAvailable) {
          nextMode = firstAvailable.mode;
          shouldUpdate = true;
        }
      }

      if (shouldUpdate && nextMode !== form.mode) {
        setForm(p => ({ ...p, mode: nextMode }));
      }
    } else if (!routeModes && form.mode) {
      setForm(p => ({ ...p, mode: "" }));
    }
  }, [form.origin, form.destination, form.type]);

  const selectService = (type: string) => {
    setForm(p => ({ ...p, type }));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  async function loadQuotes() {
    try { setQuotes((await quotesApi.list()) ?? []); } catch { setQuotes([]); }
  }
  useEffect(() => { loadQuotes(); }, [user?.id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.origin.trim())      e.origin      = "Please fill out this field";
    if (!form.destination.trim()) e.destination = "Please fill out this field";
    if (!form.mode)               e.mode        = "Please select a transport mode";
    if (!form.weight.trim())      e.weight      = "Please fill out this field";
    if (Number(form.weight) > 10000) e.weight = "Maximum weight allowed is 10000 kg (10 tons)";
    if (!form.date.trim())        e.date        = "Please fill out this field";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    const noteParts = [
      `Cargo: ${form.type}`,
      form.date ? `Preferred date: ${form.date}` : "",
      form.insurance && form.insurance !== "No Insurance" ? `Insurance: ${form.insurance}` : "",
      form.notes,
    ].filter(Boolean);
    try {
      // Ensure token is fresh before submitting
      await supabase.auth.refreshSession();
      await quotesApi.create({
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        mode: form.mode || typeToMode(form.type),
        cargo_type: form.type,
        weight: Number(form.weight) || undefined,
        notes: noteParts.join(" · "),
      });
      setSubmitted(true);
      setSubmitError(null);
      setTimeout(() => setSubmitted(false), 5000);
      setForm({ origin: "", destination: "", type: "FCL 20FT", mode: "", weight: "", date: "", insurance: "No Insurance", notes: "" });
      loadQuotes();
    } catch (err) {
      setSubmitError(apiError(err));
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 page-enter">
      <Link href="/customer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
        <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
        <span className="text-sm font-bold text-[#0B1F3A]">Back to Dashboard</span>
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

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Origin Port / City</label>
              <input
                value={form.origin}
                onChange={(e) => {
                  setForm({ ...form, origin: e.target.value });
                  setErrors(p => ({ ...p, origin: "" }));
                  setShowOriginSuggestions(true);
                }}
                onFocus={() => setShowOriginSuggestions(true)}
                onBlur={() => setShowOriginSuggestions(false)}
                placeholder="e.g. Shanghai Port, CN"
                className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${errors.origin ? "border-red-500" : "border-white/10"}`}
              />
              {showOriginSuggestions && filteredOriginLocs.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-[#16223f] shadow-xl z-50 divide-y divide-white/5">
                  {filteredOriginLocs.map((loc) => (
                    <div
                      key={loc.name}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setForm(p => ({ ...p, origin: loc.value }));
                        setErrors(p => ({ ...p, origin: "" }));
                        setShowOriginSuggestions(false);
                      }}
                      className="px-3 py-2 text-xs text-on-surface hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      {loc.name}
                    </div>
                  ))}
                </div>
              )}
              {errors.origin && <p className="text-xs text-red-400 mt-1">{errors.origin}</p>}
            </div>
            <div className="relative">
              <label className="text-xs uppercase tracking-widest text-on-surface-variant">Destination Port / City</label>
              <input
                value={form.destination}
                onChange={(e) => {
                  setForm({ ...form, destination: e.target.value });
                  setErrors(p => ({ ...p, destination: "" }));
                  setShowDestSuggestions(true);
                }}
                onFocus={() => setShowDestSuggestions(true)}
                onBlur={() => setShowDestSuggestions(false)}
                placeholder="e.g. Rotterdam Gateway, NL"
                className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${errors.destination ? "border-red-500" : "border-white/10"}`}
              />
              {showDestSuggestions && filteredDestLocs.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-[#16223f] shadow-xl z-50 divide-y divide-white/5">
                  {filteredDestLocs.map((loc) => (
                    <div
                      key={loc.name}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setForm(p => ({ ...p, destination: loc.value }));
                        setErrors(p => ({ ...p, destination: "" }));
                        setShowDestSuggestions(false);
                      }}
                      className="px-3 py-2 text-xs text-on-surface hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      {loc.name}
                    </div>
                  ))}
                </div>
              )}
              {errors.destination && <p className="text-xs text-red-400 mt-1">{errors.destination}</p>}
            </div>
          </div>

          {/* Route Analysis Panel */}
          {routeModes && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant flex items-center justify-between">
                <span>Select Shipping Mode — <span className="text-tertiary font-semibold">{form.origin}</span> → <span className="text-tertiary font-semibold">{form.destination}</span></span>
                {form.mode && <span className="text-[10px] text-tertiary font-semibold uppercase tracking-wider bg-tertiary/10 px-2 py-0.5 rounded">Selected: {form.mode}</span>}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {routeModes.map(({ mode, available, reason, transit, cost, co2 }) => {
                  const { icon: Icon, label, color, border, bg } = MODE_META[mode];
                  const isSelected = form.mode === mode;
                  
                  let activeClasses = "";
                  if (isSelected) {
                    if (mode === "road") activeClasses = "border-green-400 bg-green-400/10 ring-2 ring-green-400 shadow-[0_0_16px_rgba(74,222,128,0.25)]";
                    else if (mode === "sea") activeClasses = "border-blue-400 bg-blue-400/10 ring-2 ring-blue-400 shadow-[0_0_16px_rgba(96,165,250,0.25)]";
                    else activeClasses = "border-[#00C2FF] bg-[#00C2FF]/10 ring-2 ring-[#00C2FF] shadow-[0_0_16px_rgba(0,194,255,0.25)]";
                  } else {
                    activeClasses = available 
                      ? `${bg} ${border} hover:border-white/20 transition-all cursor-pointer` 
                      : "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed";
                  }

                  return (
                    <button
                      type="button"
                      key={mode}
                      disabled={!available}
                      onClick={() => {
                        if (available) {
                          setForm(p => ({ ...p, mode }));
                          setErrors(p => ({ ...p, mode: "" }));
                        }
                      }}
                      className={`text-left rounded-xl border p-4 flex flex-col gap-3 transition-all duration-200 ${activeClasses}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${isSelected || available ? color : "text-on-surface-variant"}`} />
                          <span className={`text-sm font-semibold ${isSelected || available ? "text-on-surface" : "text-on-surface-variant"}`}>{label}</span>
                        </div>
                        {isSelected ? (
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${
                            mode === 'road' ? 'bg-green-400' : mode === 'sea' ? 'bg-blue-400' : 'bg-[#00C2FF]'
                          }`}>
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                          </span>
                        ) : available ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400/60 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-error shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">{reason}</p>
                      {available && (
                        <div className="grid grid-cols-3 gap-1 border-t border-white/5 pt-3 text-center w-full">
                          <div><p className="text-[10px] text-on-surface-variant">Transit</p><p className="text-xs font-semibold text-on-surface mt-0.5">{transit}</p></div>
                          <div><p className="text-[10px] text-on-surface-variant">Cost</p><p className={`text-xs font-semibold mt-0.5 ${color}`}>{cost}</p></div>
                          <div><p className="text-[10px] text-on-surface-variant">CO₂</p><p className="text-xs font-semibold text-on-surface mt-0.5">{co2}</p></div>
                        </div>
                      )}
                      {!available && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-error">Not Available</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.mode && <p className="text-xs text-red-400 mt-1 font-semibold">{errors.mode}</p>}
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
              <input type="number" max="10000" value={form.weight} onChange={(e) => { 
                const val = e.target.value;
                const numVal = Number(val);
                if (val === "" || numVal <= 10000) {
                  setForm({ ...form, weight: val }); 
                  setErrors(p => ({ ...p, weight: "" })); 
                }
              }}
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

          {submitError && (
            <div role="alert" className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
              {submitError}
            </div>
          )}

          <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0] transition-colors shadow-[0_0_20px_rgba(30,136,229,0.3)] disabled:opacity-50">
            <Send className="h-4 w-4" /> {saving ? "Submitting…" : "Submit Quote Request"}
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
                      <span className="font-mono text-xs font-bold text-tertiary">{q.quote_ref ?? q.id}</span>
                      {q.cargo_type && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-on-surface-variant font-semibold">
                          {q.cargo_type}
                        </span>
                      )}
                      {q.mode && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-bold">
                          {q.mode}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm font-semibold text-on-surface">
                      <span>{q.origin}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-on-surface-variant/40" />
                      <span>{q.destination}</span>
                    </div>

                    <p className="text-xs text-on-surface-variant">
                      {q.weight != null && <>Weight: <span className="font-medium text-on-surface">{q.weight} kg</span></>}
                      {q.amount != null && (
                        <>
                          <span className="mx-2">•</span>
                          Est. Price: <span className="font-semibold text-tertiary">${Number(q.amount).toLocaleString()} {q.currency ?? "USD"}</span>
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
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border capitalize ${QUOTE_STATUS_STYLES[q.status] ?? "bg-amber-400/10 text-amber-400 border-amber-400/20"}`}>
                      <Clock className="h-3 w-3" /> {q.status ?? "pending"}
                    </span>
                    {(q.status === "quoted" || q.status === "accepted") && (
                      <Link href={`/customer/shipments/new?quote_id=${q.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-tertiary/20 text-tertiary text-xs font-semibold hover:bg-tertiary/30 transition-all mt-1">
                        Book Shipment <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                    {q.created_at && (
                      <span className="text-[10px] text-on-surface-variant/50 font-mono">
                        Requested: {new Date(q.created_at).toLocaleDateString()}
                      </span>
                    )}
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
