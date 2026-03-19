"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Zap,
  Clock,
  ShieldCheck,
  CreditCard,
  Star,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type ChargerType = "CCS" | "CHADEMO" | "TYPE2" | "J1772";
type ChargerStatus = "AVAILABLE" | "BOOKED" | "IN_USE" | "MAINTENANCE";

interface Charger {
  id: string;
  type: ChargerType;
  powerKw: number;
  pricePerKwh: number;
  status: ChargerStatus;
}

interface StationDetailProps {
  station: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    rating: number | null;
    amenities: string[];
    operatingHours: string;
    availableChargers: number;
    totalChargers: number;
    chargers: Charger[];
    operator: { id: string; name: string };
  };
}

const statusStyle: Record<ChargerStatus, string> = {
  AVAILABLE: "border-primary text-primary",
  BOOKED: "border-yellow-500 text-yellow-500",
  IN_USE: "border-blue-500 text-blue-500",
  MAINTENANCE: "border-destructive text-destructive",
};

const statusLabel: Record<ChargerStatus, string> = {
  AVAILABLE: "Available",
  BOOKED: "Reserved",
  IN_USE: "In Use",
  MAINTENANCE: "Maintenance",
};

export default function StationDetailClient({ station }: StationDetailProps) {
  const router = useRouter();
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [durationMins, setDurationMins] = useState(60);
  const [loading, setLoading] = useState(false);

  const availableChargers = station.chargers.filter(
    (c) => c.status === "AVAILABLE"
  );
  const maxPower = Math.max(...station.chargers.map((c) => c.powerKw), 0);

  // Cost estimate
  const charger = selectedCharger ?? availableChargers[0];
  const estimatedKwh = charger
    ? (charger.powerKw * (durationMins / 60) * 0.8).toFixed(1)
    : "0";
  const estimatedCost = charger
    ? ((parseFloat(estimatedKwh) * charger.pricePerKwh)).toFixed(2)
    : "0.00";

  async function handleBook() {
    if (!charger) {
      toast.error("No available charger selected");
      return;
    }
    setLoading(true);
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMins * 60 * 1000);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chargerId: charger.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Please log in to make a reservation");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        toast.error(data.error ?? "Booking failed");
        return;
      }

      toast.success("Reservation confirmed!");
      router.push(`/booking/${data.id}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 max-w-6xl mx-auto pt-8">
      <Link
        href="/"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to stations
      </Link>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left: Station Info */}
        <motion.div
          className="lg:col-span-2 space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/20 blur-[50px] rounded-full" />
            <div className="flex items-center gap-3 mb-4">
              <Badge
                className={
                  station.availableChargers > 0
                    ? "bg-primary/20 text-primary border-primary/30 font-semibold px-3 py-1"
                    : "bg-destructive/20 text-destructive border-destructive/30 px-3 py-1"
                }
                variant="outline"
              >
                {station.availableChargers} / {station.totalChargers} Available
              </Badge>
              {station.rating && (
                <span className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {station.rating.toFixed(1)}
                </span>
              )}
              <span className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" /> Verified
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              {station.name}
            </h1>
            <p className="text-lg text-muted-foreground flex items-center pr-4 font-medium">
              <MapPin className="w-5 h-5 mr-2 text-primary flex-shrink-0" />
              {station.address}, {station.city}, {station.country}
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6 p-5 rounded-2xl bg-secondary/30 backdrop-blur-md border border-border overflow-x-auto whitespace-nowrap shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(0,255,135,0.1)]">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Power</p>
                <p className="font-semibold text-foreground">{maxPower} kW</p>
              </div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(0,255,135,0.1)]">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pricing</p>
                <p className="font-semibold text-foreground">
                  ₹{charger?.pricePerKwh.toFixed(2) ?? "—"}/kWh
                </p>
              </div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(0,255,135,0.1)]">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours</p>
                <p className="font-semibold text-foreground">{station.operatingHours}</p>
              </div>
            </div>
          </div>

          {/* Tabs: chargers + amenities */}
          <Tabs defaultValue="chargers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="chargers">Chargers</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
            </TabsList>

            <TabsContent value="chargers" className="mt-8 space-y-4">
              {station.chargers.map((c, i) => (
                <Card
                  key={c.id}
                  onClick={() => c.status === "AVAILABLE" && setSelectedCharger(c)}
                  className={`transition-all duration-300 cursor-pointer overflow-hidden ${
                    selectedCharger?.id === c.id
                      ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(0,255,135,0.1)] scale-[1.01]"
                      : "border-border bg-secondary/20 hover:bg-secondary/40 hover:border-primary/20"
                  } ${c.status !== "AVAILABLE" ? "opacity-50 cursor-not-allowed grayscale-[50%]" : "backdrop-blur-xl"}`}
                >
                  <CardContent className="p-5 flex items-center justify-between relative">
                    {selectedCharger?.id === c.id && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_10px_rgba(0,255,135,0.5)]" />
                    )}
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          c.status === "AVAILABLE" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-foreground mb-1 tracking-tight">
                          Stall #{i + 1} <span className="text-muted-foreground mx-2">•</span> {c.type}
                        </h4>
                        <p className="text-sm text-muted-foreground font-medium font-mono">
                          {c.powerKw} kW <span className="text-muted-foreground mx-1">—</span> ₹{c.pricePerKwh.toFixed(2)}/kWh
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${statusStyle[c.status]} px-3 py-1 font-semibold uppercase tracking-wider text-xs bg-black/20`}
                    >
                      {statusLabel[c.status]}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="amenities" className="mt-8">
              <Card className="border-border bg-secondary/30 backdrop-blur-xl">
                <CardContent className="p-8 grid grid-cols-2 gap-6">
                  {station.amenities.length > 0 ? (
                    station.amenities.map((item) => (
                      <div key={item} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground col-span-2">
                      No amenities listed.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Right: Booking panel */}
        <motion.div
          className="lg:sticky top-24"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
          <Card className="relative overflow-hidden shadow-2xl border-border bg-background/80 backdrop-blur-xl">
            <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">Reserve a Charger</h3>
                <p className="text-sm text-muted-foreground">Secure your spot instantly and avoid waiting lines.</p>
              </div>

              {/* Charger selector */}
              {availableChargers.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground rounded-2xl bg-secondary/20 border border-border">
                  <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No chargers available right now.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Select Charger</label>
                    <div className="space-y-3">
                      {availableChargers.map((c, i) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCharger(c)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border text-sm transition-all duration-300 ${
                            (selectedCharger?.id ?? availableChargers[0]?.id) === c.id
                              ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,255,135,0.1)] text-primary"
                              : "border-border bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          <span className="font-medium">
                            Stall #{station.chargers.indexOf(c) + 1} <span className="text-muted-foreground mx-2">•</span> {c.type}
                          </span>
                          <span className={`font-mono font-bold ${
                            (selectedCharger?.id ?? availableChargers[0]?.id) === c.id ? "text-primary" : "text-foreground"
                          }`}>
                            ₹{c.pricePerKwh.toFixed(2)}/kWh
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                      <Calendar className="w-4 h-4 text-primary" /> Duration
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[30, 60, 90, 120].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setDurationMins(mins)}
                          className={`py-3 rounded-xl border text-sm font-bold transition-all duration-300 ${
                            durationMins === mins
                              ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,255,135,0.3)]"
                              : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:bg-secondary/50"
                          }`}
                        >
                          {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-secondary/40 border border-border rounded-2xl p-6 space-y-4 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] pointer-events-none" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Estimated Energy</span>
                      <span className="font-bold text-foreground font-mono">{estimatedKwh} kWh</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Rate limit factor</span>
                      <span className="font-bold text-foreground font-mono">80% (<span className="text-xs text-muted-foreground mr-2">Average capacity charge curve</span>)</span>
                    </div>
                    <div className="w-full h-px bg-border" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Estimated Total</span>
                      <span className="text-3xl font-black text-foreground shrink-0">
                        ₹{estimatedCost}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full font-semibold text-base py-6 shadow-[0_0_20px_rgba(0,255,135,0.2)]"
                    onClick={handleBook}
                    disabled={loading || availableChargers.length === 0}
                  >
                    {loading ? "Booking..." : "Reserve Now"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Billed per kWh after session. Estimated cost is not final.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
