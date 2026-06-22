"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Package, MapPin, Phone, Mail, Award, Star, Clock, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usersApi } from "@/lib/services";

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
function mapStaff(u: any) {
  return {
    id: u.id,
    name: u.name ?? u.email,
    role: "Warehouse Manager",
    shift: "—",
    zone: u.department ?? "—",
    phone: u.phone ?? "—",
    email: u.email ?? "—",
    image: initials(u.name ?? u.email ?? "?"),
    experience: "—",
  };
}

const WAREHOUSE_STAFF = [
  { id: 1, name: "Ramesh Gupta", role: "Warehouse Manager", shift: "Day Shift", zone: "Zone A", phone: "+91 98765 60001", email: "ramesh.g@warehouse.com", image: "RG", experience: "10 yrs" },
  { id: 2, name: "Sunita Devi", role: "Senior Warehouse Associate", shift: "Day Shift", zone: "Zone A", phone: "+91 98765 60002", email: "sunita.d@warehouse.com", image: "SD", experience: "8 yrs" },
  { id: 3, name: "Mohan Lal", role: "Forklift Operator", shift: "Day Shift", zone: "Zone B", phone: "+91 98765 60003", email: "mohan.l@warehouse.com", image: "ML", experience: "6 yrs" },
  { id: 4, name: "Kavita Singh", role: "Inventory Clerk", shift: "Day Shift", zone: "Zone A", phone: "+91 98765 60004", email: "kavita.s@warehouse.com", image: "KS", experience: "4 yrs" },
  { id: 5, name: "Arjun Patel", role: "Warehouse Associate", shift: "Day Shift", zone: "Zone C", phone: "+91 98765 60005", email: "arjun.p@warehouse.com", image: "AP", experience: "3 yrs" },
  { id: 6, name: "Priya Sharma", role: "Quality Inspector", shift: "Day Shift", zone: "Zone B", phone: "+91 98765 60006", email: "priya.s@warehouse.com", image: "PS", experience: "5 yrs" },
  { id: 7, name: "Vijay Kumar", role: "Loading Supervisor", shift: "Day Shift", zone: "Zone D", phone: "+91 98765 60007", email: "vijay.k@warehouse.com", image: "VK", experience: "7 yrs" },
  { id: 8, name: "Anita Kumari", role: "Warehouse Associate", shift: "Day Shift", zone: "Zone A", phone: "+91 98765 60008", email: "anita.k@warehouse.com", image: "AK", experience: "2 yrs" },
  { id: 9, name: "Suresh Yadav", role: "Forklift Operator", shift: "Evening Shift", zone: "Zone B", phone: "+91 98765 60009", email: "suresh.y@warehouse.com", image: "SY", experience: "5 yrs" },
  { id: 10, name: "Rekha Jha", role: "Inventory Clerk", shift: "Evening Shift", zone: "Zone C", phone: "+91 98765 60010", email: "rekha.j@warehouse.com", image: "RJ", experience: "4 yrs" },
  { id: 11, name: "Dinesh Rao", role: "Senior Warehouse Associate", shift: "Evening Shift", zone: "Zone A", phone: "+91 98765 60011", email: "dinesh.r@warehouse.com", image: "DR", experience: "6 yrs" },
  { id: 12, name: "Pooja Mishra", role: "Quality Inspector", shift: "Evening Shift", zone: "Zone B", phone: "+91 98765 60012", email: "pooja.m@warehouse.com", image: "PM", experience: "3 yrs" },
  { id: 13, name: "Rajendra Prasad", role: "Warehouse Associate", shift: "Evening Shift", zone: "Zone D", phone: "+91 98765 60013", email: "rajendra.p@warehouse.com", image: "RP", experience: "2 yrs" },
  { id: 14, name: "Sita Devi", role: "Loading Supervisor", shift: "Evening Shift", zone: "Zone C", phone: "+91 98765 60014", email: "sita.d@warehouse.com", image: "SD", experience: "5 yrs" },
  { id: 15, name: "Ashok Kumar", role: "Night Shift Manager", shift: "Night Shift", zone: "All Zones", phone: "+91 98765 60015", email: "ashok.k@warehouse.com", image: "AK", experience: "9 yrs" },
  { id: 16, name: "Geeta Sharma", role: "Warehouse Associate", shift: "Night Shift", zone: "Zone A", phone: "+91 98765 60016", email: "geeta.s@warehouse.com", image: "GS", experience: "3 yrs" },
  { id: 17, name: "Manoj Tiwari", role: "Forklift Operator", shift: "Night Shift", zone: "Zone B", phone: "+91 98765 60017", email: "manoj.t@warehouse.com", image: "MT", experience: "4 yrs" },
  { id: 18, name: "Lakshmi Nair", role: "Inventory Clerk", shift: "Night Shift", zone: "Zone C", phone: "+91 98765 60018", email: "lakshmi.n@warehouse.com", image: "LN", experience: "2 yrs" },
  { id: 19, name: "Harish Chandra", role: "Security In-charge", shift: "Night Shift", zone: "All Zones", phone: "+91 98765 60019", email: "harish.c@warehouse.com", image: "HC", experience: "8 yrs" },
  { id: 20, name: "Nandini Iyer", role: "Head of Warehouse Ops", shift: "Day Shift", zone: "All Zones", phone: "+91 98765 60020", email: "nandini.i@warehouse.com", image: "NI", experience: "12 yrs" },
];

const ZONES = ["All", "Zone A", "Zone B", "Zone C", "Zone D", "All Zones"];
const SHIFTS = ["All", "Day Shift", "Evening Shift", "Night Shift"];

export default function WarehouseTeamPage() {
  const [members, setMembers] = useState(WAREHOUSE_STAFF);
  useEffect(() => {
    usersApi.list({ role: "warehouse" })
      .then((staff: any[]) => { if (staff && staff.length) setMembers(staff.map(mapStaff)); })
      .catch(() => {});
  }, []);
  return (
    <div className="p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="animate-fade-up">
        <Link href="/warehouse" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-400/20">
            <Package className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-green-400">Warehouse Department</p>
            <h1 className="text-3xl font-bold text-on-surface">Warehouse Staff</h1>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant mt-2">
          Team of <span className="font-semibold text-green-400">20 warehouse professionals</span> managing inventory and operations.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: "20", icon: Award, color: "text-green-400 bg-green-400/10" },
          { label: "Supervisors", value: "4", icon: Star, color: "text-tertiary bg-tertiary/10" },
          { label: "Zones Covered", value: "4", icon: MapPin, color: "text-secondary bg-secondary/10" },
          { label: "Shifts", value: "3", icon: Clock, color: "text-on-tertiary-container bg-on-tertiary-container/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4 animate-fade-up">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}><Icon className="h-4 w-4" /></span>
            <p className="mt-3 font-mono text-xl font-bold text-on-surface">{value}</p>
            <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3 animate-fade-up">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-on-surface-variant self-center mr-2">Zone:</span>
          {ZONES.map((zone) => (
            <button
              key={zone}
              className="px-4 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-all border border-white/5 hover:border-green-400/30"
            >
              {zone}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-on-surface-variant self-center mr-2">Shift:</span>
          {SHIFTS.map((shift) => (
            <button
              key={shift}
              className="px-4 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-all border border-white/5 hover:border-green-400/30"
            >
              {shift}
            </button>
          ))}
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map((member, index) => (
          <Card 
            key={member.id} 
            className="p-4 animate-fade-up hover:border-green-400/30 transition-all"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400/30 to-green-400/10 text-green-400 font-semibold text-sm">
                {member.image}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-on-surface text-sm truncate">{member.name}</h3>
                <p className="text-xs text-green-400 mt-0.5">{member.role}</p>
              </div>
              {member.experience && parseInt(member.experience) >= 8 && (
                <Star className="h-4 w-4 text-tertiary shrink-0" fill="currentColor" opacity={0.3} />
              )}
            </div>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{member.shift}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{member.zone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Award className="h-3 w-3 shrink-0" />
                <span>{member.experience} experience</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Phone className="h-3 w-3 shrink-0" />
                <span className="truncate">{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}