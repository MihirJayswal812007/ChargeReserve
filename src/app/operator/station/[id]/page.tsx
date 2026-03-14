import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Zap, Plug, Plus, Clock, Settings, BatteryCharging } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Badge } from "@/components/ui/badge";

export default async function StationManagementPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const station = await prisma.station.findFirst({
    where: { 
      id: params.id,
      operatorId: user.userId,
    },
    include: {
      chargers: {
        include: {
          bookings: {
            where: {
              status: { in: ["CONFIRMED", "COMPLETED"] }
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!station) redirect("/operator");

  async function addCharger(formData: FormData) {
    "use server";
    
    const user = await getCurrentUser();
    if (!user) return;

    const type = formData.get("type") as string;
    const powerKw = parseFloat(formData.get("powerKw") as string);
    const pricePerKwh = parseFloat(formData.get("pricePerKwh") as string);
    
    if (isNaN(powerKw) || isNaN(pricePerKwh) || !type) return;

    await prisma.charger.create({
      data: {
        stationId: params.id,
        type: type as any,
        powerKw: powerKw,
        pricePerKwh: pricePerKwh,
        status: "AVAILABLE", // Assuming default status is still needed
      }
    });

    revalidatePath(`/operator/station/${params.id}`);
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 pb-24">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/operator">← Back to Dashboard</Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {station.name}
              <Badge variant={station.status === "ACTIVE" ? "default" : "secondary"}>
                {station.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground flex items-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4" /> {station.address}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" /> Edit Details
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Chargers ({station.chargers.length})</span>
                <Button size="sm" variant="secondary" className="gap-2">
                  Edit Statuses <Settings className="w-3.5 h-3.5" />
                </Button>
              </CardTitle>
              <CardDescription>
                Manage individual charging endpoints at this location.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {station.chargers.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Plug className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-medium">No chargers yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 text-balance">
                    Add charging endpoints to this station so users can start booking them.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {station.chargers.map(charger => (
                    <div key={charger.id} className="border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            Charger #{charger.id.substring(0, 4).toUpperCase()}
                          </h4>
                          <Badge variant="outline" className={
                            charger.status === "AVAILABLE" ? "border-emerald-500 text-emerald-500" :
                            charger.status === "IN_USE" ? "border-blue-500 text-blue-500" :
                            "border-rose-500 text-rose-500"
                          }>
                            {charger.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <BatteryCharging className="w-4 h-4" /> {charger.powerKw} kW
                          </div>
                          <div className="flex items-center gap-1.5 border-l pl-4">
                            <Plug className="w-4 h-4" /> {charger.type.replace('_', ' ')}
                          </div>
                          <div className="flex items-center gap-1.5 border-l pl-4 font-medium text-foreground">
                            ₹{charger.pricePerKwh.toFixed(2)} / kWh
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-2 text-sm">
                        <div className="text-muted-foreground">
                          {charger.bookings.length} total bookings
                        </div>
                        {charger.bookings.slice(0, 1).map(booking => (
                          <div key={booking.id} className="bg-muted px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            Last: {new Date(booking.startTime).toLocaleDateString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add Charger</CardTitle>
              <CardDescription>
                Register a new endpoint for this station.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={addCharger} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Connector Type</Label>
                  <select 
                    id="type"
                    name="type" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select a connector...</option>
                    <option value="LEVEL_2">Level 2</option>
                    <option value="DC_FAST">DC Fast</option>
                    <option value="TESLA">Tesla (NACS)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="powerKw" className="flex justify-between">
                    Power Output (kW)
                    <span className="text-muted-foreground font-normal text-xs">e.g. 50, 150, 350</span>
                  </Label>
                  <Input 
                    id="powerKw" 
                    name="powerKw" 
                    type="number" 
                    placeholder="150" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerKwh" className="flex justify-between">
                    Price ($ / kWh)
                    <span className="text-muted-foreground font-normal text-xs">Pricing per kWh</span>
                  </Label>
                  <Input 
                    id="pricePerKwh" 
                    name="pricePerKwh" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.45" 
                    required 
                  />
                </div>

                <Button type="submit" className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-2" /> Add Charger to Station
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
