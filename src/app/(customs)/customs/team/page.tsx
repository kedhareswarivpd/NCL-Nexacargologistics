"use client";

import { Card } from "@/components/ui/card";
import { FileText, MapPin, Phone, Mail, Award, Star, Globe, Shield } from "lucide-react";

const CUSTOMS_EXPERTS = [
  { id: 1, name: "Aditya Sharma", role: "Senior Customs Expert", specialization: "Import Clearance", phone: "+91 98765 50001", email: "aditya.s@customs.com", image: "AS", certifications: ["CBIC", "ICEGATE"] },
  { id: 2, name: "Kavita Menon", role: "Customs Expert", specialization: "Export Documentation", phone: "+91 98765 50002", email: "kavita.m@customs.com", image: "KM", certifications: ["FEMA"] },
  { id: 3, name: "Ravi Shankar", role: "Customs Expert", specialization: "Duty Drawback", phone: "+91 98765 50003", email: "ravi.s@customs.com", image: "RS", certifications: ["CBIC", "DGFT"] },
  { id: 4, name: "Pooja Hegde", role: "Customs Coordinator", specialization: "FTA Compliance", phone: "+91 98765 50004", email: "pooja.h@customs.com", image: "PH", certifications: ["ICEGATE"] },
  { id: 5, name: "Suresh Nair", role: "Senior Customs Expert", specialization: "Bonded Warehouse", phone: "+91 98765 50005", email: "suresh.n@customs.com", image: "SN", certifications: ["CBIC", "FEMA", "DGFT"] },
  { id: 6, name: "Anjali Bhatt", role: "Customs Expert", specialization: "Classification & Valuation", phone: "+91 98765 50006", email: "anjali.b@customs.com", image: "AB", certifications: ["ICEGATE"] },
  { id: 7, name: "Deepak Rao", role: "Customs Expert", specialization: "SEZ Operations", phone: "+91 98765 50007", email: "deepak.r@customs.com", image: "DR", certifications: ["DGFT", "FEMA"] },
  { id: 8, name: "Nisha Iyer", role: "Head of Customs", specialization: "Strategic Trade", phone: "+91 98765 50008", email: "nisha.i@customs.com", image: "NI", certifications: ["CBIC", "FEMA", "DGFT", "ICEGATE"] },
];

const SPECIALIZATIONS = ["All", "Import Clearance", "Export Documentation", "Duty Drawback", "FTA Compliance", "Bonded Warehouse", "Classification & Valuation", "SEZ Operations", "Strategic Trade"];

export default function CustomsTeamPage() {
  return (
    <div className="p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
            <Globe className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary">Customs Department</p>
            <h1 className="text-3xl font-bold text-on-surface">Customs Experts</h1>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant mt-2">
          Team of <span className="font-semibold text-secondary">8 customs specialists</span> handling clearance and compliance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Experts", value: "8", icon: Award, color: "text-secondary bg-secondary/10" },
          { label: "Senior Experts", value: "3", icon: Star, color: "text-tertiary bg-tertiary/10" },
          { label: "Certifications", value: "15+", icon: Shield, color: "text-green-400 bg-green-400/10" },
          { label: "Clearances/Mo", value: "250+", icon: FileText, color: "text-on-tertiary-container bg-on-tertiary-container/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4 animate-fade-up">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}><Icon className="h-4 w-4" /></span>
            <p className="mt-3 font-mono text-xl font-bold text-on-surface">{value}</p>
            <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
          </Card>
        ))}
      </div>

      {/* Specialization Filter */}
      <div className="flex flex-wrap gap-2 animate-fade-up">
        {SPECIALIZATIONS.map((spec) => (
          <button
            key={spec}
            className="px-4 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-all border border-white/5 hover:border-secondary/30"
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CUSTOMS_EXPERTS.map((member, index) => (
          <Card 
            key={member.id} 
            className="p-4 animate-fade-up hover:border-secondary/30 transition-all"
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 text-secondary font-semibold text-sm">
                {member.image}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-on-surface text-sm truncate">{member.name}</h3>
                <p className="text-xs text-secondary mt-0.5">{member.role}</p>
              </div>
              {member.certifications.length >= 3 && (
                <Shield className="h-4 w-4 text-green-400 shrink-0" />
              )}
            </div>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate">{member.specialization}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Award className="h-3 w-3 shrink-0" />
                <span className="truncate">{member.certifications.join(", ")}</span>
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