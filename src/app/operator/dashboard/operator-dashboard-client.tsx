"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus, Zap, MapPin, Users, CheckCircle2, Clock,
  BarChart3, Settings, ChevronRight, Trash2, AlertCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Charger {
  id: string;
  type: string;
  powerKw: number;
  pricePerKwh: number;
  status: string;
}

interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  status: string;
  totalChargers: number;
  chargers: Charger[];
  totalBookings: number;
  operatingHours: string;
}

const statusColor: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  PENDING_APPROVAL: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  INACTIVE: "bg-muted text-muted-foreground",
};

export default function OperatorDashboardClient({ userName }: { userName: string }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/operator/stations");
      const data = await res.json();
      setStations(data.stations ?? []);
    } catch {
      toast.error("Failed to load stations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalAvailable = stations.flatMap((s) => s.chargers).filter((c) => c.status === "AVAILABLE").length;
  const totalInUse = stations.flatMap((s) => s.chargers).filter((c) => c.status === "IN_USE").length;
  const totalBookings = stations.reduce((a, s) => a + s.totalBookings, 0);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operator Portal</h1>
          <p className="text-muted-foreground mt-1">Welcome, {userName}</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Station
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Stations", value: stations.length, icon: MapPin, color: "text-primary" },
          { label: "Available", value: totalAvailable, icon: CheckCircle2, color: "text-green-500" },
          { label: "In Use", value: totalInUse, icon: Zap, color: "text-yellow-500" },
          { label: "Total Bookings", value: totalBookings, icon: Users, color: "text-blue-500" },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-2xl p-4 flex flex-col gap-2">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Station list */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" /> My Stations
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading stations…
        </div>
      ) : stations.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-2">No stations yet</p>
          <p className="text-sm text-muted-foreground mb-6">Add your first charging station to get started.</p>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Station
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {stations.map((station) => (
            <motion.div
              key={station.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-2xl overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{station.name}</h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColor[station.status] ?? ""}`}
                      >
                        {station.status === "PENDING_APPROVAL" ? "Pending" : station.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {station.address}, {station.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Bookings</div>
                    <div className="text-2xl font-bold">{station.totalBookings}</div>
                  </div>
                </div>

                {/* Charger status pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {station.chargers.map((c) => (
                    <div
                      key={c.id}
                      className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                        c.status === "AVAILABLE"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : c.status === "IN_USE"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          : c.status === "BOOKED"
                          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.type} {c.powerKw}kW — {c.status}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {station.operatingHours}
                  </div>
                  <Link
                    href={`/operator/station/${station.id}`}
                    className="text-primary hover:underline flex items-center gap-1 text-xs font-medium"
                  >
                    Manage <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Station Modal */}
      {showAdd && (
        <AddStationModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}
    </div>
  );
}

// ── Add Station Modal ─────────────────────────────────────
function AddStationModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    country: "Canada",
    latitude: "",
    longitude: "",
    operatingHours: "24/7",
  });
  const [chargers, setChargers] = useState([
    { type: "CCS", powerKw: "50", pricePerKwh: "0.45" },
  ]);

  function updateField(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function addCharger() {
    setChargers((c) => [...c, { type: "CCS", powerKw: "50", pricePerKwh: "0.45" }]);
  }

  function removeCharger(i: number) {
    setChargers((c) => c.filter((_, idx) => idx !== i));
  }

  function updateCharger(i: number, k: string, v: string) {
    setChargers((c) => c.map((ch, idx) => (idx === i ? { ...ch, [k]: v } : ch)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/operator/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, chargers }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to create station"); return; }
      toast.success("Station created! Pending admin approval.");
      onCreated();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border rounded-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl"
      >
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Add New Station</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              ["name", "Station Name", "text", "col-span-2"],
              ["address", "Street Address", "text", "col-span-2"],
              ["city", "City", "text", "col-span-1"],
              ["country", "Country", "text", "col-span-1"],
              ["latitude", "Latitude", "number", "col-span-1"],
              ["longitude", "Longitude", "number", "col-span-1"],
              ["operatingHours", "Operating Hours", "text", "col-span-2"],
            ].map(([key, label, type, span]) => (
              <div key={key} className={span as string}>
                <label className="text-sm font-medium block mb-1">{label}</label>
                <input
                  type={type as string}
                  step={type === "number" ? "any" : undefined}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  value={(form as any)[key]}
                  onChange={(e) => updateField(key as string, e.target.value)}
                  className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required={key !== "operatingHours"}
                  placeholder={key === "latitude" ? "e.g. 43.6532" : key === "longitude" ? "e.g. -79.3832" : ""}
                />
              </div>
            ))}
          </div>

          {/* Chargers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Chargers</label>
              <button
                type="button"
                onClick={addCharger}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Charger
              </button>
            </div>
            <div className="space-y-2">
              {chargers.map((c, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center bg-secondary/30 p-2 rounded-lg border">
                  <select
                    value={c.type}
                    onChange={(e) => updateCharger(i, "type", e.target.value)}
                    className="bg-background border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {["CCS", "CHADEMO", "TYPE2", "J1772"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="kW"
                    value={c.powerKw}
                    onChange={(e) => updateCharger(i, "powerKw", e.target.value)}
                    className="bg-background border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    min="1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="₹/kWh"
                    value={c.pricePerKwh}
                    onChange={(e) => updateCharger(i, "pricePerKwh", e.target.value)}
                    className="bg-background border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    step="0.01"
                    min="0"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeCharger(i)}
                    disabled={chargers.length === 1}
                    className="text-destructive hover:text-destructive/80 disabled:opacity-30 flex justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Columns: Type / Power (kW) / Price (₹/kWh) / Remove
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Station
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
