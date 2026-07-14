"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, GitBranch, ShieldCheck, BarChart2,
  Warehouse, Truck, TrendingUp, Navigation, Home, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",        href: "/admin" },
  { icon: Users,           label: "User Management",   href: "/admin/users" },
  { icon: GitBranch,       label: "Branch Management", href: "/admin/branches" },
  { icon: ShieldCheck,     label: "Access Control",    href: "/admin/access" },
  { icon: BarChart2,       label: "Analytics",         href: "/admin/analytics" },
  { icon: Bell,            label: "Notifications",     href: "/admin/notifications" },
];

const portalLinks = [
  { icon: Truck, label: "Logistics", href: "/logistics" },
  { icon: Warehouse, label: "Warehouse", href: "/warehouse" },
  { icon: Navigation, label: "Driver App", href: "/driver" },
  { icon: TrendingUp, label: "Finance", href: "/finance" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 25 }}
      className="flex h-full flex-col p-4 bg-surface-container-low/20 backdrop-blur-md border-r border-white/5 shadow-xl w-[280px] overflow-y-auto"
    >
      <div className="mb-12 px-4 mt-2">
        <h1 className="text-3xl font-black text-on-surface tracking-tight bg-gradient-to-r from-white via-on-surface to-tertiary bg-clip-text text-transparent">NexaCargo</h1>
        <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest mt-1">Admin Portal</p>
      </div>
      <nav className="flex flex-col gap-1 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex items-center gap-4 p-3 rounded-lg text-xs uppercase tracking-widest group overflow-hidden"
            >
              {isActive && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-white/5 border-l-2 border-tertiary shadow-[0_0_15px_rgba(79,163,255,0.2)] rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={cn("w-5 h-5 flex items-center justify-center shrink-0", isActive ? "text-tertiary" : "text-on-surface-variant group-hover:text-on-surface")}
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
              <motion.span 
                whileHover={{ x: 3 }}
                className={cn("transition-colors", isActive ? "text-tertiary font-bold" : "text-on-surface-variant group-hover:text-on-surface")}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}

        {/* Portal Dashboards */}
        <p className="mt-6 mb-1 px-3 text-[10px] uppercase tracking-widest text-on-surface-variant/50">Portals</p>
        {portalLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 p-3 rounded-lg text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors rounded-lg -z-10" />
            <motion.div
              whileHover={{ scale: 1.1, x: 2 }}
              className="w-5 h-5 flex items-center justify-center shrink-0 text-on-surface-variant group-hover:text-on-surface"
            >
              <item.icon className="w-5 h-5" />
            </motion.div>
            <span className="transition-colors text-on-surface-variant group-hover:text-on-surface">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-white/5">
        <Link 
          href="/" 
          className="flex items-center gap-4 text-on-surface-variant p-3 hover:text-on-surface transition-colors text-xs uppercase tracking-widest rounded-lg group relative overflow-hidden"
        >
          <span className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors rounded-lg -z-10" />
          <Home className="w-5 h-5 text-on-surface-variant group-hover:text-on-surface transition-colors" /> 
          <span>Home</span>
        </Link>
      </div>
    </motion.aside>
  );
}
