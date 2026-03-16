"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Search, MapPin, Zap, Filter, SlidersHorizontal, Star,
  ChevronRight, Loader2, Clock, X, LocateFixed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const StationMap = dynamic(() => import("@/components/StationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  ),
});

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
  country: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  amenities: string[];
  operatingHours: string;
  totalChargers: number;
  chargers: Charger[];
  availableCount: number;
  distance?: number | null;
}

const CHARGER_TYPES = ["All", "CCS", "CHADEMO", "TYPE2", "J1772"];
const POWER_OPTIONS = [
  { label: "Any power", value: "" },
  { label: "50+ kW", value: "50" },
  { label: "100+ kW", value: "100" },
  { label: "150+ kW", value: "150" },
  { label: "250+ kW", value: "250" },
];

function ChargerTypePill({ type }: { type: string }) {
  const colors: Record<string, string> = {
    CCS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    CHADEMO: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    TYPE2: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    J1772: "bg-green-500/10 text-green-600 border-green-500/20",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${colors[type] ?? "bg-muted text-muted-foreground"}`}>
      {type}
    </span>
  );
}

export default function FindPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [minPower, setMinPower] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Station | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [radius, setRadius] = useState<number>(50); // Default 50km

  const fetchStations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search && !userLocation) params.set("city", search);
      if (selectedType !== "All") params.set("type", selectedType);
      if (minPower) params.set("minPower", minPower);
      if (userLocation) {
        params.set("lat", userLocation.lat.toString());
        params.set("lng", userLocation.lng.toString());
        params.set("radius", radius.toString());
      }
      params.set("limit", "500");
      const res = await fetch(`/api/stations?${params}`);
      const data = await res.json();
      setStations(data.stations ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [search, selectedType, minPower, userLocation, radius]);

  const handleUseLocation = () => {
    if ("geolocation" in navigator) {
      setLocating(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setSearch("");
          setLocating(false);
        },
        () => {
          setLocationError("Location access denied or unavailable.");
          setLocating(false);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  const handleGeocode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!search.trim()) {
      setUserLocation(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=1`, {
        headers: { "Accept-Language": "en", "User-Agent": "ChargeReserve/1.0" }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        setUserLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        setUserLocation(null); // fallback to text text filtering
      }
    } catch (err) {
      console.error(err);
      setUserLocation(null);
    }
    // Note: setting userLocation triggers fetchStations via useEffect
  };

  useEffect(() => {
    // If not geocoded yet, we still fetch normally when dependencies change.
    // If they press Enter, handleGeocode updates userLocation which triggers this.
    const t = setTimeout(fetchStations, 300);
    return () => clearTimeout(t);
  }, [fetchStations]);

  const minPrice = (s: Station) =>
    s.chargers?.length > 0
      ? Math.min(...s.chargers.map((c) => c.pricePerKwh))
      : null;

  const maxPower = (s: Station) =>
    s.chargers?.length > 0 ? Math.max(...s.chargers.map((c) => c.powerKw)) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="border-b bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <form onSubmit={handleGeocode} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search city, address, or zip code and hit Enter…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value === "") setUserLocation(null);
            }}
            className="w-full bg-secondary border-0 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
          {search && (
            <button type="button" onClick={() => { setSearch(""); setUserLocation(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters((f) => !f)}
          className="gap-1.5 shrink-0"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters {(selectedType !== "All" || minPower) ? "(Active)" : ""}
        </Button>
      </div>

      {/* Location / Radius helper below top bar */}
      <div className="bg-background border-b px-4 py-2 flex items-center justify-between gap-3 text-sm">
        <button 
          onClick={handleUseLocation} 
          disabled={locating}
          className="flex items-center gap-1.5 text-primary font-medium hover:underline text-xs disabled:opacity-60"
        >
          {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
          {locating ? "Detecting…" : "Use my location"}
        </button>
        {locationError && <span className="text-xs text-red-500">{locationError}</span>}
        {userLocation && !locationError && (
          <div className="flex items-center gap-2 flex-1 max-w-xs ml-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Radius: {radius} km</span>
            <input
              type="range"
              min="2"
              max="200"
              step="1"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-secondary/30 overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-wrap gap-4">
              {/* Type */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Connector Type</p>
                <div className="flex gap-1.5 flex-wrap">
                  {CHARGER_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selectedType === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {/* Power */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Min. Power</p>
                <div className="flex gap-1.5 flex-wrap">
                  {POWER_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setMinPower(p.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        minPower === p.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content: list + map + detail panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Station list */}
        <div className="w-full md:w-80 lg:w-96 border-r overflow-y-auto shrink-0 z-10 bg-background">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading stations…
            </div>
          ) : stations.length === 0 ? (
            <div className="text-center py-16 px-6">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No stations found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different city or adjust filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="px-4 py-2.5 text-xs text-muted-foreground font-medium">
                {stations.length} station{stations.length !== 1 ? "s" : ""} found
              </div>
              {stations.map((s) => (
                <Link
                  key={s.id}
                  href={`/station/${s.id}`}
                  className={`block w-full text-left p-4 hover:bg-secondary/50 transition-colors ${
                    selected?.id === s.id ? "bg-secondary/70 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium text-sm leading-tight">{s.name}</div>
                    {s.availableCount > 0 ? (
                      <span className="text-[10px] font-semibold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                        {s.availableCount} free
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                        full
                      </span>
                    )}
                  </div>
                  {s.distance != null && (
                    <p className="text-xs font-semibold text-primary mb-1">
                      {s.distance.toFixed(1)} kms away
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" /> {s.city}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {[...new Set((s.chargers || []).map((c) => c.type))].map((t) => (
                        <ChargerTypePill key={t} type={t} />
                      ))}
                    </div>
                    {maxPower(s) != null && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {maxPower(s)} kW
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Map area (desktop) */}
        <div className="flex-1 relative hidden md:block overflow-hidden bg-secondary/10">
          <StationMap
            stations={stations}
            selectedStation={selected}
            onSelectStation={setSelected}
            userLocation={userLocation}
            radiusKm={radius}
          />

          {/* Floating Detail Panel inside the map area */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-4 left-4 z-20 w-96 max-h-[calc(100%-2rem)] overflow-y-auto bg-background/95 backdrop-blur shadow-2xl rounded-2xl border p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1 leading-tight">{selected.name}</h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selected.address}, {selected.city}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-muted-foreground hover:text-foreground shrink-0 bg-secondary/50 rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Rating + Hours */}
                <div className="flex items-center gap-4 mb-5 text-sm">
                  {selected.rating != null && (
                    <span className="flex items-center gap-1 font-medium">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {selected.rating.toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> {selected.operatingHours}
                  </span>
                  {selected.availableCount > 0 ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 border">
                      {selected.availableCount} free
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Occupied</Badge>
                  )}
                </div>

                {/* Amenities */}
                {selected.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {selected.amenities.map((a) => (
                      <span key={a} className="text-[10px] font-semibold bg-secondary px-2 py-1 rounded-full text-muted-foreground uppercase tracking-wider">
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pricing summary */}
                {minPrice(selected) != null && (
                  <div className="bg-primary/5 border-primary/20 border rounded-xl p-3 mb-5 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Starting from</span>
                    <span className="font-bold text-lg text-primary">₹{minPrice(selected)!.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/kWh</span></span>
                  </div>
                )}

                {/* Charger list */}
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Chargers ({(selected.chargers || []).length})</h3>
                <div className="space-y-2 mb-6">
                  {(selected.chargers || []).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between border rounded-xl p-3 bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${c.status === "AVAILABLE" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{c.type} <span className="text-muted-foreground font-normal">· {c.powerKw} kW</span></div>
                          <div className="text-xs text-muted-foreground">₹{c.pricePerKwh}/kWh</div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                          c.status === "AVAILABLE"
                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                            : c.status === "IN_USE"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>

                <Button asChild size="lg" className="w-full gap-2 font-bold shadow-lg shadow-primary/20">
                  <Link href={`/station/${selected.id}`}>
                    Book a Charger <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile bottom sheet for selected station */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-background border-t rounded-t-3xl p-5 max-h-[70vh] overflow-y-auto shadow-2xl"
          >
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <p className="text-xs text-muted-foreground">{selected.city}</p>
              </div>
              <button onClick={() => setSelected(null)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex gap-1.5 flex-wrap mb-3">
              {[...new Set((selected.chargers || []).map((c) => c.type))].map((t) => (
                <ChargerTypePill key={t} type={t} />
              ))}
              {selected.availableCount > 0 && (
                <span className="text-[10px] font-semibold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
                  {selected.availableCount} available
                </span>
              )}
            </div>

            {minPrice(selected) != null && (
              <p className="text-sm text-muted-foreground mb-4">
                From <span className="font-bold text-foreground">₹{minPrice(selected)!.toFixed(2)}/kWh</span>
                {" · "}Max {maxPower(selected)} kW
              </p>
            )}

            <Button asChild size="lg" className="w-full gap-2">
              <Link href={`/station/${selected.id}`}>
                Book a Charger <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

