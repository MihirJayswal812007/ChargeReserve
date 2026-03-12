"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, QrCode, Zap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background glowing effects */}
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
              <h1 className="text-2xl font-bold tracking-tight mb-2">Reservation Confirmed</h1>
              <p className="text-muted-foreground">Your charger is secured and waiting for you.</p>
            </div>

            <div className="w-full bg-secondary/30 rounded-xl p-4 space-y-3 text-left border border-border">
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Station</span>
                <span className="font-medium text-right">ChargeReserve Downtown</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Charger</span>
                <span className="font-medium">Stall #2 (CCS)</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Arrival By</span>
                <span className="font-medium font-mono">14:45 PM</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Reservation PIN</span>
                <span className="text-primary font-bold font-mono tracking-widest text-lg">8492</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-center w-full pt-2">
              <QrCode className="w-24 h-24 text-foreground/80" />
              <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
                Scan this QR code at the charger to begin your session instantly.
              </p>
            </div>
            
            <div className="w-full space-y-3 pt-4">
              <Button size="lg" className="w-full py-6 font-semibold">Get Directions</Button>
              <Link href="/" className="block">
                <Button variant="outline" size="lg" className="w-full py-6">Return to Map</Button>
              </Link>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
