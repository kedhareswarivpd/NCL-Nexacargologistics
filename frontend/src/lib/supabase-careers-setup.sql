-- ============================================================
-- Run this in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- 1. Create the job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_title            text        NOT NULL,
  department           text        NOT NULL,
  location             text        NOT NULL,
  job_type             text        NOT NULL,
  level                text        NOT NULL,
  full_name            text        NOT NULL,
  email                text        NOT NULL,
  phone                text        NOT NULL,
  linkedin             text,
  years_of_experience  integer     NOT NULL DEFAULT 0,
  cover_letter         text        NOT NULL,
  resume_url           text,
  status               text        NOT NULL DEFAULT 'new',   -- new | reviewed | shortlisted | rejected
  applied_at           timestamptz NOT NULL DEFAULT now(),
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone (public) to INSERT (submit an application)
CREATE POLICY "Public can submit applications"
  ON public.job_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4. Only authenticated admins can SELECT (view applications)
--    Adjust this if you have a custom roles setup
CREATE POLICY "Admins can view applications"
  ON public.job_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- 5. Create Supabase Storage bucket for resumes
-- ============================================================
-- Go to: Storage → New Bucket → Name: "job-applications" → Public: OFF
-- Then add this policy so anon users can upload:

-- In Storage Policies for the "job-applications" bucket:
-- Policy name: "Anyone can upload resumes"
-- Operation: INSERT
-- Role: anon, authenticated
-- Expression: true
