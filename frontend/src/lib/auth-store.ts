/**
 * Auth store — Supabase-backed.
 * Register/login via Supabase Auth. Profile data (name, role, company, phone)
 * is stored in the `profiles` table.
 *
 * Run this SQL once in your Supabase SQL editor:
 * ─────────────────────────────────────────────
 * create table if not exists public.profiles (
 *   id          uuid primary key references auth.users(id) on delete cascade,
 *   name        text not null,
 *   role        text not null default 'customer',
 *   company     text,
 *   phone       text,
 *   created_at  timestamptz default now()
 * );
 * alter table public.profiles enable row level security;
 * create policy "Users can read own profile"
 *   on public.profiles for select using (auth.uid() = id);
 * create policy "Users can update own profile"
 *   on public.profiles for update using (auth.uid() = id);
 * create policy "Users can insert own profile"
 *   on public.profiles for insert with check (auth.uid() = id);
 * ─────────────────────────────────────────────
 */

import { supabase } from "./supabase";
import type { LoginInput, ProfileInput, RegisterInput, User, UserRole } from "./types";

const SESSION_KEY = process.env.NEXT_PUBLIC_SESSION_KEY ?? "nexacargo_session";

function toUser(id: string, email: string, profile: { name: string; role: string; company?: string; phone?: string; created_at?: string }): User {
  return {
    id,
    name:      profile.name,
    email,
    role:      profile.role as UserRole,
    company:   profile.company ?? undefined,
    phone:     profile.phone ?? undefined,
    createdAt: profile.created_at ?? new Date().toISOString(),
  };
}

export async function registerUser(input: RegisterInput): Promise<User> {
  if (input.password !== input.confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  // 1. Create Supabase Auth user
  const { data, error } = await supabase.auth.signUp({
    email:    input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        name:    input.name.trim(),
        role:    input.role ?? "customer",
        company: input.company?.trim() ?? null,
        phone:   input.phone?.trim() ?? null,
      },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Registration failed. Please try again.");

  // 2. Insert into profiles table
  const { error: profileError } = await supabase.from("profiles").upsert({
    id:      data.user.id,
    name:    input.name.trim(),
    role:    input.role ?? "customer",
    company: input.company?.trim() ?? null,
    phone:   input.phone?.trim() ?? null,
  });

  if (profileError) throw new Error(profileError.message);

  return toUser(data.user.id, data.user.email ?? input.email, {
    name:    input.name.trim(),
    role:    input.role ?? "customer",
    company: input.company?.trim(),
    phone:   input.phone?.trim(),
  });
}

export async function loginUser(input: LoginInput): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email:    input.email.trim().toLowerCase(),
    password: input.password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Login failed. Please try again.");

  // Fetch profile
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("name, role, company, phone, created_at")
    .eq("id", data.user.id)
    .limit(1);

  const profile = profiles?.[0] ?? null;
  if (profileError) throw new Error(`Could not load user profile: ${profileError.message}`);

  // Fall back to auth user metadata if profile row doesn't exist yet
  if (!profile) {
    const meta = data.user.user_metadata;
    const { error: insertError } = await supabase.from("profiles").insert({
      id:      data.user.id,
      name:    meta?.name ?? data.user.email ?? "User",
      role:    meta?.role ?? "customer",
      company: meta?.company ?? null,
      phone:   meta?.phone ?? null,
    });
    if (insertError) throw new Error(`Could not create user profile: ${insertError.message}`);
    return toUser(data.user.id, data.user.email ?? input.email, {
      name:    meta?.name ?? data.user.email ?? "User",
      role:    meta?.role ?? "customer",
      company: meta?.company,
      phone:   meta?.phone,
    });
  }

  return toUser(data.user.id, data.user.email ?? input.email, profile);
}

export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  let { data: { session } } = await supabase.auth.getSession();

  // Refresh if expiring within 60 seconds
  if (session) {
    const expiresAt = session.expires_at ?? 0;
    const nowSecs = Math.floor(Date.now() / 1000);
    if (expiresAt - nowSecs < 60) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      if (refreshed.session) session = refreshed.session;
    }
  }

  if (!session?.user) return null;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("name, role, company, phone, created_at")
    .eq("id", session.user.id)
    .limit(1);
  const profile = profiles?.[0] ?? null;

  if (!profile) return null;
  return toUser(session.user.id, session.user.email ?? "", profile);
}

export async function updateUser(_id: string, input: ProfileInput): Promise<User> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not signed in.");

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      name:    input.name.trim(),
      company: input.company?.trim() ?? null,
      phone:   input.phone?.trim() ?? null,
    })
    .eq("id", session.user.id)
    .select("name, role, company, phone, created_at")
    .single();

  if (error || !profile) throw new Error("Failed to update profile.");
  return toUser(session.user.id, session.user.email ?? "", profile);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
  });
}

export function setSession(_userId: string) {}
export function clearSession() {
  if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY);
}
