import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function adminOnly(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  return !user || user.role !== "ADMIN";
}

// GET /api/admin/stats
export async function GET(_req: NextRequest) {
  const user = await getCurrentUser();
  if (adminOnly(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [userCount, stationCount, bookingCount, sessionCount, pendingStations, recentBookings] = await Promise.all([
    prisma.user.count(),
    prisma.station.count(),
    prisma.booking.count(),
    prisma.chargingSession.count({ where: { status: "COMPLETED" } }),
    prisma.station.findMany({
      where: { status: "PENDING_APPROVAL" },
      include: { operator: { select: { name: true, email: true } }, _count: { select: { chargers: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        charger: { include: { station: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Revenue from completed sessions
  const revenue = await prisma.chargingSession.aggregate({
    _sum: { cost: true },
    where: { status: "COMPLETED" },
  });

  return NextResponse.json({
    stats: {
      users: userCount,
      stations: stationCount,
      bookings: bookingCount,
      sessions: sessionCount,
      revenue: revenue._sum.cost ?? 0,
    },
    pendingStations,
    recentBookings,
  });
}
