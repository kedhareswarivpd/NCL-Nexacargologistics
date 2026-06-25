"use client";

import { useEffect, useRef, useState } from "react";
import { User, Bell, Shield, Truck, UploadCloud, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { driverApi } from "@/lib/services";
import type { DeliveryProof } from "@/lib/types";

export default function DriverSettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [proofs, setProofs] = useState<DeliveryProof[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pwForm, setPwForm] = useState({ current: "", next: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSaved, setPwSaved] = useState(false);

  function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!pwForm.current.trim()) errs.current = "Current password is required.";
    if (!pwForm.next.trim()) errs.next = "New password is required.";
    else if (pwForm.next.length < 8) errs.next = "Password must be at least 8 characters.";
    else if (!/[A-Za-z]/.test(pwForm.next)) errs.next = "Password must include a letter.";
    else if (!/[0-9]/.test(pwForm.next)) errs.next = "Password must include a number.";
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwSaved(true);
    setPwForm({ current: "", next: "" });
    setTimeout(() => setPwSaved(false), 3000);
  }

  const [notifications, setNotifications] = useState({
    newRoute: true,
    taskAssigned: true,
    trafficAlert: true,
    shiftReminder: false,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await driverApi.profile();
        setProfile(data ?? null);
      } catch {
        setProfile(null);
      }
    })();
    // TODO: backend has no "delivery_proofs" listing endpoint — recent uploads
    // are left empty. driverApi.uploadProof(id, url) attaches a proof URL to a
    // specific delivery but does not return a browsable history.
    setProofs([]);
  }, [user]);

  async function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setUploadDone(false);
    // TODO: no file-storage / proof-upload endpoint that accepts a raw file.
    // driverApi.uploadProof(deliveryId, proofUrl) only stores an already-hosted
    // URL against a delivery; there is no bucket to upload the file to. Kept as
    // local-only confirmation until a storage endpoint exists.
    setUploadDone(true);
    setUploading(false);
  }

  function saveProfile() {
    // TODO: no driver settings write endpoint — name/phone/location changes are
    // kept in local state only and not persisted to the backend.
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <Link href="/driver" className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
          <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-tertiary">Driver</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-4 w-4 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Profile</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Full Name</label>
            <input defaultValue={user?.name ?? ""} disabled className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface-variant opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Email</label>
            <input defaultValue={user?.email ?? ""} disabled className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface-variant opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Phone</label>
            <input
              value={profile?.phone ?? ""}
              onChange={(e) => setProfile((p: any) => p ? { ...p, phone: e.target.value } : p)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Location</label>
            <input
              value={profile?.location ?? ""}
              onChange={(e) => setProfile((p: any) => p ? { ...p, location: e.target.value } : p)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50"
            />
          </div>
        </div>
        <button onClick={saveProfile} className="mt-2 px-4 py-2 rounded-lg bg-tertiary/10 text-tertiary text-sm font-semibold hover:bg-tertiary/20 transition-colors">
          Save Changes
        </button>
      </Card>

      {/* Delivery Proof Upload */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <UploadCloud className="h-4 w-4 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Delivery Proof Upload</h2>
        </div>
        <p className="text-xs text-on-surface-variant">Upload photo confirmations (POD) for your deliveries.</p>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-tertiary/40 transition-colors"
        >
          {uploadDone
            ? <CheckCircle2 className="h-8 w-8 text-green-400" />
            : <UploadCloud className={`h-8 w-8 ${uploading ? "text-tertiary animate-pulse" : "text-on-surface-variant"}`} />
          }
          <p className="text-sm text-on-surface-variant">
            {uploading ? "Uploading…" : uploadDone ? "Upload successful!" : "Click to upload delivery photo"}
          </p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleProofUpload} />
        </div>

        {proofs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Recent Uploads</p>
            {proofs.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/5">
                <a href={p.photo_url} target="_blank" rel="noreferrer" className="text-xs text-tertiary truncate hover:underline">
                  {p.photo_url.split("/").pop()}
                </a>
                <span className="text-xs text-on-surface-variant shrink-0">{new Date(p.uploaded_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Notifications */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-4 w-4 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Notifications</h2>
        </div>
        {[
          { key: "newRoute", label: "New route assigned" },
          { key: "taskAssigned", label: "Task assigned to me" },
          { key: "trafficAlert", label: "Traffic & route alerts" },
          { key: "shiftReminder", label: "Shift start reminders" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-on-surface">{label}</span>
            <button
              onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
              className={`w-10 h-5 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? "bg-tertiary" : "bg-white/10"}`}
            >
              <span className={`block w-4 h-4 rounded-full bg-white mx-auto transition-transform ${notifications[key as keyof typeof notifications] ? "translate-x-2.5" : "-translate-x-2.5"}`} />
            </button>
          </div>
        ))}
      </Card>

      {/* Vehicle Preferences */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Truck className="h-4 w-4 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Vehicle Preferences</h2>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-on-surface-variant">Assigned Vehicle</label>
          <input defaultValue={profile?.vehicle ?? "—"} disabled className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface-variant opacity-60 cursor-not-allowed" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-on-surface-variant">Preferred Navigation</label>
          <select className="mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-sm text-on-surface focus:outline-none focus:border-tertiary/50">
            <option>Fastest Route</option>
            <option>Avoid Highways</option>
            <option>Avoid Tolls</option>
            <option>Eco Route</option>
          </select>
        </div>
        <button className="mt-2 px-4 py-2 rounded-lg bg-tertiary/10 text-tertiary text-sm font-semibold hover:bg-tertiary/20 transition-colors">
          Save Preferences
        </button>
      </Card>

      {/* Security */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-4 w-4 text-tertiary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Security</h2>
        </div>
        {pwSaved && <p className="text-xs text-green-400 bg-green-400/10 rounded-lg px-3 py-2">Password updated successfully.</p>}
        <form noValidate onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">Current Password</label>
            <input type="password" value={pwForm.current} onChange={e => { setPwForm(p => ({...p, current: e.target.value})); setPwErrors(p => ({...p, current: ""})); }} placeholder="••••••••" className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50 ${pwErrors.current ? "border-red-500" : "border-white/10"}`} />
            {pwErrors.current && <p className="text-xs text-error mt-1">{pwErrors.current}</p>}
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-on-surface-variant">New Password</label>
            <input type="password" value={pwForm.next} onChange={e => { setPwForm(p => ({...p, next: e.target.value})); setPwErrors(p => ({...p, next: ""})); }} placeholder="••••••••" className={`mt-1 w-full px-3 py-2 rounded-lg bg-surface-container border text-sm text-on-surface focus:outline-none focus:border-tertiary/50 ${pwErrors.next ? "border-red-500" : "border-white/10"}`} />
            {pwErrors.next && <p className="text-xs text-error mt-1">{pwErrors.next}</p>}
          </div>
          <button type="submit" className="mt-2 px-4 py-2 rounded-lg bg-error/10 text-error text-sm font-semibold hover:bg-error/20 transition-colors">Update Password</button>
        </form>
      </Card>
    </div>
  );
}
