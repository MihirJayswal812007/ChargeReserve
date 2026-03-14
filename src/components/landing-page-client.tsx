"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Zap, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  available: number;
  total: number;
  speed: string;
  price: string;
  operatingHours: string;
}

export default function LandingPageClient({ stations }: { stations: Station[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = query.trim()
    ? stations.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.city.toLowerCase().includes(query.toLowerCase()) ||
          s.address.toLowerCase().includes(query.toLowerCase())
      )
    : stations;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/api/stations?city=${encodeURIComponent(query)}`);
    }
  }

  return (
    <div className="flex-1 flex flex-col py-12 lg:py-24 px-4 md:px-8 lg:px-16 overflow-hidden relative">
      <motion.div
        className="absolute top-0 right-0 w-full h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        {/* Left: Hero */}
        <div className="space-y-10 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Badge
              variant="secondary"
              className="px-4 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/10"
            >
              <Zap className="w-3 h-3 mr-2" />
              {stations.length > 0
                ? `${stations.length}+ fast chargers ready to book`
                : "Fast EV charging near you"}
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Power your journey. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
                Reserve your charge.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Find, book, and pay for the fastest EV charging stations near you.
              Never wait in line for a charger again.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-4 shadow-2xl shadow-primary/5 flex flex-col sm:flex-row gap-4 w-full max-w-md"
          >
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter city or station name"
                className="pl-10 h-14 bg-background border-none focus-visible:ring-1 focus-visible:ring-primary text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 text-base">
              Find Chargers
            </Button>
          </motion.form>

          <div className="flex items-center gap-8 pt-4">
            <div className="flex flex-col">
              <span className="text-3xl font-bold">
                15<span className="text-primary">m</span>
              </span>
              <span className="text-sm text-muted-foreground">Avg. charge time</span>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-3xl font-bold">
                99<span className="text-primary">%</span>
              </span>
              <span className="text-sm text-muted-foreground">Uptime guaranteed</span>
            </div>
          </div>
        </div>

        {/* Right: Nearby Stations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {query ? `Results for "${query}"` : "Available Stations"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filtered.length} station{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
              {stations.length === 0 ? (
                <>
                  <p className="font-medium">No stations available yet.</p>
                  <p className="text-sm mt-1">
                    Check back soon or{" "}
                    <Link href="/register" className="text-primary underline">
                      become an operator
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <p>No stations match your search.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-1">
              {filtered.map((station, i) => (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
                >
                  <Link href={`/station/${station.id}`} className="block">
                    <div className="group bg-background border border-border hover:border-primary/50 rounded-2xl p-5 transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(0,255,135,0.1)]">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {station.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {station.address}, {station.city}
                          </p>
                        </div>
                        <Badge
                          variant={station.available > 0 ? "default" : "secondary"}
                          className={
                            station.available > 0
                              ? "bg-primary/20 text-primary border-primary/20 hover:bg-primary/30"
                              : ""
                          }
                        >
                          {station.available} / {station.total} Available
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-primary" />
                          <span>{station.speed} Max</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{station.operatingHours}</span>
                        </div>
                        <div className="ml-auto font-medium text-foreground">
                          {station.price}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
