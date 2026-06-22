"use client";

/**
 * Top navigation for authenticated areas (dashboard, profile).
 * Shows the brand, primary links, and a user menu with a logout action that
 * clears session state and returns to the public home page.
 */

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, UserCircle, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ROLE_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

const LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/profile", icon: UserCircle },
];

export function AuthHeader() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info("You have been signed out.");
    router.replace("/");
  };

  const initials = user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[rgba(7,15,24,0.85)] px-6 backdrop-blur-xl">
      <div className="flex items-center gap-10">
        <Link href="/" className="font-display-lg text-xl font-bold tracking-tight text-primary">
          NexaCargo
        </Link>
        <nav className="hidden gap-1 md:flex">
          {LINKS.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-white/5 text-tertiary"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon className="h-4 w-4" /> {name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/10"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#005db7] text-xs font-bold text-white">
            {initials}
          </span>
          <span className="hidden text-sm font-medium text-on-surface sm:block">
            {user?.name.split(" ")[0]}
          </span>
          <ChevronDown className="h-4 w-4 text-on-surface-variant" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="glass animate-in fade-in absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border-white/10 p-1 shadow-xl"
          >
            <div className="border-b border-white/5 px-3 py-2">
              <p className="truncate text-sm font-semibold text-on-surface">{user?.name}</p>
              <p className="truncate text-xs text-on-surface-variant">{user?.email}</p>
              {user && (
                <span className="font-label-caps mt-1 inline-block rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-tertiary">
                  {ROLE_LABEL[user.role]}
                </span>
              )}
            </div>
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
            >
              <UserCircle className="h-4 w-4" /> Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error transition-colors hover:bg-error/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
