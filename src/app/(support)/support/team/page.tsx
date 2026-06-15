"use client";

import { Card } from "@/components/ui/card";
import { Headphones, Phone, Mail, Award, Star, Clock, MessageSquare, Languages } from "lucide-react";

const SUPPORT_EXECUTIVES = [
  { id: 1, name: "Shruti Patel", role: "Senior Support Executive", channel: "Voice Support", languages: ["English", "Hindi", "Gujarati"], phone: "+91 98765 70001", email: "shruti.p@support.com", image: "SP", experience: "6 yrs" },
  { id: 2, name: "Aditya Singh", role: "Support Executive", channel: "Live Chat", languages: ["English", "Hindi"], phone: "+91 98765 70002", email: "aditya.s@support.com", image: "AS", experience: "4 yrs" },
  { id: 3, name: "Divya Krishnan", role: "Support Executive", channel: "Email Support", languages: ["English", "Tamil", "Malayalam"], phone: "+91 98765 70003", email: "divya.k@support.com", image: "DK", experience: "3 yrs" },
  { id: 4, name: "Rohan Mehta", role: "Senior Support Executive", channel: "Voice Support", languages: ["English", "Hindi", "Marathi"], phone: "+91 98765 70004", email: "rohan.m@support.com", image: "RM", experience: "5 yrs" },
  { id: 5, name: "Preeti Sharma", role: "Support Executive", channel: "Live Chat", languages: ["English", "Hindi", "Punjabi"], phone: "+91 98765 70005", email: "preeti.s@support.com", image: "PS", experience: "2 yrs" },
  { id: 6, name: "Karan Deshmukh", role: "Support Executive", channel: "Email Support", languages: ["English", "Hindi"], phone: "+91 98765 70006", email: "karan.d@support.com", image: "KD", experience: "3 yrs" },
  { id: 7, name: "Ananya Reddy", role: "Senior Support Executive", channel: "Voice Support", languages: ["English", "Telugu", "Hindi"], phone: "+91 98765 70007", email: "ananya.r@support.com", image: "AR", experience: "5 yrs" },
  { id: 8, name: "Vivek Chopra", role: "Support Executive", channel: "Live Chat", languages: ["English", "Hindi"], phone: "+91 98765 70008", email: "vivek.c@support.com", image: "VC", experience: "2 yrs" },
  { id: 9, name: "Neha Agarwal", role: "Support Executive", channel: "Email Support", languages: ["English", "Hindi", "Bengali"], phone: "+91 98765 70009", email: "neha.a@support.com", image: "NA", experience: "4 yrs" },
  { id: 10, name: "Rajesh Menon", role: "Head of Customer Support", channel: "All Channels", languages: ["English", "Hindi", "Malayalam", "Tamil"], phone: "+91 98765 70010", email: "rajesh.m@support.com", image: "RM", experience: "10 yrs" },
];

const CHANNELS = ["All", "Voice Support", "Live Chat", "Email Support", "All Channels"];
const LANGUAGES = ["All", "English", "Hindi", "Gujarati", "Tamil", "Malayalam", "Marathi", "Punjabi", "Telugu", "Bengali"];

export default function SupportTeamPage() {
  return (
    <div className="p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-on-tertiary-container/20">
            <Headphones className="h-6 w-6 text-on-tertiary-container" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-on-tertiary-container">Support Department</p>
            <h1 className="text-3xl font-bold text-on-surface">Customer Support Executives</h1>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant mt-2">
          Team of <span className="font-semibold text-on-tertiary-container">10 support professionals</span> available 24/7 to assist customers.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Executives", value: "10", icon: Award, color: "text-on-tertiary-container bg-on-tertiary-container/10" },
          { label: "Senior Executives", value: "4", icon: Star, color: "text-tertiary bg-tertiary/10" },
          { label: "Languages", value: "8", icon: Languages, color: "text-secondary bg-secondary/10" },
          { label: "Response Time", value: "<2 min", icon: Clock, color: "text-green-400 bg-green-400/10" },
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
          <span className="text-xs text-on-surface-variant self-center mr-2">Channel:</span>
          {CHANNELS.map((channel) => (
            <button
              key={channel}
              className="px-4 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-all border border-white/5 hover:border-on-tertiary-container/30"
            >
              {channel}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-on-surface-variant self-center mr-2">Language:</span>
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              className="px-4 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-all border border-white/5 hover:border-on-tertiary-container/30"
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {SUPPORT_EXECUTIVES.map((member, index) => (
          <Card 
            key={member.id} 
            className="p-4 animate-fade-up hover:border-on-tertiary-container/30 transition-all"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-on-tertiary-container/30 to-on-tertiary-container/10 text-on-tertiary-container font-semibold text-sm">
                {member.image}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-on-surface text-sm truncate">{member.name}</h3>
                <p className="text-xs text-on-tertiary-container mt-0.5">{member.role}</p>
              </div>
              {member.experience && parseInt(member.experience) >= 5 && (
                <Star className="h-4 w-4 text-tertiary shrink-0" fill="currentColor" opacity={0.3} />
              )}
            </div>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Headphones className="h-3 w-3 shrink-0" />
                <span>{member.channel}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Languages className="h-3 w-3 shrink-0" />
                <span className="truncate">{member.languages.join(", ")}</span>
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