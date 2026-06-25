"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Home from "./Home";

export default function Page() {
  const { isAuthenticated, status, logout } = useAuth();

  useEffect(() => {
    // Wait until auth state has fully resolved before checking
    if (status === "authenticated" && isAuthenticated) {
      logout();
    }
  }, [status, isAuthenticated, logout]);

  return <Home />;
}
