import Link from "next/link";
import { Calendar, Clock, MapPin, Zap, ChevronRight, Settings, CreditCard, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const activeReservations = [
    {
      id: "RES-8921",
      station: "Downtown FastHub",
      address: "120 Main St, City Center",
      date: "Today",
      time: "2:00 PM - 3:00 PM",
      status: "Upcoming",
      power: "150 kW",
    }
  ];

  const pastSessions = [
    {
      id: "SES-1029",
      station: "Mall Supercharger",
      date: "Oct 12, 2023",
      energy: "45.2 kWh",
      cost: "$18.50",
      duration: "42 min"
    },
    {
      id: "SES-0982",
      station: "Airport Charge Plaza",
      date: "Oct 05, 2023",
      energy: "22.1 kWh",
      cost: "$9.20",
      duration: "25 min"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Alex. You have 1 upcoming reservation.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
           <Button variant="outline" size="sm"><Settings className="w-4 h-4 mr-2" />Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Reservations</h2>
              <Link href="/map" className="text-sm font-medium text-primary hover:underline">New Booking</Link>
            </div>
            
            <div className="space-y-4">
              {activeReservations.map((res) => (
                <div key={res.id} className="bg-card border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">{res.status}</Badge>
                        <span className="text-xs font-mono text-muted-foreground">{res.id}</span>
                      </div>
                      <h3 className="text-lg font-bold">{res.station}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {res.address}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-2 rounded-lg text-center min-w-[80px]">
                      <Zap className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
                      <span className="text-xs font-bold">{res.power}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 py-3 border-y border-border/50 bg-muted/20 px-4 -mx-5 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">{res.date}</span>
                    </div>
                    <div className="w-px h-4 bg-border"></div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">{res.time}</span>
                    </div>
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
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Past Sessions</h2>
              <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">View All</Link>
            </div>
            
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border">
                {pastSessions.map((session) => (
                  <div key={session.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{session.station}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span>{session.date}</span>
                          <span>•</span>
                          <span className="font-mono">{session.id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden sm:block">
                        <div className="font-medium text-sm">{session.energy}</div>
                        <div className="text-xs text-muted-foreground">{session.duration}</div>
                      </div>
                      <div className="font-bold">{session.cost}</div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" /> My Vehicles
            </h3>
            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30 mb-3">
               <div>
                 <div className="font-medium text-sm">Tesla Model 3</div>
                 <div className="text-xs text-muted-foreground">Long Range • 2022</div>
               </div>
               <Badge variant="outline" className="text-xs">CCS / NACS</Badge>
            </div>
            <Button variant="outline" className="w-full text-sm h-8" size="sm">Add Vehicle</Button>
          </div>

          <div className="bg-card border rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Payment Methods
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30 mb-3">
               <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-[10px] font-bold text-white tracking-widest">VISA</div>
               <div>
                 <div className="font-medium text-sm">•••• 4242</div>
                 <div className="text-xs text-muted-foreground">Expires 12/25</div>
               </div>
            </div>
            <Button variant="outline" className="w-full text-sm h-8" size="sm">Manage Payments</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
