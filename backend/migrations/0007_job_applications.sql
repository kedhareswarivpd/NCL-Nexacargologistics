-- 0007_job_applications.sql
-- Career job applications table — stores submissions from the public careers page.
-- This table is accessed directly by the frontend (Supabase JS client) for public
-- INSERT and authenticated SELECT. The backend does not manage this table.

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
  status               text        NOT NULL DEFAULT 'new',
  applied_at           timestamptz NOT NULL DEFAULT now(),
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON public.job_applications(email);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications(applied_at DESC);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Public can submit applications" ON public.job_applications;
CREATE POLICY "Public can submit applications"
  ON public.job_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view applications" ON public.job_applications;
CREATE POLICY "Admins can view applications"
  ON public.job_applications
  FOR SELECT
  TO authenticated
  USING (true);
