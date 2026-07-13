"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Mail, Phone, Briefcase, FileText,
  Link2, Upload, CheckCircle2, Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Job {
  title: string;
  dept: string;
  location: string;
  type: string;
  level: string;
}

interface Props {
  job: Job | null;
  onClose: () => void;
}

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  linkedin: string;
  years_of_experience: string;
  cover_letter: string;
  resume_name: string;
}

const EMPTY: FormState = {
  full_name: "",
  email: "",
  phone: "",
  linkedin: "",
  years_of_experience: "",
  cover_letter: "",
  resume_name: "",
};

export function JobApplicationModal({ job, onClose }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset state when job changes
  useEffect(() => {
    setForm(EMPTY);
    setResumeFile(null);
    setErrors({});
    setSubmitted(false);
  }, [job]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let val = e.target.value;
    if (key === "full_name") val = val.replace(/[^a-zA-Z\s]/g, "");
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((err) => ({ ...err, [key]: "" }));
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.full_name.trim())          e.full_name = "Full name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.com$/i.test(form.email))
      e.email = "Email must contain @ and end with .com";
    if (!form.phone.trim() || !/^[+]?[\d\s\-().]{7,15}$/.test(form.phone))
      e.phone = "Enter a valid phone number.";
    if (!form.years_of_experience)       e.years_of_experience = "Required.";
    if (!form.cover_letter.trim())       e.cover_letter = "Please add a short cover letter.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !job) return;
    setSubmitting(true);

    try {
      let resume_url: string | null = null;

      // Upload resume to Supabase Storage if provided
      if (resumeFile) {
        const ext = resumeFile.name.split(".").pop();
        const path = `resumes/${Date.now()}_${form.full_name.replace(/\s+/g, "_")}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("job-applications")
          .upload(path, resumeFile, { upsert: false });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from("job-applications")
            .getPublicUrl(path);
          resume_url = urlData.publicUrl;
        }
      }

      // Insert application row into Supabase table
      const { error } = await supabase.from("job_applications").insert({
        job_title:           job.title,
        department:          job.dept,
        location:            job.location,
        job_type:            job.type,
        level:               job.level,
        full_name:           form.full_name.trim(),
        email:               form.email.trim().toLowerCase(),
        phone:               form.phone.trim(),
        linkedin:            form.linkedin.trim() || null,
        years_of_experience: Number(form.years_of_experience),
        cover_letter:        form.cover_letter.trim(),
        resume_url,
        applied_at:          new Date().toISOString(),
        status:              "new",
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Application submission error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setResumeFile(file);
    if (file) setForm((f) => ({ ...f, resume_name: file.name }));
  };

  const inputCls = (field: keyof FormState) =>
    `w-full bg-white/5 border ${errors[field] ? "border-red-400/60" : "border-white/10"} rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#00C2FF]/60 focus:ring-1 focus:ring-[#00C2FF]/30 transition-all`;

  if (!job) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full px-6 py-12 max-w-7xl mx-auto"
      >
        <div
          className="relative w-full rounded-2xl border border-[#00C2FF]/20 bg-[#0d2040] shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 0 80px rgba(0,194,255,0.1)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-white/5">
            <div>
              <p className="text-xs font-bold text-[#00C2FF] uppercase tracking-widest mb-1">Apply Now</p>
              <h2 className="text-xl font-bold text-white leading-tight">{job.title}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/60">{job.dept}</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/60">{job.location}</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/60">{job.level}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Success state */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Application Submitted!</h3>
              <p className="text-white/60 max-w-sm text-sm">
                Thank you, <strong className="text-white">{form.full_name}</strong>! We've received your application for <strong className="text-[#00C2FF]">{job.title}</strong> and will be in touch soon.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-semibold text-sm"
              >
                Close
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Personal Info */}
              <div>
                <p className="text-xs font-semibold text-[#00C2FF]/70 uppercase tracking-widest mb-3">Personal Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full name */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-white/60 mb-1.5">
                      <User className="w-3 h-3" /> Full Name *
                    </label>
                    <input className={inputCls("full_name")} value={form.full_name} onChange={set("full_name")} placeholder="Jane Smith" />
                    {errors.full_name && <p className="text-red-400 text-[11px] mt-1">{errors.full_name}</p>}
                  </div>
                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-white/60 mb-1.5">
                      <Mail className="w-3 h-3" /> Email *
                    </label>
                    <input type="email" className={inputCls("email")} value={form.email} onChange={set("email")} placeholder="jane@example.com" />
                    {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-white/60 mb-1.5">
                      <Phone className="w-3 h-3" /> Phone *
                    </label>
                    <input className={inputCls("phone")} value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" />
                    {errors.phone && <p className="text-red-400 text-[11px] mt-1">{errors.phone}</p>}
                  </div>
                  {/* LinkedIn */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-white/60 mb-1.5">
                      <Link2 className="w-3 h-3" /> LinkedIn (optional)
                    </label>
                    <input className={inputCls("linkedin")} value={form.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/janesmith" />
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div>
                <p className="text-xs font-semibold text-[#00C2FF]/70 uppercase tracking-widest mb-3">Experience</p>
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-white/60 mb-1.5">
                    <Briefcase className="w-3 h-3" /> Years of Experience *
                  </label>
                  <input
                    type="number" min="0" max="50"
                    className={inputCls("years_of_experience")}
                    value={form.years_of_experience}
                    onChange={set("years_of_experience")}
                    placeholder="e.g. 5"
                  />
                  {errors.years_of_experience && <p className="text-red-400 text-[11px] mt-1">{errors.years_of_experience}</p>}
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <p className="text-xs font-semibold text-[#00C2FF]/70 uppercase tracking-widest mb-3">Cover Letter</p>
                <label className="flex items-center gap-1.5 text-xs text-white/60 mb-1.5">
                  <FileText className="w-3 h-3" /> Tell us why you're a great fit *
                </label>
                <textarea
                  rows={4}
                  className={`${inputCls("cover_letter")} resize-none`}
                  value={form.cover_letter}
                  onChange={set("cover_letter")}
                  placeholder="Briefly describe your experience and why you want to join NexaCargo..."
                />
                {errors.cover_letter && <p className="text-red-400 text-[11px] mt-1">{errors.cover_letter}</p>}
              </div>

              {/* Resume Upload */}
              <div>
                <p className="text-xs font-semibold text-[#00C2FF]/70 uppercase tracking-widest mb-3">Resume (optional)</p>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/15 hover:border-[#00C2FF]/40 bg-white/3 hover:bg-[#00C2FF]/5 transition-all text-sm text-white/50 hover:text-white/80"
                >
                  <Upload className="w-4 h-4" />
                  {resumeFile ? (
                    <span className="text-[#00C2FF] font-medium">{resumeFile.name}</span>
                  ) : (
                    "Upload PDF, DOC or DOCX"
                  )}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] text-white font-bold text-sm shadow-[0_0_30px_rgba(0,194,255,0.25)] hover:shadow-[0_0_40px_rgba(0,194,255,0.4)] transition-all disabled:opacity-60"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                ) : (
                  "Submit Application"
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
