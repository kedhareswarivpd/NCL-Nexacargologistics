"use client";

import { useEffect, useState, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { X, ArrowLeft, Phone, Mail } from "lucide-react";
import Link from "next/link";

interface TeamMember {
  id: number | string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  image?: string;
  [key: string]: any;
}

interface TeamStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

interface TeamPageConfig {
  department: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  textColor: string;
  borderColor: string;
  backHref: string;
  defaultMembers: TeamMember[];
  stats: TeamStat[];
  filters?: string[];
  fetchMembers?: () => Promise<TeamMember[]>;
  renderCardContent?: (member: TeamMember) => React.ReactNode;
  showEdit?: boolean;
}

const defaultInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

export function TeamPage(config: TeamPageConfig) {
  const {
    department,
    title,
    description,
    icon: Icon,
    iconColor,
    textColor,
    borderColor,
    backHref,
    defaultMembers,
    stats,
    filters,
    fetchMembers,
    renderCardContent,
    showEdit,
  } = config;

  const [members, setMembers] = useState(defaultMembers);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  function openEdit(m: TeamMember) {
    setEditTarget(m);
    setEditForm({ name: m.name, role: m.role, phone: m.phone ?? "", email: m.email ?? "" });
  }

  function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setMembers(prev => prev.map(m => m.id === editTarget.id ? { ...m, ...editForm } : m));
    setEditTarget(null);
  }

  useEffect(() => {
    if (fetchMembers) {
      fetchMembers().then(data => { if (data?.length) setMembers(data); }).catch(() => {});
    }
  }, [fetchMembers]);

  return (
    <div className="p-6 space-y-6 page-enter">
      <div className="animate-fade-up">
        <Link href={backHref} className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColor}/20`}>
            <Icon className={`h-6 w-6 ${textColor}`} />
          </div>
          <div>
            <p className={`text-xs uppercase tracking-widest ${textColor}`}>{department}</p>
            <h1 className="text-3xl font-bold text-on-surface">{title}</h1>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant mt-2">{description}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: StatIcon, color }) => (
          <Card key={label} className="p-4 animate-fade-up">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}><StatIcon className="h-4 w-4" /></span>
            <p className="mt-3 font-mono text-xl font-bold text-on-surface">{value}</p>
            <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
          </Card>
        ))}
      </div>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-up">
          {filters.map((filter) => (
            <button type="button" key={filter} className={`px-4 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-all border border-white/5 hover:${borderColor}`}>
              {filter}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map((member, index) => (
          <Card key={member.id} className={`p-4 animate-fade-up hover:${borderColor} transition-all`} style={{ animationDelay: `${index * 0.04}s` }}>
            <div className="flex items-start gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${textColor} bg-white/10 font-semibold text-sm`}>
                {member.image || defaultInitials(member.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-on-surface text-sm truncate">{member.name}</h3>
                <p className={`text-xs ${textColor} mt-0.5`}>{member.role}</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {renderCardContent ? renderCardContent(member) : (
                <>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span className="truncate">{member.phone}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </>
              )}
              {showEdit && (
                <button type="button" onClick={() => openEdit(member)} className="mt-1 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-tertiary text-xs hover:bg-tertiary/10 transition-colors w-full justify-center">
                  Edit
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-container shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="text-base font-bold text-on-surface">Edit Team Member</h2>
              <button type="button" onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant"><X className="h-4 w-4" /></button>
            </div>
            <form noValidate onSubmit={saveEdit} className="p-6 space-y-4">
              <div><label htmlFor="edit-name" className="text-xs uppercase tracking-widest text-on-surface-variant">Name</label><input id="edit-name" value={editForm.name || ""} onChange={e => setEditForm(p => ({...p, name: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
              <div><label htmlFor="edit-role" className="text-xs uppercase tracking-widest text-on-surface-variant">Role</label><input id="edit-role" value={editForm.role || ""} onChange={e => setEditForm(p => ({...p, role: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
              <div><label htmlFor="edit-phone" className="text-xs uppercase tracking-widest text-on-surface-variant">Phone</label><input id="edit-phone" value={editForm.phone || ""} onChange={e => setEditForm(p => ({...p, phone: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
              <div><label htmlFor="edit-email" className="text-xs uppercase tracking-widest text-on-surface-variant">Email</label><input id="edit-email" value={editForm.email || ""} onChange={e => setEditForm(p => ({...p, email: e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#1E88E5] text-white font-bold text-sm hover:bg-[#1565C0]">Save Changes</button>
                <button type="button" onClick={() => setEditTarget(null)} className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-on-surface-variant hover:bg-white/10">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
