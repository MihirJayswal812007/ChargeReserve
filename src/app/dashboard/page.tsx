import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, MapPin, Zap, ChevronRight, Settings, CreditCard, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import VehicleManager from "@/components/dashboard/vehicle-manager";
import PremiumCard from "@/components/dashboard/premium-card";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // TODO: Add isPremium and premiumExpiresAt to User model in prisma schema
  const dbUser = { isPremium: false, premiumExpiresAt: null };

  const [allBookings, vehicles] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: user.userId },
      include: {
        charger: {
          include: {
            station: { select: { name: true, address: true } },
          },
        },
        session: {
          select: { id: true, energyUsed: true, cost: true, duration: true, status: true, startTime: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.vehicle.findMany({ where: { userId: user.userId }, orderBy: { createdAt: "desc" } }),
  ]);

  const activeReservations = allBookings.filter(
    (b: any) => b.status === "CONFIRMED" || b.status === "PENDING"
  );

  const pastSessions = allBookings.filter(
    (b: any) => b.status === "COMPLETED" || b.session?.status === "COMPLETED"
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name}.{" "}
            {activeReservations.length > 0
              ? `You have ${activeReservations.length} upcoming reservation${activeReservations.length > 1 ? "s" : ""}.`
              : "No upcoming reservations."}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Active Reservations */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Reservations</h2>
              <Link
                href="/find"
                className="text-sm font-medium text-primary hover:underline"
              >
                New Booking
              </Link>
            </div>

            {activeReservations.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>No active reservations.</p>
                <Link href="/find" className="mt-4 inline-block">
                  <Button size="sm" className="mt-4">Find a Charger</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeReservations.map((res: any) => (
                  <div
                    key={res.id}
                    className="bg-card border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="secondary"
                            className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                          >
                            {res.status === "CONFIRMED" ? "Upcoming" : "Pending"}
                          </Badge>
                          <span className="text-xs font-mono text-muted-foreground">
                            {res.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold">{res.charger.station.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {res.charger.station.address}
                        </p>
                      </div>
                      <div className="bg-muted/50 p-2 rounded-lg text-center min-w-[80px]">
                        <Zap className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
                        <span className="text-xs font-bold">{res.charger.powerKw} kW</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 py-3 border-y border-border/50 bg-muted/20 px-4 -mx-5 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {new Date(res.startTime).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="w-px h-4 bg-border" />
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {new Date(res.startTime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" – "}
                          {new Date(res.endTime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {res.pin && (
                        <>
                          <div className="w-px h-4 bg-border" />
                          <span className="font-mono text-primary font-bold tracking-widest text-sm">
                            PIN: {res.pin}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" asChild>
                        <Link href={`/booking/${res.id}`}>View Details</Link>
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/session/${res.id}`}>Start Session</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past Sessions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Past Sessions</h2>
              <Link
                href="/reservations"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View All
              </Link>
            </div>

            {pastSessions.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
                No past sessions yet.
              </div>
            ) : (
              <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-border">
                  {pastSessions.slice(0, 5).map((b: any) => (
                    <Link
                      key={b.id}
                      href={`/session/${b.id}`}
                      className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {b.charger.station.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>
                              {new Date(b.startTime).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span>•</span>
                            <span className="font-mono">{b.charger.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        {b.session ? (
                          <div className="hidden sm:block">
                            <div className="font-medium text-sm">
                              {b.session.energyUsed.toFixed(1)} kWh
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(b.session.duration / 60)} min
                            </div>
                          </div>
                        ) : null}
                        <div className="font-bold">
                          {b.session
                            ? `₹${b.session.cost.toFixed(2)}`
                            : b.totalCost != null
                            ? `₹${b.totalCost.toFixed(2)}`
                            : "—"}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          <VehicleManager initialVehicles={vehicles as any} />

          <div className="bg-card border rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Bookings</span>
                <span className="font-medium">{allBookings.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <span className="font-medium text-primary">{activeReservations.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{pastSessions.length}</span>
              </div>
            </div>
          </div>
          
          <PremiumCard 
            isPremium={dbUser?.isPremium || false} 
            expiresAt={dbUser?.premiumExpiresAt} 
          />
        </div>
      </div>
    </div>
  );
}
