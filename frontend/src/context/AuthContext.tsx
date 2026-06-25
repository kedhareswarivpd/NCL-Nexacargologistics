"use client";

import * as React from "react";
import { useEffect, useCallback, useMemo, useReducer, createContext, useContext } from "react";
import type { LoginInput, ProfileInput, RegisterInput, User } from "@/lib/types";
import {
  loginUser, registerUser, logoutUser,
  updateUser as apiUpdateUser, requestPasswordReset, getCurrentUser,
} from "@/lib/auth-store";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: Status;
}

type Action =
  | { type: "RESTORE"; user: User | null }
  | { type: "AUTH_SUCCESS"; user: User }
  | { type: "LOGOUT" }
  | { type: "PROFILE_UPDATED"; user: User };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case "RESTORE":
      return { user: action.user, status: action.user ? "authenticated" : "unauthenticated" };
    case "AUTH_SUCCESS":
      return { user: action.user, status: "authenticated" };
    case "PROFILE_UPDATED":
      return { ...state, user: action.user };
    case "LOGOUT":
      return { user: null, status: "unauthenticated" };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (input: ProfileInput) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, status: "loading" });

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (state.status !== "authenticated") return;
    const TIMEOUT = 30 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logoutUser();
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("nexacargo_session");
        window.location.href = "/login";
      }, TIMEOUT);
    };
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [state.status]);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("nexacargo_session");
        if (stored) {
          dispatch({ type: "RESTORE", user: JSON.parse(stored) });
        }
      } catch (e) {
        console.error("Failed to parse cached session:", e);
      }
    }

    getCurrentUser().then(user => {
      dispatch({ type: "RESTORE", user });
      if (user) {
        localStorage.setItem("nexacargo_session", JSON.stringify(user));
      } else {
        localStorage.removeItem("nexacargo_session");
      }
    });
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const user = await loginUser(input);
    dispatch({ type: "AUTH_SUCCESS", user });
    localStorage.setItem("nexacargo_session", JSON.stringify(user));
    return user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const user = await registerUser(input);
    dispatch({ type: "AUTH_SUCCESS", user });
    localStorage.setItem("nexacargo_session", JSON.stringify(user));
    return user;
  }, []);

  const forgotPassword = useCallback(
    (email: string) => requestPasswordReset(email),
    [],
  );

  const updateProfile = useCallback(
    async (input: ProfileInput) => {
      if (!state.user) throw new Error("Not signed in.");
      const user = await apiUpdateUser(state.user.id, input);
      dispatch({ type: "PROFILE_UPDATED", user });
      localStorage.setItem("nexacargo_session", JSON.stringify(user));
      return user;
    },
    [state.user],
  );

  const logout = useCallback(() => {
    logoutUser();
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("nexacargo_session");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: state.status === "authenticated",
      login,
      register,
      forgotPassword,
      updateProfile,
      logout,
    }),
    [state, login, register, forgotPassword, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider.");
  return ctx;
}
