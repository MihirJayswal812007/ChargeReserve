"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Login failed");
        return;
      }
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(from);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
      <p className="text-white/50 text-sm mb-8">Sign in to your account to continue</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/70 text-sm">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00e5ff]/50 focus:ring-[#00e5ff]/20 h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/70 text-sm">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00e5ff]/50 focus:ring-[#00e5ff]/20 h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-gradient-to-r from-[#00e5ff] to-[#7b5ea7] hover:opacity-90 text-black font-semibold transition-opacity"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>

      {/* Quick login hint */}
      <div className="mt-5 p-3 rounded-lg bg-white/5 border border-white/[0.06]">
        <p className="text-xs text-white/40 font-medium mb-1">Demo accounts</p>
        <p className="text-xs text-white/50">user@chargereserve.com / password123</p>
        <p className="text-xs text-white/50">admin@chargereserve.com / password123</p>
      </div>

      <p className="mt-6 text-center text-sm text-white/40">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#00e5ff] hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#00e5ff]/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#7b5ea7] flex items-center justify-center shadow-lg shadow-[#00e5ff]/20 group-hover:shadow-[#00e5ff]/40 transition-shadow">
              <Zap className="w-5 h-5 text-black" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-white">ChargeReserve</span>
          </Link>
        </div>

        <Suspense fallback={<div className="h-64 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
