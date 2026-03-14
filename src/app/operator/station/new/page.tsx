import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function NewStationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  async function createStation(formData: FormData) {
    "use server";
    
    const user = await getCurrentUser();
    if (!user) return;

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    
    if (!name || !address || !city || !country || isNaN(latitude) || isNaN(longitude)) return;

    await prisma.station.create({
      data: {
        name,
        address,
        city,
        country,
        latitude,
        longitude,
        operatorId: user.userId,
      }
    });

    revalidatePath("/operator");
    redirect("/operator");
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/operator">← Back to Dashboard</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Station</h1>
        <p className="text-muted-foreground mt-2">
          Register a new charging station to your network.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Station Details</CardTitle>
          <CardDescription>
            Provide the location and basic details for your new charging station.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createStation} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-muted-foreground" /> Station Name
              </Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="e.g. Downtown Fast Charging Hub" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-muted-foreground" /> Address
              </Label>
              <Input 
                id="address" 
                name="address" 
                placeholder="123 Main St" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  name="city" 
                  placeholder="San Francisco" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  name="country" 
                  placeholder="USA" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  id="latitude" 
                  name="latitude" 
                  type="number" 
                  step="0.000001" 
                  placeholder="37.7749" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" 
                  name="longitude" 
                  type="number" 
                  step="0.000001" 
                  placeholder="-122.4194" 
                  required 
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button variant="outline" type="button" asChild>
                <Link href="/operator">Cancel</Link>
              </Button>
              <Button type="submit">Create Station</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
