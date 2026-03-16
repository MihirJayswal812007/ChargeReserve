import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, MapPin, Zap, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BookingStatus } from "@prisma/client";
import CancelBookingButton from "@/components/cancel-booking-button";

// Status badge styling
function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { label: string; className: string }> = {
    CONFIRMED: { label: "Confirmed", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    PENDING: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    CANCELLED: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
    COMPLETED: { label: "Completed", className: "bg-primary/10 text-primary border-primary/20" },
  };
  const { label, className } = map[status] ?? { label: status, className: "" };
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

export default async function ReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.userId },
    include: {
      charger: {
        include: {
          station: { select: { id: true, name: true, address: true, city: true } },
        },
      },
      session: { select: { id: true, status: true, energyUsed: true, cost: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const upcoming = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "PENDING"
  );
  const past = bookings.filter(
    (b) => b.status === "COMPLETED" || b.status === "CANCELLED"
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
        <p className="text-muted-foreground mt-1">
          {upcoming.length > 0
            ? `You have ${upcoming.length} upcoming reservation${upcoming.length > 1 ? "s" : ""}.`
            : "No upcoming reservations."}
        </p>
      </div>

      {/* Upcoming */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
            <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No upcoming reservations.</p>
            <Link href="/" className="mt-4 inline-block">
              <Button size="sm" className="mt-4">Find a Charger</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((booking) => (
              <div
                key={booking.id}
                className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={booking.status} />
                      <span className="text-xs font-mono text-muted-foreground">
                        {booking.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">{booking.charger.station.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {booking.charger.station.address}, {booking.charger.station.city}
                    </p>
                  </div>
                  <div className="bg-muted/50 px-3 py-2 rounded-lg text-center text-sm">
                    <Zap className="w-4 h-4 mx-auto text-primary mb-1" />
                    <span className="font-bold">{booking.charger.powerKw} kW</span>
                    <p className="text-xs text-muted-foreground">{booking.charger.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-3 border-y border-border/50 bg-muted/20 px-4 -mx-5 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      {new Date(booking.startTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      {new Date(booking.startTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      –{" "}
                      {new Date(booking.endTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {booking.pin && (
                    <>
                      <div className="w-px h-4 bg-border" />
                      <span className="font-mono text-primary font-bold tracking-widest">
                        PIN: {booking.pin}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/booking/${booking.id}`} className="flex-1">
                    <Button className="w-full">View Details</Button>
                  </Link>
                  <Link href={`/session/${booking.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">Start Session</Button>
                  </Link>
                  <CancelBookingButton bookingId={booking.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Past Sessions</h2>
          <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-border">
              {past.map((booking) => (
                <Link
                  href={`/session/${booking.id}`}
                  key={booking.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        {booking.charger.station.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>
                          {new Date(booking.startTime).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4 shrink-0">
                    {booking.session && (
                      <div className="hidden sm:block text-sm">
                        <div className="font-medium">
                          {booking.session.energyUsed.toFixed(1)} kWh
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ₹{booking.session.cost.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {!booking.session && booking.totalCost != null && (
                      <div className="font-bold text-sm">₹{booking.totalCost.toFixed(2)}</div>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
