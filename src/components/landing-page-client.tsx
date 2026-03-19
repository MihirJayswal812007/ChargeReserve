"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Zap,
  Clock,
  ChevronRight,
  Shield,
  Navigation,
  CalendarCheck,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AetherFlowHero from "@/components/ui/aether-flow-hero";
import { Globe } from "@/components/ui/globe";

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

const WHY_FEATURES = [
  {
    icon: Navigation,
    title: "Real-Time Discovery",
    description:
      "Instantly find available EV chargers near you or along your route with live status updates.",
    color: "from-[#00e5ff] to-[#007cf0]",
    glow: "shadow-[#00e5ff]/20",
  },
  {
    icon: CalendarCheck,
    title: "Advance Reservation",
    description:
      "Book your charging slot hours or days ahead of time. No more waiting in line or arriving to find all chargers busy.",
    color: "from-primary to-emerald-400",
    glow: "shadow-primary/20",
  },
  {
    icon: Shield,
    title: "Secure & Transparent",
    description:
      "All payments are processed securely. Upfront pricing with no hidden fees — ever.",
    color: "from-[#7b5ea7] to-[#00e5ff]",
    glow: "shadow-purple-500/20",
  },
  {
    icon: Zap,
    title: "Smart Route Planning",
    description:
      "Plan long trips with confidence. ChargeReserve intelligently suggests stops so you're never stranded.",
    color: "from-amber-400 to-orange-500",
    glow: "shadow-amber-400/20",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Find a Station",
    description:
      "Search by city, address, or route. Filter by speed, price, and availability to find your perfect match.",
    icon: Search,
  },
  {
    step: "02",
    title: "Reserve a Slot",
    description:
      "Pick your date and time, confirm your booking, and receive an instant confirmation — your charger is guaranteed.",
    icon: CalendarCheck,
  },
  {
    step: "03",
    title: "Charge & Go",
    description:
      "Arrive, plug in, and let ChargeReserve handle the rest. Payments are automatic. Get back on the road fast.",
    icon: Zap,
  },
];

export default function LandingPageClient({
  stations,
}: {
  stations: Station[];
}) {
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
    <div className="flex-1 flex flex-col overflow-x-clip relative">
      {/* ─ HERO ─────────────────────────────────────────────────── */}
      <section className="py-12 lg:py-24 px-4 md:px-8 lg:px-16 relative">
        <div className="absolute inset-x-0 top-0 h-screen -z-20 pointer-events-none opacity-80 [&_h1]:hidden [&>div]:h-full">
          <AetherFlowHero />
        </div>
        <motion.div
          className="absolute top-0 right-0 w-full h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        <main className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
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
                Find, book, and pay for the fastest EV charging stations near
                you. Never wait in line for a charger again.
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
                <span className="text-sm text-muted-foreground">
                  Avg. charge time
                </span>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold">
                  99<span className="text-primary">%</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  Uptime guaranteed
                </span>
              </div>
            </div>
          </div>

          {/* Right: Nearby Stations live card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex items-center justify-center min-h-[400px] lg:min-h-[600px] pointer-events-none"
          >
            {/* Replaced the list card with the real Globe in the background of the hero right side */}
            <div className="absolute inset-0 z-0">
               <Globe />
            </div>
            
            <motion.div 
               className="relative z-10 w-full bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 lg:p-8 flex flex-col gap-6 pointer-events-auto shadow-xl"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5, delay: 0.6 }}
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
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-1 scrollbar-hide">
                  {filtered.slice(0, 5).map((station, i) => (
                    <motion.div
                      key={station.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + i * 0.08 }}
                    >
                      <Link href={`/station/${station.id}`} className="block">
                        <div className="group bg-background/40 hover:bg-background border border-border hover:border-primary/50 rounded-2xl p-4 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold group-hover:text-primary transition-colors">
                                {station.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {station.city}
                              </p>
                            </div>
                            <Badge
                              variant={
                                station.available > 0 ? "default" : "secondary"
                              }
                              className="text-[10px] px-2 py-0"
                            >
                              {station.available} / {station.total}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  {filtered.length > 5 && (
                    <Link href="/find" className="text-xs text-center text-primary hover:underline py-2">
                      View all {filtered.length} stations
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </main>
      </section>

      {/* ─ FEATURED STATIONS ──────────────────────────────────────── */}
      <section
        id="stations"
        className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-16 mt-8 pb-24 z-10 relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <Badge
            variant="secondary"
            className="px-4 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/10 mb-4"
          >
            <Star className="w-3 h-3 mr-2" />
            Featured Stations
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            Top-Rated Charging Hubs
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Handpicked high-speed stations with the best availability, pricing,
            and user ratings in your area.
          </p>
        </motion.div>

        {stations.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Zap className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No featured stations yet.</p>
            <p className="text-sm mt-2">
              Be the first —{" "}
              <Link href="/register" className="text-primary underline">
                register as an operator
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.slice(0, 6).map((station, i) => (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Link href={`/station/${station.id}`} className="block h-full">
                  <div className="group relative bg-card/60 backdrop-blur-md border border-border hover:border-primary/40 rounded-3xl p-6 h-full flex flex-col gap-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,135,0.08)] hover:-translate-y-1">
                    {/* Availability indicator */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                        {station.city}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                          station.available > 0
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${station.available > 0 ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
                        />
                        {station.available > 0
                          ? `${station.available} open`
                          : "Full"}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-snug">
                        {station.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {station.address}
                      </p>
                    </div>

                    <div className="border-t border-border pt-4 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Zap className="w-4 h-4 text-primary" />
                        <span>{station.speed}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="truncate max-w-[80px]">
                          {station.operatingHours}
                        </span>
                      </div>
                      <div className="ml-auto font-semibold text-foreground">
                        {station.price}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-primary/30 text-primary hover:bg-primary/10 group-hover:border-primary/60 transition-colors"
                    >
                      Book Now
                      <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ─ WHY CHARGERESERVE ─────────────────────────────────────── */}
      <section className="w-full px-4 md:px-8 lg:px-16 py-24 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -z-10" />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />

        <div className="w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge
              variant="secondary"
              className="px-4 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/10 mb-4"
            >
              <Shield className="w-3 h-3 mr-2" />
              Why ChargeReserve
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Built for the modern EV driver
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              We combine real-time data, smart reservations, and seamless
              payments to make EV charging as easy as it should be.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-card/60 backdrop-blur-md border border-border hover:border-primary/30 rounded-3xl p-7 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-lg ${feat.glow}`}
                >
                  <feat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─ HOW IT WORKS ──────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-24 z-10 relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge
            variant="secondary"
            className="px-4 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/10 mb-4"
          >
            <ChevronRight className="w-3 h-3 mr-1" />
            Simple Process
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">How It Works</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            From searching to charging — it takes less than two minutes with
            ChargeReserve.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 z-0" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex flex-col items-center text-center gap-6"
              >
                {/* Step circle */}
                <div className="relative">
                  <div className="w-[104px] h-[104px] rounded-full bg-card/70 backdrop-blur-md border border-primary/30 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,135,0.12)]">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg shadow-primary/30">
                    {i + 1}
                  </span>
                </div>

                <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-6 w-full transition-all hover:border-primary/30 hover:shadow-[0_0_24px_rgba(0,255,135,0.07)]">
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" className="px-10 h-14 text-base" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-10 h-14 text-base border-primary/30 text-primary hover:bg-primary/10"
            asChild
          >
            <Link href="#stations">
              Browse Stations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
