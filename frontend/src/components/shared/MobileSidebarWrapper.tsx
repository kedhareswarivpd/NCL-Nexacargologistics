"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export function MobileSidebarWrapper({ children }: Props) {
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface-container border border-white/10 text-on-surface shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — always visible on lg, slide-in on mobile */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:z-auto`}
      >
        {/* Close button inside drawer on mobile */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white/10 text-on-surface-variant hover:text-on-surface"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </>
  );
}
