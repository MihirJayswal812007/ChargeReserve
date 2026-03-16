"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Zap, User, LogOut, LayoutDashboard, ChevronDown, Map, Cog, ShieldCheck, Menu, X } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
    window.location.assign("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-4 md:px-8 lg:px-16">
        
        {/* Logo and Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <button 
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5ff] to-[#7b5ea7] flex items-center justify-center shadow shadow-[#00e5ff]/20">
              <Zap className="w-4 h-4 text-black" fill="currentColor" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground hidden sm:inline-block">ChargeReserve</span>
          </Link>
        </div>

        {/* Desktop Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/find" className={`transition-colors flex items-center gap-1 ${pathname === '/find' ? 'text-foreground' : 'hover:text-foreground'}`}>
            <Map className="w-3.5 h-3.5" />Map
          </Link>
          <Link href="/#stations" className="hover:text-foreground transition-colors">Stations</Link>
          <Link href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/5 border border-border hover:bg-foreground/10 transition-colors text-foreground text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#7b5ea7] flex items-center justify-center text-black font-bold text-xs">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="text-sm text-foreground font-medium truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        user.role === "ADMIN"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          : user.role === "OPERATOR"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      }`}>{user.role}</span>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${pathname === '/dashboard' ? 'text-foreground bg-foreground/10' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" />Dashboard
                    </Link>
                    <Link
                      href="/reservations"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${pathname === '/reservations' ? 'text-foreground bg-foreground/10' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
                    >
                      <User className="w-4 h-4" />My Reservations
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${pathname === '/settings' ? 'text-foreground bg-foreground/10' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
                    >
                      <Cog className="w-4 h-4" />Settings
                    </Link>
                    {(user.role === "OPERATOR" || user.role === "ADMIN") && (
                      <Link
                        href="/operator/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${pathname === '/operator/dashboard' ? 'text-foreground bg-foreground/10' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
                      >
                        <Zap className="w-4 h-4" />Operator Portal
                      </Link>
                    )}
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${pathname === '/admin/dashboard' ? 'text-foreground bg-foreground/10' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
                      >
                        <ShieldCheck className="w-4 h-4" />Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:text-red-400 hover:bg-foreground/5 transition-colors border-t border-border mt-1"
                    >
                      <LogOut className="w-4 h-4" />Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hidden sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-[#00e5ff] to-[#7b5ea7] text-black font-semibold hover:opacity-90 border-0">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="flex flex-col p-4 gap-4 text-sm font-medium">
            <Link href="/find" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 ${pathname === '/find' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Map className="w-4 h-4" /> Map
            </Link>
            <Link href="/#stations" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
              Stations
            </Link>
            <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
              How It Works
            </Link>
            
            <div className="h-px bg-border my-2"></div>
            
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#7b5ea7] flex items-center justify-center text-black font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-foreground">{user.name}</div>
                    <div className="text-muted-foreground text-xs">{user.email}</div>
                  </div>
                </div>
                
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 ${pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link href="/reservations" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 ${pathname === '/reservations' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <User className="w-4 h-4" /> My Reservations
                </Link>
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 ${pathname === '/settings' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Cog className="w-4 h-4" /> Settings
                </Link>
                {(user.role === "OPERATOR" || user.role === "ADMIN") && (
                  <Link href="/operator/dashboard" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 ${pathname === '/operator/dashboard' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Zap className="w-4 h-4" /> Operator Portal
                  </Link>
                )}
                {user.role === "ADMIN" && (
                  <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 ${pathname === '/admin/dashboard' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    <ShieldCheck className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="text-red-500 hover:text-red-400 flex items-center gap-2 text-left">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full justify-center bg-transparent border-border text-foreground">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                </Button>
                <Button asChild className="w-full justify-center bg-gradient-to-r from-[#00e5ff] to-[#7b5ea7] border-0 text-black font-semibold hover:opacity-90">
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
