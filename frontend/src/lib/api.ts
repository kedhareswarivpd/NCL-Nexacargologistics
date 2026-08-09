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
    const status = error.response?.status;

    // Retry transient 502 / 503 / 504 errors (e.g., backend deployment cold start) up to 2 times
    if ((status === 502 || status === 503 || status === 504) && originalRequest && (originalRequest._retryCount || 0) < 2) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, 1500 * originalRequest._retryCount));
      return api(originalRequest);
    }

    if (status === 401 && originalRequest && !originalRequest._retry) {
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
    throw (error);
  }
);

/** Narrow an axios error into a readable message for toasts. */
export function apiError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;

    // Handle specific HTTP status codes with user-friendly messages
    if (status === 503) {
      const detail = data?.detail;
      if (typeof detail === "string" && detail.length > 0) return detail;
      return "The service is currently unavailable. Please try again in a few moments.";
    }
    if (status === 502) {
      return "The service is temporarily unavailable. Please try again shortly.";
    }
    if (status === 504) {
      return "The request timed out. Please try again.";
    }
    if (status === 401) {
      return "Your session has expired. Please sign in again.";
    }
    if (status === 403) {
      return "You don't have permission to perform this action.";
    }
    if (status === 404) {
      return "The requested resource was not found.";
    }
    if (status === 409) {
      const detail = data?.detail;
      if (typeof detail === "string") return detail;
      return "This action conflicts with the current state. Please refresh and try again.";
    }
    if (status === 422) {
      // Validation errors - format them nicely
      const detail = data?.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) {
        const msgs = detail.map((d) => {
          if (typeof d === "string") return d;
          if (d?.msg) {
            const loc = d.loc?.filter((l: any) => l !== "body").join(" → ");
            return loc ? `${loc}: ${d.msg}` : d.msg;
          }
          return String(d);
        }).filter(Boolean);
        if (msgs.length > 0) return msgs.join("; ");
      }
      return "Please check your input and try again.";
    }
    if (status === 429) {
      return "Too many requests. Please wait a moment before trying again.";
    }
    if (status && status >= 500) {
      return "An unexpected error occurred. Please try again later.";
    }

    // Fall back to server-provided message
    const detail = data?.detail;
    if (typeof detail === "string" && detail.length > 0) return detail;
    if (Array.isArray(detail)) {
      const msgs = detail.map((d) => (typeof d === "string" ? d : d?.msg || String(d))).filter(Boolean);
      if (msgs.length > 0) return msgs.join("; ");
    }
    return data?.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
}
