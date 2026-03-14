"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, MapPin, Zap, DollarSign, CheckCircle2, XCircle,
  Clock, BarChart3, Loader2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Stats {
  users: number;
  stations: number;
  bookings: number;
  sessions: number;
  revenue: number;
}

interface PendingStation {
  id: string;
  name: string;
  city: string;
  country: string;
  status: string;
  createdAt: string;
  operator: { name: string; email: string };
  _count: { chargers: number };
}

interface RecentBooking {
  id: string;
  status: string;
  startTime: string;
  totalCost: number | null;
  user: { name: string; email: string };
  charger: { station: { name: string } };
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingStations, setPendingStations] = useState<PendingStation[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data.stats);
      setPendingStations(data.pendingStations ?? []);
      setRecentBookings(data.recentBookings ?? []);
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleStation(id: string, action: "approve" | "reject") {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/stations/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(action === "approve" ? "Station approved!" : "Station rejected.");
      load();
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  }

  const bookingStatusColor: Record<string, string> = {
    CONFIRMED: "bg-blue-500/10 text-blue-600",
    COMPLETED: "bg-green-500/10 text-green-600",
    CANCELLED: "bg-muted text-muted-foreground",
    PENDING: "bg-yellow-500/10 text-yellow-600",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview & management</p>
        </div>
        <Button variant="outline" onClick={load} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Users", value: stats.users, icon: Users, color: "text-blue-500" },
            { label: "Stations", value: stats.stations, icon: MapPin, color: "text-purple-500" },
            { label: "Bookings", value: stats.bookings, icon: Zap, color: "text-yellow-500" },
            { label: "Sessions", value: stats.sessions, icon: CheckCircle2, color: "text-green-500" },
            {
              label: "Revenue",
              value: `₹${stats.revenue.toFixed(0)}`,
              icon: DollarSign,
              color: "text-emerald-500",
            },
          ].map((s) => (
            <div key={s.label} className="bg-card border rounded-2xl p-4 flex flex-col gap-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Station Approvals */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-500" /> Pending Approvals
          {pendingStations.length > 0 && (
            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 border">
              {pendingStations.length}
            </Badge>
          )}
        </h2>

        {pendingStations.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-2xl text-muted-foreground text-sm">
            No stations awaiting approval. 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {pendingStations.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {s.city}, {s.country} • {s._count.chargers} charger{s._count.chargers !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Operator: {s.operator.name} ({s.operator.email})
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStation(s.id, "reject")}
                    disabled={!!actionLoading}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    {actionLoading === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStation(s.id, "approve")}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Bookings */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Recent Bookings
        </h2>

        <div className="bg-card border rounded-2xl overflow-hidden">
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No bookings yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {recentBookings.map((b) => (
                <div key={b.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{b.user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {b.charger.station.name} •{" "}
                      {new Date(b.startTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${bookingStatusColor[b.status] ?? ""}`}
                  >
                    {b.status}
                  </Badge>
                  <div className="font-bold text-sm w-16 text-right">
                    {b.totalCost != null ? `₹${b.totalCost.toFixed(2)}` : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
