-- =====================================================================
-- Migration 0001 — backend-issued JWT auth (alongside Supabase)
--
-- Safe to run against an existing database. Idempotent. Does NOT drop or
-- recreate any table (unlike schema.sql, which has destructive bootstrap
-- sections). Apply with e.g.:
--   psql "$DATABASE_URL" -f backend/migrations/0001_backend_jwt_auth.sql
-- =====================================================================

-- 1. Store bcrypt hashes for users that authenticate via /api/auth/login.
--    Null for Supabase-authenticated users.
alter table public.profiles
  add column if not exists password_hash text;

-- 2. Decouple profiles from auth.users so users registered through the
--    backend (random UUID, no Supabase auth row) can be inserted.
--    Supabase-managed users keep working; they just lose ON DELETE CASCADE
--    from auth.users.
alter table public.profiles
  drop constraint if exists profiles_id_fkey;
