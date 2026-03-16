"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Eye,
  EyeOff,
  Loader2,
  User,
  Wrench,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ── Demo accounts ────────────────────────────────────────────
const DEMO_ACCOUNTS = [
  {
    role: "USER",
    label: "User",
    email: "user@chargereserve.com",
    password: "password123",
    description: "Reserve & charge",
    icon: User,
    accent: "from-[#00e5ff] to-[#00b4d8]",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    role: "OPERATOR",
    label: "Operator",
    email: "operator1@chargereserve.com",
    password: "password123",
    description: "Manage stations",
    icon: Wrench,
    accent: "from-amber-400 to-orange-500",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    role: "ADMIN",
    label: "Admin",
    email: "admin@chargereserve.com",
    password: "password123",
    description: "Full platform access",
    icon: ShieldCheck,
    accent: "from-rose-400 to-red-600",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
] as const;

// ── Role-aware redirect map ──────────────────────────────────
const ROLE_REDIRECT: Record<string, string> = {
  USER: "/dashboard",
  OPERATOR: "/operator/dashboard",
  ADMIN: "/admin/dashboard",
};

// ── Login Form ───────────────────────────────────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const doLogin = useCallback(
    async (email: string, password: string, isDemo = false) => {
      if (isDemo) setDemoLoading(email);
      else setLoading(true);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Login failed");
          return;
        }
        toast.success(`Welcome back, ${data.user.name}!`);
        const dest = from ?? ROLE_REDIRECT[data.user.role as string] ?? "/dashboard";
        // To avoid an infinite fetch loop in the Next.js cache
        // we use window.location.assign instead of router.push followed by router.refresh
        window.location.assign(dest);
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
        setDemoLoading(null);
      }
    },
    [router, from]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await doLogin(form.email, form.password);
  }

  return (
    <>
      {/* ── Main Card ── */}
      <div className="bg-card/50 border border-border/50 rounded-2xl p-8 backdrop-blur-sm shadow-xl dark:bg-white/[0.03] dark:border-white/10 dark:shadow-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Sign in to your account to continue
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground text-sm">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 focus:border-[#00e5ff]/50 focus:ring-[#00e5ff]/20 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground text-sm">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
                className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 focus:border-[#00e5ff]/50 focus:ring-[#00e5ff]/20 h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-[#00e5ff] to-[#7b5ea7] hover:opacity-90 text-black font-semibold transition-opacity"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#00e5ff] hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      </div>

      {/* ── Quick Demo Panel ── */}
      <div className="mt-4 bg-card/50 border border-border/50 rounded-2xl p-5 backdrop-blur-sm shadow-sm dark:bg-white/[0.02] dark:border-white/[0.07]">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 text-center">
          ⚡ Try a demo role
        </p>
        <div className="grid grid-cols-3 gap-3">
          {DEMO_ACCOUNTS.map((acct) => {
            const Icon = acct.icon;
            const isLoading = demoLoading === acct.email;
            return (
              <button
                key={acct.role}
                onClick={() => doLogin(acct.email, acct.password, true)}
                disabled={demoLoading !== null}
                className="group relative flex flex-col items-center gap-2 p-3.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/50 hover:border-border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/[0.03] dark:hover:bg-white/[0.07] dark:border-white/10 dark:hover:border-white/20"
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${acct.accent} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                  )}
                </div>
                {/* Label */}
                <div className="text-center">
                  <p className="text-xs font-bold text-foreground">{acct.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {acct.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground/70 text-center mt-3">
          One-click sign in — no password needed
        </p>
      </div>
    </>
  );
}

// ── Page Shell ───────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#00e5ff]/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md my-12">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#7b5ea7] flex items-center justify-center shadow-lg shadow-[#00e5ff]/20 group-hover:shadow-[#00e5ff]/40 transition-shadow">
              <Zap className="w-5 h-5 text-black" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-foreground">ChargeReserve</span>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="h-64 rounded-2xl bg-card border border-border animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
