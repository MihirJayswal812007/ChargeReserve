"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  QrCode,
  Zap,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookingData {
  id: string;
  qrCode: string;
  pin?: string;
  status: string;
  startTime: string;
  endTime: string;
  totalCost?: number;
  charger: {
    type: string;
    powerKw: number;
  };
  station: {
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

export default function BookingConfirmationClient({ booking }: { booking: BookingData }) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const durationMs = end.getTime() - start.getTime();
  const durationMins = Math.round(durationMs / 60000);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${booking.station.latitude},${booking.station.longitude}`;

  const formattedDate = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = `${start.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border shadow-2xl relative overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-400 absolute top-0 left-0" />

          <CardContent className="pt-10 pb-8 px-6 space-y-8 flex flex-col items-center text-center">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">
                Reservation Confirmed!
              </h1>
              <p className="text-muted-foreground">
                Your charger is secured and waiting for you.
              </p>
              <Badge variant="outline" className="mt-3 font-mono text-xs">
                {booking.id.slice(0, 16).toUpperCase()}
              </Badge>
            </div>

            {/* Booking details */}
            <div className="w-full bg-secondary/30 rounded-xl p-4 space-y-3 text-left border border-border">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Station
                </span>
                <span className="font-medium text-right text-sm max-w-[180px]">
                  {booking.station.name}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Charger
                </span>
                <span className="font-medium">
                  {booking.charger.type} • {booking.charger.powerKw} kW
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Date
                </span>
                <span className="font-medium font-mono text-sm">{formattedDate}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Time
                </span>
                <span className="font-medium font-mono text-sm">{formattedTime}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {durationMins < 60
                    ? `${durationMins} min`
                    : `${(durationMins / 60).toFixed(1)}h`}
                </span>
              </div>
              {booking.pin && (
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="text-muted-foreground">Access PIN</span>
                  <span className="text-primary font-bold font-mono tracking-widest text-lg">
                    {booking.pin}
                  </span>
                </div>
              )}
              {booking.totalCost !== undefined && (
                <div className="flex justify-between items-center pt-1">
                  <span className="font-semibold">Est. Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{booking.totalCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* QR Code placeholder */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="bg-white p-4 rounded-xl">
                <QrCode className="w-24 h-24 text-gray-800" />
              </div>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Show this QR code or enter your PIN at the charger to begin your session.
              </p>
              <p className="text-xs font-mono text-muted-foreground/60 break-all max-w-full">
                {booking.qrCode}
              </p>
            </div>

            {/* Actions */}
            <div className="w-full space-y-3 pt-2">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button size="lg" className="w-full py-6 font-semibold">
                  <ExternalLink className="w-4 h-4 mr-2" /> Get Directions
                </Button>
              </a>
              <Link href="/reservations" className="block">
                <Button variant="outline" size="lg" className="w-full py-6">
                  View All Reservations
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
