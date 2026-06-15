/**
 * Supabase Auth store.
 * Replaces the mock localStorage store — all auth now goes through Supabase.
 */

import { supabase } from "./supabase";
import type { LoginInput, ProfileInput, RegisterInput, User, UserRole } from "./types";

/** Map Supabase user metadata → our User shape */
function toUser(sbUser: import("@supabase/supabase-js").User): User {
  const meta = sbUser.user_metadata ?? {};
  const appMeta = sbUser.app_metadata ?? {};
  return {
    id:        sbUser.id,
    name:      meta.name      ?? sbUser.email?.split("@")[0] ?? "User",
    email:     sbUser.email   ?? "",
    role:      (meta.role ?? appMeta.role ?? "customer") as UserRole,
    company:   meta.company,
    phone:     meta.phone,
    createdAt: sbUser.created_at,
  };
}

export async function registerUser(input: RegisterInput): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email:    input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        name:    input.name.trim(),
        role:    input.role ?? "customer",
        company: input.company?.trim() ?? "",
      },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Registration failed — no user returned.");
  return toUser(data.user);
}

export async function loginUser(input: LoginInput): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email:    input.email.trim().toLowerCase(),
    password: input.password,
  });

  if (error) throw new Error("Incorrect email or password.");
  if (!data.user) throw new Error("Login failed.");

  // Fetch fresh user to get latest metadata (avoids stale role after SQL update)
  const { data: { user: freshUser } } = await supabase.auth.getUser();
  const resolved = freshUser ?? data.user;
  console.log("[auth] role resolved:", resolved.user_metadata, resolved.app_metadata);
  return toUser(resolved);
}

export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user ? toUser(user) : null;
}

export async function updateUser(_id: string, input: ProfileInput): Promise<User> {
  // Preserve existing role so a profile update never wipes it
  const { data: { user: current } } = await supabase.auth.getUser();
  const existingRole = current?.user_metadata?.role ?? "customer";

  const { data, error } = await supabase.auth.updateUser({
    data: {
      name:    input.name.trim(),
      company: input.company?.trim() ?? "",
      phone:   input.phone?.trim()   ?? "",
      role:    existingRole,
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Update failed.");
  return toUser(data.user);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
}

// Keep these as no-ops so nothing breaks — session is managed by Supabase
export function setSession(_userId: string) {}
export function clearSession() { supabase.auth.signOut(); }

/**
 * Dev helper — upgrades the currently signed-in user to admin.
 * Call once from the browser console: import('@/lib/auth-store').then(m => m.setCurrentUserAdmin())
 */
export async function setCurrentUserAdmin(): Promise<void> {
  const { error } = await supabase.auth.updateUser({ data: { role: "admin" } });
  if (error) throw new Error(error.message);
  console.log("[auth] role set to admin — please refresh.");
}
