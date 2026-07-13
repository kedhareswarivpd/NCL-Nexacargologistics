import axios from "axios";
import { supabase } from "./supabase";

/**
 * Axios client for the NexaCargo FastAPI backend.
 *
 * Authentication is delegated to Supabase: we attach the current Supabase
 * access token as a Bearer header on every request. The backend verifies it.
 */
// In the browser, route through the Next.js proxy to avoid CORS.
// On the server (SSR), call the backend directly.
const baseURL = typeof window !== "undefined"
  ? "/api/proxy"
  : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1");

export const api = axios.create({
  baseURL,
  timeout: 60000,
});

api.interceptors.request.use(async (config) => {
  let { data } = await supabase.auth.getSession();
  if (data.session) {
    const expiresAt = data.session.expires_at ?? 0;
    const nowSecs = Math.floor(Date.now() / 1000);
    // Refresh if already expired OR expiring within 5 minutes
    if (expiresAt - nowSecs < 300) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      if (refreshed.session) data = refreshed;
    }
  } else {
    // No session cached — try a refresh in case the refresh token is still valid
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed.session) data = refreshed;
  }
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { data } = await supabase.auth.refreshSession();
      if (data.session?.access_token) {
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
        return api(originalRequest);
      }
      // Refresh token expired — force re-login
      await supabase.auth.signOut();
      localStorage.removeItem("nexacargo_session");
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const isAuthPage = path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/admin-login");
        if (!isAuthPage) {
          window.location.href = `/login?next=${encodeURIComponent(path)}&reason=session_expired`;
        }
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
