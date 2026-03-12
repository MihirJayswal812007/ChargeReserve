"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, User, LogOut, LayoutDashboard, ChevronDown, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUser(d.user))
      .catch(() => null);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-4 md:px-8 lg:px-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5ff] to-[#7b5ea7] flex items-center justify-center shadow shadow-[#00e5ff]/20">
            <Zap className="w-4 h-4 text-black" fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white hidden sm:inline-block">ChargeReserve</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/50">
          <Link href="/find" className="hover:text-white transition-colors flex items-center gap-1">
            <Map className="w-3.5 h-3.5" />Map
          </Link>
          <Link href="/#stations" className="hover:text-white transition-colors">Stations</Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#7b5ea7] flex items-center justify-center text-black font-bold text-xs">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/50" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-white/[0.06]">
                      <p className="text-xs text-white/40">Signed in as</p>
                      <p className="text-sm text-white font-medium truncate">{user.email}</p>
                      <span className="text-[10px] text-[#00e5ff] font-medium uppercase tracking-wider">{user.role}</span>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />Dashboard
                    </Link>
                    <Link
                      href="/reservations"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />My Reservations
                    </Link>
                    {(user.role === "OPERATOR" || user.role === "ADMIN") && (
                      <Link
                        href="/operator/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Zap className="w-4 h-4" />Operator Portal
                      </Link>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors border-t border-white/[0.06] mt-1"
                    >
                      <LogOut className="w-4 h-4" />Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white hidden sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-[#00e5ff] to-[#7b5ea7] text-black font-semibold hover:opacity-90">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
