import axios from "axios";
import { supabase } from "./supabase";

/**
 * Axios client for the NexaCargo FastAPI backend.
 *
 * Authentication is delegated to Supabase: we attach the current Supabase
 * access token as a Bearer header on every request. The backend verifies it.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Session expired/invalid — bounce to login (avoid loop on the auth pages).
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/register") && !path.startsWith("/admin-login")) {
        window.location.href = `/login?next=${encodeURIComponent(path)}`;
      }
    }
    return Promise.reject(error);
  }
);

/** Narrow an axios error into a readable message for toasts. */
export function apiError(err: unknown, fallback = "Something went wrong."): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    return err.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
}
