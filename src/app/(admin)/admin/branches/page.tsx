"use client";

import { useState } from "react";
import { GitBranch, MapPin, Users, Package, CheckCircle2, AlertTriangle, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";

const BRANCHES = [
  { id: "BR-001", name: "Dubai HQ", location: "Dubai, UAE", region: "Middle East", type: "Headquarters", staff: 42, capacity: 95, status: "Operational" },
  { id: "BR-002", name: "Shanghai Hub", location: "Shanghai, CN", region: "Asia Pacific", type: "Logistics Hub", staff: 38, capacity: 82, status: "Operational" },
  { id: "BR-003", name: "Rotterdam Port", location: "Rotterdam, NL", region: "Europe", type: "Port Office", staff: 24, capacity: 71, status: "Operational" },
  { id: "BR-004", name: "Singapore Depot", location: "Singapore", region: "Asia Pacific", type: "Warehouse", staff: 19, capacity: 90, status: "At Capacity" },
  { id: "BR-005", name: "Los Angeles Gateway", location: "Los Angeles, US", region: "North America", type: "Logistics Hub", staff: 31, capacity: 58, status: "Operational" },
  { id: "BR-006", name: "Mumbai Office", location: "Mumbai, IN", region: "South Asia", type: "Regional Office", staff: 15, capacity: 44, status: "Maintenance" },
];

const STATUS_STYLES: Record<string, string> = {
  Operational: "text-green-400 bg-green-400/10",
  "At Capacity": "text-error bg-error/10",
  Maintenance: "text-on-tertiary-container bg-on-tertiary-container/10",
};

const TYPE_STYLES: Record<string, string> = {
  Headquarters: "text-tertiary bg-tertiary/10",
  "Logistics Hub": "text-secondary bg-secondary/10",
  "Port Office": "text-on-tertiary-container bg-on-tertiary-container/10",
  Warehouse: "text-green-400 bg-green-400/10",
  "Regional Office": "text-on-surface-variant bg-white/5",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }
};

export default function BranchManagementPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: "", location: "", type: "Logistics Hub" });
  const [branchErrors, setBranchErrors] = useState<Record<string, string>>({});

  function handleBranchSave() {
    const e: Record<string, string> = {};
    if (!branchForm.name.trim()) e.name = "Branch name is required.";
    if (!branchForm.location.trim()) e.location = "Location is required.";
    if (Object.keys(e).length) { setBranchErrors(e); return; }
    setBranchErrors({});
    setShowForm(false);
    setBranchForm({ name: "", location: "", type: "Logistics Hub" });
  }

  const filtered = BRANCHES.filter(
    (b) => b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase()) ||
      b.region.toLowerCase().includes(search.toLowerCase())
  );

  const operational = BRANCHES.filter((b) => b.status === "Operational").length;
  const atCapacity = BRANCHES.filter((b) => b.status === "At Capacity").length;
  const maintenance = BRANCHES.filter((b) => b.status === "Maintenance").length;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <motion.div variants={itemVariants}>
          <Link href="/admin" className="inline-flex items-center gap-2 mb-5 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
            <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
            <span className="text-sm font-bold text-[#0B1F3A]">← Back to Admin Dashboard</span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-tertiary">Admin Portal</p>
          <h1 className="text-3xl font-bold text-on-surface mt-1">Branch Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">Oversee multiple business locations and regional operations.</p>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-tertiary/20 text-tertiary text-xs font-semibold hover:bg-tertiary/30 transition-colors shrink-0 shadow-[0_4px_12px_rgba(153,203,255,0.1)]"
        >
          <Plus className="h-4 w-4" /> Add Branch
        </motion.button>
      </div>

      {/* Add Branch Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <Card className="p-5 space-y-4 border border-tertiary/20 bg-white/[0.01]">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">New Branch</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant">Branch Name</label>
                  <input value={branchForm.name} onChange={e => { setBranchForm(p => ({...p, name: e.target.value})); setBranchErrors(p => ({...p, name: ""})); }}
                    placeholder="e.g. Tokyo Office"
                    className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${branchErrors.name ? "border-red-500" : "border-white/10"}`} />
                  {branchErrors.name && <p className="text-xs text-error mt-1">{branchErrors.name}</p>}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant">Location</label>
                  <input value={branchForm.location} onChange={e => { setBranchForm(p => ({...p, location: e.target.value})); setBranchErrors(p => ({...p, location: ""})); }}
                    placeholder="e.g. Tokyo, JP"
                    className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/50 ${branchErrors.location ? "border-red-500" : "border-white/10"}`} />
                  {branchErrors.location && <p className="text-xs text-error mt-1">{branchErrors.location}</p>}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant">Type</label>
                  <select value={branchForm.type} onChange={e => setBranchForm(p => ({...p, type: e.target.value}))}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
                    <option>Logistics Hub</option><option>Warehouse</option><option>Port Office</option><option>Regional Office</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleBranchSave} className="px-4 py-2 rounded-lg bg-tertiary/20 text-tertiary text-sm font-semibold hover:bg-tertiary/30 transition-colors">Save Branch</button>
                <button onClick={() => { setShowForm(false); setBranchErrors({}); }} className="px-4 py-2 rounded-lg bg-white/5 text-on-surface-variant text-sm font-semibold hover:bg-white/10 transition-colors">Cancel</button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="p-5 flex items-center gap-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 transition-colors">
            <CheckCircle2 className="h-8 w-8 text-green-400 shrink-0" />
            <div><p className="font-mono text-2xl font-bold text-on-surface">{operational}</p><p className="text-xs uppercase tracking-widest text-on-surface-variant">Operational</p></div>
          </Card>
        </motion.div>
        <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="p-5 flex items-center gap-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 transition-colors">
            <AlertTriangle className="h-8 w-8 text-error shrink-0" />
            <div><p className="font-mono text-2xl font-bold text-on-surface">{atCapacity}</p><p className="text-xs uppercase tracking-widest text-on-surface-variant">At Capacity</p></div>
          </Card>
        </motion.div>
        <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="p-5 flex items-center gap-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 transition-colors">
            <GitBranch className="h-8 w-8 text-on-tertiary-container shrink-0" />
            <div><p className="font-mono text-2xl font-bold text-on-surface">{maintenance}</p><p className="text-xs uppercase tracking-widest text-on-surface-variant">Maintenance</p></div>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input type="text" placeholder="Search branches…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/55 transition-colors" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((b, index) => (
            <motion.div
              layout
              key={b.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 24, delay: index * 0.02 }}
              whileHover={{ y: -4 }}
            >
              <Card className="p-5 space-y-4 group hover:border-white/10 transition-colors h-full bg-white/[0.01]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-on-surface">{b.name}</p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3 shrink-0" />{b.location}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold shrink-0 ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_STYLES[b.type] ?? "text-on-surface-variant bg-white/5"}`}>{b.type}</span>
                  <span className="text-[11px] text-on-surface-variant bg-white/5 rounded-full px-2.5 py-0.5">{b.region}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{b.staff} staff</span>
                    <span className="flex items-center gap-1"><Package className="h-3 w-3" />{b.capacity}% capacity</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${b.capacity >= 90 ? "bg-error" : b.capacity >= 70 ? "bg-on-tertiary-container" : "bg-tertiary"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${b.capacity}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.05 + 0.1 }}
                    />
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-tertiary text-xs hover:bg-white/10 transition-colors">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-error text-xs hover:bg-error/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
