"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Battery, Zap, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ChargingSession() {
  const { id } = useParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<"connecting" | "charging" | "finished" | "error">("connecting");
  const [progress, setProgress] = useState(25); // Starting battery %
  const [kwh, setKwh] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Simulation logic
  useEffect(() => {
    if (status === "connecting") {
      const timer = setTimeout(() => setStatus("charging"), 2000);
      return () => clearTimeout(timer);
    }

    if (status === "charging") {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setStatus("finished");
            return 100;
          }
          return p + 0.5;
        });
        setKwh(k => +(k + 0.3).toFixed(1));
        setElapsed(e => e + 1);
      }, 1000); // 1 virtual second = 1 interval
      return () => clearInterval(interval);
    }
  }, [status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStop = () => {
    setStatus("finished");
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-md mx-auto py-12 px-4 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Session Active</h1>
          <p className="text-muted-foreground font-mono text-sm">{id}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
          status === "connecting" ? "bg-yellow-500/10 text-yellow-600" :
          status === "charging" ? "bg-green-500/10 text-green-600 animate-pulse" :
          status === "finished" ? "bg-primary/10 text-primary" :
          "bg-destructive/10 text-destructive"
        }`}>
          {status === "connecting" && <AlertCircle className="w-3 h-3" />}
          {status === "charging" && <Zap className="w-3 h-3" />}
          {status === "finished" && <CheckCircle2 className="w-3 h-3" />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      <div className="relative flex items-center justify-center mb-12">
        <svg width="300" height="300" className="transform -rotate-90 w-72 h-72">
          {/* Background Ring */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke="currentColor"
            strokeWidth="16"
            fill="transparent"
            className="text-secondary"
          />
          {/* Progress Ring */}
          <motion.circle
            cx="144"
            cy="144"
            r={radius}
            stroke="currentColor"
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "linear" }}
            strokeLinecap="round"
            className={status === "charging" ? "text-green-500" : "text-primary"}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-bold tracking-tighter mb-1 font-mono">
            {Math.floor(progress)}<span className="text-2xl text-muted-foreground">%</span>
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Battery className="w-4 h-4" /> State of Charge
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Zap className="w-6 h-6 text-yellow-500 mb-2" />
          <span className="text-xs text-muted-foreground mb-1">Energy Delivered</span>
          <span className="text-xl font-bold font-mono">{kwh} <span className="text-sm font-normal text-muted-foreground">kWh</span></span>
        </div>
        <div className="bg-card border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Clock className="w-6 h-6 text-blue-500 mb-2" />
          <span className="text-xs text-muted-foreground mb-1">Elapsed Time</span>
          <span className="text-xl font-bold font-mono">{formatTime(elapsed)}</span>
        </div>
        <div className="col-span-2 bg-card border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
           <span className="text-xs text-muted-foreground mb-1">Current Power</span>
           <span className="text-2xl font-bold font-mono text-green-500">
             {status === "charging" ? "124.5" : "0.0"} <span className="text-sm font-normal text-muted-foreground">kW</span>
           </span>
        </div>
      </div>

      {status === "charging" && (
        <button
          onClick={handleStop}
          className="w-full bg-destructive text-destructive-foreground font-semibold py-4 rounded-xl hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
        >
          Stop Charging
        </button>
      )}

      {status === "finished" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
           <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
             <h3 className="text-lg font-bold text-primary mb-2">Charging Complete</h3>
             <p className="text-sm text-foreground/80 mb-4">You have successfully charged your vehicle. Please unplug the connector.</p>
             <div className="flex justify-between items-center text-sm border-t border-primary/10 pt-4 mt-2">
                <span className="text-muted-foreground">Total Cost</span>
                <span className="font-bold text-lg">${(kwh * 0.45).toFixed(2)}</span>
             </div>
           </div>
           
           <button
            onClick={() => router.push('/')}
            className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Return Home
          </button>
        </motion.div>
      )}
    </div>
  );
}
