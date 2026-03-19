"use client";

import { useState } from "react";
import { Car, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number | null;
  connectorType: string;
  licensePlate: string | null;
};

export default function VehicleManager({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [connectorType, setConnectorType] = useState("CCS");
  const [licensePlate, setLicensePlate] = useState("");

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make, model, year, connectorType, licensePlate }),
      });
      if (res.ok) {
        const data = await res.json();
        setVehicles([data.vehicle, ...vehicles]);
        setIsOpen(false);
        setMake("");
        setModel("");
        setYear("");
        setConnectorType("CCS");
        setLicensePlate("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user/vehicles/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVehicles(vehicles.filter((v) => v.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" /> My Vehicles
        </h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a Vehicle</DialogTitle>
              <DialogDescription>
                Add your EV to quickly find compatible chargers.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddVehicle} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} required placeholder="e.g. Tesla" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} required placeholder="e.g. Model 3" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year (Optional)</Label>
                  <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2023" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connectorType">Connector Type</Label>
                  <select
                    id="connectorType"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={connectorType}
                    onChange={(e) => setConnectorType(e.target.value)}
                  >
                    <option value="CCS">CCS</option>
                    <option value="CHADEMO">CHAdeMO</option>
                    <option value="TYPE2">Type 2</option>
                    <option value="J1772">J1772</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate (Optional)</Label>
                <Input id="licensePlate" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} placeholder="e.g. ABC 1234" />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Vehicle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {vehicles.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-3">No vehicles added yet.</p>
      ) : (
        <div className="space-y-3 mb-3">
          {vehicles.map((v) => (
            <div key={v.id} className="flex items-center justify-between text-sm bg-muted/40 p-2 rounded-lg border">
              <div>
                <p className="font-medium">{v.make} {v.model}</p>
                <p className="text-xs text-muted-foreground">{v.connectorType}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(v.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
