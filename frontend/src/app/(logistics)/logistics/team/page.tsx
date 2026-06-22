"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Truck, MapPin, Phone, Mail, Calendar, Award, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usersApi } from "@/lib/services";

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

// Real platform staff for a role → roster card shape (region/experience unknown).
function mapStaff(u: any) {
  return {
    id: u.id,
    name: u.name ?? u.email,
    role: u.department ? `Logistics · ${u.department}` : "Logistics Manager",
    region: u.department ?? "—",
    experience: "—",
    phone: u.phone ?? "—",
    email: u.email ?? "—",
    image: initials(u.name ?? u.email ?? "?"),
  };
}

const LOGISTICS_MANAGERS = [
  { id: 1, name: "Rajesh Kumar", role: "Senior Logistics Manager", region: "North India", experience: "12 yrs", phone: "+91 98765 43210", email: "rajesh.k@logistics.com", image: "RK" },
  { id: 2, name: "Priya Sharma", role: "Logistics Manager", region: "West India", experience: "8 yrs", phone: "+91 98765 43211", email: "priya.s@logistics.com", image: "PS" },
  { id: 3, name: "Amit Patel", role: "Logistics Manager", region: "Gujarat", experience: "10 yrs", phone: "+91 98765 43212", email: "amit.p@logistics.com", image: "AP" },
  { id: 4, name: "Sneha Reddy", role: "Logistics Coordinator", region: "South India", experience: "6 yrs", phone: "+91 98765 43213", email: "sneha.r@logistics.com", image: "SR" },
  { id: 5, name: "Vikram Singh", role: "Logistics Manager", region: "Rajasthan", experience: "9 yrs", phone: "+91 98765 43214", email: "vikram.s@logistics.com", image: "VS" },
  { id: 6, name: "Anita Desai", role: "Senior Logistics Manager", region: "Mumbai", experience: "14 yrs", phone: "+91 98765 43215", email: "anita.d@logistics.com", image: "AD" },
  { id: 7, name: "Karthik Iyer", role: "Logistics Manager", region: "Tamil Nadu", experience: "7 yrs", phone: "+91 98765 43216", email: "karthik.i@logistics.com", image: "KI" },
  { id: 8, name: "Meera Joshi", role: "Logistics Coordinator", region: "Pune", experience: "5 yrs", phone: "+91 98765 43217", email: "meera.j@logistics.com", image: "MJ" },
  { id: 9, name: "Rahul Verma", role: "Logistics Manager", region: "UP/Bihar", experience: "11 yrs", phone: "+91 98765 43218", email: "rahul.v@logistics.com", image: "RV" },
  { id: 10, name: "Divya Nair", role: "Logistics Manager", region: "Kerala", experience: "8 yrs", phone: "+91 98765 43219", email: "divya.n@logistics.com", image: "DN" },
  { id: 11, name: "Sanjay Gupta", role: "Senior Logistics Manager", region: "Delhi NCR", experience: "15 yrs", phone: "+91 98765 43220", email: "sanjay.g@logistics.com", image: "SG" },
  { id: 12, name: "Pooja Malhotra", role: "Logistics Coordinator", region: "Chandigarh", experience: "4 yrs", phone: "+91 98765 43221", email: "pooja.m@logistics.com", image: "PM" },
  { id: 13, name: "Arjun Rao", role: "Logistics Manager", region: "Karnataka", experience: "9 yrs", phone: "+91 98765 43222", email: "arjun.r@logistics.com", image: "AR" },
  { id: 14, name: "Neha Kapoor", role: "Logistics Manager", region: "Punjab", experience: "7 yrs", phone: "+91 98765 43223", email: "neha.k@logistics.com", image: "NK" },
  { id: 15, name: "Manish Agarwal", role: "Head of Logistics", region: "Pan India", experience: "18 yrs", phone: "+91 98765 43224", email: "manish.a@logistics.com", image: "MA" },
];

const REGIONS = ["All", "North India", "South India", "West India", "East India", "Central India", "Pan India"];

export default function LogisticsTeamPage() {
  const [members, setMembers] = useState(LOGISTICS_MANAGERS);

  useEffect(() => {
    usersApi.list({ role: "logistics" })
      .then((staff: any[]) => { if (staff && staff.length) setMembers(staff.map(mapStaff)); })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="animate-fade-up">
        <Link href="/logistics" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary/20">
            <Truck className="h-6 w-6 text-tertiary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-tertiary">Logistics Department</p>
            <h1 className="text-3xl font-bold text-on-surface">Logistics Managers</h1>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant mt-2">
          Team of <span className="font-semibold text-tertiary">15 logistics professionals</span> managing shipments across India.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Managers", value: "15", icon: Award, color: "text-tertiary bg-tertiary/10" },
          { label: "Senior Managers", value: "4", icon: Star, color: "text-secondary bg-secondary/10" },
          { label: "Regions Covered", value: "12", icon: MapPin, color: "text-green-400 bg-green-400/10" },
          { label: "Avg Experience", value: "9.5 yrs", icon: Calendar, color: "text-on-tertiary-container bg-on-tertiary-container/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4 animate-fade-up">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}><Icon className="h-4 w-4" /></span>
            <p className="mt-3 font-mono text-xl font-bold text-on-surface">{value}</p>
            <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
          </Card>
        ))}
      </div>

      {/* Region Filter */}
      <div className="flex flex-wrap gap-2 animate-fade-up">
        {REGIONS.map((region) => (
          <button
            key={region}
            className="px-4 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-all border border-white/5 hover:border-tertiary/30"
          >
            {region}
          </button>
        ))}
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map((member, index) => (
          <Card 
            key={member.id} 
            className="p-4 animate-fade-up hover:border-tertiary/30 transition-all"
            style={{ animationDelay: `${index * 0.04}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tertiary/30 to-tertiary/10 text-tertiary font-semibold text-sm">
                {member.image}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-on-surface text-sm truncate">{member.name}</h3>
                <p className="text-xs text-tertiary mt-0.5">{member.role}</p>
              </div>
              {member.experience && parseInt(member.experience) >= 10 && (
                <Star className="h-4 w-4 text-secondary shrink-0" fill="currentColor" opacity={0.3} />
              )}
            </div>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{member.region}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Calendar className="h-3 w-3 shrink-0" />
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