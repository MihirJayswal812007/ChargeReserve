"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlugZap, QrCode, Keyboard, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SessionEntry() {
  const router = useRouter();
  const [stationId, setStationId] = useState("");
  const [method, setMethod] = useState<"qr" | "manual">("manual");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationId) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to load bookings");
      const data = await res.json();
      
      const isMatch = (id?: string) => id && id.trim().toLowerCase() === stationId.trim().toLowerCase();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activeBooking = data.bookings?.find((b: any) => 
        (isMatch(b.charger?.station?.id) || isMatch(b.charger?.id) || isMatch(b.id)) &&
        (b.status === "CONFIRMED" || b.status === "ACTIVE")
      );

      if (activeBooking) {
        router.push(`/session/${activeBooking.id}`);
      } else {
        toast.error("No active reservation found for this station ID.");
      }
    } catch (err) {
      toast.error("Error verifying station.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <PlugZap className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 mb-2">
          Start Charging
        </h1>
        <p className="text-muted-foreground">
          Scan a QR code or enter the station ID manually
        </p>
      </motion.div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setMethod("manual")}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              method === "manual" ? "bg-accent/50 text-foreground border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Enter ID
          </button>
          <button
            onClick={() => setMethod("qr")}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              method === "qr" ? "bg-accent/50 text-foreground border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Scan QR
          </button>
        </div>

        <div className="p-6">
          {method === "manual" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Station ID</label>
                <input
                  type="text"
                  placeholder="e.g. STAT-1234"
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value.toUpperCase())}
                  className="w-full bg-background border rounded-lg px-4 py-3 font-mono text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={!stationId || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect to Station
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="h-48 bg-muted rounded-xl flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed">
              <QrCode className="w-12 h-12 mb-2 opacity-50" />
              <p>Camera access required</p>
              <button className="mt-4 px-4 py-2 bg-background border rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                Enable Camera
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => router.push('/reservations')}
          className="text-sm text-primary hover:underline"
        >
          View your upcoming reservations
        </button>
      </div>
    </div>
  );
}
