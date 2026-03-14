import { redirect } from "next/navigation";
import Link from "next/link";
import { OperatorBookingsList } from "@/components/operator/operator-bookings-list";
import { OperatorRevenueChart } from "@/components/operator/operator-revenue-chart";
import { 
  Building2, 
  CreditCard, 
  Activity, 
  Zap, 
  ArrowUpRight,
  TrendingUp,
  PlugZap,
  Clock,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function OperatorDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch stations owned by the user
  const stations = await prisma.station.findMany({
    where: { operatorId: user.userId },
    include: {
      chargers: {
        include: {
          bookings: {
            include: {
              session: true,
              payment: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate metrics
  let totalEarnings = 0;
  let activeSessions = 0;
  let totalEnergy = 0;

  stations.forEach(station => {
    station.chargers.forEach(charger => {
      
      charger.bookings.forEach(booking => {
        // Calculate earnings from successful payments
        const payment = booking.payment;
        if (payment && payment.status === "COMPLETED") {
          totalEarnings += payment.amount;
        }

        // Calculate active sessions
        if (booking.session?.status === "ACTIVE") {
          activeSessions++;
        }

        // Calculate total energy dispensed
        if (booking.session?.energyUsed) {
          totalEnergy += booking.session.energyUsed;
        }
      });
    });
  });

  // Flatten and sort recent bookings
  const allBookings = stations.flatMap(station => 
    station.chargers.flatMap(charger => 
      charger.bookings.map(booking => ({
        ...booking,
        charger: charger,
        station: { id: station.id, name: station.name, address: station.address }
      }))
    )
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const recentBookings = allBookings.slice(0, 10);

  // Generate last 7 days chart data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const chartData = last7Days.map(date => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayBookings = allBookings.filter(b => {
      const bDate = new Date(b.createdAt);
      return bDate >= date && bDate < nextDate;
    });

    const revenue = dayBookings.reduce((sum, b) => {
      if (b.payment?.status === "COMPLETED") {
        return sum + b.payment.amount;
      }
      return sum;
    }, 0);

    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue
    };
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your charging stations and track revenue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/operator/station/new">
              <Zap className="w-4 h-4 mr-2" />
              Add Station
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stations</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            <Activity className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently charging across network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Energy Dispensed</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnergy.toFixed(1)} kWh</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total energy delivered
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <OperatorRevenueChart data={chartData} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest bookings and sessions across your stations</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No activity found yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentBookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <PlugZap className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {booking.station.name} - #{booking.charger.id.substring(0, 4)}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(booking.startTime).toLocaleDateString()} {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className={
                              booking.status === "COMPLETED" ? "border-emerald-500 text-emerald-500" :
                              booking.status === "CONFIRMED" ? "border-blue-500 text-blue-500" :
                              "border-muted text-muted-foreground"
                            }>
                              {booking.status}
                            </Badge>
                            <div className="mt-1 font-semibold text-sm">
                              ₹{booking.totalCost?.toFixed(2) || "0.00"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {recentBookings.length > 5 && (
                    <Button variant="ghost" className="w-full mt-4" asChild>
                      <Link href="#bookings">
                        View All Activity <ArrowUpRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/operator/station/new">
                      <Building2 className="w-4 h-4 mr-2" />
                      Add New Station
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/operator/payouts">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Payouts
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Stations</CardTitle>
              <CardDescription>Manage your EV charging infrastructure</CardDescription>
            </CardHeader>
            <CardContent>
              {stations.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Building2 className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-medium">No stations found</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">You haven&apos;t added any charging stations yet.</p>
                  <Button asChild>
                    <Link href="/operator/station/new">Add Your First Station</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stations.map(station => (
                    <div key={station.id} className="border rounded-xl overflow-hidden group">
                      <div className="h-32 bg-muted relative">
                        {/* Placeholder image for station */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                        <Badge className="absolute top-3 right-3 bg-white/90 text-black hover:bg-white backdrop-blur-sm shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-1" />
                          {station.status}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg leading-tight truncate">{station.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {station.address}
                        </p>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase font-semibold">Chargers</span>
                            <span className="font-medium">{station.chargers.length}</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild className="group-hover:bg-primary group-hover:text-primary-foreground transform transition-all">
                            <Link href={`/operator/station/${station.id}`}>Manage</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <OperatorBookingsList bookings={allBookings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
