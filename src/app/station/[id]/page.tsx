"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Zap, Clock, ShieldCheck, CreditCard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const stationData = {
  id: "sn-104",
  name: "ChargeReserve Downtown",
  address: "124 Main Street, Unit B, San Francisco, CA 94105",
  rating: "4.8",
  reviews: 124,
  available: 3,
  total: 8,
  speed: "250 kW Max",
  price: "$0.32/kWh",
  amenities: ["Restrooms", "Coffee Shop", "WiFi", "Dining"],
  chargerTypes: ["CCS", "CHAdeMO", "Tesla"],
};

export default function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 max-w-6xl mx-auto pt-8">
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to map
      </Link>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <motion.div 
          className="lg:col-span-2 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {stationData.available} Available
              </Badge>
              <span className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" /> Verified
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">{stationData.name}</h1>
            <p className="text-lg text-muted-foreground flex items-center pr-4">
              <MapPin className="w-5 h-5 mr-2 text-primary flex-shrink-0" /> {stationData.address}
            </p>
          </div>

          <div className="flex items-center gap-6 p-4 rounded-2xl bg-card border border-border mt-6 overflow-x-auto whitespace-nowrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Power</p>
                <p className="font-semibold">{stationData.speed}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pricing</p>
                <p className="font-semibold">{stationData.price}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours</p>
                <p className="font-semibold">Open 24/7</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="chargers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="chargers">Chargers</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
            </TabsList>
            <TabsContent value="chargers" className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <Zap className="text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">Stall #{i} • CCS</h4>
                        <p className="text-sm text-muted-foreground">Up to 250 kW</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-primary text-primary">Available</Badge>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="amenities" className="mt-6">
              <Card>
                <CardContent className="p-6 grid grid-cols-2 gap-4">
                  {stationData.amenities.map(item => (
                    <div key={item} className="flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-primary" />
                       <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </motion.div>

        {/* Right Column: Checkout/Booking panel */}
        <motion.div 
          className="lg:sticky top-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-2xl shadow-primary/5 border-border">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-semibold">Reserve a Charger</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Arrival Time</label>
                  <Select defaultValue="now">
                    <SelectTrigger>
                      <SelectValue placeholder="Select arrival time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Arriving Now (Hold for 15m)</SelectItem>
                      <SelectItem value="30m">In 30 Minutes</SelectItem>
                      <SelectItem value="1h">In 1 Hour</SelectItem>
                      <SelectItem value="custom">Custom Time...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Select defaultValue="unlimited">
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlimited">Until Full (Max 2h)</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="30m">30 Minutes</SelectItem>
                      <SelectItem value="45m">45 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Cost</span>
                  <span className="font-medium">~$18.50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reservation Fee</span>
                  <span className="font-medium">$2.00</span>
                </div>
                <div className="w-full h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total Due Now</span>
                  <span className="text-xl font-bold text-primary">$2.00</span>
                </div>
              </div>

              <Link href={`/booking/${resolvedParams.id}`} className="block w-full">
                <Button size="lg" className="w-full font-semibold text-base py-6 shadow-[0_0_20px_rgba(0,255,135,0.2)]">
                  Continue to Confirm Waitlist
                </Button>
              </Link>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                You will only be charged the $2.00 reservation fee upon confirmation. Cost of power is billed after session.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
