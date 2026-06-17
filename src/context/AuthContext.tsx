"use client";

import * as React from "react";
import { useEffect, useCallback, useMemo, useReducer, createContext, useContext } from "react";
import type { LoginInput, ProfileInput, RegisterInput, User } from "@/lib/types";
import {
  loginUser, registerUser, logoutUser,
  updateUser, requestPasswordReset, getCurrentUser,
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

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    getCurrentUser().then(user => {
      dispatch({ type: "RESTORE", user });
    });
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const user = await loginUser(input);
    dispatch({ type: "AUTH_SUCCESS", user });
    return user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const user = await registerUser(input);
    dispatch({ type: "AUTH_SUCCESS", user });
    return user;
  }, []);

  const forgotPassword = useCallback(
    (email: string) => requestPasswordReset(email),
    [],
  );

  const updateProfile = useCallback(
    async (input: ProfileInput) => {
      if (!state.user) throw new Error("Not signed in.");
      const user = await updateUser(state.user.id, input);
      dispatch({ type: "PROFILE_UPDATED", user });
      return user;
    },
    [state.user],
  );

  const logout = useCallback(() => {
    logoutUser();
    dispatch({ type: "LOGOUT" });
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
