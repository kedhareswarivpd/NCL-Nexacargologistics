"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { ROLE_HOME } from "@/lib/types"
import { CursorToggleButton } from "@/components/ui/CursorSwitcher"

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Industries", href: "/industries" },
  { name: "Products", href: "/products" },
  { name: "About", href: "/about" },
  { name: "Track", href: "/track" },
]

export function PublicNavbar() {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuth()

  const dashboardText = user?.role === "admin" ? "Admin Panel" : "Dashboard"
  const dashboardHref = user?.role ? ROLE_HOME[user.role] : "/dashboard"

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const closeMobile = React.useCallback(() => setMobileOpen(false), [])

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 flex w-full items-center justify-between px-6 backdrop-blur-xl border-b transition-all duration-300",
        scrolled
          ? "h-20 bg-white border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          : "h-20 bg-white border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="flex items-center gap-6 lg:gap-20">
        <Link href="/" className="flex items-center shrink-0"> 
          <img
            src="/logo5.jpg"
            alt="NexaCargo Logo"
            className="h-12 w-36 md:h-20 md:w-60 object-contain"
          />
        </Link>
        <div className="hidden gap-12 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "font-body-lg text-xl transition-colors",
                pathname === item.href
                  ? "border-b-2 border-[#1E88E5] pb-1 text-[#1E88E5]"
                  : "text-gray-600 hover:text-[#1E88E5]"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop auth controls */}
      <div className="hidden items-center gap-5 md:flex">
        <CursorToggleButton />
        {isAuthenticated && user ? (
          <>
            <Link href={dashboardHref}>
              <button className="flex items-center gap-5 rounded-lg bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] px-6 py-2 font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,194,255,0.4)] active:scale-95 shadow-md">
                <LayoutDashboard className="w-4 h-4" />
                {dashboardText}
              </button>
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center gap-5 rounded-lg border border-gray-200 px-5 py-2 font-bold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:text-red-500 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">
              <button className="rounded-lg px-6 py-2 font-bold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 active:scale-95">
                Login to Portal
              </button>
            </Link>
            <Link href="/register">
              <button className="rounded-lg bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] px-6 py-2 font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,194,255,0.4)] active:scale-95">
                Create Account
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile toggle */}
      <button
        className="text-gray-700 md:hidden"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute left-0 top-full w-full border-b border-gray-200 bg-white p-6 shadow-lg md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "text-base",
                  pathname === item.href ? "text-primary" : "text-gray-600"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] px-4 py-2.5 text-center font-bold text-white"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {dashboardText}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMobile();
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-center font-bold text-gray-700 hover:text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobile} className="rounded-lg px-4 py-2.5 text-center font-bold text-gray-700 hover:bg-gray-50">
                    Login
                  </Link>
                  <Link href="/register" onClick={closeMobile} className="rounded-lg bg-gradient-to-r from-[#1E88E5] to-[#00C2FF] px-4 py-2.5 text-center font-bold text-white">
                    Register
                  </Link>
                </>
              )}
              {/* Responsive cursor switcher inside mobile menu */}
              <div className="flex justify-center border-t border-gray-100 pt-3">
                <CursorToggleButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
