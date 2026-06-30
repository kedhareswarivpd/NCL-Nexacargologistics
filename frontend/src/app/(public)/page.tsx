"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Home from "./Home";

export default function Page() {
  const { isAuthenticated, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && isAuthenticated) {
      router.replace("/customer");
    }
  }, [status, isAuthenticated, router]);

  return <Home />;
}
