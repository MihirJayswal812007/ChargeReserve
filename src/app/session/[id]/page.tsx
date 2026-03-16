"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Battery,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Stage = "loading" | "starting" | "charging" | "stopping" | "finished" | "error";

interface SessionData {
  id: string;
  energyUsed: number;
  cost: number;
  duration: number;
  status: string;
  startTime: string;
}

interface BookingData {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  charger: { powerKw: number; pricePerKwh: number; type: string; station: { name: string; address: string } };
  session: SessionData | null;
}

// ── helpers ───────────────────────────────────────────────
function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ChargingSession() {
  const { id: bookingId } = useParams() as { id: string };
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("loading");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Live metrics
  const [elapsed, setElapsed] = useState(0);
  const [energyUsed, setEnergyUsed] = useState(0);
  const [cost, setCost] = useState(0);
  const [power, setPower] = useState(0);

  const startedAt = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const patchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── 1) Load booking ────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        // Fetch the booking (reuse bookings API)
        const res = await fetch("/api/bookings");
        if (res.status === 401) { router.push("/login"); return; }
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bk: BookingData = data.bookings?.find((b: any) => b.id === bookingId) ?? null;

        if (!bk) { setStage("error"); return; }
        setBooking(bk);

        // If there's already an active session, resume it
        if (bk.session && bk.session.status === "ACTIVE") {
          setSessionId(bk.session.id);
          const already = Math.round(
            (Date.now() - new Date(bk.session.startTime).getTime()) / 1000
          );
          startedAt.current = new Date(bk.session.startTime).getTime();
          setElapsed(already);
          setEnergyUsed(bk.session.energyUsed);
          setCost(bk.session.cost);
          setPower(bk.charger.powerKw * 0.85);
          setStage("charging");
          return;
        }

        // If already completed
        if (bk.session?.status === "COMPLETED") {
          setSessionId(bk.session.id);
          setElapsed(bk.session.duration);
          setEnergyUsed(bk.session.energyUsed);
          setCost(bk.session.cost);
          setStage("finished");
          return;
        }

        setStage("starting");
      } catch {
        setStage("error");
      }
    }
    load();
  }, [bookingId, router]);

  // ── 2) Start session ─────────────────────────────────
  useEffect(() => {
    if (stage !== "starting") return;

    async function startSession() {
      try {
        const res = await fetch("/api/sessions/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Could not start session");
          setStage("error");
          return;
        }
        setSessionId(data.session.id);
        startedAt.current = Date.now();
        setPower(booking!.charger.powerKw * 0.85);
        setStage("charging");
        toast.success("Session started — charging!");
      } catch {
        setStage("error");
      }
    }

    // Small delay so the user sees "connecting" state
    const t = setTimeout(startSession, 1500);
    return () => clearTimeout(t);
  }, [stage, bookingId, booking]);

  // ── 3) Local tick while charging ──────────────────────
  useEffect(() => {
    if (stage !== "charging") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const secs = Math.round((Date.now() - startedAt.current) / 1000);
      const hrs = secs / 3600;
      const kw = booking?.charger.powerKw ?? 50;
      const kwh = +(kw * hrs * 0.85).toFixed(3);
      const pph = booking?.charger.pricePerKwh ?? 0.45;
      setElapsed(secs);
      setEnergyUsed(kwh);
      setCost(+(kwh * pph).toFixed(2));
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [stage, booking]);

  // ── 4) PATCH metrics to DB every 30 s ─────────────────
  const patchMetrics = useCallback(async () => {
    if (!sessionId || stage !== "charging") return;
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          energyUsed,
          duration: elapsed,
        }),
      });
    } catch { /* non-critical */ }
  }, [sessionId, stage, energyUsed, elapsed]);

  useEffect(() => {
    if (stage !== "charging") {
      if (patchIntervalRef.current) clearInterval(patchIntervalRef.current);
      return;
    }
    patchIntervalRef.current = setInterval(patchMetrics, 30_000);
    return () => { if (patchIntervalRef.current) clearInterval(patchIntervalRef.current); };
  }, [stage, patchMetrics]);

  // ── 5) Stop session ───────────────────────────────────
  async function handleStop() {
    if (!sessionId) return;
    setStage("stopping");
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Could not stop session"); setStage("charging"); return; }
      setElapsed(data.session.duration);
      setEnergyUsed(data.session.energyUsed);
      setCost(data.session.cost);
      setStage("finished");
      toast.success("Session ended — thanks for charging!");
    } catch {
      setStage("charging");
      toast.error("Network error, please try again");
    }
  }

  // ── Ring math ─────────────────────────────────────────
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const totalBookedDurationSeconds = booking
    ? (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 1000
    : 1;
  const batteryPct = booking
    ? Math.min((elapsed / totalBookedDurationSeconds) * 100, 100)
    : 0;
  const strokeDashoffset = circumference - (batteryPct / 100) * circumference;

  const stageColor: Record<Stage, string> = {
    loading: "text-muted-foreground",
    starting: "text-yellow-500",
    charging: "text-primary",
    stopping: "text-yellow-500",
    finished: "text-green-500",
    error: "text-destructive",
  };

  const stageLabel: Record<Stage, string> = {
    loading: "Loading",
    starting: "Connecting…",
    charging: "Charging",
    stopping: "Stopping…",
    finished: "Complete",
    error: "Error",
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {stage === "finished" ? "Session Complete" : "Charging Session"}
          </h1>
          {booking && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {booking.charger.station.name}
            </p>
          )}
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-secondary ${stageColor[stage]}`}
        >
          {stage === "loading" && <Loader2 className="w-3 h-3 animate-spin" />}
          {stage === "starting" && <Loader2 className="w-3 h-3 animate-spin" />}
          {stage === "charging" && <Zap className="w-3 h-3 animate-pulse" />}
          {stage === "stopping" && <Loader2 className="w-3 h-3 animate-spin" />}
          {stage === "finished" && <CheckCircle2 className="w-3 h-3" />}
          {stage === "error" && <AlertCircle className="w-3 h-3" />}
          {stageLabel[stage]}
        </div>
      </div>

      {/* Error */}
      {stage === "error" && (
        <div className="text-center py-16 space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive opacity-50" />
          <p className="text-muted-foreground">Could not load session. Check your reservation is valid.</p>
          <Button onClick={() => router.push("/reservations")}>My Reservations</Button>
        </div>
      )}

      {/* Loading skeleton */}
      {stage === "loading" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading session…</p>
        </div>
      )}

      {(stage !== "loading" && stage !== "error") && (
        <>
          {/* Ring */}
          <div className="relative flex items-center justify-center mb-10">
            <svg width="300" height="300" className="transform -rotate-90 w-72 h-72">
              <circle
                cx="144" cy="144" r={radius}
                stroke="currentColor" strokeWidth="16" fill="transparent"
                className="text-secondary"
              />
              <motion.circle
                cx="144" cy="144" r={radius}
                stroke="currentColor" strokeWidth="16" fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                strokeLinecap="round"
                className={stage === "finished" ? "text-green-500" : "text-primary"}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-bold tracking-tighter mb-1 font-mono">
                {Math.floor(batteryPct)}
                <span className="text-2xl text-muted-foreground">%</span>
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Battery className="w-4 h-4" /> Session Progress
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-card border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Zap className="w-6 h-6 text-yellow-500 mb-2" />
              <span className="text-xs text-muted-foreground mb-1">Energy Delivered</span>
              <span className="text-xl font-bold font-mono">
                {energyUsed.toFixed(2)}{" "}
                <span className="text-sm font-normal text-muted-foreground">kWh</span>
              </span>
            </div>
            <div className="bg-card border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Clock className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-xs text-muted-foreground mb-1">Elapsed Time</span>
              <span className="text-xl font-bold font-mono">{fmt(elapsed)}</span>
            </div>
            <div className="col-span-2 bg-card border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Current Power</span>
                <span className="text-2xl font-bold font-mono text-primary">
                  {stage === "charging" ? power.toFixed(1) : "0.0"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">kW</span>
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground mb-1">Session Cost</span>
                <span className="text-2xl font-bold font-mono">
                  ₹{cost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Charger info */}
          {booking && (
            <div className="bg-secondary/30 border rounded-xl p-3 text-sm flex items-center justify-between mb-6">
              <span className="text-muted-foreground">
                {booking.charger.type} • {booking.charger.powerKw} kW
              </span>
              <span className="font-medium">₹{booking.charger.pricePerKwh.toFixed(2)}/kWh</span>
            </div>
          )}

          {/* Actions */}
          {stage === "starting" && (
            <div className="w-full py-4 rounded-xl border-2 border-dashed border-yellow-500/40 text-center text-yellow-600 text-sm font-medium flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Connecting to charger…
            </div>
          )}

          {stage === "charging" && (
            <Button
              variant="destructive"
              size="lg"
              className="w-full py-6 text-base font-semibold shadow-lg shadow-destructive/20"
              onClick={handleStop}
            >
              Stop Charging
            </Button>
          )}

          {stage === "stopping" && (
            <Button disabled size="lg" className="w-full py-6 text-base">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finishing session…
            </Button>
          )}

          {stage === "finished" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold text-primary mb-1">Charging Complete!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please safely unplug the connector.
                </p>
                <div className="flex justify-between text-sm border-t border-primary/10 pt-4">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-bold text-xl">₹{cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-muted-foreground">Energy</span>
                  <span className="font-medium">{energyUsed.toFixed(2)} kWh</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{fmt(elapsed)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full py-6 font-semibold"
                onClick={() => router.push("/")}
              >
                Return Home
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => router.push("/reservations")}
              >
                My Reservations
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
